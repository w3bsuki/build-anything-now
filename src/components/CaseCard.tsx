import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { AnimalCase } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ProgressBar } from './ProgressBar';
import { cn } from '@/lib/utils';

interface CaseCardProps {
  caseData: AnimalCase;
  className?: string;
}

export function CaseCard({ caseData, className }: CaseCardProps) {
  return (
    <Link
      to={`/case/${caseData.id}`}
      className={cn(
        'block bg-card rounded-2xl overflow-hidden shadow-card card-hover animate-fade-in',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={caseData.images[0]}
          alt={caseData.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={caseData.status} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">
          {caseData.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{caseData.location.city}, {caseData.location.neighborhood}</span>
        </div>

        <ProgressBar
          current={caseData.fundraising.current}
          goal={caseData.fundraising.goal}
          currency={caseData.fundraising.currency}
          size="sm"
        />
      </div>
    </Link>
  );
}
