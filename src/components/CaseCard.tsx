import { Link } from 'react-router-dom';
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
          title={caseData.title}
          text={caseData.description}
          url={`${window.location.origin}/case/${caseData.id}`}
        />
      </div>

      <Link to={`/case/${caseData.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={caseData.images[0]}
            alt={caseData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2.5 left-2.5">
            <StatusBadge status={caseData.status} size="sm" />
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 pb-2">
          <h3 className="font-semibold text-base text-foreground mb-1.5 line-clamp-2">
            {caseData.title}
          </h3>

          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{caseData.location.city}, {caseData.location.neighborhood}</span>
          </div>
        </div>
      </Link>

      {/* Footer actions (kept outside Link to avoid nested interactive elements) */}
      <div className="px-3.5 pb-3.5">
        <ProgressBar
          current={caseData.fundraising.current}
          goal={caseData.fundraising.goal}
          currency={caseData.fundraising.currency}
          layout="compact"
          size="sm"
        />

        <Button asChild className="w-full mt-3 h-11 btn-donate">
          <Link to={`/case/${caseData.id}`} aria-label={`Donate to ${caseData.title}`}>
            <Heart className="w-4 h-4 mr-2" />
            Donate
          </Link>
        </Button>
      </div>
    </div>
  );
}
