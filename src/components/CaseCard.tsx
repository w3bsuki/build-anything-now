import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, PawPrint, Users } from 'lucide-react';
import { AnimalCase } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

// Generate consistent supporter count from case ID
function getSupporterCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 35) + 8; // 8-42 supporters
}

// Status config using design tokens
const statusConfig = {
  critical: { 
    progress: 'bg-destructive',
    button: 'bg-destructive hover:bg-destructive/90',
  },
  urgent: { 
    progress: 'bg-destructive',
    button: 'bg-destructive hover:bg-destructive/90',
  },
  recovering: { 
    progress: 'bg-recovering',
    button: 'bg-recovering hover:bg-recovering/90',
  },
  adopted: { 
    progress: 'bg-adopted',
    button: 'bg-adopted hover:bg-adopted/90',
  },
};

export function CaseCard({ caseData, className }: CaseCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const supporterCount = useMemo(() => getSupporterCount(caseData.id), [caseData.id]);
  const status = statusConfig[caseData.status];
  const isUrgent = caseData.status === 'critical' || caseData.status === 'urgent';
  
  return (
    <article
      className={cn(
        'group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200',
        className
      )}
    >
      {/* Share Button */}
      <div className="absolute top-3 right-3 z-20">
        <ShareButton
          title={caseData.title}
          text={caseData.description}
          url={`${window.location.origin}/case/${caseData.id}`}
          size="sm"
        />
      </div>

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
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/5 to-primary/10">
              <PawPrint className="w-14 h-14 text-primary/20" />
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
          
          {/* Bottom gradient for progress visibility */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          
          {/* Status badge with urgency pulse */}
          <div className="absolute top-3 left-3">
            <StatusBadge 
              status={caseData.status} 
              size="sm" 
              className={cn(
                "shadow-sm backdrop-blur-md",
                isUrgent && "animate-pulse"
              )} 
            />
          </div>

          {/* Progress overlay on image */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="flex flex-col">
                <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">Raised</span>
                <span className="text-white text-lg font-bold leading-none">
                  {caseData.fundraising.current.toLocaleString()} <span className="text-sm font-medium opacity-80">{caseData.fundraising.currency}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-white text-2xl font-black">{Math.round(percentage)}%</span>
              </div>
            </div>
            
            {/* Progress bar - status colored */}
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  status.progress
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-white/60">
              <span>Goal: {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{supporterCount} supporters</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 pb-2">
          <h3 className="font-semibold text-[15px] text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {caseData.title}
          </h3>

          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-medium">{caseData.location.city}, {caseData.location.neighborhood}</span>
          </div>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-3.5 pb-3.5 pt-1">
        <Button 
          asChild 
          className={cn(
            "w-full h-10 rounded-lg font-semibold text-sm transition-all text-white",
            status.button
          )}
        >
          <Link to={`/case/${caseData.id}`} aria-label={`Donate to ${caseData.title}`}>
            <Heart className="w-4 h-4 mr-1.5 fill-current" />
            {isUrgent ? t('actions.donateNow') || 'Donate Now' : t('actions.donate')}
          </Link>
        </Button>
      </div>
    </article>
  );
}
