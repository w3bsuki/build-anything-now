import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  goal: number;
  currency?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  current,
  goal,
  currency = 'BGN',
  showLabels = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-foreground">
            {current.toLocaleString()} {currency}
          </span>
          <span className="text-sm text-muted-foreground">
            of {goal.toLocaleString()} {currency}
          </span>
        </div>
      )}
      <div className={cn('progress-bar-track', heights[size])}>
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabels && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {Math.round(percentage)}% funded
        </p>
      )}
    </div>
  );
}
