import { useMemo, useState, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Flag, Heart, MapPin, MoreHorizontal, PawPrint, Share2 } from 'lucide-react';
import type { AnimalCase } from '@/types';
import { cn } from '@/lib/utils';
import { getStatusTone } from '@/lib/statusTone';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/StatusBadge';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { ReportedBadge } from '@/components/trust/ReportedBadge';
import { ReportConcernSheet } from '@/components/trust/ReportConcernSheet';

export type TwitterCaseCardContext = 'feed' | 'adoption';

interface TwitterCaseCardProps extends HTMLAttributes<HTMLElement> {
  caseData: AnimalCase;
  context?: TwitterCaseCardContext;
  socialStats?: {
    likeCount: number;
    commentCount: number;
    liked: boolean;
    supporterAvatars: (string | null)[];
    helperCount: number;
    helperAvatars: (string | null)[];
  };
}

function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function getFallbackHelpersCount(caseId: string): number {
  const hash = hashString(caseId);
  return Math.abs(hash % 26) + 5; // 5-30 helpers
}

function getFallbackHelperAvatars(caseId: string): (string | null)[] {
  const hash = Math.abs(hashString(caseId));
  return Array.from({ length: 3 }).map((_, index) => {
    const img = ((hash + index) % 70) + 1;
    return `https://i.pravatar.cc/48?img=${img}`;
  });
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

function getAnimalName(title: string): string | null {
  const skipWords = [
    'a',
    'an',
    'the',
    'meet',
    'help',
    'found',
    'rescue',
    'save',
    'this',
    'injured',
    'sick',
    'abandoned',
  ];
  const words = title.split(/[\s\-\u2013\u2014]+/).filter((word) => word.length > 0);

  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 2) continue;
    if (skipWords.includes(cleanWord.toLowerCase())) continue;
    if (/^[A-Z]/.test(cleanWord)) {
      return cleanWord.length > 12 ? cleanWord.slice(0, 12) : cleanWord;
    }
  }
  return null;
}

