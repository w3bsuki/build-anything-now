import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, PawPrint } from 'lucide-react';
import { AnimalCase } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';
import { getCaseShareUrl } from '@/lib/shareUrls';
import { getStatusTone } from '@/lib/statusTone';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/trust/VerificationBadge';
import { ReportedBadge } from '@/components/trust/ReportedBadge';

interface CaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

function formatTimeAgo(dateString: string, t: TranslateFn, locale: string): string {
  const now = new Date();
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = now.getTime() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  
  if (seconds < 60) return t('time.justNow');
  if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
  if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });

  return new Date(dateString).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
}

export function CaseCard({ caseData, className }: CaseCardProps) {
  const { t, i18n } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const statusTone = getStatusTone(caseData.status);
  const isCritical = caseData.status === 'critical';
  const timeAgo = formatTimeAgo(caseData.createdAt, t, i18n.language);
  const shareUrl = getCaseShareUrl({ caseId: caseData.id, locale: i18n.language }) ?? `${window.location.origin}/case/${caseData.id}`;
  
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs transition-all duration-200 hover:border-border/80 hover:shadow-sm',
        className
      )}
    >
      {/* Share Button */}
      <div className="absolute top-3 right-3 z-20" onClick={e => e.preventDefault()}>
        <ShareButton
          title={caseData.title}
          text={caseData.description}
          url={shareUrl}
          size="sm"
          appearance="overlay"
        />
      </div>

      <Link to={`/case/${caseData.id}`} className="block">
        {/* Image with overlays */}
        <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
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
                isCritical && "relative after:absolute after:-right-1 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-y-1/2 after:animate-pulse after:rounded-full after:bg-destructive-foreground/90 after:content-['']"
              )} 
            />
          </div>

          {/* Progress overlay on image */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="flex flex-col">
                <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">{t('fundraising.raised')}</span>
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
                  statusTone.progress
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-white/60">
              <span>{t('home.goalOf')} {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}</span>
              <span>{t('home.supportersPending')}</span>
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
            "h-10 w-full rounded-xl text-sm font-semibold transition-colors",
            statusTone.cta
          )}
        >
          <Link to={`/case/${caseData.id}`} aria-label={t('actions.donateTo', { title: caseData.title })}>
            <Heart className="w-4 h-4 mr-1.5 fill-current" />
            {(isCritical || caseData.status === 'urgent') ? t('actions.donateNow') || 'Donate Now' : t('actions.donate')}
          </Link>
        </Button>
      </div>
    </article>
  );
}
