import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusTone } from '@/lib/statusTone';
import type { AnimalCase } from '@/types';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { StatusBadge } from '@/components/StatusBadge';

interface CompactCaseCardProps {
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

export function CompactCaseCard({ caseData, className }: CompactCaseCardProps) {
  const { i18n } = useTranslation();
  const statusTone = getStatusTone(caseData.status);
  const percentage = caseData.fundraising.goal > 0
    ? Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100)
    : 0;
  const timeAgo = useMemo(() => formatRelativeTime(caseData.createdAt, i18n.language), [caseData.createdAt, i18n.language]);

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated shadow-xs transition-colors hover:border-border/90',
        'focus-within:ring-2 focus-within:ring-focus-ring-strong focus-within:ring-offset-2 focus-within:ring-offset-background',
        className,
      )}
    >
      <Link to={`/case/${caseData.id}`} className="block">
        <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
          <img
            src={caseData.images[0]}
            alt={caseData.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-overlay-dim/35" />

          <div className="absolute left-2 top-2">
            <StatusBadge status={caseData.status} size="sm" className="shadow-2xs" />
          </div>
        </div>

        <div className="p-3">
          <h3 className="min-h-11 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {caseData.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{caseData.location.city}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              •
            </span>
            <span className="shrink-0">{timeAgo}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              •
            </span>
            <VerificationBadge status={caseData.verificationStatus ?? 'unverified'} className="text-xs" />
          </div>

          <div className="mt-2.5 space-y-1.5 rounded-lg border border-border/55 bg-surface-sunken p-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-background/70">
              <div className={cn('h-full rounded-full', statusTone.progress)} style={{ width: `${percentage}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                {caseData.fundraising.current.toLocaleString()} / {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}
              </span>
              <span className="font-semibold text-foreground">{Math.round(percentage)}%</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function CompactCaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs animate-pulse', className)}>
      <div className="aspect-4/3 bg-muted" />
      <div className="space-y-2 p-2.5">
        <div className="h-3.5 w-full rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <div className="h-1.5 rounded-full bg-muted" />
        <div className="flex justify-between">
          <div className="h-2.5 w-16 rounded bg-muted" />
          <div className="h-2.5 w-8 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
