import React from 'react';
import { Mail, Phone, MapPin, Building2, User, FileText, Globe } from 'lucide-react';

export default function VariantTwo({ invoice, company }: { invoice: any, company?: any }) {
  const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  const taxAmount = totalAmount * ((invoice.taxRate || 0) / 100);
  const formattedTotal = totalAmount + taxAmount;
  
  const formatCurrency = (amt: number) => {
    return `${invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPaid = invoice.status === 'PAID';
  const progressPercent = isPaid ? 100 : invoice.status === 'SENT' ? 25 : 0;

  return (
    <div className="w-full max-w-[900px] print:!max-w-none mx-auto print:!mx-0 bg-white min-h-[1100px] print:!min-h-0 shadow-sm print:!shadow-none rounded-lg print:!rounded-none overflow-hidden print:!overflow-visible border border-gray-100 print:!border-none flex flex-col print:!block font-sans">
      
      {/* Top Banner (Novatech style: Dark slate with green accent) */}
      <div className="h-32 print:!h-12 bg-[#111827] relative flex justify-end items-center px-10 overflow-hidden">
        {/* Decorative Green slash */}
        <div className="absolute -left-10 top-0 bottom-0 w-[400px] bg-[#0C3B2E] -skew-x-[30deg]"></div>
        
        {/* Contact info on the right */}
        <div className="text-gray-300 text-xs space-y-2 z-10 font-medium">
          {invoice.client?.company?.companyPhone && <div className="flex items-center justify-end gap-3"><Phone size={14} className="text-gray-400"/> {invoice.client.company.companyPhone}</div>}
          {invoice.client?.company?.companyEmail && <div className="flex items-center justify-end gap-3"><Mail size={14} className="text-gray-400"/> {invoice.client.company.companyEmail}</div>}
          <div className="flex items-center justify-end gap-3">
            {company?.website ? (
              <>
                <Globe size={14} className="text-gray-400"/> 
                {company.website.replace(/^https?:\/\//, '')}
              </>
            ) : (
              <>
                <Globe size={14} className="text-gray-400"/> 
                www.faibah.com
              </>
            )}
          </div>
          <div className="flex items-start justify-end gap-3 pt-1">
            <MapPin size={14} className="text-gray-400 mt-0.5"/> 
            <div className="text-right">
              {invoice.client?.company?.address && <div>{invoice.client.company.address}</div>}
              {(invoice.client?.company?.city || invoice.client?.company?.country) && <div>{[invoice.client?.company?.city, invoice.client?.company?.country].filter(Boolean).join(', ')}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 py-12 flex-1 flex flex-col print:!block print:!py-2">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-14 print:!mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6">
              {company?.logoUrl ? (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src={company.logoUrl} alt={company.name || 'Agency Logo'} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#0C3B2E] rounded-xl flex items-center justify-center">
                  <span className="text-[#FFBA00] font-bold text-2xl tracking-tighter">
                    {company?.name ? company.name.charAt(0).toUpperCase() : 'F'}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-gray-900 leading-none">{company?.name || 'Faibah Agency'}</span>
                <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">{company?.workType || 'Digital Agency'}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-[#111827] tracking-wider mb-1">INVOICE</h1>
            <p className="text-gray-500 font-medium text-lg tracking-wide uppercase">{invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}</p>
          </div>

          <div className="flex items-center gap-6 mt-16 print:!mt-4 bg-gray-50 px-6 py-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-4 text-sm border-r border-gray-200 pr-6">
              <FileText size={24} className="text-[#0C3B2E]" />
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 font-medium">Invoice Date</span>
                <span className="font-bold text-gray-900">{new Date(invoice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm border-r border-gray-200 pr-6">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500 font-medium">Due Date</span>
                <span className="font-bold text-gray-900">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-500 text-sm font-medium">Status</span>
              <span className={`px-4 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-[#0C3B2E] text-white' : 'bg-gray-200 text-gray-700'}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="flex justify-between mb-12 print:!mb-4">
          <div className="flex gap-4 max-w-[300px]">
            <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#0C3B2E] shrink-0">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 mb-2 tracking-wider">BILL TO</span>
              <span className="font-bold text-gray-900 text-lg mb-1">{invoice.client?.name || 'Unknown Client'}</span>
              <div className="text-sm text-gray-600 space-y-1">
                {invoice.client?.address && <p>{invoice.client.address}</p>}
                {(invoice.client?.city || invoice.client?.country) && <p>{[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ')}</p>}
                {invoice.client?.email && <p className="mt-2 text-gray-800">{invoice.client.email}</p>}
                {invoice.client?.whatsappNumber && <p className="text-gray-800">{invoice.client.whatsappNumber}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-4 max-w-[300px]">
            <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#0C3B2E] shrink-0">
              <Building2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 mb-2 tracking-wider">FROM</span>
              <span className="font-bold text-gray-900 text-lg mb-1">{company?.name || 'Faibah Agency'}</span>
              <div className="text-sm text-gray-600 space-y-1">
                {company?.address && <p>{company.address}</p>}
                {(company?.city || company?.country) && <p>{[company?.city, company?.country].filter(Boolean).join(', ')}</p>}
                {company?.companyEmail && <p className="mt-2 text-gray-800">{company.companyEmail}</p>}
                {company?.companyPhone && <p className="text-gray-800">{company.companyPhone}</p>}
                {company?.taxRate > 0 && <p className="text-xs text-gray-400 mt-1">VAT Reg No: {company.taxRate}%</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-10 print:!mb-4 overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111827] text-white">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wide w-16 text-center">
                  <div className="w-4 h-4 bg-gray-500/30 rounded inline-block"></div>
                </th>
                <th className="px-6 py-4 font-semibold text-sm tracking-wide">Item & Description</th>
                <th className="px-6 py-4 font-semibold text-sm tracking-wide text-center">Qty</th>
                <th className="px-6 py-4 font-semibold text-sm tracking-wide text-right">Rate</th>
                <th className="px-6 py-4 font-semibold text-sm tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items?.map((item: any, idx: number) => {
                const parts = item.description ? item.description.split('|||') : ['Unknown Item'];
                const itemName = parts[0];
                const itemDetails = parts.length > 1 ? parts.slice(1).join('|||') : 'Professional service delivered as per project requirements.';

                return (
                <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 print:!py-2 text-center">
                    <div className="w-8 h-8 mx-auto bg-gray-50 border border-gray-100 text-[#0C3B2E] rounded flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                  </td>
                  <td className="px-6 py-6 print:!py-2">
                    <div className="font-bold text-gray-900 mb-1">{itemName}</div>
                    {itemDetails && <div className="text-xs text-gray-500">{itemDetails}</div>}
                  </td>
                  <td className="px-6 py-6 print:!py-2 text-center font-medium text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-6 print:!py-2 text-right font-medium text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-6 print:!py-2 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</td>
                </tr>
              )})}
              {(!invoice.items || invoice.items.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No items found for this invoice.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="flex justify-between items-end mt-auto print:!mt-4 pb-8 print:!pb-2 border-b border-gray-100">
          
          {/* Payment Overview */}
          <div className="flex gap-4 flex-1 mr-8">
            <div className="bg-gray-50/80 rounded-2xl p-5 flex-1 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute top-4 left-4">Payment Overview</span>
              <div className="mt-4 flex items-center justify-center gap-6 w-full">
                {/* Fake Chart */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner relative"
                  style={{
                    background: `conic-gradient(#111827 ${progressPercent}%, #e5e7eb ${progressPercent}%)`
                  }}
                >
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center">
                    <span className="font-bold text-[#111827] text-lg leading-none">{progressPercent}%</span>
                    <span className="text-[9px] font-semibold text-gray-500">{isPaid ? 'Paid' : 'Pending'}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                    <span className="text-gray-600 font-medium w-12">Paid</span>
                    <span className="font-bold text-gray-900">{isPaid ? '100%' : '0%'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                    <span className="text-gray-600 font-medium w-12">Pending</span>
                    <span className="font-bold text-gray-900">{isPaid ? '0%' : '100%'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[340px] space-y-4 text-base">
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span className="font-medium">VAT ({invoice.taxRate || 0}%)</span>
              <span className="font-semibold text-gray-900">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900 font-bold text-gray-900 text-xl">
              <span>Total</span>
              <span>{formatCurrency(formattedTotal)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 font-bold text-[#0C3B2E] text-xl bg-green-50 p-3 rounded-lg">
              <span>Amount Paid</span>
              <span>{isPaid ? formatCurrency(formattedTotal) : formatCurrency(0)}</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Bank Details */}
      <div className="px-10 pb-8 print:!pb-0 flex items-start text-xs break-inside-avoid">
        <div className="flex-1 bg-gray-50/50 p-6 print:!p-3 rounded-2xl border border-gray-100">
          <span className="font-bold text-[#111827] mb-3 block text-sm tracking-wider">BANK DETAILS</span>
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-gray-600">
            <div><span className="font-semibold block text-gray-400 text-[10px] uppercase mb-0.5">Bank Name</span> <span className="text-sm font-medium text-gray-900">{company?.bankName || 'Not specified'}</span></div>
            <div><span className="font-semibold block text-gray-400 text-[10px] uppercase mb-0.5">Account Name</span> <span className="text-sm font-medium text-gray-900">{company?.accountName || 'Not specified'}</span></div>
            <div><span className="font-semibold block text-gray-400 text-[10px] uppercase mb-0.5">Account Number</span> <span className="text-sm font-medium text-gray-900">{company?.accountNumber || 'Not specified'}</span></div>
            <div><span className="font-semibold block text-gray-400 text-[10px] uppercase mb-0.5">Routing / Sort Code</span> <span className="text-sm font-medium text-gray-900">{company?.routingNumber || 'Not specified'}</span></div>
            <div><span className="font-semibold block text-gray-400 text-[10px] uppercase mb-0.5">SWIFT Code</span> <span className="text-sm font-medium text-gray-900">{company?.swiftCode || 'Not specified'}</span></div>
          </div>
        </div>
      </div>

      {/* Bottom Thanks Banner */}
      <div className="bg-[#111827] text-center py-6 print:!py-2 text-[#0C3B2E] italic font-serif text-2xl mt-auto">
        Thank you for your <span className="font-bold underline decoration-[#FFBA00] underline-offset-4 decoration-2">business!</span>
      </div>

    </div>
  );
}
