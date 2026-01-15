import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslatedMockData } from '@/hooks/useTranslatedMockData';
import { CampaignCard } from '@/components/CampaignCard';
import { FilterPills } from '@/components/FilterPills';
import { CampaignCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { Sparkles, TrendingUp, CheckCircle, Megaphone } from 'lucide-react';

type CampaignFilter = 'all' | 'trending' | 'completed';

const Campaigns = () => {
  const { t } = useTranslation();
  const { mockCampaigns } = useTranslatedMockData();
  const [filter, setFilter] = useState<CampaignFilter>('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

  const filterOptions = [
    { id: 'all', label: t('campaigns.allCampaigns'), icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'trending', label: t('campaigns.trending'), icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'completed', label: t('campaigns.completed'), icon: <CheckCircle className="w-3.5 h-3.5" /> },
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
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title={t('nav.campaigns')}
        showLogo
        searchPlaceholder={t('campaigns.searchPlaceholder')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <FilterPills
          options={filterOptions}
          selected={filter}
          onSelect={(id) => setFilter(id as CampaignFilter)}
        />
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-2 border-b border-border/50">
        <div className="container mx-auto px-4 space-y-2">
          <FilterPills
            options={filterOptions}
            selected={filter}
            onSelect={(id) => setFilter(id as CampaignFilter)}
          />
        </div>
      </div>

      {/* Featured Campaigns - Horizontal Scroll (only when showing all) */}
      {filter === 'all' && (isLoading || trendingCampaigns.length > 0) && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-foreground">{t('campaigns.featured')}</h2>
              {!isLoading && <span className="text-xs text-muted-foreground">({trendingCampaigns.length})</span>}
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  id="nearby-campaigns-filter"
                  checked={showNearbyOnly}
                  onCheckedChange={setShowNearbyOnly}
                  className="scale-90"
                />
                <Label htmlFor="nearby-campaigns-filter" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                  {t('campaigns.nearbyOnly')}
                </Label>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 px-4 pb-2" style={{ width: 'max-content' }}>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="w-64 flex-shrink-0">
                    <CampaignCardSkeleton />
                  </div>
                ))
              ) : (
                trendingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="w-64 flex-shrink-0">
                    <CampaignCard campaign={campaign} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* All Campaigns */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-foreground">
              {filter === 'all' ? t('campaigns.allCampaigns') : filter === 'trending' ? t('campaigns.trending') : t('campaigns.completed')}
            </h2>
            {!isLoading && <span className="text-xs text-muted-foreground">({filteredCampaigns.length})</span>}
          </div>
          {isLoading ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <CampaignCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('campaigns.noResults', { filter })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Campaigns;
