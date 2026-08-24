import React from 'react';
import { Mail, Phone, MapPin, Building2, User, FileText } from 'lucide-react';

export default function VariantThree({ invoice }: { invoice: any }) {
  const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
  const taxAmount = totalAmount * ((invoice.taxRate || 0) / 100);
  const formattedTotal = totalAmount + taxAmount;
  
  const formatCurrency = (amt: number) => {
    return `${invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPaid = invoice.status === 'PAID';
  const progressPercent = isPaid ? 100 : invoice.status === 'SENT' ? 25 : 0;

  return (
    <div className="w-full max-w-[900px] print:!max-w-none mx-auto print:!mx-0 bg-white min-h-[1100px] print:!min-h-0 overflow-hidden print:!overflow-visible border border-gray-300 print:!border-none flex flex-col print:!block font-sans p-10 print:!p-6 print:!pb-12 text-gray-900">
      
      {/* Header Section */}
      <div className="flex justify-between items-start mb-12 print:!mb-6 border-b border-gray-200 pb-8 print:!pb-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col mb-4">
            <span className="font-bold text-2xl leading-tight uppercase tracking-wider">{invoice.client?.company?.name || 'Faibah Agency'}</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            {invoice.client?.company?.address && <p>{invoice.client.company.address}</p>}
            {(invoice.client?.company?.city || invoice.client?.company?.country) && <p>{[invoice.client?.company?.city, invoice.client?.company?.country].filter(Boolean).join(', ')}</p>}
            {invoice.client?.company?.companyEmail && <p>{invoice.client.company.companyEmail}</p>}
            {invoice.client?.company?.companyPhone && <p>{invoice.client.company.companyPhone}</p>}
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-4xl font-light tracking-widest text-gray-400 mb-6 uppercase">Invoice</h1>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-left">
            <span className="text-gray-500">Invoice No:</span>
            <span className="font-semibold text-right">{invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}</span>
            
            <span className="text-gray-500">Date:</span>
            <span className="font-semibold text-right">{new Date(invoice.createdAt).toLocaleDateString()}</span>
            
            <span className="text-gray-500">Due Date:</span>
            <span className="font-semibold text-right">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
            
            <span className="text-gray-500 mt-2">Status:</span>
            <span className="font-semibold text-right mt-2">{invoice.status}</span>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="mb-12 print:!mb-6">
        <span className="text-xs font-bold text-gray-400 mb-4 block uppercase tracking-widest">Billed To</span>
        <span className="font-bold text-lg mb-1 block">{invoice.client?.name || 'Unknown Client'}</span>
        <div className="text-sm text-gray-600 space-y-1">
          {invoice.client?.address && <p>{invoice.client.address}</p>}
          {(invoice.client?.city || invoice.client?.country) && <p>{[invoice.client?.city, invoice.client?.country].filter(Boolean).join(', ')}</p>}
          {invoice.client?.email && <p>{invoice.client.email}</p>}
          {invoice.client?.whatsappNumber && <p>{invoice.client.whatsappNumber}</p>}
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-10 print:!mb-6">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-3 font-semibold text-gray-900 uppercase">Item & Description</th>
              <th className="py-3 font-semibold text-gray-900 uppercase text-center w-24">Qty</th>
              <th className="py-3 font-semibold text-gray-900 uppercase text-right w-32">Rate</th>
              <th className="py-3 font-semibold text-gray-900 uppercase text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items?.map((item: any, idx: number) => {
              const parts = item.description ? item.description.split('|||') : ['Unknown Item'];
              const itemName = parts[0];
              const itemDetails = parts.length > 1 ? parts.slice(1).join('|||') : 'Professional service delivered as per project requirements.';

              return (
              <tr key={idx}>
                <td className="py-4 print:!py-2">
                  <div className="font-bold text-gray-900">{itemName}</div>
                  {itemDetails && <div className="text-xs text-gray-500 mt-1">{itemDetails}</div>}
                </td>
                <td className="py-4 print:!py-2 text-center text-gray-700">{item.quantity}</td>
                <td className="py-4 print:!py-2 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-4 print:!py-2 text-right font-bold text-gray-900">{formatCurrency(item.amount)}</td>
              </tr>
            )})}
            {(!invoice.items || invoice.items.length === 0) && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">No items found for this invoice.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="flex justify-end mt-auto print:!mt-4 pt-6 print:!pt-2">
        <div className="w-[340px] flex flex-col justify-end">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">VAT ({invoice.taxRate || 0}%)</span>
              <span className="font-semibold text-gray-900">{formatCurrency(taxAmount)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center border-t-2 border-gray-900 pt-4 mb-2">
            <span className="font-bold uppercase tracking-wider text-sm">Total Amount</span>
            <span className="font-bold text-xl">{formatCurrency(formattedTotal)}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Amount Paid</span>
            <span className="font-semibold">{isPaid ? formatCurrency(formattedTotal) : formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="font-bold">Amount Due</span>
            <span className="font-bold text-lg">{isPaid ? formatCurrency(0) : formatCurrency(formattedTotal)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer Details */}
      <div className="mt-16 print:!mt-6 pt-8 print:!pt-4 border-t border-gray-200 text-xs break-inside-avoid">
        <span className="font-bold text-gray-900 mb-4 block uppercase tracking-widest">Bank Details</span>
        <div className="grid grid-cols-2 gap-y-3 gap-x-12 text-gray-600 max-w-[600px]">
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-gray-500">Bank Name</span> 
            <span className="font-medium text-gray-900">{invoice.client?.company?.bankName || 'Not specified'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-gray-500">Account Name</span> 
            <span className="font-medium text-gray-900">{invoice.client?.company?.accountName || 'Not specified'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-gray-500">Account Number</span> 
            <span className="font-medium text-gray-900">{invoice.client?.company?.accountNumber || 'Not specified'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-gray-500">Routing Code</span> 
            <span className="font-medium text-gray-900">{invoice.client?.company?.routingNumber || 'Not specified'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-1">
            <span className="font-semibold text-gray-500">SWIFT Code</span> 
            <span className="font-medium text-gray-900">{invoice.client?.company?.swiftCode || 'Not specified'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
