import React from 'react';
import { Mail, Phone, MapPin, Building2, User, FileText, CheckCircle2 } from 'lucide-react';

export default function VariantOne({ invoice, company }: { invoice: any, company?: any }) {
  const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  const taxAmount = totalAmount * ((invoice.taxRate || 0) / 100);
  const formattedTotal = totalAmount + taxAmount;
  
  const formatCurrency = (amt: number) => {
    return `${invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPaid = invoice.status === 'PAID';
  const progressPercent = isPaid ? 100 : invoice.status === 'SENT' ? 25 : 0;

  return (
    <div className="w-full max-w-[900px] print:!max-w-none mx-auto print:!mx-0 bg-white min-h-[1100px] print:!min-h-0 shadow-sm print:!shadow-none rounded-lg print:!rounded-none overflow-hidden print:!overflow-visible border border-gray-100 print:!border-none flex flex-col print:!block font-sans p-10 print:!p-6 print:!pb-12">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            {company?.logoUrl ? (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={company.logoUrl} alt={company.name || 'Agency Logo'} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-[#0C3B2E] rounded-lg flex items-center justify-center">
                <span className="text-[#FFBA00] font-bold text-xl tracking-tighter">
                  {company?.name ? company.name.charAt(0).toUpperCase() : 'F'}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 leading-tight">{company?.name || 'Faibah'}</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">{company?.workType || 'Digital Agency'}</span>
            </div>
          </div>
          <h1 className="text-5xl font-black text-[#0B2110] tracking-tight mt-6">INVOICE</h1>
          <p className="text-gray-500 text-sm mt-1">Solutions that drive success.</p>
        </div>

        <div className="bg-[#0C3B2E] text-white p-6 rounded-2xl w-72 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-green-100">Invoice No.</span>
            <span className="font-bold">{invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-green-100">Invoice Date</span>
            <span className="font-semibold">{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-green-100">Due Date</span>
            <span className="font-semibold">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-green-700/50 mt-1">
            <span className="text-sm text-green-100">Payment Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-green-400 text-green-900' : 'bg-[#FFBA00] text-yellow-900'}`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="flex gap-6 mb-10">
        <div className="flex-1 bg-gray-50/50 border border-gray-100 p-6 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-[#0C3B2E]/10 text-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 mb-1 tracking-wider">BILL TO</span>
            <span className="font-bold text-gray-900 text-lg mb-2">{invoice.client?.name || 'Unknown Client'}</span>
            <div className="text-sm text-gray-600 space-y-1">
              {invoice.client?.address && <p>{invoice.client.address}</p>}
              {(invoice.client?.city || invoice.client?.country) && <p>{[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ')}</p>}
              {invoice.client?.email && <p className="mt-2 text-gray-800">{invoice.client.email}</p>}
              {invoice.client?.whatsappNumber && <p className="text-gray-800">{invoice.client.whatsappNumber}</p>}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50/50 border border-gray-100 p-6 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-[#0C3B2E]/10 text-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 mb-1 tracking-wider">FROM</span>
            <span className="font-bold text-gray-900 text-lg mb-2">{company?.name || 'Faibah Agency'}</span>
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
      <div className="mb-10 rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0C3B2E] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-16">#</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Item & Description</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Qty</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Rate</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items?.map((item: any, idx: number) => {
              const parts = item.description ? item.description.split('|||') : ['Unknown Item'];
              const itemName = parts[0];
              const itemDetails = parts.length > 1 ? parts.slice(1).join('|||') : 'Professional service delivered as per project requirements.';

              return (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                  <td className="px-6 py-5 font-semibold text-gray-400">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 mb-1">{itemName}</div>
                        {itemDetails && <div className="text-xs text-gray-500 line-clamp-2">{itemDetails}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-medium text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-5 text-right font-medium text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-5 text-right font-bold text-[#0C3B2E]">{formatCurrency(item.amount)}</td>
                </tr>
              );
            })}
            {(!invoice.items || invoice.items.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No items found for this invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="flex gap-8 mt-auto print:!mt-12 pt-6">
        
        {/* Payment Overview & QR */}
        <div className="flex gap-4 flex-1">
          <div className="bg-gray-50/80 rounded-2xl p-5 flex-1 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute top-4 left-4">Payment Overview</span>
            <div className="mt-4 flex items-center justify-center gap-6 w-full">
              {/* Fake Chart */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner relative"
                style={{
                  background: `conic-gradient(#0C3B2E ${progressPercent}%, #e5e7eb ${progressPercent}%)`
                }}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center">
                  <span className="font-bold text-[#0C3B2E] text-lg leading-none">{progressPercent}%</span>
                  <span className="text-[9px] font-semibold text-gray-500">{isPaid ? 'Paid' : 'Pending'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0C3B2E]"></div>
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

        {/* Totals */}
        <div className="w-[340px] flex flex-col justify-end">
          <div className="px-6 mb-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">VAT ({invoice.taxRate || 0}%)</span>
              <span className="font-semibold text-gray-900">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-base pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-900">Total Amount</span>
              <span className="font-bold text-[#0C3B2E]">{formatCurrency(formattedTotal)}</span>
            </div>
          </div>
          
          <div className="bg-[#0C3B2E] text-white p-6 rounded-xl flex justify-between items-center shadow-md">
            <span className="font-medium text-green-100">Amount Due</span>
            <span className="text-2xl font-bold">{isPaid ? formatCurrency(0) : formatCurrency(formattedTotal)}</span>
          </div>
        </div>

      </div>
      
      {/* Footer Details */}
      <div className="mt-8 pt-8 border-t border-gray-100 flex items-start gap-12 text-xs break-inside-avoid">

        
        <div className="flex-1">
          <span className="font-bold text-gray-900 mb-3 block">BANK DETAILS</span>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-600">
            <div><span className="font-semibold">Bank Name:</span> {company?.bankName || 'Not specified'}</div>
            <div><span className="font-semibold">Account Name:</span> {company?.accountName || 'Not specified'}</div>
            <div><span className="font-semibold">Account Number:</span> {company?.accountNumber || 'Not specified'}</div>
            <div><span className="font-semibold">Routing:</span> {company?.routingNumber || 'Not specified'}</div>
            <div><span className="font-semibold">SWIFT Code:</span> {company?.swiftCode || 'Not specified'}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
