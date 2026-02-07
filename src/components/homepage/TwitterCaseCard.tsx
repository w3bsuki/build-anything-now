import { useMemo, useState, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flag, Heart, MapPin, MoreHorizontal, PawPrint, Share2, ChevronRight } from 'lucide-react';
import { AnimalCase } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { ReportedBadge } from '@/components/trust/ReportedBadge';
import { ReportConcernSheet } from '@/components/trust/ReportConcernSheet';

interface TwitterCaseCardProps extends HTMLAttributes<HTMLElement> {
  caseData: AnimalCase;
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
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Generate deterministic "helpers" placeholders for dev/demo
function getFallbackHelpersCount(caseId: string): number {
  const hash = hashString(caseId);
  return Math.abs(hash % 26) + 5; // 5-30 helpers
}

function getFallbackHelperAvatars(caseId: string): (string | null)[] {
  const hash = Math.abs(hashString(caseId));
  return Array.from({ length: 3 }).map((_, index) => {
    // pravatar supports img=1..70ish; keep it in-range.
    const img = ((hash + index) % 70) + 1;
    return `https://i.pravatar.cc/48?img=${img}`;
  });
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Extract first name from case title for personalized CTA
function getAnimalName(title: string): string {
  const skipWords = ['a', 'an', 'the', 'meet', 'help', 'found', 'rescue', 'save', 'this', 'injured', 'sick', 'abandoned'];
  const words = title.split(/[\s\-–—]+/).filter(w => w.length > 0);

  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 2) continue;
    if (skipWords.includes(cleanWord.toLowerCase())) continue;
    if (/^[A-Z]/.test(cleanWord)) {
      return cleanWord.length > 12 ? cleanWord.slice(0, 12) : cleanWord;
    }
  }
  return 'them';
}

// Status config using design tokens - colors used throughout card
const statusConfig = {
  critical: { 
    label: 'Critical', 
    badge: 'bg-destructive text-destructive-foreground',
    progress: 'bg-destructive',
    button: 'bg-destructive hover:bg-destructive/90',
  },
  urgent: { 
    label: 'Urgent', 
    badge: 'bg-destructive text-destructive-foreground',
    progress: 'bg-destructive',
    button: 'bg-destructive hover:bg-destructive/90',
  },
  recovering: { 
    label: 'Recovering', 
    badge: 'bg-recovering text-recovering-foreground',
    progress: 'bg-recovering',
    button: 'bg-recovering hover:bg-recovering/90',
  },
  adopted: { 
    label: 'Adopted', 
    badge: 'bg-adopted text-adopted-foreground',
    progress: 'bg-adopted',
    button: 'bg-adopted hover:bg-adopted/90',
  },
};

