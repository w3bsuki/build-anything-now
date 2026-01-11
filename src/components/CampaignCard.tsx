import { Link } from 'react-router-dom';
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
  return (
    <div
      className={cn(
        'relative bg-card rounded-xl overflow-hidden border border-border',
        className
      )}
    >
      {/* Share Button */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <ShareButton
          title={campaign.title}
          text={campaign.description}
          url={`${window.location.origin}/campaigns/${campaign.id}`}
        />
      </div>

      <Link to={`/campaigns/${campaign.id}`} className="block">
        {/* Image - same aspect ratio as CaseCard */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {/* Date badge in top-left like CaseCard's status badge */}
          {campaign.endDate && (
            <div className="absolute top-2.5 left-2.5">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-warning/90 text-warning-foreground text-xs font-medium">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(campaign.endDate), 'MMM d')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 pb-2">
          <h3 className="font-semibold text-base text-foreground mb-1.5 line-clamp-2">
            {campaign.title}
          </h3>

          <p className="text-muted-foreground text-xs mb-3 line-clamp-1">
            {campaign.description}
          </p>
        </div>
      </Link>

      {/* Footer actions (kept outside Link to avoid nested interactive elements) */}
      <div className="px-3.5 pb-3.5">
        <ProgressBar
          current={campaign.current}
          goal={campaign.goal}
          currency={campaign.unit}
          layout="compact"
          size="sm"
        />

        <Button asChild className="w-full mt-3 h-11 btn-donate">
          <Link to={`/campaigns/${campaign.id}`} aria-label={`Contribute to ${campaign.title}`}>
            <Heart className="w-4 h-4 mr-2" />
            Contribute
          </Link>
        </Button>
      </div>
    </div>
  );
}
