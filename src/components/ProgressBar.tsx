import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  goal: number;
  currency?: string;
  showLabels?: boolean;
  layout?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  current,
  goal,
  currency = 'EUR',
  showLabels = true,
  layout = 'default',
  size = 'md',
  className,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const percentage = Math.min((current / goal) * 100, 100);

  const heights = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  const formattedCurrent = current.toLocaleString();
  const formattedGoal = goal.toLocaleString();
  const formattedPercent = `${Math.round(percentage)}%`;

  // Minimal Twitter-style layout
  if (layout === 'minimal') {
    return (
      <div className={cn('w-full', className)}>
        <div className={cn('bg-muted rounded-full overflow-hidden', heights[size])}>
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabels && (
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-medium text-foreground">
              {formattedCurrent} {currency} raised
            </span>
            <span className="text-xs text-muted-foreground">
              {formattedPercent}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabels && layout === 'default' && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {formattedCurrent} {currency}
          </span>
          <span className="text-sm text-muted-foreground">
            {t('common.of')} {formattedGoal} {currency}
          </span>
        </div>
      )}

      {showLabels && layout === 'compact' && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0 mb-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-semibold text-foreground">
              {formattedCurrent}/{formattedGoal}
            </span>
            <span className="text-xs text-muted-foreground">{currency}</span>
          </div>
          <span className="text-xs text-primary font-medium">
            {formattedPercent} {t('fundraising.funded')}
          </span>
        </div>
      )}

      <div className={cn('progress-bar-track', heights[size])}>
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && layout === 'default' && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {formattedPercent} {t('fundraising.funded')}
        </p>
      )}
    </div>
  );
}
