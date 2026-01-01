import { mockCampaigns } from '@/data/mockData';
import { CampaignCard } from '@/components/CampaignCard';
import { Megaphone, Sparkles } from 'lucide-react';

const Campaigns = () => {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-b from-warning/5 to-transparent py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-warning-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Campaigns
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-md mx-auto">
            Join our special initiatives and make a bigger impact together
          </p>
        </div>
      </section>

      {/* Featured Campaign */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-warning" />
            <h2 className="text-base font-semibold text-foreground">Featured</h2>
          </div>
          <div className="max-w-2xl">
            <CampaignCard campaign={mockCampaigns[0]} />
          </div>
        </div>
      </section>

      {/* All Campaigns */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          <h2 className="text-base font-semibold text-foreground mb-3">All Campaigns</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Campaigns;
