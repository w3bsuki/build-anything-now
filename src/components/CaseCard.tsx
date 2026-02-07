import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, PawPrint } from 'lucide-react';
import { AnimalCase } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { ReportedBadge } from '@/components/trust/ReportedBadge';

interface CaseCardProps {
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

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
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
  const status = statusConfig[caseData.status];
  const isCritical = caseData.status === 'critical';
  const timeAgo = formatTimeAgo(caseData.createdAt);
  
  return (
    <article
      className={cn(
        'group relative bg-card rounded-xl overflow-hidden shadow-sm ring-1 ring-border/30 hover:ring-border/50 hover:shadow-md transition-all duration-200',
        className
      )}
    >
      {/* Share Button */}
      <div className="absolute top-3 right-3 z-20" onClick={e => e.preventDefault()}>
        <ShareButton
          title={caseData.title}
          text={caseData.description}
          url={`${window.location.origin}/case/${caseData.id}`}
          size="sm"
          appearance="overlay"
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
            <div className="absolute inset-0 flex items-center justify-center bg-muted/70">
              <PawPrint className="w-14 h-14 text-primary/20" />
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
          
          {/* Top overlay for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-16 bg-overlay-dim/45 pointer-events-none" />
          
          {/* Bottom overlay for progress visibility */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-overlay-dim/70 pointer-events-none" />
          
          {/* Status badge with urgency pulse */}
          <div className="absolute top-3 left-3">
            <StatusBadge 
              status={caseData.status} 
              size="sm" 
              className={cn(
                "shadow-sm backdrop-blur-md",
                isCritical && "relative after:content-[''] after:absolute after:-right-1 after:top-1/2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-destructive-foreground/90 after:animate-pulse"
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
              <span>{t('home.supportersPending', 'Supporter counts after verified activity')}</span>
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
            <span className="text-muted-foreground/60">•</span>
            <span className="shrink-0">{timeAgo}</span>
            <span className="text-muted-foreground/60">•</span>
            <VerificationBadge status={caseData.verificationStatus ?? 'unverified'} />
            <ReportedBadge caseId={caseData.id} />
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
            {(isCritical || caseData.status === 'urgent') ? t('actions.donateNow') || 'Donate Now' : t('actions.donate')}
          </Link>
        </Button>
      </div>
    </article>
  );
}
