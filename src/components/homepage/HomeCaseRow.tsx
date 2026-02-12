import { useMemo, useState, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PawPrint } from 'lucide-react';
import type { AnimalCase } from '@/types';
import { cn } from '@/lib/utils';
import { getStatusTone } from '@/lib/statusTone';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type HomeCaseRowContext = 'feed' | 'adoption';
export type HomeCaseRowVariant = 'card' | 'list';

interface HomeCaseRowProps extends HTMLAttributes<HTMLElement> {
  caseData: AnimalCase;
  context?: HomeCaseRowContext;
  variant?: HomeCaseRowVariant;
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

export function HomeCaseRow({
  caseData,
  context = 'feed',
  variant = 'card',
  className,
  ...props
}: HomeCaseRowProps) {
  const { t, i18n } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const statusTone = getStatusTone(caseData.status);
  const statusLabel = useMemo(() => {
    const labelKeys = {
      critical: { full: 'status.critical', short: 'status.criticalShort' },
      urgent: { full: 'status.urgent', short: 'status.urgentShort' },
      recovering: { full: 'status.recovering', short: 'status.recoveringShort' },
      adopted: { full: 'status.adopted', short: 'status.adoptedShort' },
    } as const;

    const keys = labelKeys[caseData.status];
    return t(keys.short, { defaultValue: t(keys.full) });
  }, [caseData.status, t]);
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

  return (
    <article
      {...props}
      className={cn(
        variant === 'card'
          ? 'overflow-hidden rounded-2xl border border-border/65 bg-surface-elevated transition-colors hover:border-border/90'
          : 'border-b border-border/60 last:border-b-0',
        variant === 'card'
          ? 'focus-within:ring-2 focus-within:ring-focus-ring-strong focus-within:ring-offset-2 focus-within:ring-offset-background'
          : undefined,
        className,
      )}
    >
      <Link
        to={`/case/${caseData.id}`}
        className={cn(
          'flex items-start gap-3 p-3 transition-colors active:bg-interactive-active',
          variant === 'list'
            ? 'hover:bg-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus-ring-strong'
            : undefined,
        )}
      >
        <div className="relative size-12 shrink-0">
          <div className="size-12 overflow-hidden rounded-xl border border-border/50 bg-surface-sunken">
            {!imageError && caseData.images[0] ? (
              <img
                src={caseData.images[0]}
                alt={caseData.title}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <PawPrint className="size-6 text-muted-foreground/35" />
              </div>
            )}
          </div>

          <Avatar className="absolute -bottom-1 -right-1 h-6 w-6 border border-avatar-border bg-avatar-bg ring-2 ring-background">
            <AvatarImage src={caseData.author?.avatar ?? undefined} alt={authorName} />
            <AvatarFallback className="bg-avatar-bg text-xs font-semibold text-avatar-placeholder">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-foreground">
              {caseData.title}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
                statusTone.badgeSoft,
              )}
            >
              <span className={cn('size-1.5 rounded-full', statusTone.progress)} aria-hidden />
              <span className="truncate">{statusLabel}</span>
            </span>

            <span className="min-w-0 truncate font-semibold text-foreground/85">{authorName}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              •
            </span>
            <span className="min-w-0 truncate">{caseData.location.city}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              •
            </span>
            <span className="shrink-0">{timeAgo}</span>
            {context === 'adoption' ? (
              <span className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {t('filters.adopt', 'Adopt')}
              </span>
            ) : null}
          </div>

          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
              <div className={cn('h-full rounded-full', statusTone.progress)} style={{ width: `${percentage}%` }} />
            </div>
            <div className="flex items-baseline justify-between gap-2 text-xs tabular-nums">
              <span className="truncate font-semibold text-foreground">
                {caseData.fundraising.goal > 0
                  ? `${caseData.fundraising.current.toLocaleString()} / ${caseData.fundraising.goal.toLocaleString()} ${caseData.fundraising.currency}`
                  : `${caseData.fundraising.current.toLocaleString()} ${caseData.fundraising.currency}`}
              </span>
              <span className="shrink-0 text-muted-foreground">{Math.round(percentage)}%</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function HomeCaseRowSkeleton({
  className,
  variant = 'card',
}: {
  className?: string;
  variant?: HomeCaseRowVariant;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 animate-pulse',
        variant === 'card'
          ? 'rounded-2xl border border-border/60 bg-surface-elevated'
          : 'border-b border-border/60 last:border-b-0',
        className,
      )}
    >
      <div className="size-12 shrink-0 rounded-xl bg-muted" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-4 w-11/12 rounded bg-muted" />
        <div className="h-3 w-3/5 rounded bg-muted" />
        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-muted" />
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-1/3 rounded bg-muted" />
            <div className="h-3 w-10 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
