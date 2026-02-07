/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { HomeHeaderV2 } from '@/components/homepage/HomeHeaderV2';
import { IntentFilterPills, type CityFilter, type FilterTab } from '@/components/homepage/IntentFilterPills';
import { HeroCircles, type UrgentStoryCircleItem } from '@/components/homepage/HeroCircles';
import { TwitterCaseCard } from '@/components/homepage/TwitterCaseCard';
import { CompactCaseCard, CompactCaseCardSkeleton } from '@/components/homepage/CompactCaseCard';
import { CaseCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { CampaignCard } from '@/components/CampaignCard';
import type { AnimalCase, Campaign } from '@/types';
import { api } from '../../convex/_generated/api';

type LandingIntent = 'urgent' | 'nearby' | 'success' | 'all';

const PAGE_SIZE = 12;

function mapFilterToIntent(filter: FilterTab): LandingIntent {
  if (filter === 'urgent') return 'urgent';
  if (filter === 'nearby') return 'nearby';
  if (filter === 'success') return 'success';
  return 'all';
}

function mapFilterToCity(filter: FilterTab): CityFilter | undefined {
  if (filter === 'sofia' || filter === 'varna' || filter === 'plovdiv') return filter;
  return undefined;
}

const IndexV2 = () => {
  const { t, i18n } = useTranslation();
  const [intentFilter, setIntentFilter] = useState<FilterTab>('urgent');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allCases, setAllCases] = useState<AnimalCase[]>([]);
  const [heroCase, setHeroCase] = useState<AnimalCase | null>(null);
  const [stories, setStories] = useState<UrgentStoryCircleItem[]>([]);
  const [cityCounts, setCityCounts] = useState<Record<CityFilter, number>>({
    sofia: 0,
    varna: 0,
    plovdiv: 0,
  });
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [featuredInitiative, setFeaturedInitiative] = useState<Campaign | null>(null);
  const [hasLoadedInitialFeed, setHasLoadedInitialFeed] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadCursor, setLoadCursor] = useState<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const city = mapFilterToCity(intentFilter);
  const intent = mapFilterToIntent(intentFilter);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoadCursor(null);
    setNextCursor(null);
    setHasMore(false);
    setIsLoadingMore(false);
  }, [intentFilter, debouncedSearch, i18n.language]);

  const initialFeed = useQuery(api.home.getLandingFeed, {
    locale: i18n.language,
    intent,
    city,
    search: debouncedSearch || undefined,
    limit: PAGE_SIZE,
  });

  const paginatedFeed = useQuery(
    api.home.getLandingFeed,
    loadCursor
      ? {
        locale: i18n.language,
        intent,
        city,
        search: debouncedSearch || undefined,
        cursor: loadCursor,
        limit: PAGE_SIZE,
      }
      : 'skip'
  );

  useEffect(() => {
    if (!initialFeed) return;
    setHasLoadedInitialFeed(true);
    setAllCases((initialFeed.casesPage?.items ?? []) as AnimalCase[]);
    setHeroCase((initialFeed.heroCase ?? null) as AnimalCase | null);
    setStories((initialFeed.stories ?? []) as UrgentStoryCircleItem[]);
    setCityCounts((initialFeed.cityCounts ?? { sofia: 0, varna: 0, plovdiv: 0 }) as Record<CityFilter, number>);
    setUnreadNotifications(initialFeed.unreadCounts?.notifications ?? 0);

    const featuredInitiativeRaw = initialFeed.featuredInitiative ?? null;
    const nextFeaturedInitiative: Campaign | null = featuredInitiativeRaw
      ? {
        id: featuredInitiativeRaw.id,
        title: featuredInitiativeRaw.title,
        description: featuredInitiativeRaw.description,
        image: featuredInitiativeRaw.image ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        goal: featuredInitiativeRaw.goal,
        current: featuredInitiativeRaw.current,
        unit: featuredInitiativeRaw.unit,
        endDate: featuredInitiativeRaw.endDate ?? undefined,
      }
      : null;
    setFeaturedInitiative(nextFeaturedInitiative);

    setHasMore(Boolean(initialFeed.casesPage?.hasMore));
    setNextCursor(initialFeed.casesPage?.nextCursor ?? null);
    setIsLoadingMore(false);
    setLoadCursor(null);
  }, [initialFeed]);

  useEffect(() => {
    if (!paginatedFeed || !isLoadingMore) return;
    const incoming = (paginatedFeed.casesPage?.items ?? []) as AnimalCase[];
    setAllCases((prev) => [...prev, ...incoming]);
    setHasMore(Boolean(paginatedFeed.casesPage?.hasMore));
    setNextCursor(paginatedFeed.casesPage?.nextCursor ?? null);
    setLoadCursor(null);
    setIsLoadingMore(false);
  }, [paginatedFeed, isLoadingMore]);

  const feedLoading = !hasLoadedInitialFeed && initialFeed === undefined;

  const loadMore = useCallback(() => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadCursor(nextCursor);
  }, [hasMore, nextCursor, isLoadingMore]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore || feedLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [feedLoading, hasMore, loadMore]);

  const displayCases = useMemo(() => {
    return heroCase ? [heroCase, ...allCases] : allCases;
  }, [heroCase, allCases]);

  const [horizontalCases, restCases] = useMemo(() => {
    return [displayCases.slice(0, 6), displayCases.slice(6)];
  }, [displayCases]);

  const handleIntentSelect = useCallback((nextFilter: FilterTab) => {
    setIntentFilter(nextFilter);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);

  const sectionTitle = useMemo(() => {
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
  }, [intentFilter, t]);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      <HomeHeaderV2
        onOpenSearch={() => setIsSearchOpen(true)}
        unreadNotifications={unreadNotifications}
        topContent={<HeroCircles stories={stories} isLoading={feedLoading && stories.length === 0} />}
      >
        <IntentFilterPills
          selected={intentFilter}
          onSelect={handleIntentSelect}
          cityCounts={cityCounts}
          className="px-0"
        />
      </HomeHeaderV2>

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />

      <section className="py-4">
        <div className="container mx-auto px-4 max-w-3xl">
          {debouncedSearch ? (
            <div className="mb-3 rounded-xl border border-border/65 bg-card/80 px-3 py-2 flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {t('home.searchResultsFor', 'Results for "{{query}}"', { query: debouncedSearch })}
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-md px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t('actions.clear', 'Clear')}
              </button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{sectionTitle}</h2>
              {!feedLoading && (
                <span className="text-xs text-muted-foreground">
                  ({displayCases.length})
                </span>
              )}
            </div>
          </div>

          {feedLoading ? (
            <div className="space-y-4">
              <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <CompactCaseCardSkeleton key={`compact-skeleton-${index}`} className="w-56 shrink-0" />
                  ))}
                </div>
              </div>
              {Array.from({ length: 3 }).map((_, index) => (
                <CaseCardSkeleton key={`case-skeleton-${index}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {horizontalCases.length > 0 ? (
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-3 pb-1" style={{ width: 'max-content' }}>
                    {horizontalCases.map((caseData, index) => (
                      <div key={caseData.id} className="w-56 shrink-0" {...(index === 0 ? { 'data-tour': 'case-card' } : {})}>
                        <CompactCaseCard caseData={caseData} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {featuredInitiative ? (
                <section className="rounded-2xl border border-border/60 bg-card/70 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t('campaigns.initiatives', 'Pawtreon Initiatives')}
                    </h3>
                  </div>
                  <CampaignCard campaign={featuredInitiative} />
                </section>
              ) : null}

              {restCases.map((caseData) => (
                <TwitterCaseCard key={caseData.id} caseData={caseData} />
              ))}

              {displayCases.length === 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {debouncedSearch
                      ? t('home.noSearchResults', 'No cases found for "{{query}}"', { query: debouncedSearch })
                      : t('home.noMatches', 'No cases match this filter')}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {hasMore && !feedLoading && allCases.length > 0 ? (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t('common.loadingMore', 'Loading more...')}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">{t('common.scrollToLoad', 'Scroll to load more')}</span>
              )}
            </div>
          ) : null}

          {!hasMore && !feedLoading && allCases.length > 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t('home.endOfList', "You've seen all cases")}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default IndexV2;
