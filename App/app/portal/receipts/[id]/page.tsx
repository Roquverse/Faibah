'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { ReceiptsApi } from '@/lib/api';

export default function ClientReceiptPreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const receiptData = await ReceiptsApi.getById(id as string);
        setSelectedReceipt(receiptData);
      } catch (e) {
        console.error('Error fetching receipt:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchReceipt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
        <div className="text-gray-500 font-medium flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 animate-spin" /> Loading receipt...
        </div>
      </div>
    );
  }

  if (error || !selectedReceipt) {
    return (
      <div className="flex flex-col h-full min-h-[400px] items-center justify-center p-8 gap-4 bg-white rounded-2xl border border-gray-200">
        <div className="text-gray-500 font-medium">Receipt not found or access denied.</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:!space-y-0 print:!block">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden mb-8">
        <div className="flex items-center gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              Payment Receipt 
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium font-mono border border-gray-200">
                {selectedReceipt.receiptRef || `RCP-${selectedReceipt.id.slice(0, 6).toUpperCase()}`}
              </span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#0C3B2E] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#082B21] transition-colors shadow-sm">
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Printable Receipt Content */}
      <div className="bg-white rounded-2xl w-full p-8 shadow-2xl border border-gray-100 print:shadow-none print:border-none print:p-0">
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6">
            <div>
              <div className="text-xl font-extrabold text-[#0C3B2E] tracking-tight">FAIBA PLATFORM</div>
              <div className="text-xs text-gray-500 mt-1">Payment Confirmation Receipt</div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-gray-900">
                {selectedReceipt.receiptRef || `RCP-${selectedReceipt.id.slice(0, 6).toUpperCase()}`}
              </div>
              <div className="text-xs text-gray-500 font-semibold mt-0.5">
                Date: {new Date(selectedReceipt.paymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block mb-1">Received From:</span>
              <span className="font-bold text-gray-900 text-sm block">
                {selectedReceipt.invoice?.client?.name || 'Valued Client'}
              </span>
              <span className="text-gray-500">
                {selectedReceipt.invoice?.client?.email || ''}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block mb-1">Invoice Reference:</span>
              <span className="font-bold text-gray-900 text-sm block">
                #{selectedReceipt.invoice?.invoiceRef || selectedReceipt.invoiceId?.slice(0, 8).toUpperCase()}
              </span>
              <span className="text-gray-500">
                Payment Method: {selectedReceipt.paymentMethod || 'Bank Transfer'}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-6 rounded-2xl text-center">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Total Amount Received</div>
            <div className="text-3xl font-extrabold text-emerald-900">
              {selectedReceipt.invoice?.currency === 'USD' ? '$' : '₦'}
              {Number(selectedReceipt.amountPaid).toLocaleString()}
            </div>
            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-emerald-600 text-white text-[11px] font-bold rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Payment Successful
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
            Thank you for your business! This is an official computer-generated payment receipt.
          </div>

        </div>
      </div>

    </div>
  );
}
