/* eslint-disable react-hooks/set-state-in-effect */
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomeHeaderV2 } from '@/components/homepage/HomeHeaderV2';
import { HomeFiltersDrawer } from '@/components/homepage/HomeFiltersDrawer';
import { IntentFilterPills, type CityFilter, type HomeIntent } from '@/components/homepage/IntentFilterPills';
import { HeroCircles, type UrgentStoryCircleItem } from '@/components/homepage/HeroCircles';
import { HomeCaseCard, HomeCaseCardSkeleton } from '@/components/homepage/HomeCaseCard';
import { SearchOverlay } from '@/components/search/SearchOverlay';
import { CampaignCard } from '@/components/CampaignCard';
import { PageSection } from '@/components/layout/PageSection';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StickySegmentRail } from '@/components/layout/StickySegmentRail';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { AnimalCase, Campaign } from '@/types';
import { api } from '../../convex/_generated/api';

const PAGE_SIZE = 12;
const DEFAULT_RADIUS_KM = 25;

const cityFallbackLabels: Record<CityFilter, string> = {
  sofia: 'Sofia',
  varna: 'Varna',
  plovdiv: 'Plovdiv',
};

const IndexV2 = () => {
  const { t, i18n } = useTranslation();
  const [intent, setIntent] = useState<HomeIntent>('urgent');
  const [city, setCity] = useState<CityFilter | undefined>(undefined);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
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

  const { status: locationStatus, location, requestLocation } = useUserLocation();
  const isFollowingIntent = intent === 'following';
  const hasLocation = locationStatus === 'granted' && Boolean(location);
  const near = intent === 'nearby' && hasLocation
    ? { lat: location!.lat, lng: location!.lng, radiusKm }
    : undefined;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setLoadCursor(null);
    setNextCursor(null);
    setHasMore(false);
    setIsLoadingMore(false);
  }, [intent, city, radiusKm, locationStatus, location?.lat, location?.lng, debouncedSearch, i18n.language]);

  const initialLandingFeed = useQuery(
    api.home.getLandingFeed,
    isFollowingIntent
      ? 'skip'
      : {
        locale: i18n.language,
        intent,
        city,
        near,
        search: debouncedSearch || undefined,
        limit: PAGE_SIZE,
      }
  );

  const initialFollowingFeed = useQuery(
    api.home.getFollowingFeed,
    isFollowingIntent
      ? {
        locale: i18n.language,
        search: debouncedSearch || undefined,
        limit: PAGE_SIZE,
      }
      : 'skip'
  );

  const paginatedLandingFeed = useQuery(
    api.home.getLandingFeed,
    loadCursor && !isFollowingIntent
      ? {
        locale: i18n.language,
        intent,
        city,
        near,
        search: debouncedSearch || undefined,
        cursor: loadCursor,
        limit: PAGE_SIZE,
      }
      : 'skip'
  );

  const paginatedFollowingFeed = useQuery(
    api.home.getFollowingFeed,
    loadCursor && isFollowingIntent
      ? {
        locale: i18n.language,
        search: debouncedSearch || undefined,
        cursor: loadCursor,
        limit: PAGE_SIZE,
      }
      : 'skip'
  );

  useEffect(() => {
    if (!initialLandingFeed || isFollowingIntent) return;
    setHasLoadedInitialFeed(true);
    setAllCases((initialLandingFeed.casesPage?.items ?? []) as AnimalCase[]);
    setHeroCase((initialLandingFeed.heroCase ?? null) as AnimalCase | null);
    setStories((initialLandingFeed.stories ?? []) as UrgentStoryCircleItem[]);
    setCityCounts((initialLandingFeed.cityCounts ?? { sofia: 0, varna: 0, plovdiv: 0 }) as Record<CityFilter, number>);
    setUnreadNotifications(initialLandingFeed.unreadCounts?.notifications ?? 0);

    const featuredInitiativeRaw = initialLandingFeed.featuredInitiative ?? null;
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

    setHasMore(Boolean(initialLandingFeed.casesPage?.hasMore));
    setNextCursor(initialLandingFeed.casesPage?.nextCursor ?? null);
    setIsLoadingMore(false);
    setLoadCursor(null);
  }, [initialLandingFeed, isFollowingIntent]);

  useEffect(() => {
    if (!initialFollowingFeed || !isFollowingIntent) return;
    setHasLoadedInitialFeed(true);
    setAllCases((initialFollowingFeed.casesPage?.items ?? []) as AnimalCase[]);
    setHeroCase(null);
    setStories([]);
    setCityCounts({ sofia: 0, varna: 0, plovdiv: 0 });
    setUnreadNotifications(initialFollowingFeed.unreadCounts?.notifications ?? 0);
    setFeaturedInitiative(null);
    setHasMore(Boolean(initialFollowingFeed.casesPage?.hasMore));
    setNextCursor(initialFollowingFeed.casesPage?.nextCursor ?? null);
    setIsLoadingMore(false);
    setLoadCursor(null);
  }, [initialFollowingFeed, isFollowingIntent]);

  useEffect(() => {
    if (!isLoadingMore) return;

    const paginatedFeed = isFollowingIntent ? paginatedFollowingFeed : paginatedLandingFeed;
    if (!paginatedFeed) return;

    const incoming = (paginatedFeed.casesPage?.items ?? []) as AnimalCase[];
    setAllCases((prev) => [...prev, ...incoming]);
    setHasMore(Boolean(paginatedFeed.casesPage?.hasMore));
    setNextCursor(paginatedFeed.casesPage?.nextCursor ?? null);
    setLoadCursor(null);
    setIsLoadingMore(false);
  }, [isFollowingIntent, paginatedFollowingFeed, paginatedLandingFeed, isLoadingMore]);

  const feedLoading = !hasLoadedInitialFeed && (isFollowingIntent ? initialFollowingFeed : initialLandingFeed) === undefined;

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

  const caseCards = useMemo(() => {
    return heroCase ? [heroCase, ...allCases] : allCases;
  }, [heroCase, allCases]);

  const showDistance = intent === 'nearby' && hasLocation;
  const needsLocation = intent === 'nearby' && !hasLocation;
  const showStories = !isFollowingIntent && (feedLoading || stories.length > 0);
  const hasActiveMore = Boolean(city) || (showDistance && radiusKm !== DEFAULT_RADIUS_KM);
  const caseContext = intent === 'adoption' ? 'adoption' : 'feed';

  const handleIntentChange = useCallback((nextIntent: HomeIntent) => {
    setIntent(nextIntent);
    if (nextIntent === 'nearby' && locationStatus !== 'granted' && locationStatus !== 'requesting') {
      void requestLocation();
    }
  }, [locationStatus, requestLocation]);

  const handleCityChange = useCallback((nextCity: CityFilter | undefined) => {
    setCity(nextCity);
    setIsMoreOpen(false);

    // Near requires permission; city is the fallback for people who decline location.
    if (intent === 'nearby' && !hasLocation) {
      setIntent('urgent');
    }
  }, [hasLocation, intent]);

  const handleClearFilters = useCallback(() => {
    setIntent('urgent');
    setCity(undefined);
    setRadiusKm(DEFAULT_RADIUS_KM);
    setIsMoreOpen(false);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
  }, []);

  const cityLabel = useMemo(() => {
    if (!city) return undefined;
    return t(`cities.${city}`, cityFallbackLabels[city]);
  }, [city, t]);

  const sectionTitle = useMemo(() => {
    if (intent === 'following') {
      return t('home.followingTab', 'Following');
    }

    if (intent === 'nearby') {
      return t('home.nearYou', 'Near You');
    }

    if (intent === 'adoption') {
      return cityLabel
        ? t('home.adoptionInCity', 'Adoption in {{city}}', { city: cityLabel })
        : t('home.adoption', 'Adoption');
    }

    return cityLabel
      ? t('home.casesInCity', 'Cases in {{city}}', { city: cityLabel })
      : t('home.casesNeedingHelp', 'Cases Needing Help');
  }, [cityLabel, intent, t]);

  return (
    <PageShell>
      <HomeHeaderV2
        onOpenSearch={() => setIsSearchOpen(true)}
        unreadNotifications={unreadNotifications}
        topContent={showStories ? <HeroCircles stories={stories} isLoading={feedLoading && stories.length === 0} /> : undefined}
      >
        <IntentFilterPills
          intent={intent}
          onIntentChange={handleIntentChange}
          hasActiveMore={hasActiveMore}
          showMore={!isFollowingIntent}
          onOpenMore={() => setIsMoreOpen(true)}
        />
      </HomeHeaderV2>

      <StickySegmentRail className="py-3">
        <IntentFilterPills
          contained={false}
          intent={intent}
          onIntentChange={handleIntentChange}
          hasActiveMore={hasActiveMore}
          showMore={!isFollowingIntent}
          onOpenMore={() => setIsMoreOpen(true)}
        />
      </StickySegmentRail>

      <HomeFiltersDrawer
        open={isMoreOpen}
        onOpenChange={setIsMoreOpen}
        city={city}
        onCityChange={handleCityChange}
        cityCounts={cityCounts}
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        showDistance={showDistance}
        onClear={handleClearFilters}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />

      <PageSection className="pt-3">
        {debouncedSearch ? (
          <div className="mb-3.5 flex items-center justify-between gap-2 rounded-2xl border border-border/65 bg-surface-elevated px-3 py-2 shadow-xs">
            <p className="text-sm text-muted-foreground">
              {t('home.searchResultsFor', 'Results for "{{query}}"', { query: debouncedSearch })}
            </p>
            <Button type="button" variant="ghost" className="h-7 px-2 text-xs font-semibold" onClick={clearSearch}>
              {t('actions.clear', 'Clear')}
            </Button>
          </div>
        ) : null}

        <SectionHeader title={sectionTitle} count={feedLoading ? undefined : caseCards.length} />

        {needsLocation ? (
          <div className="mb-5 rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
            <p className="text-sm font-semibold text-foreground">
              {t('home.enableLocationTitle', 'Enable location to see nearby cases')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('home.enableLocationBody', 'We only use your approximate location to filter this feed.')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-11 rounded-xl text-base"
                onClick={() => requestLocation()}
                disabled={locationStatus === 'requesting'}
              >
                {locationStatus === 'requesting'
                  ? t('home.requestingLocation', 'Requesting...')
                  : t('home.enableLocationCta', 'Enable location')}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl text-base"
                onClick={() => setIsMoreOpen(true)}
              >
                {t('home.chooseCity', 'Choose city')}
              </Button>
            </div>
          </div>
        ) : null}

        {feedLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <HomeCaseCardSkeleton key={`case-skeleton-${index}`} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {caseCards.map((caseData, index) => (
              <Fragment key={caseData.id}>
                {featuredInitiative && caseCards.length > 0 && index === 2 ? (
                  <section className="col-span-2 rounded-2xl border border-border/65 bg-surface-elevated p-3 lg:col-span-3">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="font-display text-sm font-semibold text-foreground">
                        {t('campaigns.initiatives', 'Pawtreon Initiatives')}
                      </h3>
                    </div>
                    <CampaignCard campaign={featuredInitiative} />
                  </section>
                ) : null}

                <HomeCaseCard
                  caseData={caseData}
                  context={caseContext}
                  variant="compact"
                  {...(heroCase && index === 0 ? { 'data-tour': 'case-card' } : undefined)}
                />
              </Fragment>
            ))}

            {featuredInitiative && caseCards.length > 0 && caseCards.length <= 2 ? (
              <section className="col-span-2 rounded-2xl border border-border/65 bg-surface-elevated p-3 lg:col-span-3">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {t('campaigns.initiatives', 'Pawtreon Initiatives')}
                  </h3>
                </div>
                <CampaignCard campaign={featuredInitiative} />
              </section>
            ) : null}

            {caseCards.length === 0 && !needsLocation ? (
              <div className="col-span-2 rounded-2xl border border-border/60 bg-surface-elevated p-6 text-center lg:col-span-3">
                <p className="text-sm text-muted-foreground">
                  {debouncedSearch
                    ? t('home.noSearchResults', 'No cases found for "{{query}}"', { query: debouncedSearch })
                    : intent === 'following'
                      ? t('home.followingEmpty', 'Follow rescuers and clinics to see their cases here')
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
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{t('common.loadingMore', 'Loading more...')}</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">{t('common.scrollToLoad', 'Scroll to load more')}</span>
            )}
          </div>
        ) : null}

        {!hasMore && !feedLoading && allCases.length > 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {t('home.endOfList', "You've seen all cases")}
          </div>
        ) : null}
      </PageSection>
    </PageShell>
  );
};

export default IndexV2;
