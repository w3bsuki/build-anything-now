import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { mockCampaigns } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Heart, Calendar, Target, Users, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const CampaignProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const campaign = mockCampaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('common.campaignNotFound')}</h1>
          <Link to="/campaigns" className="text-primary hover:underline">
            {t('common.goBackCampaigns')}
          </Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((campaign.current / campaign.goal) * 100);

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <Link
            to="/campaigns"
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-medium text-sm text-foreground truncate flex-1">
            {campaign.title}
          </h1>
          <ShareButton title={campaign.title} text={campaign.description} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Back Button */}
          <Link
            to="/campaigns"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToCampaigns')}
          </Link>

          {/* Hero Image */}
          <div className="relative rounded-xl overflow-hidden mb-6">
            <img
              src={campaign.image}
              alt={campaign.title}
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {campaign.title}
              </h1>
              {campaign.endDate && (
                <div className="flex items-center gap-1.5 text-white/90 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{t('campaignProfile.ends')} {format(new Date(campaign.endDate), 'MMMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">{t('campaignProfile.campaignProgress')}</span>
              </div>
              <span className="text-2xl font-bold text-primary">{percentage}%</span>
            </div>

            <div className="progress-bar-track h-3 mb-4">
              <div
                className="progress-bar-fill transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-primary">{campaign.current}</span>
                <span className="text-muted-foreground text-lg ml-1">
                  / {campaign.goal} {campaign.unit}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Users className="w-4 h-4" />
                <span>127 {t('campaignProfile.supporters')}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('campaignProfile.aboutThisCampaign')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {campaign.description}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('campaignProfile.everyContribution')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              {t('campaignProfile.allDonationsTracked')}
            </p>
          </div>

          {/* Impact Section */}
          <div className="bg-muted/50 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('campaignProfile.yourImpact')}</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-xs text-muted-foreground">{t('campaignProfile.animalsHelped')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">127</div>
                <div className="text-xs text-muted-foreground">{t('campaignProfile.supporters')}</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4</div>
                <div className="text-xs text-muted-foreground">{t('campaignProfile.citiesReached')}</div>
              </div>
            </div>
          </div>

          {/* Recent Supporters placeholder */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('campaignProfile.recentSupporters')}</h2>
            <div className="space-y-3">
              {['Ivan P.', 'Maria S.', t('common.anonymous')].map((name, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">{t('campaignProfile.contributed')} {10 + i * 5} {campaign.unit}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{i + 1}{t('time.hoursAgo')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky-donate">
        <div className="container mx-auto max-w-2xl flex gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors",
              isSaved 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card border-border text-foreground"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
          <Button className="flex-1 h-10 btn-donate text-sm">
            <Heart className="w-4 h-4 mr-2" />
            {t('actions.contributeNow')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignProfile;
