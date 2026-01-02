import { useState } from 'react';
import { mockCampaigns } from '@/data/mockData';
import { CampaignCard } from '@/components/CampaignCard';
import { ContentTabs } from '@/components/ContentTabs';
import { Megaphone, Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

type CampaignTab = 'active' | 'trending' | 'completed';

const Campaigns = () => {
  const [activeTab, setActiveTab] = useState<CampaignTab>('active');

  // Mock filter logic (in real app, campaigns would have status)
  const activeCampaigns = mockCampaigns;
  const trendingCampaigns = mockCampaigns.filter((_, i) => i === 0);
  const completedCampaigns: typeof mockCampaigns = [];

  const getCurrentCampaigns = () => {
    switch (activeTab) {
      case 'trending':
        return trendingCampaigns;
      case 'completed':
        return completedCampaigns;
      default:
        return activeCampaigns;
    }
  };

  const currentCampaigns = getCurrentCampaigns();

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

      {/* Tabs */}
      <div className="sticky top-0 md:top-16 bg-background z-40 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 py-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              Active
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trending
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Featured Campaign - Horizontal Scroll (only on Active tab) */}
      {activeTab === 'active' && trendingCampaigns.length > 0 && (
        <section className="py-5">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-warning" />
              <h2 className="text-base font-semibold text-foreground">Featured</h2>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
              {trendingCampaigns.map((campaign) => (
                <div key={campaign.id} className="w-[320px] flex-shrink-0">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Campaigns */}
      <section className="py-5">
        <div className="container mx-auto px-4">
          <h2 className="text-base font-semibold text-foreground mb-3">
            {activeTab === 'active' ? 'All Campaigns' : activeTab === 'trending' ? 'Trending Now' : 'Completed Campaigns'}
          </h2>
          {currentCampaigns.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {currentCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No {activeTab} campaigns at the moment
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Campaigns;
