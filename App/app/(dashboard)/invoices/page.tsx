'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Eye, Receipt, FileText, Trash2, MoreHorizontal, Search, DollarSign, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { InvoicesApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusPill } from '@/components/shared/StatusPill';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import NewInvoiceModal from '@/components/dashboard/NewInvoiceModal';
import GenerateReceiptModal from '@/components/dashboard/GenerateReceiptModal';

type Invoice = {
  id: string;
  invoiceRef?: string;
  status: string;
  currency: string;
  taxRate?: number;
  dueDate?: string;
  updatedAt?: string;
  createdAt?: string;
  client?: { name?: string } | null;
  project?: { name?: string } | null;
  items?: { amount: number }[];
};

function calcTotal(inv: Invoice) {
  const sub = inv.items?.reduce((a, i) => a + i.amount, 0) ?? 0;
  return sub * (1 + (inv.taxRate ?? 0) / 100);
}

function currencySymbol(currency: string) {
  return currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency;
}

function fmtCurrency(sym: string, amt: number) {
  return `${sym}${amt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await InvoicesApi.getAll();
      setInvoices(data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.invoice-menu')) setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sym = invoices.length > 0 ? currencySymbol(invoices[0].currency) : '₦';

  let outstanding = 0, overdue = 0, collected = 0;
  invoices.forEach(inv => {
    const total = calcTotal(inv);
    if (inv.status === 'SENT') {
      outstanding += total;
      if (inv.dueDate && new Date(inv.dueDate) < now) overdue += total;
    } else if (inv.status === 'PAID') {
      if (new Date(inv.updatedAt ?? inv.createdAt ?? '') >= startOfMonth) collected += total;
    }
  });

  // ── Table ────────────────────────────────────────────────────────────────
  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    return !q || (inv.invoiceRef ?? inv.id).toLowerCase().includes(q)
      || inv.client?.name?.toLowerCase().includes(q)
      || inv.project?.name?.toLowerCase().includes(q);
  });

  const columns: ColumnDef<Invoice>[] = [
    {
      key: 'invoiceRef', header: 'Invoice ID',
      render: inv => (
        <span className="font-mono text-xs font-semibold text-gray-900">
          {inv.invoiceRef ?? inv.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: 'client', header: 'Client & Project',
      render: inv => (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{inv.client?.name ?? 'Unknown Client'}</div>
          <div className="text-xs text-gray-400">{inv.project?.name ?? 'No project linked'}</div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status', headerClassName: 'text-center',
      render: inv => <div className="flex justify-center"><StatusPill status={inv.status} /></div>,
    },
    {
      key: 'amount', header: 'Amount', headerClassName: 'text-right',
      render: inv => (
        <div className="text-right font-bold text-gray-900">
          {fmtCurrency(currencySymbol(inv.currency), calcTotal(inv))}
        </div>
      ),
    },
    {
      key: 'dueDate', header: 'Due Date', headerClassName: 'text-right',
      render: inv => (
        <div className="text-right text-sm text-gray-500">
          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
        </div>
      ),
    },
    {
      key: 'actions', header: '', headerClassName: 'w-[140px]',
      render: inv => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/invoices/${inv.id}`}
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Eye size={12} /> View
          </Link>
          {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
            <button
              onClick={e => { e.stopPropagation(); setReceiptInvoice(inv); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Receipt size={12} /> Receipt
            </button>
          )}
          {/* ⋯ menu */}
          <div className="relative invoice-menu">
            <button
              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === inv.id ? null : inv.id); }}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal size={15} />
            </button>
            {openMenuId === inv.id && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                <button
                  onClick={() => { setInvoiceToEdit(inv); setIsNewOpen(true); setOpenMenuId(null); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <FileText size={14} /> Edit Invoice
                </button>
                <button
                  onClick={async () => {
                    if (!confirm('Delete this invoice?')) return;
                    await InvoicesApi.delete(inv.id);
                    fetchInvoices();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Invoices"
        description="Global view of all your receivables and payments."
        action={{ label: 'New Invoice', onClick: () => { setInvoiceToEdit(null); setIsNewOpen(true); }, icon: <Plus size={15} /> }}
      />

      <div className="p-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Outstanding" value={fmtCurrency(sym, outstanding)} icon={<DollarSign size={18} />} />
          <StatCard title="Overdue" value={fmtCurrency(sym, overdue)} icon={<AlertTriangle size={18} />} />
          <StatCard title="Avg. Days to Payment" value="0 Days" icon={<Clock size={18} />} />
          <StatCard title="Collected This Month" value={fmtCurrency(sym, collected)} icon={<TrendingUp size={18} />} />
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="pl-9"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No invoices yet"
          emptyDescription="Create your first invoice to start tracking receivables."
          emptyAction={{ label: 'New Invoice', onClick: () => setIsNewOpen(true) }}
        />
      </div>

      <NewInvoiceModal
        isOpen={isNewOpen}
        invoiceToEdit={invoiceToEdit}
        onClose={() => { setIsNewOpen(false); setInvoiceToEdit(null); }}
        onSuccess={() => { setIsNewOpen(false); setInvoiceToEdit(null); fetchInvoices(); }}
      />
      <GenerateReceiptModal
        isOpen={!!receiptInvoice}
        invoice={receiptInvoice}
        onClose={() => setReceiptInvoice(null)}
        onSuccess={() => setReceiptInvoice(null)}
      />
    </div>
  );
}
