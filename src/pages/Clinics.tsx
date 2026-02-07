import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { FilterPills } from '@/components/FilterPills';
import { FeaturedClinicCard, ClinicGridCard, ClinicListCard } from '@/components/FeaturedClinicCard';
import { EmergencyBanner } from '@/components/EmergencyBanner';
import { ClinicCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { Button } from '@/components/ui/button';
import { MapPin, LayoutGrid, List, Star, Clock, Building2, Filter } from 'lucide-react';
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
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title={t('nav.clinics', 'Vet Clinics')}
        showLogo
        searchPlaceholder={t('clinics.searchPlaceholder', 'Search clinics, specializations...')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      >
        {/* Filter Pills Row */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 px-2.5 rounded-full bg-muted/80 hover:bg-muted"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <span className="text-xs font-medium">{t('clinics.filters', 'Filters')}</span>
          </Button>
          <FilterPills
            options={cityFilters}
            selected={cityFilter}
            onSelect={setCityFilter}
          />
        </div>
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-3 border-b border-border/40">
        <div className="container mx-auto px-4">
          <FilterPills
            options={cityFilters}
            selected={cityFilter}
            onSelect={setCityFilter}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-3 space-y-4">

        {/* === FEATURED CLINICS SECTION === */}
        {(isLoading || featuredClinics.length > 0) && !show24hOnly && (
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <h2 className="text-sm font-semibold text-foreground">
                {t('clinics.featuredClinics', 'Featured Clinics')}
              </h2>
            </div>

            {/* Horizontal scroll container - vertical cards */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-[160px] h-[200px] rounded-2xl bg-muted animate-pulse" />
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
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">
                {show24hOnly
                  ? t('clinics.24hClinics', '24/7 Clinics')
                  : t('clinics.allClinics', 'All Clinics')}
              </h2>
              {!isLoading && (
                <span className="text-xs text-muted-foreground">
                  ({allClinics.length})
                </span>
              )}
            </div>

            {/* View Mode + Quick Filters */}
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
                    : "bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                24/7
              </Button>

              {/* Divider */}
              <div className="w-px h-5 bg-border mx-1" />

              {/* View Mode Toggle */}
              <div className="flex bg-muted/60 rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-7 w-7 p-0 rounded-md",
                    viewMode === 'grid'
                      ? "bg-background shadow-sm text-foreground"
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
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

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
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
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
      </div>
    </div>
  );
};

export default Clinics;
