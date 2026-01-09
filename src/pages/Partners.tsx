import { useState } from 'react';
import { mockPartners } from '@/data/mockData';
import { PartnerCard } from '@/components/PartnerCard';
import { FilterPills } from '@/components/FilterPills';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Heart, ShoppingBag, Stethoscope, Bone } from 'lucide-react';

const domainFilters = [
  { id: 'all', label: 'All' },
  { id: 'pet-shop', label: 'Pet Shops', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { id: 'food-brand', label: 'Pet Food', icon: <Bone className="w-3.5 h-3.5" /> },
  { id: 'veterinary', label: 'Veterinary', icon: <Stethoscope className="w-3.5 h-3.5" /> },
  { id: 'sponsor', label: 'Sponsors', icon: <Heart className="w-3.5 h-3.5" /> },
];

const Partners = () => {
  const [domainFilter, setDomainFilter] = useState('all');

  const filteredPartners = mockPartners.filter(
    (partner) => domainFilter === 'all' || partner.type === domainFilter
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent/5 to-transparent py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Our Partners
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-md mx-auto">
            Working with amazing businesses who share our mission
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-4 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
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

      {/* Filter Pills */}
      <div className="sticky top-0 md:top-14 bg-background z-30 py-3 border-b border-border">
        <div className="container mx-auto px-4">
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
            <span className="text-xs text-muted-foreground">({filteredPartners.length})</span>
          </div>
          {filteredPartners.length > 0 ? (
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filteredPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No partners found in this category
            </div>
          )}
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-6">
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
