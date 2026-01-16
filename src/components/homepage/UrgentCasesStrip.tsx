import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UrgentCaseCard, UrgentCaseCardSkeleton } from './UrgentCaseCard';
import type { AnimalCase } from '@/types';

interface UrgentCasesStripProps {
  cases: AnimalCase[];
  isLoading?: boolean;
  className?: string;
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
    <section className={cn("py-4", className)}>
      {/* Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Siren className="w-4 h-4 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">
              {t('home.needsHelpNow', 'Needs Help Now')}
            </h2>
            {!isLoading && (
              <span className="text-sm text-destructive font-medium">
                ({urgentCases.length})
              </span>
            )}
          </div>
          <Link 
            to="/?filter=urgent"
            className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('common.seeAll', 'See all')}
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Horizontal scroll of campaign-style cards */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-64 shrink-0">
                <UrgentCaseCardSkeleton />
              </div>
            ))
          ) : (
            urgentCases.map((caseData) => (
              <div key={caseData.id} className="w-64 shrink-0">
                <UrgentCaseCard caseData={caseData} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
