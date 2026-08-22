import React from 'react';
import { Mail, Phone, MapPin, Building2, User, FileText, CheckCircle2 } from 'lucide-react';

export default function VariantOne({ invoice }: { invoice: any }) {
  const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  const taxAmount = totalAmount * ((invoice.taxRate || 0) / 100);
  const formattedTotal = totalAmount + taxAmount;
  
  const formatCurrency = (amt: number) => {
    return `${invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPaid = invoice.status === 'PAID';
  const progressPercent = isPaid ? 100 : invoice.status === 'SENT' ? 25 : 0;

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white min-h-[1100px] shadow-sm rounded-lg overflow-hidden border border-gray-100 flex flex-col font-sans p-10 print:shadow-none print:border-none print:p-0">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#346E3A] rounded-lg flex items-center justify-center">
              <span className="text-[#FBDF4B] font-bold text-xl tracking-tighter">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 leading-tight">Faibah</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Digital Agency</span>
            </div>
          </div>
          <h1 className="text-5xl font-black text-[#0B2110] tracking-tight mt-6">INVOICE</h1>
          <p className="text-gray-500 text-sm mt-1">Solutions that drive success.</p>
        </div>

        <div className="bg-[#346E3A] text-white p-6 rounded-2xl w-72 shadow-lg">
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
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-green-400 text-green-900' : 'bg-[#FBDF4B] text-yellow-900'}`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="flex gap-6 mb-10">
        <div className="flex-1 bg-gray-50/50 border border-gray-100 p-6 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-[#346E3A]/10 text-[#346E3A] rounded-xl flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 mb-1 tracking-wider">BILL TO</span>
            <span className="font-bold text-gray-900 text-lg mb-2">{invoice.client?.name || 'Unknown Client'}</span>
            <div className="text-sm text-gray-600 space-y-1">
              <p>45/A, Road 12, Victoria Island</p>
              <p>Lagos, Nigeria</p>
              <p className="mt-2 text-gray-800">client@example.com</p>
              <p className="text-gray-800">+234 800 000 0000</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50/50 border border-gray-100 p-6 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 bg-[#346E3A]/10 text-[#346E3A] rounded-xl flex items-center justify-center shrink-0">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 mb-1 tracking-wider">FROM</span>
            <span className="font-bold text-gray-900 text-lg mb-2">Faibah Agency</span>
            <div className="text-sm text-gray-600 space-y-1">
              <p>123 Tech Street, Ikoyi</p>
              <p>Lagos, Nigeria</p>
              <p className="mt-2 text-gray-800">hello@faibah.com</p>
              <p className="text-gray-800">+234 123 456 7890</p>
              <p className="text-xs text-gray-400 mt-1">VAT Reg No: 123456789</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-10 rounded-2xl overflow-hidden border border-gray-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#346E3A] text-white">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider w-16">#</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Item & Description</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-center">Qty</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Rate</th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoice.items?.map((item: any, idx: number) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                <td className="px-6 py-5 font-semibold text-gray-400">{String(idx + 1).padStart(2, '0')}</td>
                <td className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1">{item.description}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">Professional service delivered as per project requirements.</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center font-medium text-gray-700">{item.quantity}</td>
                <td className="px-6 py-5 text-right font-medium text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="px-6 py-5 text-right font-bold text-[#346E3A]">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
            {(!invoice.items || invoice.items.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">No items found for this invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="flex gap-8 mt-auto pt-6">
        
        {/* Payment Overview & QR */}
        <div className="flex gap-4 flex-1">
          <div className="bg-gray-50/80 rounded-2xl p-5 flex-1 border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute top-4 left-4">Payment Overview</span>
            <div className="mt-4 flex items-center justify-center gap-6 w-full">
              {/* Fake Chart */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner relative"
                style={{
                  background: `conic-gradient(#346E3A ${progressPercent}%, #e5e7eb ${progressPercent}%)`
                }}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center">
                  <span className="font-bold text-[#346E3A] text-lg leading-none">{progressPercent}%</span>
                  <span className="text-[9px] font-semibold text-gray-500">{isPaid ? 'Paid' : 'Pending'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#346E3A]"></div>
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
          
          <div className="bg-gray-50/80 rounded-2xl p-5 w-40 border border-gray-100 flex flex-col items-center text-center relative">
             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider absolute top-4">Scan to Pay</span>
             <div className="mt-8 bg-white p-2 rounded-lg border border-gray-200">
                {/* SVG QR Code Placeholder */}
                <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 10H40V40H10V10ZM20 20V30H30V20H20ZM60 10H90V40H60V10ZM70 20V30H80V20H70ZM10 60H40V90H10V60ZM20 70V80H30V70H20ZM50 10H60V20H50V10ZM50 30H60V40H50V30ZM10 50H20V60H10V50ZM30 50H40V60H30V50ZM40 60H50V70H40V60ZM40 80H50V90H40V80ZM50 50H60V60H50V50ZM50 70H60V80H50V70ZM60 50H70V60H60V50ZM60 90H70V100H60V90ZM70 60H80V70H70V60ZM70 80H80V90H70V80ZM80 50H90V60H80V50ZM80 70H90V80H80V70ZM90 60H100V70H90V60ZM90 80H100V90H90V80Z" fill="#111827"/>
                </svg>
             </div>
             <p className="text-[9px] font-medium text-gray-500 mt-3 leading-tight">Thank you for your business!</p>
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
              <span className="font-bold text-[#346E3A]">{formatCurrency(formattedTotal)}</span>
            </div>
          </div>
          
          <div className="bg-[#346E3A] text-white p-6 rounded-xl flex justify-between items-center shadow-md">
            <span className="font-medium text-green-100">Amount Due</span>
            <span className="text-2xl font-bold">{isPaid ? formatCurrency(0) : formatCurrency(formattedTotal)}</span>
          </div>
        </div>

      </div>
      
      {/* Footer Details */}
      <div className="mt-8 pt-8 border-t border-gray-100 flex items-start gap-12 text-xs">
        <div>
          <span className="font-bold text-gray-900 mb-3 block">PAYMENT METHODS</span>
          <div className="flex gap-4">
            <div className="px-3 py-1 bg-gray-100 rounded text-gray-600 font-bold">VISA</div>
            <div className="px-3 py-1 bg-gray-100 rounded text-gray-600 font-bold">MasterCard</div>
            <div className="px-3 py-1 bg-gray-100 rounded text-gray-600 font-bold flex items-center gap-1"><Building2 size={12}/> Bank</div>
          </div>
        </div>
        
        <div className="flex-1">
          <span className="font-bold text-gray-900 mb-3 block">BANK DETAILS</span>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-gray-600">
            <div><span className="font-semibold">Bank Name:</span> GTBank PLC</div>
            <div><span className="font-semibold">Account Name:</span> Faibah Digital Solutions Ltd.</div>
            <div><span className="font-semibold">Account Number:</span> 0123456789</div>
            <div><span className="font-semibold">Branch:</span> Victoria Island Branch</div>
            <div><span className="font-semibold">SWIFT Code:</span> GTBINGLA</div>
          </div>
        </div>
      </div>

    </div>
  );
}
