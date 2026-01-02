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
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 md:pt-24 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Veterinary Clinics
            </h1>
          </div>
          <p className="text-muted-foreground mb-6">
            Find trusted veterinary clinics across Bulgaria
          </p>

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search clinics or specializations..."
                className="pl-10 bg-card"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <FilterPills
                options={cityFilters}
                selected={cityFilter}
                onSelect={setCityFilter}
              />
              <div className="flex items-center gap-2 sm:ml-auto">
                <Switch
                  id="24h-filter"
                  checked={show24hOnly}
                  onCheckedChange={setShow24hOnly}
                />
                <Label htmlFor="24h-filter" className="text-sm font-medium cursor-pointer">
                  24/7 Only
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {/* Emergency Section */}
        {emergencyClinics.length > 0 && !show24hOnly && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              24/7 Emergency Clinics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {emergencyClinics.slice(0, 3).map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </div>
        )}

        {/* All Clinics */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {show24hOnly ? '24/7 Clinics' : 'All Clinics'} ({filteredClinics.length})
          </h2>
          {filteredClinics.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClinics.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No clinics found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clinics;
