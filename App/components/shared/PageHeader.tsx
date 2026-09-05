import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  children?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader — standard top-of-page header used across every dashboard screen.
 * Accepts an optional primary action button and a children slot for extra controls.
 */
export function PageHeader({ title, description, action, children, className }: PageHeaderProps) {
  return (
    <div className={cn('', className)}>
      <div className="flex items-start justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {children}
          {action && (
            <Button onClick={action.onClick} size="sm" className="gap-2">
              {action.icon}
              {action.label}
            </Button>
          )}
        </div>
      </div>
      <Separator />
    </div>
  );
}
