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
          <div key={update.id} className="flex gap-4">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                  config.color
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-full min-h-[40px] bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p className="text-xs text-muted-foreground mb-1">
                {format(new Date(update.date), 'MMM d, yyyy')}
              </p>
              <h4 className="font-semibold text-foreground">{update.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {update.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
