import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnimalCase } from '@/types';
import { VerificationBadge } from '@/components/trust/VerificationBadge';

interface CompactCaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

const statusStyles = {
  critical: {
    badge: 'badge-critical',
    progress: 'bg-destructive',
  },
  urgent: {
    badge: 'badge-urgent',
    progress: 'bg-urgent',
  },
  recovering: {
    badge: 'badge-recovering',
    progress: 'bg-recovering',
  },
  adopted: {
    badge: 'badge-adopted',
    progress: 'bg-adopted',
  },
} as const;

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function CompactCaseCard({ caseData, className }: CompactCaseCardProps) {
  const { t } = useTranslation();
  const status = statusStyles[caseData.status];
  const isCritical = caseData.status === 'critical';
  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const timeAgo = formatTimeAgo(caseData.createdAt);

  return (
    <article
      className={cn(
        'bg-card rounded-xl overflow-hidden shadow-sm ring-1 ring-border/30 transition-all active:scale-[0.98]',
        className
      )}
    >
      <Link to={`/case/${caseData.id}`} className="block">
        <div className="relative aspect-4/3 bg-muted overflow-hidden">
          <img
            src={caseData.images[0]}
            alt={caseData.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm',
                status.badge
              )}
            >
              {isCritical && (
                <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground/90 animate-pulse" />
              )}
              {caseData.status === 'critical'
                ? t('status.critical', 'Critical')
                : caseData.status === 'urgent'
                  ? t('status.urgent', 'Urgent')
                  : caseData.status === 'recovering'
                    ? t('status.recovering', 'Recovering')
                    : t('status.adopted', 'Adopted')}
            </span>
          </div>
        </div>

        <div className="p-2.5">
          <h3 className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">
            {caseData.title}
          </h3>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{caseData.location.city}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="shrink-0">{timeAgo}</span>
            <span className="text-muted-foreground/60">•</span>
            <VerificationBadge status={caseData.verificationStatus ?? 'unverified'} className="text-[11px]" />
          </div>

          <div className="mt-2 space-y-1">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', status.progress)}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
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
    <div className={cn('bg-card rounded-xl overflow-hidden ring-1 ring-border/30 shadow-sm animate-pulse', className)}>
      <div className="aspect-4/3 bg-muted" />
      <div className="p-2.5 space-y-2">
        <div className="h-3.5 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-1.5 bg-muted rounded-full" />
        <div className="flex justify-between">
          <div className="h-2.5 bg-muted rounded w-16" />
          <div className="h-2.5 bg-muted rounded w-8" />
        </div>
      </div>
    </div>
  );
}
