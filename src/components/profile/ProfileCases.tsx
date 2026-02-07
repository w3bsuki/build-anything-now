import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PawPrint, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';

interface Case {
  _id: string;
  title: string;
  description: string;
  type: 'critical' | 'urgent' | 'recovering' | 'adopted';
  status: 'active' | 'funded' | 'closed';
  location: {
    city: string;
    neighborhood: string;
  };
  fundraising: {
    goal: number;
    current: number;
    currency: string;
  };
  imageUrl?: string | null;
}

interface ProfileCasesProps {
  cases: Case[];
  emptyMessage?: string;
}

export function ProfileCases({ cases, emptyMessage }: ProfileCasesProps) {
  const { t } = useTranslation();

  if (!cases || cases.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <PawPrint className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{t('profile.noCases')}</h3>
        <p className="text-sm text-muted-foreground">{emptyMessage || t('profile.noCasesDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cases.map((caseItem) => {
        const percentage = Math.min((caseItem.fundraising.current / caseItem.fundraising.goal) * 100, 100);
        
        return (
          <Link
            key={caseItem._id}
            to={`/case/${caseItem._id}`}
            className="block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-sm transition-all active:scale-[0.99]"
          >
            <div className="flex gap-3 p-3">
              {/* Image - Always show, with placeholder if missing */}
              <div className="w-[72px] h-[72px] rounded-lg overflow-hidden bg-muted shrink-0">
                {caseItem.imageUrl ? (
                  <img
                    src={caseItem.imageUrl}
                    alt={caseItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                {/* Title row with badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1 flex-1">{caseItem.title}</h3>
                  <StatusBadge 
                    status={caseItem.type} 
                    size="sm" 
                    className="shrink-0"
                  />
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{caseItem.location.city}</span>
                </div>

                {/* Progress - Simplified, no duplicate text */}
                <div className="space-y-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {caseItem.fundraising.current.toLocaleString()} {caseItem.fundraising.currency}
                    </span>
                    <span className="text-muted-foreground">
                      {t('common.of')} {caseItem.fundraising.goal.toLocaleString()} {caseItem.fundraising.currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
