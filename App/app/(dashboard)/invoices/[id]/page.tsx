'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Send, RefreshCcw } from 'lucide-react';
import { InvoicesApi } from '@/lib/api';
import VariantOne from '@/components/invoices/VariantOne';
import VariantTwo from '@/components/invoices/VariantTwo';

export default function InvoicePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<1 | 2>(1);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await InvoicesApi.getById(id as string);
        setInvoice(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 bg-gray-50/50">
        <div className="text-gray-500 font-medium flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 animate-spin" /> Loading invoice...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 bg-gray-50/50 gap-4">
        <div className="text-gray-500 font-medium">Invoice not found.</div>
        <button onClick={() => router.push('/invoices')} className="text-blue-600 hover:underline">Go back to Invoices</button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-gray-100 pb-12">
      
      {/* Top action bar (Not visible when printed) */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/invoices')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-3">
              Preview Invoice 
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium font-mono border border-gray-200">
                {invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}
              </span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          
          {/* Variant Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 mr-4">
            <button 
              onClick={() => setVariant(1)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${variant === 1 ? 'bg-white text-[#346E3A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Variant 1 (Nexora)
            </button>
            <button 
              onClick={() => setVariant(2)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${variant === 2 ? 'bg-white text-[#346E3A] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Variant 2 (Novatech)
            </button>
          </div>

          <button onClick={() => window.print()} className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors border border-gray-300">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button className="flex items-center gap-2 bg-[#346E3A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2a582e] transition-colors shadow-sm">
            <Send className="w-4 h-4" />
            Send to Client
          </button>
        </div>
      </div>

      {/* Invoice Preview Container */}
      <div className="mt-8 px-8 print:p-0 print:mt-0">
        {variant === 1 ? (
          <VariantOne invoice={invoice} />
        ) : (
          <VariantTwo invoice={invoice} />
        )}
      </div>

    </div>
  );
}
