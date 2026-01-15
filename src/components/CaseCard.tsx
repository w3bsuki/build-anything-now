import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin } from 'lucide-react';
import { AnimalCase } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

export function CaseCard({ caseData, className }: CaseCardProps) {
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
          title={caseData.title}
          text={caseData.description}
          url={`${window.location.origin}/case/${caseData.id}`}
          size="sm"
        />
      </div>

      <Link to={`/case/${caseData.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img
            src={caseData.images[0]}
            alt={caseData.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {/* Scrim for better readability of badges */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          
          <div className="absolute top-2.5 left-2.5">
            <StatusBadge status={caseData.status} size="sm" className="shadow-sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-3 pb-2 space-y-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-base text-foreground line-clamp-1 leading-tight">
              {caseData.title}
            </h3>

            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate font-medium">{caseData.location.city}, {caseData.location.neighborhood}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Footer actions (kept outside Link to avoid nested interactive elements) */}
      <div className="px-3 pb-3 pt-0">
        <ProgressBar
          current={caseData.fundraising.current}
          goal={caseData.fundraising.goal}
          currency={caseData.fundraising.currency}
          layout="compact"
          size="sm"
        />

        <Button asChild variant="donate" className="w-full mt-3 h-10 rounded-xl shadow-sm text-sm font-semibold">
          <Link to={`/case/${caseData.id}`} aria-label={`Donate to ${caseData.title}`}>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            {t('actions.donate')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
