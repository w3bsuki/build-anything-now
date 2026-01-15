import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, AlertTriangle, Heart, Activity } from 'lucide-react';
import { useQuery } from 'convex/react';
import { CaseCard } from '@/components/CaseCard';
import { FilterPills } from '@/components/FilterPills';
import { CaseCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslatedMockData } from '@/hooks/useTranslatedMockData';
import { MobilePageHeader } from '@/components/MobilePageHeader';

import { api } from '../../convex/_generated/api';

function IndexMock() {
  const { t } = useTranslation();
  const { mockCases } = useTranslatedMockData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

  const statusFilters = [
    { id: 'all', label: t('status.all') },
    { id: 'critical', label: t('status.critical'), icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'urgent', label: t('status.urgent'), icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'recovering', label: t('status.recovering'), icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'adopted', label: t('status.adopted'), icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  // Filter cases based on selected status
  const filteredCases = mockCases.filter((c) => {
    return statusFilter === 'all' || c.status === statusFilter;
  });

  const urgentCases = filteredCases.filter(c => c.status === 'urgent' || c.status === 'critical');
  const otherCases = filteredCases.filter(c => c.status !== 'urgent' && c.status !== 'critical');

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title="PawsSafe"
        showLogo
        searchPlaceholder={t('home.searchPlaceholder')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <FilterPills
          options={statusFilters}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-2 border-b border-border/50">
        <div className="container mx-auto px-4 space-y-2">
          <FilterPills
            options={statusFilters}
            selected={statusFilter}
            onSelect={setStatusFilter}
          />
        </div>
      </div>

      {/* Urgent Cases - Horizontal Scroll */}
      {(isLoading || urgentCases.length > 0) && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-urgent" />
              <h2 className="text-sm font-semibold text-foreground">{t('home.urgentCases')}</h2>
              {!isLoading && <span className="text-xs text-muted-foreground">({urgentCases.length})</span>}
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  id="nearby-cases-filter"
                  checked={showNearbyOnly}
                  onCheckedChange={setShowNearbyOnly}
                  className="scale-90"
                />
                <Label htmlFor="nearby-cases-filter" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                  {t('home.nearbyOnly')}
                </Label>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-64 flex-shrink-0">
                    <CaseCardSkeleton />
                  </div>
                ))
              ) : (
                urgentCases.map((caseData) => (
                  <div key={caseData.id} className="w-64 flex-shrink-0">
                    <CaseCard caseData={caseData} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* All Cases */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {urgentCases.length > 0 ? t('home.otherCases') : t('home.allCases')}
            </h2>
            {!isLoading && <span className="text-xs text-muted-foreground">({otherCases.length})</span>}
          </div>
          {isLoading ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          ) : otherCases.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherCases.map((caseData) => (
                <CaseCard key={caseData.id} caseData={caseData} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('home.noMatches')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function IndexConvex() {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cases = useQuery(api.cases.listUiForLocale, { locale: i18n.language });
  const isLoading = cases === undefined;
  const caseList = cases ?? [];

  const statusFilters = [
    { id: 'all', label: t('status.all') },
    { id: 'critical', label: t('status.critical'), icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'urgent', label: t('status.urgent'), icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'recovering', label: t('status.recovering'), icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'adopted', label: t('status.adopted'), icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const filteredCases = caseList.filter((c) => {
    return statusFilter === 'all' || c.status === statusFilter;
  });

  const urgentCases = filteredCases.filter(c => c.status === 'urgent' || c.status === 'critical');
  const otherCases = filteredCases.filter(c => c.status !== 'urgent' && c.status !== 'critical');

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title="PawsSafe"
        showLogo
        searchPlaceholder={t('home.searchPlaceholder')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <FilterPills options={statusFilters} selected={statusFilter} onSelect={setStatusFilter} />
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-2 border-b border-border/50">
        <div className="container mx-auto px-4 space-y-2">
          <FilterPills options={statusFilters} selected={statusFilter} onSelect={setStatusFilter} />
        </div>
      </div>

      {(isLoading || urgentCases.length > 0) && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-urgent" />
              <h2 className="text-sm font-semibold text-foreground">{t('home.urgentCases')}</h2>
              {!isLoading && <span className="text-xs text-muted-foreground">({urgentCases.length})</span>}
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  id="nearby-cases-filter"
                  checked={showNearbyOnly}
                  onCheckedChange={setShowNearbyOnly}
                  className="scale-90"
                />
                <Label htmlFor="nearby-cases-filter" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                  {t('home.nearbyOnly')}
                </Label>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-64 flex-shrink-0">
                    <CaseCardSkeleton />
                  </div>
                ))
              ) : (
                urgentCases.map((caseData) => (
                  <div key={caseData.id} className="w-64 flex-shrink-0">
                    <CaseCard caseData={caseData} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {urgentCases.length > 0 ? t('home.otherCases') : t('home.allCases')}
            </h2>
            {!isLoading && <span className="text-xs text-muted-foreground">({otherCases.length})</span>}
          </div>
          {isLoading ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          ) : otherCases.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {otherCases.map((caseData) => (
                <CaseCard key={caseData.id} caseData={caseData} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('home.noMatches')}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const Index = () => {
  const convexEnabled = Boolean(import.meta.env.VITE_CONVEX_URL);
  return convexEnabled ? <IndexConvex /> : <IndexMock />;
};

export default Index;
