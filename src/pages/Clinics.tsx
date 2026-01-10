import { useState } from 'react';
import { ClinicCard } from '@/components/ClinicCard';
import { FilterPills } from '@/components/FilterPills';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { mockClinics } from '@/data/mockData';
import { Search, Stethoscope, MapPin } from 'lucide-react';

const cityFilters = [
  { id: 'all', label: 'All Cities' },
  { id: 'sofia', label: 'Sofia', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'varna', label: 'Varna', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'plovdiv', label: 'Plovdiv', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'burgas', label: 'Burgas', icon: <MapPin className="w-3.5 h-3.5" /> },
];

const Clinics = () => {
  const [cityFilter, setCityFilter] = useState('all');
  const [show24hOnly, setShow24hOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClinics = mockClinics.filter((clinic) => {
    const matchesCity = cityFilter === 'all' || clinic.city.toLowerCase() === cityFilter;
    const matches24h = !show24hOnly || clinic.is24h;
    const matchesSearch = !searchQuery || 
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matches24h && matchesSearch;
  });

  const emergencyClinics = filteredClinics.filter(c => c.is24h);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      {/* Hero */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-accent-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              Veterinary Clinics
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-xs max-w-md mx-auto">
            Find trusted veterinary clinics across Bulgaria
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="sticky top-0 md:top-14 bg-background z-30 py-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search clinics or specializations..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <FilterPills
              options={cityFilters}
              selected={cityFilter}
              onSelect={setCityFilter}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-4">
        {/* Emergency Section */}
        {emergencyClinics.length > 0 && !show24hOnly && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <h2 className="text-sm font-semibold text-foreground">24/7 Emergency Clinics</h2>
              <span className="text-xs text-muted-foreground">({emergencyClinics.length})</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {emergencyClinics.slice(0, 3).map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </div>
        )}

        {/* All Clinics */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {show24hOnly ? '24/7 Clinics' : 'All Clinics'}
            </h2>
            <span className="text-xs text-muted-foreground">({filteredClinics.length})</span>
            <div className="flex items-center gap-2 ml-auto">
              <Switch
                id="24h-filter"
                checked={show24hOnly}
                onCheckedChange={setShow24hOnly}
                className="scale-90"
              />
              <Label htmlFor="24h-filter" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                24/7 Only
              </Label>
            </div>
          </div>
          {filteredClinics.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No clinics found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clinics;
