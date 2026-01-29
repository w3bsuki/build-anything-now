import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { Loader2, RefreshCw } from 'lucide-react';
import { TwitterCaseCard } from '@/components/homepage/TwitterCaseCard';
import { CompactCaseCard, CompactCaseCardSkeleton } from '@/components/homepage/CompactCaseCard';
import { CaseCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { HomeHeaderV2 } from '@/components/homepage/HomeHeaderV2';
import { IntentFilterPills, type FilterTab, BULGARIAN_CITIES, type CityFilter } from '@/components/homepage/IntentFilterPills';
import { UrgentCasesStrip } from '@/components/homepage/UrgentCasesStrip';
import { HeroCircles, type TopHero } from '@/components/homepage/HeroCircles';
import { HeroCaseCard, HeroCaseCardSkeleton } from '@/components/homepage/HeroCaseCard';
import { cn } from '@/lib/utils';
import type { AnimalCase } from '@/types';
import { Switch } from '@/components/ui/switch';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const IndexV2 = () => {
  const { t, i18n } = useTranslation();
  const [intentFilter, setIntentFilter] = useState<FilterTab>('urgent');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'focus' | 'browse'>('focus');
  
  // Pagination state
  const [allCases, setAllCases] = useState<AnimalCase[]>([]);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number | null>(null);

  // Initial page of cases
  const initialCases = useQuery(api.cases.listUiForLocalePaginated, { 
    locale: i18n.language,
    limit: 20, // Load more initially for filtering
  });
  
  // Load more cases (only when cursor is set)
  const moreCases = useQuery(
    api.cases.listUiForLocalePaginated,
    cursor ? { locale: i18n.language, limit: 10, cursor } : "skip"
  );
  
  // Social stats for all visible cases
  const caseIds = allCases.map(c => c.id as Id<"cases">);
  const socialStats = useQuery(
    api.social.getSocialStats,
    caseIds.length > 0 ? { caseIds } : "skip"
  );

  const topVolunteers = useQuery(api.volunteers.getTop, { limit: 10 });
  const heroes: TopHero[] = (topVolunteers ?? []).map((vol) => ({
    id: vol.userId as unknown as string,
    name: vol.name,
    avatar: vol.avatar,
    animalsHelped: vol.stats.animalsHelped,
  }));
  
  // Initialize cases from first query
  useEffect(() => {
    if (initialCases && allCases.length === 0) {
      const id = setTimeout(() => {
        setAllCases(initialCases.items as AnimalCase[]);
        setHasMore(initialCases.hasMore);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [initialCases, allCases.length]);
  
  // Append more cases when loaded
  useEffect(() => {
    if (moreCases && isLoadingMore) {
      const id = setTimeout(() => {
        setAllCases(prev => [...prev, ...(moreCases.items as AnimalCase[])]);
        setHasMore(moreCases.hasMore);
        setIsLoadingMore(false);
      }, 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [moreCases, isLoadingMore]);
  
  const isLoading = initialCases === undefined;
  const caseList = allCases;

  // Priority order for smart sorting (critical/urgent first)
  const priorityOrder: Record<string, number> = {
    'critical': 0,
    'urgent': 1,
    'recovering': 2,
    'adopted': 3,
  };

  // Filter cases based on intent filter and search
  const getFilteredCases = () => {
    let filtered = [...caseList];
    
    // Apply search filter first
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.location?.city?.toLowerCase().includes(query) ||
        c.author?.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply intent filter
    switch (intentFilter) {
      case 'urgent':
        // Show urgent/critical cases, sorted by priority
        filtered = filtered
          .filter(c => c.status === 'critical' || c.status === 'urgent' || c.status === 'recovering')
          .sort((a, b) => {
            const priorityA = priorityOrder[a.status] ?? 99;
            const priorityB = priorityOrder[b.status] ?? 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        break;
        
      case 'nearby':
        // TODO: Implement actual geolocation filtering
        // For now, show all sorted by recency
        filtered = filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      
      // City filters
      case 'sofia':
      case 'varna':
      case 'plovdiv': {
        const cityMap: Record<CityFilter, string[]> = {
          sofia: ['sofia', 'софия', 'софія'],
          varna: ['varna', 'варна'],
          plovdiv: ['plovdiv', 'пловдив'],
        };
        const cityNames = cityMap[intentFilter];
        filtered = filtered
          .filter(c => {
            const city = c.location?.city?.toLowerCase() || '';
            return cityNames.some(name => city.includes(name));
          })
          .sort((a, b) => {
            const priorityA = priorityOrder[a.status] ?? 99;
            const priorityB = priorityOrder[b.status] ?? 99;
            if (priorityA !== priorityB) return priorityA - priorityB;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        break;
      }
        
      case 'success':
        // Show only adopted/success cases
        filtered = filtered
          .filter(c => c.status === 'adopted')
          .sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        break;
    }
    
    return filtered;
  };

  const filteredCases = getFilteredCases();
  
  // Get the most critical case for hero feature (only on urgent filter)
  const heroCase = useMemo(() => {
    if (intentFilter !== 'urgent') return null;
    const criticalCases = caseList.filter(c => c.status === 'critical');
    if (criticalCases.length > 0) {
      // Return the critical case with lowest funding percentage
      return criticalCases.sort((a, b) => {
        const pctA = a.fundraising.current / a.fundraising.goal;
        const pctB = b.fundraising.current / b.fundraising.goal;
        return pctA - pctB;
      })[0];
    }
    return null;
  }, [caseList, intentFilter]);
  
  // Filter out hero case from main list to avoid duplication
  const mainCases = heroCase 
    ? filteredCases.filter(c => c.id !== heroCase.id)
    : filteredCases;
  
  // Calculate city counts for filter pills
  const cityCounts = useMemo(() => {
    const cityMap: Record<CityFilter, string[]> = {
      sofia: ['sofia', 'софия', 'софія'],
      varna: ['varna', 'варна'],
      plovdiv: ['plovdiv', 'пловдив'],
    };
    
    const counts: Record<CityFilter, number> = { sofia: 0, varna: 0, plovdiv: 0 };
    
    for (const c of caseList) {
      const city = c.location?.city?.toLowerCase() || '';
      for (const [key, names] of Object.entries(cityMap)) {
        if (names.some(name => city.includes(name))) {
          counts[key as CityFilter]++;
          break;
        }
      }
    }
    
    return counts;
  }, [caseList]);
  
  // Get urgent cases for the strip (always from full list, not filtered)
  const urgentCases = caseList.filter(c => c.status === 'critical' || c.status === 'urgent');

  // Load more handler for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore && allCases.length > 0) {
      const lastCase = allCases[allCases.length - 1];
      if (lastCase) {
        setIsLoadingMore(true);
        setCursor(new Date(lastCase.createdAt).getTime());
      }
    }
  }, [hasMore, isLoadingMore, allCases]);
  
  // Intersection observer for infinite scroll
  const loadMoreRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);
  
  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current === null) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - pullStartY.current;
    
    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(distance * 0.5, 80));
    }
  };
  
  const handleTouchEnd = async () => {
    if (pullDistance > 60 && !isRefreshing) {
      setIsRefreshing(true);
      
      // Reset and refetch
      setAllCases([]);
      setCursor(undefined);
      setHasMore(true);
      
      // Wait for initial query to refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRefreshing(false);
    }
    
    pullStartY.current = null;
    setPullDistance(0);
  };

  // Get section title based on filter
  const getSectionTitle = () => {
    switch (intentFilter) {
      case 'urgent':
        return t('home.casesNeedingHelp', 'Cases Needing Help');
      case 'nearby':
        return t('home.nearYou', 'Near You');
      case 'sofia':
        return t('home.casesInCity', 'Cases in {{city}}', { city: 'София' });
      case 'varna':
        return t('home.casesInCity', 'Cases in {{city}}', { city: 'Варна' });
      case 'plovdiv':
        return t('home.casesInCity', 'Cases in {{city}}', { city: 'Пловдив' });
      case 'success':
        return t('home.successStories', 'Success Stories');
      default:
        return t('home.allCases', 'All Cases');
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen pb-24 md:pb-8 md:pt-16"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 flex items-center justify-center z-50 bg-background transition-all duration-200 md:hidden",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ height: pullDistance, paddingTop: 'env(safe-area-inset-top)' }}
      >
        <RefreshCw 
          className={cn(
            "w-5 h-5 text-primary transition-transform",
            isRefreshing && "animate-spin",
            pullDistance > 60 && "text-primary scale-110"
          )} 
        />
      </div>
      
      {/* Mobile Header with Search + Filter Pills */}
      <HomeHeaderV2 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        topContent={<HeroCircles heroes={heroes} isLoading={isLoading || topVolunteers === undefined} />}
      >
        <IntentFilterPills 
          selected={intentFilter} 
          onSelect={setIntentFilter}
          cityCounts={cityCounts}
          className="px-0"
        />
      </HomeHeaderV2>

      {/* Urgent Cases Strip - Always visible at top when not filtering by "success" or "following" */}
      {(intentFilter === 'urgent' || intentFilter === 'nearby') && (
        <div className="md:hidden border-b border-border/30">
          <UrgentCasesStrip 
            cases={urgentCases}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          {/* Desktop Search */}
          <div className="max-w-md mx-auto mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder', 'Search cases, rescuers, locations...')}
                className="w-full rounded-full bg-muted/60 pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <IntentFilterPills 
            selected={intentFilter} 
            onSelect={setIntentFilter}
            cityCounts={cityCounts}
            className="justify-center px-0"
          />
        </div>
      </div>

      {/* Main Feed Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {getSectionTitle()}
              </h2>
              {!isLoading && (
                <span className="text-xs text-muted-foreground">
                  ({heroCase ? mainCases.length + 1 : mainCases.length})
                </span>
              )}
            </div>
            {/* Mobile view toggle */}
            <div className="flex items-center sm:hidden">
              <Switch
                id="cases-grid-toggle"
                checked={layoutMode === 'browse'}
                onCheckedChange={(checked) => setLayoutMode(checked ? 'browse' : 'focus')}
                className="scale-90"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <>
              {/* Hero skeleton on urgent filter */}
              {intentFilter === 'urgent' && (
                <div className="mb-6">
                  <HeroCaseCardSkeleton />
                </div>
              )}
              {/* Mobile */}
              {layoutMode === 'browse' ? (
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CompactCaseCardSkeleton key={`compact-skel-${i}`} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:hidden">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CaseCardSkeleton key={`full-skel-${i}`} />
                  ))}
                </div>
              )}
              {/* Desktop list */}
              <div className="hidden sm:flex sm:flex-col sm:gap-4 sm:max-w-lg sm:mx-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <CaseCardSkeleton key={`full-skel-${i}`} />
                ))}
              </div>
            </>
          ) : mainCases.length > 0 || heroCase ? (
            <>
              {/* Hero Case - only on urgent filter when we have a critical case */}
              {heroCase && intentFilter === 'urgent' && (
                <div className="mb-6">
                  <HeroCaseCard caseData={heroCase} />
                </div>
              )}
              
              {/* Mobile */}
              {layoutMode === 'browse' ? (
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  {mainCases.map((caseData, index) => (
                    <CompactCaseCard 
                      key={caseData.id}
                      caseData={caseData}
                      {...(index === 0 ? { 'data-tour': 'case-card' } : {})}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:hidden">
                  {mainCases.map((caseData, index) => (
                    <TwitterCaseCard 
                      key={caseData.id} 
                      caseData={caseData}
                      socialStats={socialStats?.[caseData.id]}
                      {...(index === 0 ? { 'data-tour': 'case-card' } : {})}
                    />
                  ))}
                </div>
              )}
              {/* Desktop list */}
              <div className="hidden sm:flex sm:flex-col sm:gap-4 sm:max-w-lg sm:mx-auto">
                {mainCases.map((caseData, index) => (
                  <TwitterCaseCard 
                    key={caseData.id} 
                    caseData={caseData}
                    socialStats={socialStats?.[caseData.id]}
                    {...(index === 0 ? { 'data-tour': 'case-card' } : {})}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                {searchQuery 
                  ? t('home.noSearchResults', 'No cases found for "{{query}}"', { query: searchQuery })
                  : t('home.noMatches', 'No cases match this filter')
                }
              </p>
            </div>
          )}
          
          {/* Infinite Scroll Trigger */}
          {hasMore && !isLoading && mainCases.length > 0 && (
            <div 
              ref={loadMoreRef}
              className="flex justify-center py-8"
            >
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('common.loadingMore', 'Loading more...')}</span>
                </div>
              )}
            </div>
          )}
          
          {/* End of list indicator */}
          {!hasMore && mainCases.length > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('home.endOfList', "You've seen all cases")} 🎉
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default IndexV2;
