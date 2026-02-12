import { useMemo, useState, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, PawPrint } from 'lucide-react';
import type { AnimalCase } from '@/types';
import { cn } from '@/lib/utils';
import { getStatusTone } from '@/lib/statusTone';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type HomeCaseCardContext = 'feed' | 'adoption';
export type HomeCaseCardVariant = 'default' | 'compact';

interface HomeCaseCardProps extends HTMLAttributes<HTMLElement> {
  caseData: AnimalCase;
  context?: HomeCaseCardContext;
  variant?: HomeCaseCardVariant;
}

function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'short' });

  const absSeconds = Math.abs(diffSeconds);
  if (absSeconds < 60) return rtf.format(diffSeconds, 'second');

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');

  const diffWeeks = Math.round(diffDays / 7);
  if (Math.abs(diffWeeks) < 5) return rtf.format(diffWeeks, 'week');

  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
}

export function HomeCaseCard({
  caseData,
  context = 'feed',
  variant = 'default',
  className,
  ...props
}: HomeCaseCardProps) {
  const { t, i18n } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isCompact = variant === 'compact';
  const statusTone = getStatusTone(caseData.status);
  const percentage = caseData.fundraising.goal > 0
    ? Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100)
    : 0;

  const timeAgo = useMemo(() => formatRelativeTime(caseData.createdAt, i18n.language), [caseData.createdAt, i18n.language]);
  const authorName = caseData.author?.name ?? t('common.anonymous', 'Anonymous');
  const authorInitials = caseData.author?.name
    ? caseData.author.name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U';

  const ctaLabel = useMemo(() => {
    if (context === 'adoption') return t('actions.adopt', 'Adopt');
    if (caseData.status === 'critical' || caseData.status === 'urgent') return t('actions.donateNow', 'Donate Now');
    return t('actions.donate', 'Donate');
  }, [caseData.status, context, t]);

  const ctaClassName = context === 'adoption'
    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
    : statusTone.cta;

  return (
    <article
      {...props}
      className={cn(
        'overflow-hidden rounded-2xl border border-border/65 bg-surface-elevated transition-colors hover:border-border/90',
        'focus-within:ring-2 focus-within:ring-focus-ring-strong focus-within:ring-offset-2 focus-within:ring-offset-background',
        className,
      )}
    >
      <Link to={`/case/${caseData.id}`} className="block">
        <div
          className={cn(
            'relative overflow-hidden bg-surface-sunken',
            isCompact ? 'h-24' : 'aspect-video',
          )}
        >
          {!imageLoaded && !imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken">
              <PawPrint className="h-10 w-10 animate-pulse text-muted-foreground/20" />
            </div>
          ) : null}

          {imageError || !caseData.images[0] ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken/80">
              <PawPrint className="h-12 w-12 text-muted-foreground/30" />
            </div>
          ) : (
            <img
              src={caseData.images[0]}
              alt={caseData.title}
              loading="lazy"
              className={cn('h-full w-full object-cover', !imageLoaded && 'opacity-0')}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          <div className={cn('absolute', isCompact ? 'left-2 top-2' : 'left-3 top-3')}>
            <StatusBadge status={caseData.status} size="sm" className="shadow-2xs" />
          </div>
        </div>

        <div className={cn('space-y-2', isCompact ? 'p-2.5' : 'p-3')}>
          <div className="flex items-center gap-2">
            <Avatar className={cn('border border-avatar-border bg-avatar-bg', isCompact ? 'h-6 w-6' : 'h-8 w-8')}>
              <AvatarImage src={caseData.author?.avatar ?? undefined} alt={authorName} />
              <AvatarFallback className="bg-avatar-bg text-xs font-semibold text-avatar-placeholder">
                {authorInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              {isCompact ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate font-semibold text-foreground/85">{authorName}</span>
                  <span className="text-muted-foreground/60" aria-hidden>
                    •
                  </span>
                  <span className="min-w-0 truncate">{caseData.location.city}</span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="min-w-0 truncate font-semibold text-foreground/85">{authorName}</span>
                  <span className="text-muted-foreground/60" aria-hidden>
                    •
                  </span>
                  <span className="min-w-0 truncate">{caseData.location.city}</span>
                  <span className="text-muted-foreground/60" aria-hidden>
                    •
                  </span>
                  <span className="shrink-0">{timeAgo}</span>
                </div>
              )}
            </div>
          </div>

          <h3 className={cn('line-clamp-2 font-semibold leading-snug text-foreground', isCompact ? 'text-sm' : 'text-base')}>
            {caseData.title}
          </h3>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-xs tabular-nums">
              <span className="min-w-0 truncate font-semibold text-foreground">
                {isCompact || caseData.fundraising.goal <= 0
                  ? `${caseData.fundraising.current.toLocaleString()} ${caseData.fundraising.currency}`
                  : `${caseData.fundraising.current.toLocaleString()} / ${caseData.fundraising.goal.toLocaleString()} ${caseData.fundraising.currency}`}
              </span>
              <span className="shrink-0 text-muted-foreground">{Math.round(percentage)}%</span>
            </div>

            <div className={cn('overflow-hidden rounded-full bg-surface-sunken', isCompact ? 'h-1.5' : 'h-2')}>
              <div className={cn('h-full rounded-full', statusTone.progress)} style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </div>
      </Link>

      {!isCompact ? (
        <div className="px-3 pb-3">
          <Button asChild className={cn('h-11 w-full rounded-xl text-sm font-semibold', ctaClassName)}>
            <Link to={`/case/${caseData.id}`}>
              <Heart className="mr-2 h-4 w-4 fill-current" />
              {ctaLabel}
            </Link>
          </Button>
        </div>
      ) : null}
    </article>
  );
}

export function HomeCaseCardSkeleton({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: HomeCaseCardVariant;
}) {
  const isCompact = variant === 'compact';
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated animate-pulse', className)}>
      <div className={cn('bg-muted', isCompact ? 'h-24' : 'aspect-video')} />
      <div className={cn('space-y-2', isCompact ? 'p-2.5' : 'p-3')}>
        <div className="flex items-center gap-2">
          <div className={cn('rounded-full bg-muted', isCompact ? 'h-6 w-6' : 'h-8 w-8')} />
          <div className={cn('h-3 rounded bg-muted', isCompact ? 'w-24' : 'w-40')} />
        </div>
        <div className="h-5 w-11/12 rounded bg-muted" />
        <div className={cn('w-full rounded-full bg-muted', isCompact ? 'h-1.5' : 'h-2')} />
      </div>
      {!isCompact ? (
        <div className="px-3 pb-3">
          <div className="h-11 w-full rounded-xl bg-muted" />
        </div>
      ) : null}
    </div>
  );
}
