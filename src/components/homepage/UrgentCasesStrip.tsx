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

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function UrgentCaseChip({ caseData }: { caseData: AnimalCase }) {
  const isCritical = caseData.status === 'critical';
  const percentage = Math.min((caseData.fundraising.current / caseData.fundraising.goal) * 100, 100);
  const timeAgo = formatTimeAgo(caseData.createdAt);

  return (
    <Link 
      to={`/case/${caseData.id}`}
      className={cn(
        "shrink-0 w-44 bg-card rounded-2xl overflow-hidden shadow-sm transition-all active:scale-[0.98]",
        isCritical 
          ? "ring-1 ring-destructive/20 hover:ring-destructive/40" 
          : "ring-1 ring-border/40 hover:ring-border/60"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={caseData.images[0]}
          alt={caseData.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide",
            isCritical 
              ? "bg-destructive text-destructive-foreground shadow-md" 
              : "bg-destructive/90 text-destructive-foreground shadow-md"
          )}>
            {isCritical && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {isCritical ? 'Critical' : 'Urgent'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-2.5">
        <h4 className="font-semibold text-[13px] leading-tight text-foreground line-clamp-2 mb-1.5">
          {caseData.title}
        </h4>
        
        {/* Location + Time */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-2">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{caseData.location.city}</span>
          <span className="text-muted-foreground/60">•</span>
          <span className="shrink-0">{timeAgo}</span>
        </div>
        
        {/* Progress mini bar */}
        <div className="space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-destructive to-destructive/80 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-destructive font-medium">
              €{caseData.fundraising.current}
            </span>
            <span className="font-semibold text-foreground">
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
    <div className="shrink-0 w-44 bg-card rounded-2xl overflow-hidden ring-1 ring-border/40 shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-2.5 space-y-2">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-1.5 bg-muted rounded-full" />
        <div className="flex justify-between">
          <div className="h-2.5 bg-muted rounded w-10" />
          <div className="h-2.5 bg-muted rounded w-10" />
        </div>
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
