import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type HomeIntent = 'urgent' | 'nearby' | 'adoption';

export const BULGARIAN_CITIES = ['sofia', 'varna', 'plovdiv'] as const;
export type CityFilter = typeof BULGARIAN_CITIES[number];

interface IntentFilterPillsProps {
  intent: HomeIntent;
  onIntentChange: (intent: HomeIntent) => void;
  hasActiveMore?: boolean;
  onOpenMore: () => void;
  contained?: boolean;
  className?: string;
}

function SegmentedButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 items-center justify-center gap-1 rounded-xl px-2 text-sm font-semibold transition-colors sm:px-3',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'bg-surface-elevated text-foreground'
          : 'text-muted-foreground hover:bg-interactive-hover hover:text-foreground active:bg-interactive-active',
      )}
    >
      <span className="min-w-0 truncate leading-none">{label}</span>
    </button>
  );
}

export function IntentFilterPills({
  intent,
  onIntentChange,
  hasActiveMore = false,
  onOpenMore,
  contained = true,
  className,
}: IntentFilterPillsProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(contained ? 'rounded-2xl border border-border/65 bg-surface-sunken p-1' : undefined, className)}>
      <div className="flex items-center gap-1.5">
        <div className="grid flex-1 grid-cols-3 gap-1.5">
          <SegmentedButton
            selected={intent === 'urgent'}
            onClick={() => onIntentChange('urgent')}
            label={t('filters.urgent', 'Urgent')}
          />
          <SegmentedButton
            selected={intent === 'nearby'}
            onClick={() => onIntentChange('nearby')}
            label={t('filters.nearMe', 'Near')}
          />
          <SegmentedButton
            selected={intent === 'adoption'}
            onClick={() => onIntentChange('adoption')}
            label={t('filters.adopt', 'Adopt')}
          />
        </div>

        <button
          type="button"
          onClick={onOpenMore}
          aria-label={t('filters.more', 'More filters')}
          className={cn(
            'relative inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors',
            'hover:bg-interactive-hover hover:text-foreground active:bg-interactive-active',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <SlidersHorizontal className="size-5" />
          {hasActiveMore ? (
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" aria-hidden />
          ) : null}
        </button>
      </div>
    </div>
  );
}
