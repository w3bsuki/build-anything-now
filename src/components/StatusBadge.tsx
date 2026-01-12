import { cn } from '@/lib/utils';
import { AnimalStatus } from '@/types';
import { AlertTriangle, Heart, Activity, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AnimalStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    className: 'badge-critical',
  },
  urgent: {
    label: 'Urgent',
    icon: Activity,
    className: 'badge-urgent',
  },
  recovering: {
    label: 'Recovering',
    icon: Heart,
    className: 'badge-recovering',
  },
  adopted: {
    label: 'Adopted',
    icon: CheckCircle,
    className: 'badge-adopted',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        config.className,
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  );
}
