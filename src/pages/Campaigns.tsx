import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CampaignCard } from '@/components/CampaignCard';
import { FilterPills } from '@/components/FilterPills';
import { CampaignCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { TrendingUp, CheckCircle, Megaphone } from 'lucide-react';
import type { Campaign } from '@/types';

type CampaignFilter = 'all' | 'trending' | 'completed' | 'initiatives';

const Campaigns = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<CampaignFilter>('all');
  const [showNearbyOnly, setShowNearbyOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch campaigns from Convex
  const rawCampaigns = useQuery(api.campaigns.list, {});
  const isLoading = rawCampaigns === undefined;

  // Transform Convex data to match frontend Campaign type
  const campaigns: (Campaign & { campaignType: 'rescue' | 'initiative' })[] = (rawCampaigns ?? []).map((c) => ({
    id: c._id,
    title: c.title,
    description: c.description,
    image: c.image ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    goal: c.goal,
    current: c.current,
    unit: c.unit,
    endDate: c.endDate,
    campaignType: c.campaignType ?? 'rescue',
  }));

  const filterOptions = [
    { id: 'all', label: t('campaigns.allCampaigns'), icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'trending', label: t('campaigns.trending'), icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'initiatives', label: t('campaigns.initiatives', 'Pawtreon Initiatives'), icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'completed', label: t('campaigns.completed'), icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ];

  // Filter campaigns based on status
  const rescueCampaigns = campaigns.filter((c) => c.campaignType !== 'initiative');
  const initiativeCampaigns = campaigns.filter((c) => c.campaignType === 'initiative');
  const trendingCampaigns = rescueCampaigns.filter((c) => c.current / c.goal >= 0.5 && c.current < c.goal);
  const completedCampaigns = campaigns.filter((c) => c.current >= c.goal);

  const getFilteredCampaigns = () => {
    switch (filter) {
      case 'trending':
        return trendingCampaigns;
      case 'completed':
        return completedCampaigns;
      case 'initiatives':
        return initiativeCampaigns;
      default:
        return campaigns;
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
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-2">
        <div className="container mx-auto px-4 space-y-2">
          <FilterPills
            options={filterOptions}
            selected={filter}
            onSelect={(id) => setFilter(id as CampaignFilter)}
          />
        </div>
      </div>

      {/* Mission initiatives - highlighted for roadmap funding track */}
      {(filter === 'all' || filter === 'initiatives') && (isLoading || initiativeCampaigns.length > 0) && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">{t('campaigns.initiatives', 'Pawtreon Initiatives')}</h2>
              {!isLoading && <span className="text-xs text-muted-foreground">({initiativeCampaigns.length})</span>}
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
                initiativeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="w-64 flex-shrink-0">
                    <CampaignCard campaign={campaign} />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured rescue campaigns - Horizontal Scroll (only when showing all) */}
      {filter === 'all' && (isLoading || trendingCampaigns.length > 0) && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">{t('campaigns.featuredRescue', 'Featured Rescue Campaigns')}</h2>
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
