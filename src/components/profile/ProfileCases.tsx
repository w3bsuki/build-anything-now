import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PawPrint, MapPin } from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

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
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Link
          key={caseItem._id}
          to={`/case/${caseItem._id}`}
          className="block bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors"
        >
          <div className="flex gap-4 p-4">
            {/* Image */}
            {caseItem.imageUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                <img
                  src={caseItem.imageUrl}
                  alt={caseItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{caseItem.title}</h3>
                <StatusBadge 
                  status={caseItem.type} 
                  size="sm" 
                  className="shrink-0"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span>{caseItem.location.city}</span>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <ProgressBar
                  current={caseItem.fundraising.current}
                  goal={caseItem.fundraising.goal}
                  size="sm"
                />
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {caseItem.fundraising.current} {caseItem.fundraising.currency}
                  </span>
                  <span className="text-muted-foreground">
                    / {caseItem.fundraising.goal} {caseItem.fundraising.currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
