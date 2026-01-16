import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Siren, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnimalCase } from '@/types';

interface UrgentCasesStripProps {
  cases: AnimalCase[];
  isLoading?: boolean;
  className?: string;
}

function UrgentCaseChip({ caseData }: { caseData: AnimalCase }) {
  const isCritical = caseData.status === 'critical';
  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);

  return (
    <Link 
      to={`/case/${caseData.id}`}
      className={cn(
        "shrink-0 w-40 bg-card rounded-xl overflow-hidden border transition-all active:scale-[0.98]",
        isCritical 
          ? "border-destructive/30 hover:border-destructive/50" 
          : "border-border/50 hover:border-border"
      )}
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={caseData.images[0]}
          alt={caseData.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Status badge */}
        <div className="absolute top-1.5 left-1.5">
          <span className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shadow-sm",
            isCritical 
              ? "bg-destructive text-destructive-foreground" 
              : "bg-destructive/90 text-destructive-foreground"
          )}>
            {isCritical && <span className="w-1 h-1 rounded-full bg-white animate-pulse" />}
            {isCritical ? 'Critical' : 'Urgent'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-2">
        <h4 className="font-medium text-xs text-foreground line-clamp-1 mb-1">
          {caseData.title}
        </h4>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
          <MapPin className="w-2.5 h-2.5" />
          <span className="truncate">{caseData.location.city}</span>
        </div>
        
        {/* Progress mini bar */}
        <div className="space-y-0.5">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-destructive rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-muted-foreground">
              €{caseData.fundraising.current}
            </span>
            <span className="font-medium text-foreground">
              €{caseData.fundraising.goal}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function UrgentCaseSkeleton() {
  return (
    <div className="shrink-0 w-40 bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse">
      <div className="aspect-4/3 bg-muted" />
      <div className="p-2 space-y-2">
        <div className="h-3 bg-muted rounded w-3/4" />
        <div className="h-2 bg-muted rounded w-1/2" />
        <div className="h-1 bg-muted rounded-full" />
      </div>
    </div>
  );
}

export function UrgentCasesStrip({ cases, isLoading, className }: UrgentCasesStripProps) {
  const { t } = useTranslation();
  
  // Filter for urgent/critical only
  const urgentCases = cases.filter(c => c.status === 'critical' || c.status === 'urgent');
  
  // Don't render if no urgent cases and not loading
  if (!isLoading && urgentCases.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-2">
          <Siren className="w-4 h-4 text-destructive" />
          <h2 className="text-sm font-semibold text-foreground">
            {t('home.needsHelpNow', 'Needs Help Now')}
          </h2>
          {!isLoading && (
            <span className="text-xs text-destructive font-medium">
              ({urgentCases.length})
            </span>
          )}
        </div>
        <Link 
          to="/campaigns?filter=urgent"
          className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('common.seeAll', 'See all')}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-1" style={{ width: 'max-content' }}>
          {isLoading ? (
            <>
              <UrgentCaseSkeleton />
              <UrgentCaseSkeleton />
              <UrgentCaseSkeleton />
            </>
          ) : (
            urgentCases.map((caseData) => (
              <UrgentCaseChip key={caseData.id} caseData={caseData} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
