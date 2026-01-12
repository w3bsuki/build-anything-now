import { useState } from 'react';
import { mockPartners } from '@/data/mockData';
import { PartnerCard } from '@/components/PartnerCard';
import { FilterPills } from '@/components/FilterPills';
import { PartnerCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Heart, ShoppingBag, Stethoscope, Bone, Search } from 'lucide-react';

const domainFilters = [
  { id: 'all', label: 'All' },
  { id: 'pet-shop', label: 'Pet Shops', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'food-brand', label: 'Pet Food', icon: <Bone className="w-3.5 h-3.5" /> },
  { id: 'veterinary', label: 'Veterinary', icon: <Stethoscope className="w-3.5 h-3.5" /> },
  { id: 'sponsor', label: 'Sponsors', icon: <Heart className="w-3.5 h-3.5" /> },
];

const Partners = () => {
  const [domainFilter, setDomainFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

  const filteredPartners = mockPartners.filter((partner) => {
    const matchesDomain = domainFilter === 'all' || partner.type === domainFilter;
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contribution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-12 pb-20 md:pb-8 md:pt-16">
      {/* Hero + Stats + Filters */}
      <div className="sticky top-12 md:top-14 bg-background z-30 pt-2 pb-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Users className="w-4 h-4 text-accent-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              Our Partners
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-xs max-w-md mx-auto">
            Working with amazing businesses who share our mission
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <FilterPills
            options={domainFilters}
            selected={domainFilter}
            onSelect={setDomainFilter}
          />
        </div>
      </div>

      {/* Partners Grid */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {domainFilter === 'all' ? 'All Partners' : domainFilters.find(f => f.id === domainFilter)?.label}
            </h2>
            {!isLoading && <span className="text-xs text-muted-foreground">({filteredPartners.length})</span>}
          </div>
          {isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PartnerCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredPartners.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No partners found matching your criteria
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center bg-muted/50 rounded-xl py-4">
            <div>
              <p className="text-xl font-bold text-primary">{mockPartners.length}</p>
              <p className="text-xs text-muted-foreground">Partners</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">1,200+</p>
              <p className="text-xs text-muted-foreground">Animals Helped</p>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">50,000+</p>
              <p className="text-xs text-muted-foreground">BGN Contributed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-xl p-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Want to make a difference?
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Join our network of partners and help save more animals
            </p>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Handshake className="w-4 h-4 mr-2" />
              Become a Partner
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
