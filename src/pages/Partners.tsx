import { mockPartners } from '@/data/mockData';
import { PartnerCard } from '@/components/PartnerCard';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Heart } from 'lucide-react';

const Partners = () => {
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
          <p className="text-center text-muted-foreground text-sm max-w-md mx-auto mb-5">
            Working with amazing businesses who share our mission
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <Button className="btn-donate">
              <Handshake className="w-4 h-4 mr-2" />
              Become a Partner
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{mockPartners.length}</p>
              <p className="text-xs text-muted-foreground">Partners</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">1,200+</p>
              <p className="text-xs text-muted-foreground">Animals Helped</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">50,000+</p>
              <p className="text-xs text-muted-foreground">BGN Contributed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          <h2 className="text-base font-semibold text-foreground mb-3">All Partners</h2>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mockPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="bg-muted/50 rounded-xl p-5 md:p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">
              Want to make a difference?
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              Partner with PawsSafe and help us save more lives
            </p>
            <Button className="btn-donate">
              <Handshake className="w-4 h-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
