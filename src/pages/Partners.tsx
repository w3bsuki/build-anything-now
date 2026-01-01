import { mockPartners } from '@/data/mockData';
import { PartnerCard } from '@/components/PartnerCard';
import { Button } from '@/components/ui/button';
import { Users, Handshake, Heart } from 'lucide-react';

const Partners = () => {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent/10 via-background to-success/5 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Users className="w-7 h-7 text-accent-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Our Partners
            </h1>
          </div>
          <p className="text-center text-muted-foreground max-w-lg mx-auto mb-6">
            We're grateful to work with amazing businesses and organizations who share our mission.
          </p>

          {/* CTA */}
          <div className="flex justify-center">
            <Button className="btn-donate">
              <Handshake className="w-5 h-5 mr-2" />
              Become a Partner
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gradient">{mockPartners.length}</p>
              <p className="text-sm text-muted-foreground">Partners</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">1,200+</p>
              <p className="text-sm text-muted-foreground">Animals Helped</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gradient">50,000+</p>
              <p className="text-sm text-muted-foreground">BGN Contributed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-4">All Partners</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mockPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      </section>

      {/* Become a Partner Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-6 md:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Want to make a difference?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Partner with PawsSafe and help us save more lives. We offer various partnership opportunities for businesses of all sizes.
            </p>
            <Button className="btn-donate">
              <Handshake className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
