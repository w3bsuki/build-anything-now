import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClinicCard } from '@/components/ClinicCard';
import { FilterPills } from '@/components/FilterPills';
import { ClinicCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { mockClinics } from '@/data/mockData';
import { Search, MapPin } from 'lucide-react';

const Clinics = () => {
  const { t } = useTranslation();
  const [cityFilter, setCityFilter] = useState('all');
  const [show24hOnly, setShow24hOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

  const cityFilters = [
    { id: 'all', label: t('clinics.allCities') },
    { id: 'sofia', label: 'Sofia', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'varna', label: 'Varna', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'plovdiv', label: 'Plovdiv', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'burgas', label: 'Burgas', icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  const filteredClinics = mockClinics.filter((clinic) => {
    const matchesCity = cityFilter === 'all' || clinic.city.toLowerCase() === cityFilter;
    const matches24h = !show24hOnly || clinic.is24h;
    const matchesSearch = !searchQuery || 
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matches24h && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pt-12 pb-20 md:pb-8 md:pt-16">
      {/* Search + Filters */}
      <div className="sticky top-12 md:top-14 bg-background z-30 pt-3 pb-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('clinics.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <FilterPills
            options={cityFilters}
            selected={cityFilter}
            onSelect={setCityFilter}
          />
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-4">
        {/* All Clinics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {show24hOnly ? t('clinics.24hClinics') : t('clinics.allClinics')}
            </h2>
            {!isLoading && <span className="text-xs text-muted-foreground">({filteredClinics.length})</span>}
            <div className="flex items-center gap-2 ml-auto">
              <Switch
                id="24h-filter"
                checked={show24hOnly}
                onCheckedChange={setShow24hOnly}
                className="scale-90"
              />
              <Label htmlFor="24h-filter" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                {t('clinics.24hOnly')}
              </Label>
            </div>
          </div>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ClinicCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredClinics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('clinics.noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clinics;
