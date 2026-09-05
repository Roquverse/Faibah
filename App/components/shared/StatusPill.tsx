import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusVariant = 'default' | 'success' | 'warning' | 'destructive' | 'secondary' | 'outline';

const STATUS_MAP: Record<string, StatusVariant> = {
  // Project statuses
  ACTIVE:      'success',
  IN_PROGRESS: 'success',
  COMPLETED:   'secondary',
  DONE:        'secondary',
  CANCELLED:   'destructive',
  ON_HOLD:     'warning',
  PAUSED:      'warning',
  // Invoice / Payment statuses
  PAID:        'success',
  SENT:        'default',
  DRAFT:       'outline',
  OVERDUE:     'destructive',
  PARTIAL:     'warning',
  PENDING:     'warning',
  FAILED:      'destructive',
  REFUNDED:    'secondary',
  // Proposal statuses
  ACCEPTED:    'success',
  REJECTED:    'destructive',
  VIEWED:      'default',
  // Task statuses
  TODO:        'secondary',
  IN_REVIEW:   'warning',
};

interface StatusPillProps {
  status: string;
  className?: string;
}

/**
 * StatusPill — maps any status string to the correct coloured Badge.
 * Used across Invoices, Projects, Proposals, Payments, Tasks.
 */
export function StatusPill({ status, className }: StatusPillProps) {
  const normalised = status?.toUpperCase().replace(/[\s-]/g, '_') ?? '';
  const variant = STATUS_MAP[normalised] ?? 'secondary';

  return (
    <Badge variant={variant} className={cn('capitalize', className)}>
      {status?.toLowerCase().replace(/_/g, ' ')}
    </Badge>
  );
}
