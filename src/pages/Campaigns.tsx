import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CampaignCard } from '@/components/CampaignCard';
import { FilterPills } from '@/components/FilterPills';
import { CampaignCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { PageSection } from '@/components/layout/PageSection';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StickySegmentRail } from '@/components/layout/StickySegmentRail';
import { TrendingUp, CheckCircle, Megaphone } from 'lucide-react';
import type { Campaign } from '@/types';

type CampaignFilter = 'all' | 'trending' | 'completed' | 'initiatives';

const Campaigns = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<CampaignFilter>('all');
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
    const query = searchQuery.trim().toLowerCase();
    const withSearch = (list: (Campaign & { campaignType: 'rescue' | 'initiative' })[]) =>
      query.length === 0
        ? list
        : list.filter((campaign) =>
            campaign.title.toLowerCase().includes(query) ||
            campaign.description.toLowerCase().includes(query),
          );

    switch (filter) {
      case 'trending':
        return withSearch(trendingCampaigns);
      case 'completed':
        return withSearch(completedCampaigns);
      case 'initiatives':
        return withSearch(initiativeCampaigns);
      default:
        return withSearch(campaigns);
    }
  };

  const filteredCampaigns = getFilteredCampaigns();
  const filteredTrendingCampaigns = trendingCampaigns.filter((campaign) =>
    searchQuery.trim().length === 0
      ? true
      : campaign.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );
  const filteredInitiativeCampaigns = initiativeCampaigns.filter((campaign) =>
    searchQuery.trim().length === 0
      ? true
      : campaign.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  return (
    <PageShell>
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title={t('nav.campaigns')}
        showLogo
        searchPlaceholder={t('campaigns.searchPlaceholder')}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchMode="adaptive"
      >
        <FilterPills
          options={filterOptions}
          selected={filter}
          onSelect={(id) => setFilter(id as CampaignFilter)}
        />
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <StickySegmentRail className="py-3">
        <FilterPills
          options={filterOptions}
          selected={filter}
          onSelect={(id) => setFilter(id as CampaignFilter)}
        />
      </StickySegmentRail>

      {/* Mission initiatives - highlighted for roadmap funding track */}
      {(filter === 'all' || filter === 'initiatives') && (isLoading || filteredInitiativeCampaigns.length > 0) && (
        <PageSection contained={false}>
          <div className="mx-auto w-full max-w-3xl px-4">
            <SectionHeader
              title={t('campaigns.initiatives', 'Pawtreon Initiatives')}
              count={!isLoading ? filteredInitiativeCampaigns.length : undefined}
            />
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
                filteredInitiativeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="w-64 flex-shrink-0">
                    <CampaignCard campaign={campaign} />
                  </div>
                ))
              )}
            </div>
          </div>
        </PageSection>
      )}

      {/* Featured rescue campaigns - Horizontal Scroll (only when showing all) */}
      {filter === 'all' && (isLoading || filteredTrendingCampaigns.length > 0) && (
        <PageSection contained={false}>
          <div className="mx-auto w-full max-w-3xl px-4">
            <SectionHeader
              title={t('campaigns.featuredRescue', 'Featured Rescue Campaigns')}
              count={!isLoading ? filteredTrendingCampaigns.length : undefined}
            />
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
                filteredTrendingCampaigns.map((campaign) => (
                  <div key={campaign.id} className="w-64 flex-shrink-0">
                    <CampaignCard campaign={campaign} />
                  </div>
                ))
              )}
            </div>
          </div>
        </PageSection>
      )}

      {/* All Campaigns */}
      <PageSection>
          <SectionHeader
            title={
              filter === 'all'
                ? t('campaigns.allCampaigns')
                : filter === 'trending'
                  ? t('campaigns.trending')
                  : filter === 'initiatives'
                    ? t('campaigns.initiatives', 'Pawtreon Initiatives')
                    : t('campaigns.completed')
            }
            count={!isLoading ? filteredCampaigns.length : undefined}
          />
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
            <div className="rounded-2xl border border-border/60 bg-surface-elevated py-12 text-center text-sm text-muted-foreground shadow-xs">
              {t('campaigns.noResults', { filter })}
            </div>
          )}
      </PageSection>
    </PageShell>
  );
};

export default Campaigns;
