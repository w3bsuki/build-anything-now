import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { FilterPills } from '@/components/FilterPills';
import { PageSection } from '@/components/layout/PageSection';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StickySegmentRail } from '@/components/layout/StickySegmentRail';
import { FeaturedClinicCard, ClinicGridCard, ClinicListCard } from '@/components/FeaturedClinicCard';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { ClinicCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { Button } from '@/components/ui/button';
import { MapPin, LayoutGrid, List, Star, Clock, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'list';

const Clinics = () => {
  const { t } = useTranslation();
  const [cityFilter, setCityFilter] = useState('all');
  const [show24hOnly, setShow24hOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Fetch clinics from Convex
  const clinics = useQuery(api.clinics.list, {
    city: cityFilter === 'all' ? undefined : cityFilter,
    is24h: show24hOnly ? true : undefined,
  });
  const isLoading = clinics === undefined;

  // City filter options
  const cityFilters = [
    { id: 'all', label: t('clinics.allCities', 'All Cities') },
    { id: 'sofia', label: 'Sofia', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'varna', label: 'Varna', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'plovdiv', label: 'Plovdiv', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'burgas', label: 'Burgas', icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  // Filter + memoize clinics
  const { featuredClinics, allClinics } = useMemo(() => {
    const all = (clinics ?? []).filter((clinic) => {
      const matchesSearch = !searchQuery ||
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });

    return {
      featuredClinics: all.filter(c => c.featured && c.verified),
      allClinics: all,
    };
  }, [clinics, searchQuery]);

  return (
    <PageShell>
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title={t('nav.clinics', 'Vet Clinics')}
        showLogo
        searchPlaceholder={t('clinics.searchPlaceholder', 'Search clinics, specializations...')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchMode="adaptive"
      >
        <FilterPills
          options={cityFilters}
          selected={cityFilter}
          onSelect={setCityFilter}
        />
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <StickySegmentRail className="py-3">
        <FilterPills
          options={cityFilters}
          selected={cityFilter}
          onSelect={setCityFilter}
        />
      </StickySegmentRail>

      {/* Main Content */}
      <PageSection className="py-3" contentClassName="space-y-4">

        {/* === FEATURED CLINICS SECTION === */}
        {(isLoading || featuredClinics.length > 0) && !show24hOnly && (
          <section>
            <SectionHeader
              title={
                <span className="inline-flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  {t('clinics.featuredClinics', 'Featured Clinics')}
                </span>
              }
            />

            {/* Horizontal scroll container - vertical cards */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[200px] w-[160px] flex-shrink-0 animate-pulse rounded-2xl bg-surface-sunken" />
                  ))}
                </>
              ) : (
                featuredClinics.map((clinic) => (
                  <FeaturedClinicCard
                    key={clinic._id}
                    clinic={clinic}
                    variant="vertical"
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* === EMERGENCY BANNER === */}
        <EmergencyBanner />

        {/* === ALL CLINICS SECTION === */}
        <section>
          {/* Section Header with View Toggle */}
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                {show24hOnly
                  ? t('clinics.24hClinics', '24/7 Clinics')
                  : t('clinics.allClinics', 'All Clinics')}
              </span>
            }
            count={!isLoading ? allClinics.length : undefined}
            action={
              <div className="flex items-center gap-1.5">
                {/* 24/7 Toggle */}
                <Button
                  variant={show24hOnly ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShow24hOnly(!show24hOnly)}
                  className={cn(
                    "h-8 px-2.5 rounded-lg text-xs font-medium gap-1.5",
                    show24hOnly
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 bg-surface-sunken/80 text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  24/7
                </Button>

                {/* Divider */}
                <div className="w-px h-5 bg-border mx-1" />

                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-border/60 bg-surface-sunken/80 p-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "h-7 w-7 p-0 rounded-md",
                      viewMode === 'grid'
                        ? "bg-surface shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "h-7 w-7 p-0 rounded-md",
                      viewMode === 'list'
                        ? "bg-surface shadow-xs text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    )}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            }
          />

          {/* Clinics Grid/List */}
          {isLoading ? (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "flex flex-col gap-3"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ClinicCardSkeleton key={i} />
              ))}
            </div>
          ) : allClinics.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allClinics.map((clinic) => (
                  <ClinicGridCard key={clinic._id} clinic={clinic} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {allClinics.map((clinic) => (
                  <ClinicListCard key={clinic._id} clinic={clinic} />
                ))}
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-border/60 bg-surface-elevated py-12 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-sunken">
                <Building2 className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground text-sm">
                {t('clinics.noResults', 'No clinics found')}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t('clinics.tryDifferentFilters', 'Try adjusting your filters')}
              </p>
            </div>
          )}
        </section>
      </PageSection>
    </PageShell>
  );
};

export default Clinics;
