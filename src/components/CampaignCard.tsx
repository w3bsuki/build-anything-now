import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Campaign } from '@/types';
import { ShareButton } from './ShareButton';
import { Heart, Clock, TrendingUp, PawPrint } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const percentage = Math.min((campaign.current / campaign.goal) * 100, 100);
  const daysLeft = campaign.endDate 
    ? differenceInDays(new Date(campaign.endDate), new Date())
    : null;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const isEnding = daysLeft !== null && daysLeft <= 3 && daysLeft > 0;
  const isAlmostFunded = percentage >= 75 && percentage < 100;
  const isFunded = percentage >= 100;
  
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs transition-colors duration-200 hover:border-border/80',
        className
      )}
    >
      {/* Share Button */}
      <div className="absolute top-3 right-3 z-20" onClick={e => e.preventDefault()}>
        <ShareButton
          title={campaign.title}
          text={campaign.description}
          url={`${window.location.origin}/campaigns/${campaign.id}`}
          size="sm"
          appearance="overlay"
        />
      </div>

      <Link to={`/campaigns/${campaign.id}`} className="block">
        {/* Image with overlays */}
        <div className="relative aspect-4/3 overflow-hidden bg-surface-sunken">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken">
              <PawPrint className="w-10 h-10 text-muted-foreground/20 animate-pulse" />
            </div>
          )}
          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-sunken/80">
              <PawPrint className="w-14 h-14 text-primary/20" />
            </div>
          ) : (
            <img
              src={campaign.image}
              alt={campaign.title}
              className={cn(
                "w-full h-full object-cover",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Top overlay for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-20 bg-overlay-dim/45 pointer-events-none" />
          
          {/* Bottom overlay for progress visibility */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-overlay-dim/70 pointer-events-none" />

          {/* Time-based badge */}
          {daysLeft !== null && daysLeft > 0 && (
            <div className="absolute top-3 left-3">
              <div className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors",
                isEnding
                  ? "bg-destructive/90 text-destructive-foreground" 
                  : isUrgent 
                    ? "bg-urgent/90 text-urgent-foreground"
                    : "bg-overlay-dim/75 text-white"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span>{t('campaigns.daysLeft', { count: daysLeft })}</span>
              </div>
            </div>
          )}
          
          {/* Momentum badge */}
          {isAlmostFunded && (
            <div className="absolute top-3 left-3 mt-9">
              <div className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2 py-1 text-xs font-semibold text-success-foreground">
                <TrendingUp className="w-3 h-3" />
                <span>{t('campaigns.almostThere')}</span>
              </div>
            </div>
          )}

          {/* Progress overlay on image */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="flex flex-col">
                <span className="text-white/70 text-xs font-medium uppercase tracking-wide">
                  {t('campaigns.raised')}
                </span>
                <span className="text-white text-lg font-bold leading-none">
                  {campaign.current.toLocaleString()} <span className="text-sm font-medium opacity-80">{campaign.unit}</span>
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
                      ? "bg-primary"
                      : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="mt-1.5 text-xs text-white/70">
              <span>{t('campaigns.goal')}: {campaign.goal.toLocaleString()} {campaign.unit}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 pb-2">
          <h3 className="font-display text-base font-bold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary">
            {campaign.title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2 mt-1.5 leading-relaxed">
            {campaign.description}
          </p>
        </div>
      </Link>

      {/* CTA */}
      <div className="px-3.5 pb-3.5 pt-1">
        <Button 
          asChild 
          variant={isEnding ? "destructive" : "donate"}
          className={cn(
            "w-full h-11 rounded-xl text-sm font-bold transition-colors",
            isEnding && "text-destructive-foreground"
          )}
        >
          <Link to={`/campaigns/${campaign.id}`} aria-label={t('campaigns.contributeTo', { title: campaign.title })}>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            {isEnding ? t('campaigns.donateNowEndingSoon') : t('actions.contribute')}
          </Link>
        </Button>
      </div>
    </article>
  );
}
