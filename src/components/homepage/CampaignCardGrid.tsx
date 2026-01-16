import { useQuery } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../../../convex/_generated/api';
import { CampaignCard } from '@/components/CampaignCard';
import { CampaignCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import type { Campaign } from '@/types';

interface CampaignCardGridProps {
  /** Maximum number of campaigns to show */
  limit?: number;
  /** Grid layout variant */
  variant?: 'featured' | 'compact' | 'full';
  /** Section title override */
  title?: string;
  /** Show view all link */
  showViewAll?: boolean;
  /** Additional class names */
  className?: string;
}

export function CampaignCardGrid({
  limit = 3,
  variant = 'featured',
  title,
  showViewAll = true,
  className,
}: CampaignCardGridProps) {
  const { t } = useTranslation();
  
  // Fetch trending campaigns from Convex
  const rawCampaigns = useQuery(api.campaigns.getTrending, { limit });
  const isLoading = rawCampaigns === undefined;
  
  // Transform Convex data to match frontend Campaign type
  const campaigns: Campaign[] = (rawCampaigns ?? []).map((c) => ({
    id: c._id,
    title: c.title,
    description: c.description,
    image: c.image ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    goal: c.goal,
    current: c.current,
    unit: c.unit,
    endDate: c.endDate,
  }));
  
  // Don't render if no campaigns and not loading
  if (!isLoading && campaigns.length === 0) {
    return null;
  }
  
  const sectionTitle = title ?? t('home.activeCampaigns');
  
  // Grid classes based on variant
  const gridClasses = {
    featured: 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    compact: 'grid gap-3 grid-cols-2 sm:grid-cols-3',
    full: 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <section className={cn('py-6', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {sectionTitle}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t('home.campaignsSubtitle', 'Help us reach our goals')}
              </p>
            </div>
          </div>
          
          {showViewAll && !isLoading && campaigns.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary hover:text-primary/80 h-8 px-3"
            >
              <Link to="/campaigns">
                {t('common.viewAll')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
        
        {/* Campaign Stats Row */}
        {!isLoading && campaigns.length > 0 && variant === 'featured' && (
          <div className="flex items-center gap-4 mb-4 overflow-x-auto scrollbar-hide pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-success" />
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{campaigns.length}</span> {t('campaigns.active')}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {campaigns.reduce((sum, c) => sum + c.current, 0).toLocaleString()}
                </span> {campaigns[0]?.unit ?? 'EUR'} {t('campaigns.raised')}
              </span>
            </div>
          </div>
        )}
        
        {/* Campaigns Grid */}
        {isLoading ? (
          <div className={gridClasses[variant]}>
            {Array.from({ length: limit }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className={gridClasses[variant]}>
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
        
        {/* Mobile "View All" Button */}
        {showViewAll && !isLoading && campaigns.length > 0 && (
          <div className="mt-4 sm:hidden">
            <Button
              variant="outline"
              asChild
              className="w-full h-11 border-border hover:bg-muted"
            >
              <Link to="/campaigns">
                {t('campaigns.viewAllCampaigns')}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
