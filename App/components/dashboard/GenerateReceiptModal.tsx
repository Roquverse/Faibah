'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ReceiptsApi } from '@/lib/api';

export default function GenerateReceiptModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  invoice
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSuccess: () => void,
  invoice: any
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // Set default amount when modal opens and invoice changes
  React.useEffect(() => {
    if (isOpen && invoice) {
      const totalAmount = invoice.items?.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;
      const formattedTotal = totalAmount + (totalAmount * ((invoice.taxRate || 0) / 100));
      setAmountPaid(formattedTotal);
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountPaid <= 0) {
      alert("Amount paid must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await ReceiptsApi.create({
        invoiceId: invoice.id,
        amountPaid: Number(amountPaid),
        paymentMethod,
        paymentDate: new Date(paymentDate).toISOString()
      });
      onSuccess();
    } catch (error) {
      console.error("Failed to generate receipt:", error);
      alert("Failed to generate receipt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Generate Receipt</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Invoice Reference</div>
            <div className="font-semibold text-gray-900">{invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}</div>
            <div className="text-xs text-gray-400 mt-2">Client: {invoice.client?.name}</div>
          </div>

          <form id="generate-receipt-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount Paid</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  {invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}
                </span>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={amountPaid}
                  onChange={e => setAmountPaid(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Cash">Cash</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payment Date</label>
              <input 
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                required
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="generate-receipt-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#FBDF4B] text-gray-900 hover:bg-[#F3D53C] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Generating...' : 'Generate Receipt'}
          </button>
        </div>

      </div>
    </div>
  );
}
