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
    <div className="bg-card rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={campaign.image}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-bold text-xl text-white mb-1">{campaign.title}</h3>
          {campaign.endDate && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Ends {format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-muted-foreground text-sm mb-5 line-clamp-2">
          {campaign.description}
        </p>

        {/* Large Progress Display */}
        <div className="mb-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-3xl font-bold text-gradient">
                {campaign.current}
              </span>
              <span className="text-muted-foreground text-lg">
                /{campaign.goal} {campaign.unit}
              </span>
            </div>
            <span className="text-lg font-semibold text-primary">
              {percentage}%
            </span>
          </div>
          <div className="progress-bar-track h-3">
            <div
              className="progress-bar-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <Button className="w-full btn-donate">
          <Heart className="w-4 h-4 mr-2" />
          Contribute Now
        </Button>
      </div>
    </div>
  );
}
