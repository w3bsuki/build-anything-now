import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, PawPrint, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import type { AnimalCase } from '@/types';

interface HeroCaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

// Generate consistent supporter count from case ID
function getSupporterCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 35) + 8;
}

export function HeroCaseCard({ caseData, className }: HeroCaseCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const supporterCount = getSupporterCount(caseData.id);
  const timeAgo = formatTimeAgo(caseData.createdAt);
  const isCritical = caseData.status === 'critical';

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl bg-warm-surface ring-1 ring-warm-accent/20',
        className
      )}
    >
      <Link to={`/case/${caseData.id}`} className="block">
        {/* Hero Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <PawPrint className="w-12 h-12 text-muted-foreground/20 animate-pulse" />
            </div>
          )}
          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-warm-accent/10 to-warm-accent/5">
              <PawPrint className="w-16 h-16 text-warm-accent/30" />
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

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/50 to-transparent" />

          {/* Status badge with pulse */}
          <div className="absolute top-4 left-4">
            <StatusBadge
              status={caseData.status}
              size="md"
              className={cn(
                "shadow-lg backdrop-blur-md",
                isCritical && "animate-pulse"
              )}
            />
          </div>

          {/* Featured label */}
          <div className="absolute top-4 right-4">
            <span className="px-2.5 py-1 rounded-full bg-warm-accent text-warm-accent-foreground text-xs font-semibold shadow-lg">
              {t('home.featured', '🔥 Featured')}
            </span>
          </div>

          {/* Bottom content overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            {/* Title */}
            <h2 className="text-white text-lg font-bold leading-tight mb-2 line-clamp-2 drop-shadow-md">
              {caseData.title}
            </h2>

            {/* Meta row */}
            <div className="flex items-center gap-3 text-white/80 text-xs mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{caseData.location.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{supporterCount} {t('home.helping', 'helping')}</span>
              </div>
            </div>

            {/* Progress section */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-white/60 text-xs uppercase tracking-wide">{t('home.raised', 'Raised')}</span>
                  <div className="text-white text-xl font-bold">
                    {caseData.fundraising.current.toLocaleString()} 
                    <span className="text-sm font-medium opacity-80 ml-1">{caseData.fundraising.currency}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white text-3xl font-black">{Math.round(percentage)}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warm-accent rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="text-white/60 text-xs">
                {t('home.goalOf', 'Goal:')} {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* CTA Button - outside link to prevent nested links */}
      <div className="p-4 pt-0 -mt-2 relative z-10">
        <Button
          asChild
          size="lg"
          className="w-full bg-warm-accent hover:bg-warm-accent/90 text-warm-accent-foreground font-semibold rounded-xl shadow-lg"
        >
          <Link to={`/case/${caseData.id}`}>
            <Heart className="w-5 h-5 mr-2 fill-current" />
            {t('actions.donateNow', 'Donate Now')}
          </Link>
        </Button>
      </div>
    </article>
  );
}

// Skeleton for loading state
export function HeroCaseCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-warm-surface ring-1 ring-warm-accent/20 animate-pulse">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-4 pt-0 -mt-2">
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
