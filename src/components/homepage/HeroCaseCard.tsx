import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Heart, MapPin, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStatusTone } from '@/lib/statusTone';
import { cn } from '@/lib/utils';
import type { AnimalCase } from '@/types';

interface HeroCaseCardProps {
  caseData: AnimalCase;
  className?: string;
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

export function HeroCaseCard({ caseData, className }: HeroCaseCardProps) {
  const { t, i18n } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  return (
    <article
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated shadow-xs',
        'focus-within:ring-2 focus-within:ring-focus-ring-strong focus-within:ring-offset-2 focus-within:ring-offset-background',
        className,
      )}
    >
      <Link to={`/case/${caseData.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-surface-sunken">
          {!imageLoaded && !imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken">
              <PawPrint className="h-12 w-12 animate-pulse text-muted-foreground/20" />
            </div>
          ) : null}

          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken/80">
              <PawPrint className="h-16 w-16 text-muted-foreground/30" />
            </div>
          ) : (
            <img
              src={caseData.images[0]}
              alt={caseData.title}
              className={cn('h-full w-full object-cover', !imageLoaded && 'opacity-0')}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          <div className="absolute left-3 top-3">
            <StatusBadge status={caseData.status} size="md" className="shadow-2xs" />
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-avatar-bg ring-1 ring-avatar-border">
              <AvatarImage src={caseData.author?.avatar ?? undefined} alt={authorName} />
              <AvatarFallback className="bg-avatar-bg text-xs font-semibold text-avatar-placeholder">
                {authorInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{authorName}</p>
              <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{caseData.location.city}</span>
                <span className="text-muted-foreground/60" aria-hidden>
                  •
                </span>
                <Clock className="h-3 w-3 shrink-0" />
                <span className="shrink-0">{timeAgo}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="line-clamp-2 font-display text-xl font-semibold leading-tight text-foreground">
              {caseData.title}
            </h2>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground/95">
              {caseData.description}
            </p>
          </div>

          <div className="space-y-2 rounded-xl border border-border/55 bg-surface-sunken p-3">
            <div className="flex items-end justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('campaigns.raised', 'Raised')}
                </span>
                <div className="text-lg font-bold text-foreground">
                  {caseData.fundraising.current.toLocaleString()}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">
                    {caseData.fundraising.currency}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-foreground">{Math.round(percentage)}%</span>
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-surface/80 ring-1 ring-border/35">
              <div className={cn('h-full rounded-full', statusTone.progress)} style={{ width: `${percentage}%` }} />
            </div>

            <div className="text-xs text-muted-foreground">
              {t('home.goalOf', 'Goal:')} {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          asChild
          size="lg"
          className={cn('w-full rounded-xl font-semibold', statusTone.cta)}
        >
          <Link to={`/case/${caseData.id}`}>
            <Heart className="mr-2 h-5 w-5 fill-current" />
            {t('actions.donateNow', 'Donate Now')}
          </Link>
        </Button>
      </div>
    </article>
  );
}

export function HeroCaseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="mb-1 h-4 w-28 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
        </div>
        <div className="h-6 w-4/5 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-28 rounded-xl bg-muted/50" />
        <div className="h-12 rounded-xl bg-muted" />
      </div>
    </div>
  );
}

