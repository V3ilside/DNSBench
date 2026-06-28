import { cn } from '@/lib/utils';

type BadgeStatus = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  className?: string;
}

const statusStyles: Record<BadgeStatus, string> = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-active',
  neutral: 'bg-surface-800 text-muted border-surface-600',
};

const dotStyles: Record<BadgeStatus, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger:  'bg-red-400',
  info:    'bg-blue-400',
  neutral: 'bg-slate-500',
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[status])} />
      {label}
    </span>
  );
}
