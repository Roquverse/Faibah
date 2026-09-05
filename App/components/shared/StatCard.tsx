import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

/**
 * StatCard — KPI metric card used on Overview and financial screens.
 * Shared across all tiers; tier-specific data is just passed as props.
 */
export function StatCard({ title, value, delta, icon, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
              {value}
            </p>
            {delta && (
              <p
                className={cn(
                  'mt-2 text-xs font-medium',
                  delta.positive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-500 dark:text-red-400'
                )}
              >
                {delta.positive ? '↑' : '↓'} {delta.value}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-[#FFBA00]/10 text-[#FFBA00] shrink-0">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
