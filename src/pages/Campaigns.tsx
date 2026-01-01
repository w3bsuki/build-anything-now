import { mockCampaigns } from '@/data/mockData';
import { CampaignCard } from '@/components/CampaignCard';
import { Megaphone, Sparkles } from 'lucide-react';

const Campaigns = () => {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-warning/10 via-background to-primary/5 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-warning flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-warning-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Campaigns
            </h1>
          </div>
          <p className="text-center text-muted-foreground max-w-lg mx-auto">
            Join our special initiatives and make a bigger impact. Together, we can achieve amazing things.
          </p>
        </div>
      </section>

      {/* Featured Campaign */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-bold text-foreground">Featured Campaign</h2>
          </div>
          <div className="max-w-2xl">
            <CampaignCard campaign={mockCampaigns[0]} />
          </div>
        </div>
      </section>

      {/* All Campaigns */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-bold text-foreground mb-4">All Campaigns</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
