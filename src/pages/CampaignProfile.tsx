import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Heart, Calendar, Target, Users, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Id } from '../../convex/_generated/dataModel';

const CampaignProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch campaign from Convex
  const rawCampaign = useQuery(
    api.campaigns.get,
    id ? { id: id as Id<"campaigns"> } : "skip"
  );

  const isLoading = rawCampaign === undefined;

  // Transform to match expected shape
  const campaign = rawCampaign ? {
    id: rawCampaign._id,
    title: rawCampaign.title,
    description: rawCampaign.description,
    image: rawCampaign.image ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    goal: rawCampaign.goal,
    current: rawCampaign.current,
    unit: rawCampaign.unit,
    endDate: rawCampaign.endDate,
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-foreground mb-1">{t('common.campaignNotFound')}</h1>
          <Link to="/campaigns" className="text-sm text-primary hover:underline">
            {t('common.goBackCampaigns')}
          </Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((campaign.current / campaign.goal) * 100);
  const supporters = 127; // This would come from actual data

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 md:hidden">
        <div className="flex items-center gap-2 h-12 px-4">
          <Link
            to="/campaigns"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-foreground hover:bg-muted active:bg-muted/80 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-[15px] text-foreground truncate flex-1">
            {campaign.title}
          </h1>
          <ShareButton title={campaign.title} text={campaign.description} size="sm" className="bg-transparent hover:bg-muted text-muted-foreground" />
        </div>
      </div>

      <div className="px-4 py-4 md:container md:mx-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Desktop Back Button */}
          <Link
            to="/campaigns"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToCampaigns')}
          </Link>

          {/* Hero Image */}
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full aspect-16/10 object-cover"
            />
            {/* Title overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-4 bg-foreground/30">
              <h1 className="text-xl font-bold text-white leading-tight">
                {campaign.title}
              </h1>
              {campaign.endDate && (
                <div className="flex items-center gap-1.5 text-white/90 text-xs mt-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('campaignProfile.ends')} {format(new Date(campaign.endDate), 'MMMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Card - Compact */}
          <div className="bg-card rounded-xl border border-border p-4">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Target className="w-4 h-4 text-primary" />
                <span>{t('campaignProfile.campaignProgress')}</span>
              </div>
              <span className="text-lg font-bold text-primary">{percentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="progress-bar-track h-2 mb-3">
              <div
                className="progress-bar-fill transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-foreground">{campaign.current.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">/ {campaign.goal.toLocaleString()} {campaign.unit}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <Users className="w-3.5 h-3.5" />
                <span>{supporters} {t('campaignProfile.supporters')}</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('campaignProfile.aboutThisCampaign')}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {campaign.description}
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mt-3">
              {t('campaignProfile.everyContribution')}
            </p>
          </div>

          {/* Recent Supporters */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('campaignProfile.recentSupporters')}</h2>
            <div className="space-y-2">
              {['Ivan P.', 'Maria S.', t('common.anonymous')].map((name, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{t('campaignProfile.contributed')} {10 + i * 5} {campaign.unit}</div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{i + 1}{t('time.hoursAgo')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky-donate md:hidden">
        <div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                isSaved
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-foreground"
              )}
            >
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            <Button variant="donate" className="flex-1 h-10 text-sm rounded-xl">
              <Heart className="w-4 h-4 mr-2" />
              {t('actions.contributeNow')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignProfile;
