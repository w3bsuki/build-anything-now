import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AnimalStatus } from '@/types';
import { AlertTriangle, Heart, Activity, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AnimalStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig = {
  critical: {
    labelKey: 'status.critical',
    shortLabelKey: 'status.criticalShort',
    icon: AlertTriangle,
    className: 'badge-critical',
  },
  urgent: {
    labelKey: 'status.urgent',
    shortLabelKey: 'status.urgentShort',
    icon: Activity,
    className: 'badge-urgent',
  },
  recovering: {
    labelKey: 'status.recovering',
    shortLabelKey: 'status.recoveringShort',
    icon: Heart,
    className: 'badge-recovering',
  },
  adopted: {
    labelKey: 'status.adopted',
    shortLabelKey: 'status.adoptedShort',
    icon: CheckCircle,
    className: 'badge-adopted',
  },
};

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const { t, i18n } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;
  
  // Use short labels for small size to prevent wrapping
  const labelKey = size === 'sm' ? config.shortLabelKey : config.labelKey;
  // Fallback to full label if short doesn't exist
  const label = t(labelKey, { defaultValue: t(config.labelKey) });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap',
        config.className,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1.5 text-sm',
        className
      )}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      <span className="truncate max-w-[80px]">{label}</span>
    </span>
  );
}
