'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Printer, RefreshCcw, CheckCircle2, Building2, User, FileText } from 'lucide-react';
import { ReceiptsApi, CompanyApi } from '@/lib/api';

export default function ClientReceiptPreviewPage() {
  const { id } = useParams();

  const [receipt, setReceipt] = useState<any>(null);
  const [company, setCompany]  = useState<any>(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [data, co] = await Promise.all([
          ReceiptsApi.getById(id as string),
          CompanyApi.getProfile().catch(() => null),
        ]);
        setReceipt(data);
        setCompany(co ?? null);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <RefreshCcw className="w-4 h-4 animate-spin" /> Loading receipt…
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-white">
        <div className="text-gray-500 font-medium">Receipt not found or access denied.</div>
      </div>
    );
  }

  /* ── Derived values ─────────────────────────────── */
  const inv       = receipt.invoice;
  const sym       = inv?.currency === 'USD' ? '$' : inv?.currency === 'NGN' ? '₦' : (inv?.currency ?? '₦');
  const fmt       = (n: number) => `${sym}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const subtotal  = inv?.items?.reduce((s: number, i: any) => s + (i.amount || 0), 0) ?? 0;
  const tax       = subtotal * ((inv?.taxRate || 0) / 100);
  const invTotal  = subtotal + tax;
  const totalPaid = inv?.receipts?.reduce((s: number, r: any) => s + (r.amountPaid || 0), 0) ?? Number(receipt.amountPaid);
  const balance   = Math.max(0, invTotal - totalPaid);
  const isFullyPaid = balance === 0 && invTotal > 0;
  const paidPct   = invTotal > 0 ? Math.min(100, Math.round((totalPaid / invTotal) * 100)) : (isFullyPaid ? 100 : 0);

  const rcpRef    = receipt.receiptRef ?? `RCP-${receipt.id.slice(0, 6).toUpperCase()}`;
  const rcpDate   = new Date(receipt.paymentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Set page title = receipt ref so browser uses it as the PDF filename
  useEffect(() => {
    document.title = rcpRef;
    return () => { document.title = 'Faibah'; };
  }, [rcpRef]);

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">

      {/* ── Toolbar (hidden on print) ── */}
      <div className="print:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-base font-extrabold text-gray-900">Payment Receipt</h1>
          <p className="text-xs text-gray-400 font-mono">{rcpRef}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#0C3B2E] text-white rounded-xl text-sm font-bold hover:bg-[#082B21] transition-colors shadow"
        >
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {/* ── Receipt Document ── */}
      <div className="max-w-[820px] mx-auto my-8 print:my-0 print:max-w-none print:mx-0">
        <div className="receipt-print-zone bg-white rounded-2xl shadow-xl p-10 print:p-8 relative font-sans overflow-hidden">

          {/* Watermark */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.04] rotate-[-30deg] text-[110px] font-black tracking-widest uppercase ${
            isFullyPaid ? 'text-green-700' : 'text-yellow-600'
          }`}>
            {isFullyPaid ? 'PAID' : 'PARTIAL'}
          </div>

          {/* ── Header ── */}
          <div className="flex justify-between items-start mb-10">
            {/* Brand */}
            <div className="flex items-center gap-3">
              {company?.logoUrl ? (
                <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src={company.logoUrl} alt={company.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[#FFBA00] font-black text-xl">
                    {company?.name ? company.name.charAt(0).toUpperCase() : 'F'}
                  </span>
                </div>
              )}
              <div>
                <div className="font-extrabold text-xl text-gray-900 leading-tight">{company?.name ?? 'Faibah'}</div>
                <div className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">{company?.workType ?? 'Digital Agency'}</div>
              </div>
            </div>

            {/* Receipt badge */}
            <div className="bg-[#0C3B2E] text-white p-5 rounded-2xl shadow-lg min-w-[200px]">
              <div className="text-[10px] font-bold text-green-300 uppercase tracking-widest mb-1">Payment Receipt</div>
              <div className="font-black text-lg tracking-tight">{rcpRef}</div>
              <div className="text-xs text-green-200 mt-1">{rcpDate}</div>
              <div className="mt-3 pt-3 border-t border-green-700/40 flex items-center justify-between">
                <span className="text-xs text-green-300">Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isFullyPaid ? 'bg-green-400 text-green-900' : 'bg-[#FFBA00] text-yellow-900'
                }`}>
                  {isFullyPaid ? 'PAID' : 'PARTIAL'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Parties ── */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Client */}
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-start gap-4">
              <div className="w-9 h-9 bg-[#0C3B2E]/10 text-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
                <User size={18} />
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Received From</div>
                <div className="font-bold text-gray-900 text-base">{inv?.client?.name ?? 'Valued Client'}</div>
                {inv?.client?.email && <div className="text-xs text-gray-500 mt-0.5">{inv.client.email}</div>}
                {inv?.client?.whatsappNumber && <div className="text-xs text-gray-500">{inv.client.whatsappNumber}</div>}
                {inv?.client?.address && <div className="text-xs text-gray-400 mt-1">{inv.client.address}</div>}
                {(inv?.client?.city || inv?.client?.country) && !inv?.client?.address && (
                  <div className="text-xs text-gray-400">{[inv?.client?.city, inv?.client?.country].filter(Boolean).join(', ')}</div>
                )}
              </div>
            </div>

            {/* Issuer */}
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex items-start gap-4">
              <div className="w-9 h-9 bg-[#0C3B2E]/10 text-[#0C3B2E] rounded-xl flex items-center justify-center shrink-0">
                <Building2 size={18} />
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Issued By</div>
                <div className="font-bold text-gray-900 text-base">{company?.name ?? 'Faibah Agency'}</div>
                {company?.companyEmail && <div className="text-xs text-gray-500 mt-0.5">{company.companyEmail}</div>}
                {company?.companyPhone && <div className="text-xs text-gray-500">{company.companyPhone}</div>}
                {company?.address && <div className="text-xs text-gray-400 mt-1">{company.address}</div>}
                {(company?.city || company?.country) && !company?.address && (
                  <div className="text-xs text-gray-400">{[company?.city, company?.country].filter(Boolean).join(', ')}</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Meta Row ── */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[{
              label: 'Invoice Ref',
              value: inv?.invoiceRef ? `#${inv.invoiceRef}` : `#${receipt.invoiceId?.slice(0,8).toUpperCase() ?? '—'}`,
            }, {
              label: 'Payment Method',
              value: receipt.paymentMethod ?? 'Bank Transfer',
            }, {
              label: 'Payment Date',
              value: rcpDate,
            }].map(({ label, value }) => (
              <div key={label} className="bg-[#0C3B2E]/5 border border-[#0C3B2E]/10 rounded-xl p-3.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                <div className="font-semibold text-gray-900 text-sm">{value}</div>
              </div>
            ))}
          </div>

          {/* ── Items Table ── */}
          {inv?.items && inv.items.length > 0 && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0C3B2E] text-white">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider w-10">#</th>
                    <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider">Item &amp; Description</th>
                    <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-center">Qty</th>
                    <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-right">Rate</th>
                    <th className="px-5 py-3.5 font-semibold text-[11px] uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inv.items.map((item: any, idx: number) => {
                    const parts = item.description ? item.description.split('|||') : ['Service'];
                    const itemName    = parts[0];
                    const itemDetails = parts.length > 1 ? parts.slice(1).join('') : '';
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                        <td className="px-5 py-4 text-gray-400 font-semibold text-xs">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-100 text-gray-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <FileText size={14} />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{itemName}</div>
                              {itemDetails && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{itemDetails}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center text-gray-700 font-medium">{item.quantity ?? 1}</td>
                        <td className="px-5 py-4 text-right text-gray-700 font-medium">{fmt(item.unitPrice ?? 0)}</td>
                        <td className="px-5 py-4 text-right font-bold text-[#0C3B2E]">{fmt(item.amount ?? 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Totals + Progress ── */}
          <div className="flex gap-6 mb-8">
            {/* Progress donut */}
            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col items-center justify-center gap-3">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Progress</div>
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-inner"
                style={{ background: `conic-gradient(#0C3B2E ${paidPct}%, #e5e7eb ${paidPct}%)` }}
              >
                <div className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center">
                  <span className="font-black text-[#0C3B2E] text-base leading-none">{paidPct}%</span>
                  <span className="text-[9px] font-semibold text-gray-500">{isFullyPaid ? 'Paid' : 'Partial'}</span>
                </div>
              </div>
              <div className="space-y-1.5 w-full">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0C3B2E]"></div>
                  <span className="text-gray-500 flex-1">Paid</span>
                  <span className="font-bold text-gray-900">{paidPct}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                  <span className="text-gray-500 flex-1">Remaining</span>
                  <span className="font-bold text-gray-900">{100 - paidPct}%</span>
                </div>
              </div>
            </div>

            {/* Amounts */}
            <div className="flex-[2] flex flex-col justify-end">
              <div className="space-y-2.5 px-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT ({inv?.taxRate ?? 0}%)</span>
                  <span className="font-semibold text-gray-900">{fmt(tax)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Invoice Total</span>
                  <span className="font-bold text-gray-900">{fmt(invTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">This Payment</span>
                  <span className="font-semibold text-green-700">{fmt(Number(receipt.amountPaid))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Paid to Date</span>
                  <span className="font-semibold text-green-700">{fmt(totalPaid)}</span>
                </div>
              </div>
              <div className={`p-5 rounded-xl flex justify-between items-center shadow-md ${
                isFullyPaid ? 'bg-green-600' : 'bg-[#0C3B2E]'
              }`}>
                <div>
                  <div className="text-xs text-white/70 font-medium">Balance Remaining</div>
                  <div className="text-2xl font-black text-white">
                    {isFullyPaid ? 'Fully Paid' : fmt(balance)}
                  </div>
                </div>
                {isFullyPaid && (
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              This is an official computer-generated receipt.<br />
              <span className="font-semibold text-gray-500">Thank you for your business!</span>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-medium">Receipt #{rcpRef}</div>
              <div className="text-[10px] text-gray-300">Generated by Faibah Platform</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
