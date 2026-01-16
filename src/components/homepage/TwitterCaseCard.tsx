import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, PawPrint, ChevronRight } from 'lucide-react';
import { AnimalCase } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShareButton } from '@/components/ShareButton';

interface TwitterCaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

// Generate deterministic counts based on case ID
function getHelpersCount(caseId: string): number {
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash << 5) - hash) + caseId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 26) + 5; // 5-30 helpers
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

export function TwitterCaseCard({ caseData, className }: TwitterCaseCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const helpersCount = useMemo(() => getHelpersCount(caseData.id), [caseData.id]);
  const timeAgo = getTimeAgo(caseData.createdAt);
  const animalName = getAnimalName(caseData.title);
  const status = statusConfig[caseData.status];
  const isUrgent = caseData.status === 'critical' || caseData.status === 'urgent';

  // Get author initials for avatar fallback
  const authorInitials = caseData.author?.name
    ? caseData.author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <article
      className={cn(
        'group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200',
        className
      )}
    >
      {/* Poster Header - Instagram style */}
      <div className="flex items-center gap-3 p-3 border-b border-border/30">
        <Avatar className="h-9 w-9 ring-2 ring-primary/20">
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
          </div>
        </div>
        <div onClick={e => e.preventDefault()}>
          <ShareButton
            title={caseData.title}
            text={caseData.description}
            url={`${window.location.origin}/case/${caseData.id}`}
            size="sm"
          />
        </div>
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
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-muted to-muted/50">
              <PawPrint className="w-10 h-10 text-muted-foreground/30" />
            </div>
          ) : (
            <img
              src={caseData.images[0]}
              alt={caseData.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}

          {/* Top gradient for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-16 bg-linear-to-b from-black/50 to-transparent pointer-events-none" />

          {/* Status Badge - top left */}
          <div className="absolute top-2.5 left-2.5">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide shadow-sm",
              status.badge
            )}>
              {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />}
              {status.label}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3.5">
          {/* Title */}
          <h3 className="font-semibold text-[15px] text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors mb-1.5">
            {caseData.title}
          </h3>

          {/* Description - subtle */}
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {caseData.description}
          </p>

          {/* Funding Progress - Clean Twitter-style */}
          <div className="space-y-2 mb-3">
            {/* Progress bar - status colored */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
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
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 border-2 border-avatar-border-stacked ring-1 ring-background">
                    <AvatarImage src="https://i.pravatar.cc/24?img=1" />
                    <AvatarFallback className="text-[10px] font-medium">A</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 border-2 border-avatar-border-stacked ring-1 ring-background">
                    <AvatarImage src="https://i.pravatar.cc/24?img=2" />
                    <AvatarFallback className="text-[10px] font-medium">B</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 border-2 border-avatar-border-stacked ring-1 ring-background">
                    <AvatarImage src="https://i.pravatar.cc/24?img=3" />
                    <AvatarFallback className="text-[10px] font-medium">C</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-muted-foreground font-medium">{helpersCount} helping</span>
              </div>
            </div>
          </div>

          {/* CTA Button - status colored */}
          <Button 
            className={cn(
              "w-full h-10 rounded-lg font-semibold text-sm transition-all text-white",
              status.button
            )}
          >
            <Heart className="w-4 h-4 mr-1.5 fill-current" />
            Help {animalName}
            <ChevronRight className="w-4 h-4 ml-1 opacity-60" />
          </Button>
        </div>
      </Link>
    </article>
  );
}

// Skeleton for loading state
export function TwitterCaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card rounded-xl overflow-hidden border border-border/50', className)}>
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
