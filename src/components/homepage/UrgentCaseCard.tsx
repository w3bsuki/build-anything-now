import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Users, TrendingUp, PawPrint, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import type { AnimalCase } from '@/types';

interface UrgentCaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

// Generate consistent helper count from case ID
function getHelpersCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 45) + 12; // 12-56 helpers
}

// Format time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

export function UrgentCaseCard({ caseData, className }: UrgentCaseCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const helpersCount = getHelpersCount(caseData.id);
  const timeAgo = getTimeAgo(caseData.createdAt);
  
  const isCritical = caseData.status === 'critical';
  const isUrgent = caseData.status === 'urgent' || caseData.status === 'critical';
  const isAlmostFunded = percentage >= 75 && percentage < 100;
  const isFunded = percentage >= 100;
  
  return (
    <article
      className={cn(
        'group relative bg-card rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/30 transition-all duration-300 hover:ring-border/50 hover:shadow-lg',
        className
      )}
    >
      <Link to={`/case/${caseData.id}`} className="block">
        {/* Image with overlays */}
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <PawPrint className="w-10 h-10 text-muted-foreground/20 animate-pulse" />
            </div>
          )}
          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-destructive/5 to-destructive/10">
              <PawPrint className="w-14 h-14 text-destructive/20" />
            </div>
          ) : (
            <img
              src={caseData.images[0]}
              alt={caseData.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Top gradient for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
          
          {/* Bottom gradient for progress visibility */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          {/* Status badge - top left */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-colors",
              isCritical 
                ? "bg-destructive/90 text-destructive-foreground animate-pulse" 
                : isUrgent 
                  ? "bg-warning/90 text-warning-foreground"
                  : "bg-black/50 text-white"
            )}>
              {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />}
              <span>{isCritical ? t('status.critical', 'Critical') : t('status.urgent', 'Urgent')}</span>
            </div>
          </div>
          
          {/* Share button - top right */}
          <div className="absolute top-3 right-3 z-20" onClick={e => e.preventDefault()}>
            <ShareButton
              title={caseData.title}
              text={caseData.description}
              url={`${window.location.origin}/case/${caseData.id}`}
              size="sm"
              appearance="overlay"
            />
          </div>
          
          {/* Momentum badge - if almost funded */}
          {isAlmostFunded && (
            <div className="absolute top-3 left-3 mt-16">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/90 text-success-foreground text-[10px] font-bold shadow-lg backdrop-blur-md">
                <TrendingUp className="w-3 h-3" />
                <span>{t('campaigns.almostThere', 'Almost there!')}</span>
              </div>
            </div>
          )}

          {/* Progress overlay on image */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="flex flex-col">
                <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">
                  {t('campaigns.raised', 'Raised')}
                </span>
                <span className="text-white text-lg font-bold leading-none">
                  {caseData.fundraising.current.toLocaleString()} <span className="text-sm font-medium opacity-80">{caseData.fundraising.currency}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-white text-2xl font-black">{Math.round(percentage)}%</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isFunded 
                    ? "bg-success" 
                    : isAlmostFunded 
                      ? "bg-linear-to-r from-destructive to-success"
                      : "bg-destructive"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-white/60">
              <span>{t('campaigns.goal', 'Goal')}: {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{helpersCount} {t('cases.helping', 'helping')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 pb-2">
          {/* Location + Time meta */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
            <MapPin className="w-3 h-3" />
            <span>{caseData.location.city}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
          
          <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {caseData.title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2 mt-1.5 leading-relaxed">
            {caseData.description}
          </p>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-3.5 pb-3.5 pt-1">
        <Button 
          asChild 
          variant="default" 
          className={cn(
            "w-full h-11 rounded-xl font-bold text-sm transition-all",
            isCritical && "bg-destructive hover:bg-destructive/90"
          )}
        >
          <Link to={`/case/${caseData.id}`} aria-label={t('cases.helpAnimal', { title: caseData.title })}>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            {isCritical ? t('actions.helpNow', 'Help Now') : t('actions.contribute', 'Contribute')}
            <Heart className="w-4 h-4 ml-2 fill-current" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

// Skeleton for loading state
export function UrgentCaseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/30', className)}>
      <div className="aspect-4/3 bg-muted animate-pulse relative">
        <div className="absolute top-3 left-3 h-6 w-16 bg-black/20 rounded-full" />
        <div className="absolute bottom-0 inset-x-0 p-3 space-y-2">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="h-2 w-12 bg-white/20 rounded" />
              <div className="h-5 w-16 bg-white/30 rounded" />
            </div>
            <div className="h-7 w-10 bg-white/30 rounded" />
          </div>
          <div className="h-2 bg-white/20 rounded-full" />
        </div>
      </div>
      <div className="p-3.5 pb-3.5 space-y-2">
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-11 bg-muted rounded-xl animate-pulse mt-3" />
      </div>
    </div>
  );
}
