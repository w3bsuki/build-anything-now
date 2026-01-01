import { Campaign } from '@/types';
import { ProgressBar } from './ProgressBar';
import { Button } from './ui/button';
import { Calendar, Heart } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.round((campaign.current / campaign.goal) * 100);

  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border/50 card-hover">
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

        <Button className="w-full btn-donate h-10 text-sm">
          <Heart className="w-4 h-4 mr-1.5" />
          Contribute
        </Button>
      </div>
    </div>
  );
}
