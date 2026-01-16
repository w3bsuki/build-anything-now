import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { Loader2, RefreshCw } from 'lucide-react';
import { TwitterCaseCard } from '@/components/homepage/TwitterCaseCard';
import { CaseCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { HomeHeader } from '@/components/homepage/HomeHeader';
import { HeroCircles } from '@/components/homepage/HeroCircles';
import { FeedFilter } from '@/components/homepage/FeedFilter';
import { UrgentCasesStrip } from '@/components/homepage/UrgentCasesStrip';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { cn } from '@/lib/utils';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

const Index = () => {
  const { t, i18n } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
    limit: 10,
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
  
  const topHeroesRaw = useQuery(api.users.getTopHeroes, { limit: 10 });
  
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
  
  // Transform heroes to match expected shape
  const topHeroes = (topHeroesRaw ?? []).map((h: any) => ({
    id: h?.id?.toString() ?? '',
    name: h?.name ?? 'User',
    avatar: h?.avatar,
    animalsHelped: h?.animalsHelped ?? 0,
  }));

  // Priority order for smart sorting (critical/urgent first)
  const priorityOrder: Record<string, number> = {
    'critical': 0,
    'urgent': 1,
    'recovering': 2,
    'adopted': 3,
  };

  // Filter cases based on selected filter
  const filteredCases = caseList
    .filter((c) => {
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
    })
    // Smart sort: critical/urgent first, then by date
    .sort((a, b) => {
      const priorityA = priorityOrder[a.status] ?? 99;
      const priorityB = priorityOrder[b.status] ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      // Same priority - sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
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
      
      {/* Mobile Header */}
      <HomeHeader />

      {/* Story Circles - Social element */}
      <div className="md:hidden">
        <HeroCircles 
          heroes={topHeroes} 
          isLoading={topHeroesRaw === undefined} 
        />
      </div>

      {/* Feed Filter Dropdown - Mobile */}
      <div className="md:hidden">
        <FeedFilter 
          selected={statusFilter} 
          onSelect={setStatusFilter}
        />
      </div>

      {/* Desktop Header with Circles + Filter */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 border-b border-border/50">
        <div className="container mx-auto px-4">
          <HeroCircles 
            heroes={topHeroes} 
            isLoading={topHeroesRaw === undefined} 
          />
          <FeedFilter 
            selected={statusFilter} 
            onSelect={setStatusFilter}
          />
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        onSearch={handleSearch}
      />

      {/* Urgent Cases Strip - Campaign-style cards */}
      <UrgentCasesStrip 
        cases={caseList as any} 
        isLoading={isLoading}
      />

      {/* Cases Grid */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCases.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredCases.map((caseData, index) => (
                <TwitterCaseCard 
                  key={caseData.id} 
                  caseData={caseData}
                  {...(index === 0 ? { 'data-tour': 'case-card' } : {})}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('home.noMatches')}
            </div>
          )}
          
          {/* Infinite Scroll Trigger */}
          {hasMore && !isLoading && filteredCases.length > 0 && (
            <div 
              ref={loadMoreRef}
              className="flex justify-center py-8"
            >
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
            </div>
          )}
          
          {/* End of list indicator */}
          {!hasMore && filteredCases.length > 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              You've seen all cases 🎉
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