export function TwitterCaseCard({
  caseData,
  context = 'feed',
  className,
  socialStats,
  ...props
}: TwitterCaseCardProps) {
  const { t, i18n } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const percentage = caseData.fundraising.goal > 0
    ? Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100)
    : 0;

  const fallbackHelpersCount = useMemo(() => getFallbackHelpersCount(caseData.id), [caseData.id]);
  const fallbackHelperAvatars = useMemo(() => getFallbackHelperAvatars(caseData.id), [caseData.id]);

  const baseLikeCount = socialStats?.likeCount ?? 0;
  const helpersFromStats = socialStats?.helperCount ?? baseLikeCount;
  const helpersCount = helpersFromStats > 0 ? helpersFromStats : (import.meta.env.DEV ? fallbackHelpersCount : 0);

  const helperAvatarsFromStats = (socialStats?.helperAvatars ?? socialStats?.supporterAvatars ?? []);
  const helperAvatars =
    helperAvatarsFromStats.filter(Boolean).length > 0
      ? helperAvatarsFromStats
      : (import.meta.env.DEV ? fallbackHelperAvatars : []);

  const timeAgo = useMemo(() => formatRelativeTime(caseData.createdAt, i18n.language), [caseData.createdAt, i18n.language]);
  const animalName = useMemo(() => getAnimalName(caseData.title), [caseData.title]);

  const statusTone = getStatusTone(caseData.status);
  const isUrgent = caseData.status === 'critical' || caseData.status === 'urgent';
  const ctaLabel = useMemo(() => {
    if (context === 'adoption') {
      return animalName
        ? t('actions.adoptWithName', 'Adopt {{name}}', { name: animalName })
        : t('actions.adopt', 'Adopt');
    }

    if (isUrgent) {
      return animalName
        ? t('actions.helpNowWithName', 'Help {{name}} now', { name: animalName })
        : t('actions.helpNow', 'Help now');
    }

    return animalName
      ? t('actions.supportCaseWithName', 'Support {{name}}', { name: animalName })
      : t('actions.supportCase', 'Support case');
  }, [animalName, context, isUrgent, t]);

  const authorName = caseData.author?.name ?? t('common.anonymous', 'Anonymous');
  const authorInitials = caseData.author?.name
    ? caseData.author.name
      .split(' ')
      .map((name) => name[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U';

  const shareUrl = `${window.location.origin}/case/${caseData.id}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: t('common.copied', 'Copied'), description: t('common.linkCopied', 'Link copied to clipboard') });
    } catch {
      window.prompt(t('common.copyThisLink', 'Copy this link:'), shareUrl);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: caseData.title,
          text: caseData.description,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled, fall back to copy
      }
    }
    await copyLink();
  };

  return (
    <article
      {...props}
      className={cn(
        'group overflow-hidden rounded-2xl border border-border/65 bg-surface-elevated shadow-xs transition-colors hover:border-border/90',
        'focus-within:ring-2 focus-within:ring-focus-ring-strong focus-within:ring-offset-2 focus-within:ring-offset-background',
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-border/65 bg-surface-elevated px-3.5 py-3">
        <Avatar className="h-9 w-9 bg-avatar-bg ring-1 ring-avatar-border">
          <AvatarImage src={caseData.author?.avatar ?? undefined} alt={authorName} />
          <AvatarFallback className="bg-avatar-bg text-xs font-semibold text-avatar-placeholder">
            {authorInitials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {authorName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{caseData.location.city}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              •
            </span>
            <span className="shrink-0">{timeAgo}</span>
            <span className="text-muted-foreground/60" aria-hidden>
              •
            </span>
            <VerificationBadge status={caseData.verificationStatus ?? 'unverified'} />
            <ReportedBadge caseId={caseData.id} />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('actions.more', 'More')}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/65 bg-surface-sunken/80 text-foreground transition-colors',
                'hover:bg-interactive-hover active:bg-interactive-active',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <MoreHorizontal className="mx-auto h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('actions.share', 'Share')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
              {t('report.reportConcern', 'Report concern')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link to={`/case/${caseData.id}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-surface-sunken">
          {!imageLoaded && !imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken">
              <PawPrint className="h-8 w-8 animate-pulse text-muted-foreground/20" />
            </div>
          ) : null}

          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken/80">
              <PawPrint className="h-10 w-10 text-muted-foreground/30" />
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

          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-overlay-dim/45" />

          <div className="absolute left-2.5 top-2.5">
            <StatusBadge status={caseData.status} size="sm" className="shadow-2xs" />
          </div>
        </div>

        <div className="p-4">
          <h3 className="mb-1 line-clamp-2 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {caseData.title}
          </h3>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground/95">
            {caseData.description}
          </p>

          <div
            className={cn(
              'mb-3.5 space-y-2.5 rounded-xl border p-2.5',
              isUrgent ? 'border-urgent/35 bg-surface-sunken' : 'border-border/55 bg-surface-sunken',
            )}
          >
            <div className="flex items-start justify-between gap-3 text-sm">
              {helpersCount > 0 ? (
                <div className="min-w-0 flex items-center gap-1.5">
                  <div className="flex shrink-0 -space-x-2">
                    {Array.from({ length: Math.min(3, helpersCount) }).map((_, index) => {
                      const src = helperAvatars[index] ?? null;
                      return (
                        <Avatar key={index} className="h-6 w-6 border-2 border-avatar-border-stacked ring-1 ring-background shadow-2xs">
                          {src ? <AvatarImage src={src} alt="" /> : null}
                          <AvatarFallback className="bg-avatar-bg text-avatar-placeholder">
                            <PawPrint className="h-3.5 w-3.5" />
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                  </div>
                  <span className="truncate font-medium text-muted-foreground">
                    {t('home.helpersHelping', '{{count}} helping', { count: helpersCount })}
                  </span>
                </div>
              ) : (
                <span className="font-medium text-muted-foreground">
                  {t('common.noHelpersYet', 'No helpers yet')}
                </span>
              )}

              <span className="shrink-0 text-right">
                <span className="font-semibold text-foreground">{caseData.fundraising.current.toLocaleString()}</span>
                <span className="text-muted-foreground">
                  {' '}
                  / {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}
                </span>
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-surface/80 ring-1 ring-border/35">
              <div className={cn('h-full rounded-full', statusTone.progress)} style={{ width: `${percentage}%` }} />
            </div>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <Button
          asChild
          className={cn('h-11 w-full rounded-xl text-base font-semibold', statusTone.cta)}
        >
          <Link to={`/case/${caseData.id}`}>
            <Heart className="mr-2 h-5 w-5 fill-current" />
            <span className="truncate">{ctaLabel}</span>
            <ChevronRight className="ml-2 h-4 w-4 opacity-60" />
          </Link>
        </Button>
      </div>

      <ReportConcernSheet
        open={reportOpen}
        onOpenChange={setReportOpen}
        caseId={caseData.id}
        caseTitle={caseData.title}
      />
    </article>
  );
}

export function TwitterCaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs', className)}>
      <div className="flex items-center gap-3 border-b border-border/30 p-3">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        <div className="flex-1">
          <div className="mb-1 h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="aspect-video animate-pulse bg-muted" />
      <div className="p-3.5">
        <div className="mb-1.5 h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-1 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mb-3 h-16 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
