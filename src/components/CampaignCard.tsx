import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Campaign } from '@/types';
import { ShareButton } from './ShareButton';
import { ProgressBar } from './ProgressBar';
import { Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CampaignCardProps {
  campaign: Campaign;
  className?: string;
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'relative bg-card rounded-xl overflow-hidden shadow-sm',
        className
      )}
    >
      {/* Share Button */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <ShareButton
          title={campaign.title}
          text={campaign.description}
          url={`${window.location.origin}/campaigns/${campaign.id}`}
          size="sm"
        />
      </div>

      <Link to={`/campaigns/${campaign.id}`} className="block">
        {/* Image - shorter aspect ratio for more compact cards */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {/* Scrim for better readability of badges */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          {/* Date badge in top-left like CaseCard's status badge */}
          {campaign.endDate && (
            <div className="absolute top-2.5 left-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/90 backdrop-blur-sm text-warning-foreground text-xs font-semibold shadow-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span>{format(new Date(campaign.endDate), 'MMM d')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 pb-2 space-y-1">
          <h3 className="font-semibold text-base text-foreground line-clamp-1 leading-tight">
            {campaign.title}
          </h3>

          <p className="text-muted-foreground text-xs line-clamp-1 leading-relaxed">
            {campaign.description}
          </p>
        </div>
      </Link>

      {/* Footer actions (kept outside Link to avoid nested interactive elements) */}
      <div className="px-3 pb-3 pt-0">
        <ProgressBar
          current={campaign.current}
          goal={campaign.goal}
          currency={campaign.unit}
          layout="compact"
          size="sm"
        />

        <Button asChild variant="donate" className="w-full mt-3 h-10 rounded-xl shadow-sm text-sm font-semibold">
          <Link to={`/campaigns/${campaign.id}`} aria-label={`Contribute to ${campaign.title}`}>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            {t('actions.contribute')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
