'use client';

import React, { useState, useEffect } from 'react';
import { Download, Search, ArrowDownLeft, CreditCard, TrendingUp, Clock } from 'lucide-react';
import { PaymentsApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, type ColumnDef } from '@/components/shared/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Payment = {
  id: string;
  rawId?: string;
  date: string;
  client: string;
  invoice: string;
  method: string;
  amount: string;
};

export default function PaymentsPage() {
  const [data, setData] = useState<{
    totalReceived: number;
    receivedThisMonth: number;
    pendingClearance: number;
    payments: Payment[];
  }>({ totalReceived: 0, receivedThisMonth: 0, pendingClearance: 0, payments: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    PaymentsApi.getAll()
      .then(res => {
        if (res) setData({
          totalReceived:     res.totalReceived     ?? 0,
          receivedThisMonth: res.receivedThisMonth ?? 0,
          pendingClearance:  res.pendingClearance  ?? 0,
          payments:          res.payments          ?? [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data.payments.length) return;
    const headers = ['Transaction ID', 'Date', 'Client', 'Invoice', 'Method', 'Amount'];
    const rows = data.payments.map(p => [p.id, p.date, `"${p.client}"`, p.invoice, p.method, `"${p.amount}"`]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `Faibah_Payments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = data.payments.filter(p => {
    const q = search.toLowerCase();
    return !q || [p.id, p.client, p.invoice, p.method].some(v => v?.toLowerCase().includes(q));
  });

  const columns: ColumnDef<Payment>[] = [
    {
      key: 'id', header: 'Transaction ID',
      render: p => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-green-100 text-green-700 shrink-0">
            <ArrowDownLeft size={12} />
          </div>
          <span className="font-mono text-xs font-semibold text-gray-900">{p.id}</span>
        </div>
      ),
    },
    { key: 'date', header: 'Date', render: p => <span className="text-sm text-gray-500">{p.date}</span> },
    { key: 'client', header: 'Client', render: p => <span className="font-semibold text-sm text-gray-900">{p.client}</span> },
    { key: 'invoice', header: 'Invoice', render: p => <span className="font-semibold text-sm text-[#0C3B2E]">{p.invoice}</span> },
    {
      key: 'method', header: 'Method',
      render: p => (
        <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">{p.method}</span>
      ),
    },
    {
      key: 'amount', header: 'Amount', headerClassName: 'text-right',
      render: p => <div className="text-right font-extrabold text-green-600">+{p.amount}</div>,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Payments"
        description="Ledger of all received payments across your projects."
      >
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
          <Download size={14} /> Export CSV
        </Button>
      </PageHeader>

      <div className="p-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Received" value={`₦${data.totalReceived.toLocaleString()}`} icon={<TrendingUp size={18} />} />
          <StatCard title="Received This Month" value={`₦${data.receivedThisMonth.toLocaleString()}`} icon={<CreditCard size={18} />} />
          <StatCard title="Pending Clearance" value={`₦${data.pendingClearance.toLocaleString()}`} icon={<Clock size={18} />} />
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..." className="pl-9" />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No payments yet"
          emptyDescription="Payments will appear here once invoices are marked as paid."
        />
      </div>
    </div>
  );
}
