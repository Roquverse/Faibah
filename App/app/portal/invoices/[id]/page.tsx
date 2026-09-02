'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, RefreshCcw, CreditCard } from 'lucide-react';
import { InvoicesApi, CompanyApi } from '@/lib/api';
import VariantThree from '@/components/invoices/VariantThree';

export default function ClientInvoicePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const invoiceData = await InvoicesApi.getById(id as string);
        setInvoice(invoiceData);
        // Attempt to fetch company info (sender's info). 
        // In a real multi-tenant app, the invoice might include companyId or details directly.
        const companyData = await CompanyApi.getProfile().catch(() => null);
        setCompany(companyData);
      } catch (e) {
        console.error('Error fetching invoice:', e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
        <div className="text-gray-500 font-medium flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 animate-spin" /> Loading invoice...
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col h-full min-h-[400px] items-center justify-center p-8 gap-4 bg-white rounded-2xl border border-gray-200">
        <div className="text-gray-500 font-medium">Invoice not found or access denied.</div>
        <button onClick={() => router.push('/portal/invoices')} className="text-indigo-600 font-bold hover:underline">
          Go back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 print:!space-y-0 print:!block">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden mb-8">
        <div className="flex items-center gap-4 shrink-0">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
              Invoice 
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-medium font-mono border border-gray-200">
                {invoice.invoiceRef || invoice.id.slice(0,8).toUpperCase()}
              </span>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          {invoice.status !== 'PAID' && (
            <button disabled className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed shadow-sm">
              <CreditCard className="w-4 h-4" />
              Pay Now (Coming Soon)
            </button>
          )}
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="flex justify-center w-full pb-32 print:p-0 print:pb-0">
        <div className="w-[800px] min-w-[800px] origin-top transform scale-[0.50] sm:scale-[0.70] lg:scale-100 transition-all duration-300 -mb-[50%] sm:-mb-[30%] lg:mb-0 shadow-2xl bg-white border border-gray-100 print:shadow-none print:border-none">
          <VariantThree invoice={invoice} company={company} />
        </div>
      </div>

    </div>
  );
}
