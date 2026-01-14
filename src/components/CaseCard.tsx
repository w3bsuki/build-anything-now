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
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
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
        <div className="p-3 pb-1.5">
          <h3 className="font-medium text-sm text-foreground mb-1 truncate">
            {caseData.title}
          </h3>

          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{caseData.location.city}, {caseData.location.neighborhood}</span>
          </div>
        </div>
      </Link>

      {/* Footer actions (kept outside Link to avoid nested interactive elements) */}
      <div className="px-3 pb-3">
        <ProgressBar
          current={caseData.fundraising.current}
          goal={caseData.fundraising.goal}
          currency={caseData.fundraising.currency}
          layout="compact"
          size="sm"
        />

        <Button asChild className="w-full mt-2.5 h-9 btn-donate font-medium text-sm">
          <Link to={`/case/${caseData.id}`} aria-label={`Donate to ${caseData.title}`}>
            <Heart className="w-3.5 h-3.5 mr-1.5" />
            {t('actions.donate')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
