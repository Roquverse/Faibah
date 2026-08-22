import React from 'react';
import { Mail, Phone, MapPin, Building2, User, FileText, Globe } from 'lucide-react';

export default function VariantTwo({ invoice }: { invoice: any }) {
  const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  const taxAmount = totalAmount * ((invoice.taxRate || 0) / 100);
  const formattedTotal = totalAmount + taxAmount;
  
  const formatCurrency = (amt: number) => {
    return `${invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPaid = invoice.status === 'PAID';

  return (
    <div className="w-full max-w-[900px] mx-auto bg-white min-h-[1100px] shadow-sm rounded-lg overflow-hidden border border-gray-100 flex flex-col font-sans print:shadow-none print:border-none">
      
      {/* Top Banner (Novatech style: Dark slate with green accent) */}
      <div className="h-32 bg-[#111827] relative flex justify-end items-center px-10 overflow-hidden">
        {/* Decorative Green slash */}
        <div className="absolute -left-10 top-0 bottom-0 w-[400px] bg-[#346E3A] -skew-x-[30deg]"></div>
        
        {/* Contact info on the right */}
        <div className="text-gray-300 text-xs space-y-2 z-10 font-medium">
          <div className="flex items-center justify-end gap-3"><Phone size={14} className="text-gray-400"/> +234 123 456 7890</div>
          <div className="flex items-center justify-end gap-3"><Mail size={14} className="text-gray-400"/> hello@faibah.com</div>
          <div className="flex items-center justify-end gap-3"><Globe size={14} className="text-gray-400"/> www.faibah.com</div>
          <div className="flex items-start justify-end gap-3 pt-1"><MapPin size={14} className="text-gray-400 mt-0.5"/> 123 Tech Street, Ikoyi<br/>Lagos, Nigeria</div>
        </div>
      </div>

      <div className="px-10 py-12 flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-14">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#346E3A] rounded-xl flex items-center justify-center">
                <span className="text-[#FBDF4B] font-bold text-2xl tracking-tighter">F</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl text-gray-900 leading-none">Faibah</span>
                <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">Digital Agency</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-[#111827] tracking-wider mb-1">INVOICE</h1>
            <p className="text-gray-500 font-medium text-lg tracking-wide uppercase">{invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}</p>
          </div>

          <div className="flex items-center gap-6 mt-16 bg-gray-50 px-6 py-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-4 text-sm border-r border-gray-200 pr-6">
              <FileText size={24} className="text-[#346E3A]" />
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
              <span className={`px-4 py-1 rounded-full text-xs font-bold ${isPaid ? 'bg-[#346E3A] text-white' : 'bg-gray-200 text-gray-700'}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="flex justify-between mb-12">
          <div className="flex gap-4 max-w-[300px]">
            <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#346E3A] shrink-0">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 mb-2 tracking-wider">BILL TO</span>
              <span className="font-bold text-gray-900 text-lg mb-1">{invoice.client?.name || 'Unknown Client'}</span>
              <div className="text-sm text-gray-600 space-y-1">
                <p>45/A, Road 12, Victoria Island</p>
                <p>Lagos, Nigeria</p>
                <p className="mt-2 text-gray-800">client@example.com</p>
                <p className="text-gray-800">+234 800 000 0000</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 max-w-[300px]">
            <div className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-[#346E3A] shrink-0">
              <Building2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 mb-2 tracking-wider">FROM</span>
              <span className="font-bold text-gray-900 text-lg mb-1">Faibah Agency</span>
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
        <div className="mb-10 overflow-hidden border border-gray-200 rounded-lg">
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
              {invoice.items?.map((item: any, idx: number) => (
                <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-6 text-center">
                    <div className="w-8 h-8 mx-auto bg-gray-50 border border-gray-100 text-[#346E3A] rounded flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="font-bold text-gray-900 mb-1">{item.description}</div>
                    <div className="text-xs text-gray-500">Professional service delivered as per project requirements.</div>
                  </td>
                  <td className="px-6 py-6 text-center font-medium text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-6 text-right font-medium text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-6 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</td>
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
        <div className="flex justify-between items-end mt-auto pb-8">
          
          <div className="max-w-[300px]">
            <div className="flex items-center gap-2 mb-3 text-[#346E3A]">
              <FileText size={16} />
              <span className="font-bold text-sm">Payment Method</span>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="font-bold text-[#111827] italic text-xl">VISA</div>
              <div className="font-bold text-[#111827] italic text-xl">mastercard</div>
              <div className="font-bold text-gray-500 text-sm flex items-center gap-1 border border-gray-200 px-2 rounded"><Building2 size={14}/> BANK</div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 flex gap-4 bg-gray-50/50">
               <div className="bg-white p-2 border border-gray-200 rounded shrink-0">
                  {/* SVG QR Code Placeholder */}
                  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 10H40V40H10V10ZM20 20V30H30V20H20ZM60 10H90V40H60V10ZM70 20V30H80V20H70ZM10 60H40V90H10V60ZM20 70V80H30V70H20ZM50 10H60V20H50V10ZM50 30H60V40H50V30ZM10 50H20V60H10V50ZM30 50H40V60H30V50ZM40 60H50V70H40V60ZM40 80H50V90H40V80ZM50 50H60V60H50V50ZM50 70H60V80H50V70ZM60 50H70V60H60V50ZM60 90H70V100H60V90ZM70 60H80V70H70V60ZM70 80H80V90H70V80ZM80 50H90V60H80V50ZM80 70H90V80H80V70ZM90 60H100V70H90V60ZM90 80H100V90H90V80Z" fill="#111827"/>
                  </svg>
               </div>
               <div>
                  <div className="font-bold text-gray-900 text-sm mb-1">Scan to pay</div>
                  <p className="text-xs text-gray-500 leading-snug">Thank you for your business! We truly appreciate your trust in Faibah.</p>
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
            <div className="flex justify-between items-center pt-2 font-bold text-[#346E3A] text-xl bg-green-50 p-3 rounded-lg">
              <span>Amount Paid</span>
              <span>{isPaid ? formatCurrency(formattedTotal) : formatCurrency(0)}</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom Thanks Banner */}
      <div className="bg-[#111827] text-center py-6 text-[#346E3A] italic font-serif text-2xl mt-auto">
        Thank you for your <span className="font-bold underline decoration-[#FBDF4B] underline-offset-4 decoration-2">business!</span>
      </div>

    </div>
  );
}