export function TwitterCaseCard({ caseData, className, socialStats, ...props }: TwitterCaseCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
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
  const timeAgo = getTimeAgo(caseData.createdAt);
  const animalName = getAnimalName(caseData.title);
  const status = statusConfig[caseData.status];
  const isUrgent = caseData.status === 'critical' || caseData.status === 'urgent';
  const ctaClass = isUrgent
    ? 'bg-warm-accent hover:bg-warm-accent/90 text-warm-accent-foreground'
    : 'bg-primary hover:bg-primary/90 text-primary-foreground';
  const ctaText = isUrgent
    ? t('actions.helpNow', 'Help Now')
    : t('actions.supportCase', 'Support Case');
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

  // Get author initials for avatar fallback
  const authorInitials = caseData.author?.name
    ? caseData.author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <article
      {...props}
      className={cn(
        'group rounded-2xl bg-surface-elevated/95 overflow-hidden ring-1 ring-border/45 hover:ring-border/65 transition-colors duration-200',
        className
      )}
    >
      {/* Poster Header - Instagram style */}
      <div className="flex items-center gap-3 p-3.5 border-b border-border/40 bg-card/80">
        <Avatar className="h-9 w-9 ring-2 ring-primary/25">
          <AvatarImage 
            src={caseData.author?.avatar} 
            alt={caseData.author?.name || 'User'} 
          />
          <AvatarFallback className="text-xs font-semibold bg-muted">
            {authorInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground truncate">
              {caseData.author?.name || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{caseData.location.city}</span>
            <span className="text-muted-foreground/60">•</span>
            <span>{timeAgo}</span>
            <span className="text-muted-foreground/60">•</span>
            <VerificationBadge status={caseData.verificationStatus ?? 'unverified'} />
            <ReportedBadge caseId={caseData.id} />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={t('actions.more', 'More')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-muted/70 text-foreground transition-colors duration-200 hover:bg-muted active:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        {/* Compact Image - 16:9 ratio for cleaner look */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-muted-foreground/20 animate-pulse" />
            </div>
          )}
          
          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/75">
              <PawPrint className="w-10 h-10 text-muted-foreground/30" />
            </div>
          ) : (
            <img
              src={caseData.images[0]}
              alt={caseData.title}
              className={cn(
                "w-full h-full object-cover",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          <div className="absolute inset-x-0 top-0 h-16 bg-black/20 pointer-events-none" />

          {/* Status Badge - top left */}
          <div className="absolute top-2.5 left-2.5">
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                status.badge
              )}>
              {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-white/80" />}
              {status.label}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1">
            {caseData.title}
          </h3>

          {/* Description - subtle */}
          <p className="text-sm text-muted-foreground/95 line-clamp-2 leading-relaxed mb-3">
            {caseData.description}
          </p>

          {/* Funding Progress - Clean Twitter-style */}
          <div className="rounded-xl border border-border/45 bg-muted/35 p-2.5 space-y-2 mb-3.5">
            {/* Progress bar - status colored */}
            <div className="h-1.5 bg-background/70 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  status.progress
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            {/* Stats row - minimal inline */}
            <div className="flex items-center justify-between text-sm">
              <span>
                <span className="font-semibold text-foreground">{caseData.fundraising.current.toLocaleString()}</span>
                <span className="text-muted-foreground"> / {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}</span>
              </span>
               
              {/* Avatar group for helpers - using stacked border token */}
              {helpersCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {Array.from({ length: Math.min(3, helpersCount) }).map((_, index) => {
                      const src = helperAvatars[index] ?? null;
                      return (
                        <Avatar key={index} className="h-6 w-6 border-2 border-avatar-border-stacked ring-1 ring-background shadow-2xs">
                          {src ? <AvatarImage src={src} alt="" /> : null}
                          <AvatarFallback className="text-xs font-medium">🐾</AvatarFallback>
                        </Avatar>
                      );
                    })}
                  </div>
                  <span className="text-muted-foreground font-medium">{helpersCount} helping</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA Button - status colored */}
          <Button 
            className={cn(
              "w-full h-10 rounded-xl font-semibold text-sm transition-all",
              ctaClass
            )}
          >
            <Heart className="w-4 h-4 mr-1.5 fill-current" />
            {ctaText} {animalName}
            <ChevronRight className="w-4 h-4 ml-1 opacity-60" />
          </Button>
        </div>
      </Link>

      <ReportConcernSheet
        open={reportOpen}
        onOpenChange={setReportOpen}
        caseId={caseData.id}
        caseTitle={caseData.title}
      />
    </article>
  );
}

// Skeleton for loading state
export function TwitterCaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card rounded-xl overflow-hidden ring-1 ring-border/30', className)}>
      {/* Poster Header Skeleton */}
      <div className="flex items-center gap-3 p-3 border-b border-border/30">
        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-muted rounded animate-pulse mb-1" />
          <div className="h-3 w-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-3.5">
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse mb-1.5" />
        <div className="h-4 w-full bg-muted rounded animate-pulse mb-1" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse mb-3" />
        <div className="h-16 bg-muted/50 rounded-lg animate-pulse mb-3" />
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
