'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Send, RefreshCcw } from 'lucide-react';
import { InvoicesApi } from '@/lib/api';
import VariantOne from '@/components/invoices/VariantOne';
import VariantTwo from '@/components/invoices/VariantTwo';
import VariantThree from '@/components/invoices/VariantThree';

export default function InvoicePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<1 | 2 | 3>(3);

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
    <div className="w-full flex flex-col min-h-screen print:!min-h-0 bg-gray-100 pb-12 print:!p-0 print:!bg-white print:!block">
      
      {/* Top action bar (Not visible when printed) */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6 print:hidden shadow-sm">
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => router.push('/invoices')}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              Preview Invoice 
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium font-mono border border-gray-200">
                {invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}
              </span>
            </h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          
          {/* Variant Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 w-full sm:w-auto overflow-x-auto">
            <button 
              onClick={() => setVariant(3)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${variant === 3 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Classic
            </button>
            <button 
              onClick={() => setVariant(2)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${variant === 2 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Professional
            </button>
            <button 
              onClick={() => setVariant(1)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-all whitespace-nowrap ${variant === 1 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Enterprise
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors border border-gray-300">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#FBDF4B] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#F3D53C] transition-colors border border-transparent whitespace-nowrap">
              <Send className="w-4 h-4" />
              Send to Client
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Preview Container */}
      <div className="mt-8 flex justify-center w-full pb-32 print:hidden">
        <div className="w-[800px] min-w-[800px] origin-top transform scale-[0.40] sm:scale-[0.65] lg:scale-100 transition-all duration-300 -mb-[60%] sm:-mb-[35%] lg:mb-0 shadow-2xl bg-white">
          {variant === 1 ? (
            <VariantOne invoice={invoice} />
          ) : variant === 2 ? (
            <VariantTwo invoice={invoice} />
          ) : (
            <VariantThree invoice={invoice} />
          )}
        </div>
      </div>

      {/* Dedicated Print Container */}
      <div className="hidden print:block w-full max-w-full m-0 p-0 bg-white">
        {variant === 1 ? (
          <VariantOne invoice={invoice} />
        ) : variant === 2 ? (
          <VariantTwo invoice={invoice} />
        ) : (
          <VariantThree invoice={invoice} />
        )}
      </div>

    </div>
  );
}
