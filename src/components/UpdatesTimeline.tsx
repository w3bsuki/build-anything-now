import { CaseUpdate } from '@/types';
import { cn } from '@/lib/utils';
import { Stethoscope, Flag, Bell, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';

interface UpdatesTimelineProps {
  updates: CaseUpdate[];
}

const typeConfig = {
  medical: {
    icon: Stethoscope,
    color: 'bg-accent text-accent-foreground',
  },
  milestone: {
    icon: Flag,
    color: 'bg-warning text-warning-foreground',
  },
  update: {
    icon: Bell,
    color: 'bg-secondary text-secondary-foreground',
  },
  success: {
    icon: PartyPopper,
    color: 'bg-success text-success-foreground',
  },
};

export function UpdatesTimeline({ updates }: UpdatesTimelineProps) {
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-0">
      {sortedUpdates.map((update, index) => {
        const config = typeConfig[update.type];
        const Icon = config.icon;
        const isLast = index === sortedUpdates.length - 1;

        return (
          <div key={update.id} className="flex gap-3">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  config.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className="w-px h-full min-h-[32px] bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 pt-0.5">
              <p className="text-xs text-muted-foreground mb-0.5">
                {format(new Date(update.date), 'MMM d, yyyy')}
              </p>
              <h4 className="font-medium text-sm text-foreground">{update.title}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {update.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
