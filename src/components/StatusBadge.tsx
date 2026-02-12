import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AnimalStatus } from '@/types';
import { getStatusTone } from '@/lib/statusTone';
import { AlertTriangle, Heart, Activity, CheckCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AnimalStatus;
  size?: 'sm' | 'md';
  tone?: 'solid' | 'soft';
  className?: string;
}

const statusConfig = {
  critical: {
    labelKey: 'status.critical',
    shortLabelKey: 'status.criticalShort',
    icon: AlertTriangle,
  },
  urgent: {
    labelKey: 'status.urgent',
    shortLabelKey: 'status.urgentShort',
    icon: Activity,
  },
  recovering: {
    labelKey: 'status.recovering',
    shortLabelKey: 'status.recoveringShort',
    icon: Heart,
  },
  adopted: {
    labelKey: 'status.adopted',
    shortLabelKey: 'status.adoptedShort',
    icon: CheckCircle,
  },
};

export function StatusBadge({ status, size = 'md', tone = 'solid', className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;
  const toneStyles = getStatusTone(status);
  
  // Use short labels for small size to prevent wrapping
  const labelKey = size === 'sm' ? config.shortLabelKey : config.labelKey;
  // Fallback to full label if short doesn't exist
  const label = t(labelKey, { defaultValue: t(config.labelKey) });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-semibold whitespace-nowrap',
        tone === 'soft' ? toneStyles.badgeSoft : toneStyles.badgeSolid,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1.5 text-sm',
        className
      )}
    >
      <Icon className={cn('shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
      <span className="max-w-20 truncate">{label}</span>
    </span>
  );
}
