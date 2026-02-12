import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Star, 
  PawPrint, 
  Heart, 
  Calendar,
  Clock,
  Award,
  MessageCircle,
  Mail,
  MapPin,
  TrendingUp,
  HandHeart,
  Coins,
  Share2
} from 'lucide-react';
import { CaseCard } from '@/components/CaseCard';
import type { Id } from '../../convex/_generated/dataModel';

const VolunteerProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  
  // Fetch volunteer from Convex
  const rawVolunteer = useQuery(
    api.volunteers.get,
    id ? { id: id as Id<"volunteers"> } : "skip"
  );
  
  // Fetch cases for display (UI-shaped, not raw Convex docs)
  const rawCases = useQuery(api.cases.listUiForLocale, { locale: i18n.language });
  
  const isLoading = rawVolunteer === undefined;
  
  // Transform to match expected shape
  const volunteer = rawVolunteer ? {
    id: rawVolunteer._id,
    name: rawVolunteer.name ?? 'Unknown',
    avatar: rawVolunteer.avatar ?? '',
    bio: rawVolunteer.bio,
    location: rawVolunteer.location,
    rating: rawVolunteer.rating,
    memberSince: rawVolunteer.memberSince,
    isTopVolunteer: rawVolunteer.isTopVolunteer,
    badges: rawVolunteer.badges,
    stats: rawVolunteer.stats,
  } : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('common.volunteerNotFound')}</h1>
          <Link to="/partners" className="text-primary hover:underline">
            {t('common.goBackPartners')}
          </Link>
        </div>
      </div>
    );
  }

  // Get some cases this volunteer might have helped with
  const helpedCases = (rawCases ?? []).slice(0, 2);

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <Link
            to="/partners"
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <h1 className="font-medium text-sm text-foreground truncate flex-1">
            {volunteer.name}
          </h1>
          <button className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Back Button */}
          <Link
            to="/partners"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToPartners')}
          </Link>

          {/* Profile Header */}
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-6 md:p-8 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-surface-sunken/60 -z-10" />
            
            <div className="relative inline-block mb-4">
              <img
                src={volunteer.avatar}
                alt={volunteer.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-background shadow-lg"
              />
              {volunteer.isTopVolunteer && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-warning rounded-full flex items-center justify-center shadow-md">
                  <Star className="w-4 h-4 text-warning-foreground fill-current" />
                </div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {volunteer.name}
            </h1>

            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-semibold text-foreground">{volunteer.rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{t('volunteerProfile.memberSince')} {volunteer.memberSince}</span>
            </div>

            {volunteer.isTopVolunteer && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium mb-4">
                <Star className="w-3.5 h-3.5 fill-current" />
                {t('partners.topVolunteer')}
              </div>
            )}

            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {volunteer.bio}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button size="sm" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                {t('volunteerProfile.message')}
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Heart className="w-4 h-4" />
                {t('volunteerProfile.follow')}
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <PawPrint className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xl font-bold text-foreground">{volunteer.stats.animalsHelped}</p>
              <p className="text-xs text-muted-foreground">{t('volunteerProfile.animalsHelped')}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                <Heart className="w-5 h-5 text-accent" />
              </div>
              <p className="text-xl font-bold text-foreground">{volunteer.stats.adoptions}</p>
              <p className="text-xs text-muted-foreground">{t('volunteerProfile.adoptions')}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-5 h-5 text-warning" />
              </div>
              <p className="text-xl font-bold text-foreground">{volunteer.stats.campaigns}</p>
              <p className="text-xs text-muted-foreground">{t('volunteerProfile.campaigns')}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border text-center">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <p className="text-xl font-bold text-foreground">{volunteer.stats.hoursVolunteered}</p>
              <p className="text-xs text-muted-foreground">{t('volunteerProfile.hours')}</p>
            </div>
          </div>

          {/* Badges Section */}
          {volunteer.badges.length > 0 && (
            <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-6 mb-6">
              <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                {t('volunteerProfile.badgesAchievements')}
              </h2>
              {/* Mobile: Short badges for compact display */}
              <div className="flex flex-wrap gap-2 sm:hidden">
                {volunteer.badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                  >
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{badge}</span>
                  </div>
                ))}
              </div>
              {/* Desktop: Full badges */}
              <div className="hidden sm:flex flex-wrap gap-2">
                {volunteer.badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                  >
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Impact Section */}
          <div className="bg-primary/5 rounded-2xl p-6 mb-6 border border-primary/10">
            <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('volunteerProfile.volunteerImpact')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background/50 rounded-xl p-4 text-center">
                <HandHeart className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{volunteer.stats.animalsHelped}</p>
                <p className="text-xs text-muted-foreground">{t('volunteerProfile.livesChanged')}</p>
              </div>
              <div className="bg-background/50 rounded-xl p-4 text-center">
                <Coins className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{volunteer.stats.donationsReceived.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{t('volunteerProfile.eurRaised')}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/10">
              <p className="text-sm text-foreground/80 text-center">
                <span className="font-semibold text-primary">{volunteer.name}</span> {t('volunteerProfile.makingDifference', { since: volunteer.memberSince, hours: volunteer.stats.hoursVolunteered })}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-6 mb-6">
            <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-primary" />
              {t('volunteerProfile.casesHelped')}
            </h2>
            <div className="space-y-3">
              {helpedCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseData={caseItem} />
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-6">
            <h2 className="font-semibold text-lg text-foreground mb-4">{t('volunteerProfile.connect')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm text-foreground">{t('volunteerProfile.message')}</div>
                  <div className="text-sm text-muted-foreground">{t('volunteerProfile.sendDirectMessage')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm text-foreground">{t('partnerProfile.location')}</div>
                  <div className="text-sm text-muted-foreground">Sofia, Bulgaria</div>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4 gap-2">
              <MessageCircle className="w-4 h-4" />
              {t('volunteerProfile.sendMessage')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerProfile;
