import { Link } from 'react-router-dom';
import { Campaign } from '@/types';
import { Button } from './ui/button';
import { ShareButton } from './ShareButton';
import { Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.round((campaign.current / campaign.goal) * 100);

  return (
    <div className="relative bg-card rounded-xl overflow-hidden border border-border/50 card-hover">
      {/* Share Button */}
      <div className="absolute top-3 right-3 z-10">
        <ShareButton 
          title={campaign.title} 
          text={campaign.description}
          url={`${window.location.origin}/campaigns/${campaign.id}`}
        />
      </div>

      <Link to={`/campaigns/${campaign.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-semibold text-lg text-white mb-0.5">{campaign.title}</h3>
            {campaign.endDate && (
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Calendar className="w-3 h-3" />
                <span>Ends {format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Progress Display */}
        <div className="mb-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-2xl font-bold text-primary">
                {campaign.current}
              </span>
              <span className="text-muted-foreground text-sm">
                /{campaign.goal} {campaign.unit}
              </span>
            </div>
            <span className="text-sm font-medium text-primary">
              {percentage}%
            </span>
          </div>
          <div className="progress-bar-track h-2">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <Link to={`/campaigns/${campaign.id}`}>
          <Button className="w-full btn-donate h-10 text-sm">
            <Heart className="w-4 h-4 mr-1.5" />
            Contribute
          </Button>
        </Link>
      </div>
    </div>
  );
}
