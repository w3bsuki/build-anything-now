import { useState } from 'react';
import { mockCampaigns } from '@/data/mockData';
import { CampaignCard } from '@/components/CampaignCard';
import { FilterPills } from '@/components/FilterPills';
import { Megaphone, Sparkles, Search, TrendingUp, CheckCircle } from 'lucide-react';

type CampaignFilter = 'all' | 'trending' | 'completed';

const Campaigns = () => {
  const [filter, setFilter] = useState<CampaignFilter>('all');

  const filterOptions = [
    { id: 'all', label: 'All', icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'completed', label: 'Completed', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ];

  // Mock filter logic - show first 2 campaigns as trending for horizontal scroll demo
  const trendingCampaigns = mockCampaigns.filter((_, i) => i < 2);
  const completedCampaigns: typeof mockCampaigns = [];

  const getFilteredCampaigns = () => {
    switch (filter) {
      case 'trending':
        return trendingCampaigns;
      case 'completed':
        return completedCampaigns;
      default:
        return mockCampaigns;
    }
  };

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Hero */}
      <section>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-warning-foreground" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              Campaigns
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-xs max-w-md mx-auto">
            Join our special initiatives and make a bigger impact together
          </p>
        </div>
      </section>

      {/* Search & Filter Pills */}
      <div className="sticky top-0 md:top-14 bg-background z-30 py-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <FilterPills
            options={filterOptions}
            selected={filter}
            onSelect={(id) => setFilter(id as CampaignFilter)}
          />
        </div>
      </div>

      {/* Featured Campaigns - Horizontal Scroll (only when showing all) */}
      {filter === 'all' && trendingCampaigns.length > 0 && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Featured</h2>
              <span className="text-xs text-muted-foreground">({trendingCampaigns.length})</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
              {trendingCampaigns.map((campaign) => (
                <div key={campaign.id} className="w-[300px] flex-shrink-0">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Campaigns */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {filter === 'all' ? 'All Campaigns' : filter === 'trending' ? 'Trending' : 'Completed'}
            </h2>
            <span className="text-xs text-muted-foreground">({filteredCampaigns.length})</span>
          </div>
          {filteredCampaigns.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No {filter} campaigns at the moment
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Campaigns;
