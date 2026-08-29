'use client';

import React, { useState, useEffect } from 'react';
import { SubscriptionsApi } from '@/lib/api';
import { format } from 'date-fns';
import { Repeat } from 'lucide-react';

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
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage recurring billing and subscriptions</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-semibold text-sm">Loading subscriptions...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                <Repeat className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Subscriptions Yet</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 max-w-sm">
                Subscriptions are created automatically when you check "Make this a Subscription" on an invoice line item.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-bold">Subscription Name</th>
                    <th className="px-6 py-4 font-bold">Client</th>
                    <th className="px-6 py-4 font-bold">Frequency</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Next Billing</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{sub.name}</div>
                        {sub.invoiceRef && <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Ref: {sub.invoiceRef}</div>}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-slate-300">
                        {sub.client?.companyName || sub.client?.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {sub.frequency}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {sub.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-medium">
                        {format(new Date(sub.nextBillingDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          sub.status === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
