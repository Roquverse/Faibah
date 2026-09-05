'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionsApi } from '@/lib/api';
import { format } from 'date-fns';
import { Repeat, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await SubscriptionsApi.getAll();
      setSubscriptions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50/50 dark:bg-slate-900/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2">Manage recurring billing and client subscriptions.</p>
        </div>

        <Card className="border-0 shadow-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Repeat className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Subscriptions Yet</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
                Subscriptions are created automatically when you check "Make this a Subscription" on an invoice line item.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b-gray-200 dark:border-b-gray-700/50 hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-300">Subscription Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-300">Client</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-300">Frequency</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-300">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-300">Next Billing</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id} className="border-b-gray-100 dark:border-b-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">{sub.name}</div>
                      {sub.invoiceRef && <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Ref: {sub.invoiceRef}</div>}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-slate-300">
                      {sub.client?.companyName || sub.client?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300">
                        {sub.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900 dark:text-white">
                      {sub.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-slate-300 font-medium">
                      {format(new Date(sub.nextBillingDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'outline'} className={sub.status === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
