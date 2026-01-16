import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Campaign } from '@/types';
import { ShareButton } from './ShareButton';
import { Heart, Users, Sparkles, Clock, TrendingUp, PawPrint } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

// Generate consistent donor count from campaign ID
function getDonorCount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 45) + 12; // 12-56 donors
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  const { t } = useTranslation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const percentage = Math.min((campaign.current / campaign.goal) * 100, 100);
  const donorCount = getDonorCount(campaign.id);
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
        'group relative bg-card rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/30 transition-all duration-300 hover:ring-border/50 hover:shadow-lg',
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
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <PawPrint className="w-10 h-10 text-muted-foreground/20 animate-pulse" />
            </div>
          )}
          {/* Error fallback */}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <PawPrint className="w-14 h-14 text-primary/20" />
            </div>
          ) : (
            <img
              src={campaign.image}
              alt={campaign.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-500 group-hover:scale-105",
                !imageLoaded && "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          
          {/* Top gradient for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
          
          {/* Bottom gradient for progress visibility */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />

          {/* Time-based badge */}
          {daysLeft !== null && daysLeft > 0 && (
            <div className="absolute top-3 left-3">
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-colors",
                isEnding 
                  ? "bg-destructive/90 text-destructive-foreground animate-pulse" 
                  : isUrgent 
                    ? "bg-warning/90 text-warning-foreground"
                    : "bg-black/50 text-white"
              )}>
                <Clock className="w-3.5 h-3.5" />
                <span>{t('campaigns.daysLeft', { count: daysLeft })}</span>
              </div>
            </div>
          )}
          
          {/* Momentum badge */}
          {isAlmostFunded && (
            <div className="absolute top-3 left-3 mt-9">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/90 text-success-foreground text-[10px] font-bold shadow-lg backdrop-blur-md">
                <TrendingUp className="w-3 h-3" />
                <span>{t('campaigns.almostThere')}</span>
              </div>
            </div>
          )}

          {/* Progress overlay on image */}
          <div className="absolute bottom-0 inset-x-0 p-3">
            <div className="flex items-end justify-between gap-2 mb-2">
              <div className="flex flex-col">
                <span className="text-white/70 text-[10px] font-medium uppercase tracking-wide">
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
                      ? "bg-gradient-to-r from-primary to-success"
                      : "bg-primary"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-white/60">
              <span>{t('campaigns.goal')}: {campaign.goal.toLocaleString()} {campaign.unit}</span>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{t('campaigns.supporters', { count: donorCount })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 pb-2">
          <h3 className="font-bold text-base text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
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
          variant="default" 
          className={cn(
            "w-full h-11 rounded-xl font-bold text-sm transition-all",
            isEnding && "bg-destructive hover:bg-destructive/90"
          )}
        >
          <Link to={`/campaigns/${campaign.id}`} aria-label={t('campaigns.contributeTo', { title: campaign.title })}>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            {isEnding ? t('campaigns.donateNowEndingSoon') : t('actions.contribute')}
            {isAlmostFunded && <Sparkles className="w-4 h-4 ml-2" />}
          </Link>
        </Button>
      </div>
    </article>
  );
}
