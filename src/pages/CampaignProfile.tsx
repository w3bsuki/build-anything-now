import { useParams, Link } from 'react-router-dom';
import { mockCampaigns } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Heart, Calendar, Target, Users } from 'lucide-react';
import { format } from 'date-fns';

const CampaignProfile = () => {
  const { id } = useParams();
  const campaign = mockCampaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Campaign not found</h1>
          <Link to="/campaigns" className="text-primary hover:underline">
            Go back to campaigns
          </Link>
        </div>
      </div>
    );
  }

  const percentage = Math.round((campaign.current / campaign.goal) * 100);

  return (
    <div className="min-h-screen pb-28 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border md:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link
            to="/campaigns"
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
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
            Back to campaigns
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
                  <span>Ends {format(new Date(campaign.endDate), 'MMMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-card rounded-xl border border-border p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Campaign Progress</span>
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
                <span>127 supporters</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">About this campaign</h2>
            <p className="text-muted-foreground leading-relaxed">
              {campaign.description}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Every contribution, no matter how small, makes a real difference in the lives of animals in need.
              Your support helps us provide essential care, shelter, and medical treatment to stray and abandoned
              animals across Bulgaria.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              All donations are tracked transparently, and we provide regular updates on how your contributions
              are being used. Together, we can make a lasting impact on animal welfare in our communities.
            </p>
          </div>

          {/* Impact Section */}
          <div className="bg-muted/50 rounded-xl p-5 mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Impact</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-xs text-muted-foreground">Animals helped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">127</div>
                <div className="text-xs text-muted-foreground">Supporters</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">4</div>
                <div className="text-xs text-muted-foreground">Cities reached</div>
              </div>
            </div>
          </div>

          {/* Recent Supporters placeholder */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Recent Supporters</h2>
            <div className="space-y-3">
              {['Ivan P.', 'Maria S.', 'Anonymous'].map((name, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground">Contributed {10 + i * 5} {campaign.unit}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{i + 1}h ago</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Donate Button */}
      <div className="sticky-donate">
        <div className="container mx-auto max-w-2xl flex gap-2">
          <ShareButton
            title={campaign.title}
            text={campaign.description}
            variant="icon"
            className="w-11 h-11 rounded-xl bg-card border border-border"
          />
          <Button className="flex-1 h-11 btn-donate text-base">
            <Heart className="w-4 h-4 mr-2" />
            Contribute Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignProfile;
