import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { Loader2, RefreshCw } from 'lucide-react';
import { TwitterCaseCard } from '@/components/homepage/TwitterCaseCard';
import { CaseCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { HomeHeaderV2 } from '@/components/homepage/HomeHeaderV2';
import { IntentFilterPills, type FilterTab } from '@/components/homepage/IntentFilterPills';
import { UrgentCasesStrip } from '@/components/homepage/UrgentCasesStrip';
import { cn } from '@/lib/utils';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const IndexV2 = () => {
  const { t, i18n } = useTranslation();
  const [intentFilter, setIntentFilter] = useState<FilterTab>('urgent');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [allCases, setAllCases] = useState<any[]>([]);
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
  
  // Initialize cases from first query
  useEffect(() => {
    if (initialCases && allCases.length === 0) {
      setAllCases(initialCases.items);
      setHasMore(initialCases.hasMore);
    }
  }, [initialCases, allCases.length]);
  
  // Append more cases when loaded
  useEffect(() => {
    if (moreCases && isLoadingMore) {
      setAllCases(prev => [...prev, ...moreCases.items]);
      setHasMore(moreCases.hasMore);
      setIsLoadingMore(false);
    }
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
        
      case 'success':
        // Show only adopted/success cases
        filtered = filtered
          .filter(c => c.status === 'adopted')
          .sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        break;
        
      case 'following':
        // TODO: Implement following filter when we have follow data
        // For now, show empty state
        filtered = [];
        break;
    }
    
    return filtered;
  };

  const filteredCases = getFilteredCases();
  
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
      case 'success':
        return t('home.successStories', 'Success Stories');
      case 'following':
        return t('home.fromPeopleYouFollow', 'From People You Follow');
      default:
        return t('home.allCases', 'All Cases');
    }
  };

  // Empty state for following
  const renderFollowingEmptyState = () => (
    <div className="text-center py-16 px-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">👥</span>
      </div>
      <h3 className="font-semibold text-foreground mb-2">
        {t('home.noFollowingYet', "You're not following anyone yet")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        {t('home.followHint', 'Follow rescuers and organizations to see their cases here')}
      </p>
    </div>
  );

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
      >
        <IntentFilterPills 
          selected={intentFilter} 
          onSelect={setIntentFilter}
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
            className="justify-center px-0"
          />
        </div>
      </div>

      {/* Main Feed Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {getSectionTitle()}
            </h2>
            {!isLoading && intentFilter !== 'following' && (
              <span className="text-xs text-muted-foreground">
                ({filteredCases.length})
              </span>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          ) : intentFilter === 'following' && filteredCases.length === 0 ? (
            renderFollowingEmptyState()
          ) : filteredCases.length > 0 ? (
            <div className="flex flex-col gap-4 max-w-lg mx-auto">
              {filteredCases.map((caseData, index) => (
                <TwitterCaseCard 
                  key={caseData.id} 
                  caseData={caseData}
                  {...(index === 0 ? { 'data-tour': 'case-card' } : {})}
                />
              ))}
            </div>
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
          {hasMore && !isLoading && filteredCases.length > 0 && intentFilter !== 'following' && (
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
          {!hasMore && filteredCases.length > 0 && (
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
