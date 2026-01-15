import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { CaseCard } from '@/components/CaseCard';
import { CaseCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HomeHeader } from '@/components/homepage/HomeHeader';
import { HeroCircles } from '@/components/homepage/HeroCircles';
import { SegmentedFilter } from '@/components/homepage/SegmentedFilter';
import { SearchOverlay } from '@/components/search/SearchOverlay';

import { api } from '../../convex/_generated/api';

const Index = () => {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cases = useQuery(api.cases.listUiForLocale, { locale: i18n.language });
  const topHeroesRaw = useQuery(api.users.getTopHeroes, { limit: 10 });
  
  const isLoading = cases === undefined;
  const caseList = cases ?? [];
  
  // Transform heroes to match expected shape
  const topHeroes = (topHeroesRaw ?? []).map((h: any) => ({
    id: h?.id?.toString() ?? '',
    name: h?.name ?? 'User',
    avatar: h?.avatar,
    animalsHelped: h?.animalsHelped ?? 0,
  }));

  // Filter options - mobile-first: 4 tabs that fit
  const filterOptions = [
    { id: 'all', label: t('status.all') },
    { id: 'urgent', label: t('status.urgent'), icon: '🆘' },
    { id: 'adopted', label: t('status.adopted'), icon: '🏠' },
    { id: 'nearby', label: '', icon: '📍' }, // Icon-only for space
  ];

  const filteredCases = caseList.filter((c) => {
    // Filter by status - "urgent" shows both urgent AND critical
    if (statusFilter === 'urgent' && c.status !== 'urgent' && c.status !== 'critical') return false;
    if (statusFilter === 'adopted' && c.status !== 'adopted') return false;
    // Filter by nearby - would need geolocation (placeholder for now)
    if (statusFilter === 'nearby') {
      // TODO: implement actual geolocation filtering
      return true; // Show all for now
    }
    // Filter by search query (basic)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.location?.city?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const urgentCases = filteredCases.filter(c => c.status === 'urgent' || c.status === 'critical');
  const otherCases = filteredCases.filter(c => c.status !== 'urgent' && c.status !== 'critical');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header with Search Icon */}
      <HomeHeader onSearchClick={() => setSearchOpen(true)} />

      {/* Story Circles - Social element */}
      <div className="md:hidden">
        <HeroCircles 
          heroes={topHeroes} 
          isLoading={topHeroesRaw === undefined} 
        />
      </div>

      {/* Segmented Filter - Mobile - Sticky under header */}
      <div className="md:hidden sticky top-[calc(3rem+env(safe-area-inset-top))] z-40 bg-background">
        <SegmentedFilter 
          options={filterOptions} 
          selected={statusFilter} 
          onSelect={setStatusFilter}
          className="px-3"
        />
      </div>

      {/* Desktop Header with Circles + Filters */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 border-b border-border/50">
        <div className="container mx-auto px-4">
          <HeroCircles 
            heroes={topHeroes} 
            isLoading={topHeroesRaw === undefined} 
          />
          <SegmentedFilter 
            options={filterOptions} 
            selected={statusFilter} 
            onSelect={setStatusFilter}
            className="px-0"
          />
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onSearch={handleSearch}
      />

      {/* Urgent Cases Section */}
      {(isLoading || urgentCases.length > 0) && (
        <section className="pb-2" data-tour="urgent-cases">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-urgent" />
              <h2 className="text-sm font-semibold text-foreground">{t('home.urgentCases')}</h2>
              {!isLoading && <span className="text-xs text-muted-foreground">({urgentCases.length})</span>}
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
                urgentCases.map((caseData, index) => (
                  <div 
                    key={caseData.id} 
                    className="w-64 flex-shrink-0"
                    {...(index === 0 ? { 'data-tour': 'case-card' } : {})}
                  >
                    <CaseCard caseData={caseData} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* All/Other Cases Section */}
      <section className="pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-2">
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
};

export default Index;
