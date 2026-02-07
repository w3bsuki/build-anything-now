import { useTranslation } from 'react-i18next';
import { CaseUpdate } from '@/types';
import { cn } from '@/lib/utils';
import { Stethoscope, Flag, Bell, PartyPopper, BadgeCheck, ShieldCheck } from 'lucide-react';

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
} as const;

function evidenceLabel(type: CaseUpdate['evidenceType']) {
  if (type === 'bill') return 'Bill';
  if (type === 'lab_result') return 'Lab result';
  if (type === 'clinic_photo') return 'Clinic photo';
  if (type === 'other') return 'Evidence';
  return null;
}

function authorLabel(role: CaseUpdate['authorRole']) {
  if (role === 'clinic') return 'Clinic';
  if (role === 'moderator') return 'Moderator';
  return 'Rescuer';
}

export function UpdatesTimeline({ updates }: UpdatesTimelineProps) {
  const { i18n } = useTranslation();

  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (sortedUpdates.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        No updates yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {sortedUpdates.map((update, index) => {
        const config = typeConfig[update.type];
        const Icon = config.icon;
        const isLast = index === sortedUpdates.length - 1;
        const evidence = evidenceLabel(update.evidenceType);

        return (
          <div key={update.id} className="flex gap-3">
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
                <div className="w-px h-full min-h-8 bg-border" />
              )}
            </div>

            <div className="pb-4 pt-0.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-xs text-muted-foreground">
                  {formatDate(update.date)}
                </p>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-[11px] rounded-full border border-border/70 px-2 py-0.5 text-muted-foreground inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {authorLabel(update.authorRole)}
                </span>
                {evidence && (
                  <span className="text-[11px] rounded-full border border-border/70 px-2 py-0.5 text-muted-foreground inline-flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    {evidence}
                  </span>
                )}
              </div>

              {update.title ? (
                <h4 className="font-medium text-sm text-foreground">{update.title}</h4>
              ) : null}

              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed whitespace-pre-wrap">
                {update.description}
              </p>

              {update.images && update.images.length > 0 ? (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {update.images.slice(0, 6).map((img, imgIndex) => (
                    <img
                      key={`${update.id}-${imgIndex}`}
                      src={img}
                      alt="Update evidence"
                      className="w-full h-20 rounded-lg object-cover bg-muted"
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
