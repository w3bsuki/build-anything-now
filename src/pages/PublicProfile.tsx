import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  PawPrint, 
  Heart, 
  Award,
  MessageCircle,
  MapPin,
  Share2,
  Lock,
  Bookmark,
  Pencil,
  MoreHorizontal,
  Calendar
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileBadges } from '@/components/profile/ProfileBadges';
import { ProfileCases } from '@/components/profile/ProfileCases';
import { FollowButton } from '@/components/profile/FollowButton';
import { MonthlySupportDrawer } from '@/components/donations/MonthlySupportDrawer';
import { useState } from 'react';
import { ProfileEditDrawer } from '@/components/profile/ProfileEditDrawer';
import { cn } from '@/lib/utils';
import type { Id } from '../../convex/_generated/dataModel';

const PublicProfile = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [monthlySupportOpen, setMonthlySupportOpen] = useState(false);

  // Handle "me" alias
  const currentUser = useQuery(api.users.me);
  const actualUserId = userId === 'me' 
    ? currentUser?._id 
    : userId as Id<"users"> | undefined;

  // Fetch profile data
  const profile = useQuery(
    api.users.getPublicProfile,
    actualUserId ? { userId: actualUserId } : "skip"
  );

  const profileStats = useQuery(
    api.users.getProfileStats,
    actualUserId ? { userId: actualUserId } : "skip"
  );

  const isFollowing = useQuery(
    api.social.isFollowing,
    actualUserId && !profile?.isOwnProfile ? { userId: actualUserId } : "skip"
  );

  // Fetch saved cases for own profile
  const savedCases = useQuery(
    api.users.getSavedCases,
    profile?.isOwnProfile ? {} : "skip"
  );

  // Fetch cases created by this user (for rescuers)
  const userCases = useQuery(
    api.cases.listByUserWithImages,
    actualUserId ? { userId: actualUserId } : "skip"
  );
  const savedCaseItems = (savedCases ?? []).filter((caseItem) => caseItem !== null);

  const isLoading = profile === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">{t('common.loading')}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4">
          <h1 className="text-lg font-bold text-foreground mb-2">{t('profile.userNotFound')}</h1>
          <Link to="/" className="text-sm text-primary hover:underline">
            {t('common.goHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Private profile view (not own profile)
  if (!profile.isPublic && !profile.isOwnProfile) {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-16 bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70 md:hidden">
          <div className="flex items-center gap-3 h-14 px-4">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-base font-semibold text-foreground truncate flex-1">
              {profile.displayName}
            </h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-sm mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 ring-2 ring-border">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Lock className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h1 className="text-lg font-bold text-foreground mb-1">{profile.displayName}</h1>
            <p className="text-sm text-muted-foreground mb-6">{t('profile.privateProfile')}</p>
            <FollowButton userId={actualUserId!} isFollowing={!!isFollowing} />
          </div>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName} - Pawtreon`,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const casesCount = userCases?.length ?? profileStats?.casesCreated ?? 0;

  // Extra bottom padding when showing contextual action bar for other users
  const bottomPadding = profile.isOwnProfile ? 'pb-20 md:pb-8' : 'pb-32 md:pb-8';

  return (
    <div className={cn("min-h-screen bg-background", bottomPadding)}>
      {/* Mobile Header - Twitter style with avatar */}
      <header className="sticky top-0 z-50 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70 md:hidden">
        <div className="flex items-center gap-3 h-14 px-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          {/* Mini avatar in header */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-muted shrink-0 ring-1 ring-border">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                {profile.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground truncate">
              {profile.displayName}
            </h1>
            <p className="text-xs text-muted-foreground">{casesCount} {t('profile.cases').toLowerCase()}</p>
          </div>
          <button 
            onClick={handleShare}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block md:pt-16">
        <div className="container max-w-2xl mx-auto px-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
        </div>
      </div>

      <div className="container max-w-2xl mx-auto px-4">
        {/* Profile Card - Clean card design */}
        <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs overflow-hidden mt-4 shadow-sm">
          {/* Cover area */}
          <div className="h-20 md:h-24 bg-surface-overlay/40" />
          
          {/* Profile content */}
          <div className="px-4 pb-4">
            {/* Avatar - Overlapping cover */}
            <div className="flex items-end justify-between -mt-10 md:-mt-12 mb-3">
              <div className="relative">
                {/* Gradient ring for avatar */}
                <div className={cn(
                  "rounded-full p-[3px]",
                  profile.role === 'volunteer'
                    ? "bg-primary/30"
                    : "bg-border"
                )}>
                  <div className="rounded-full bg-background p-[2px]">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-muted">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                          {profile.displayName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Volunteer badge */}
                {profile.role === 'volunteer' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                    <Heart className="w-3 h-3 text-primary-foreground fill-current" />
                  </div>
                )}
              </div>

              {/* Action buttons - right aligned */}
              <div className="flex items-center gap-2 mb-2">
                {profile.isOwnProfile ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 rounded-xl gap-2 font-semibold"
                      onClick={() => setEditDrawerOpen(true)}
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('profile.editProfile')}</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-9 w-9 rounded-xl"
                      onClick={handleShare}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <FollowButton userId={actualUserId!} isFollowing={!!isFollowing} />
                    <Button
                      size="sm"
                      variant="donate"
                      className="h-11 rounded-xl gap-2 font-semibold"
                      onClick={() => setMonthlySupportOpen(true)}
                    >
                      <Heart className="w-4 h-4" />
                      <span>{t('actions.supportMonthly', 'Support Monthly')}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="h-9 rounded-xl gap-2" asChild>
                      <Link to={`/messages/${actualUserId}`}>
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('profile.message')}</span>
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Name & handle */}
            <div className="mb-2">
              <h1 className="text-lg font-bold text-foreground">{profile.displayName}</h1>
              {profile.city && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{profile.city}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-foreground mb-3 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Meta info */}
            {profile.memberSince && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                <span>{t('profile.memberSince')} {profile.memberSince}</span>
              </div>
            )}

            {/* Stats row - Twitter style */}
            <div className="flex items-center gap-4 text-sm">
              <button className="hover:underline">
                <strong className="text-foreground">{profile.followingCount}</strong>{' '}
                <span className="text-muted-foreground">{t('profile.following')}</span>
              </button>
              <button className="hover:underline">
                <strong className="text-foreground">{profile.followerCount}</strong>{' '}
                <span className="text-muted-foreground">{t('profile.followers')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs - Responsive: icons only on mobile, icons + text on larger screens */}
        <Tabs defaultValue="cases" className="mt-4">
          <TabsList className={cn(
            "w-full h-12 p-1 bg-surface-elevated rounded-2xl border border-border/60 shadow-xs grid overflow-hidden gap-1",
            profile.isOwnProfile ? "grid-cols-4" : "grid-cols-3"
          )}>
            <TabsTrigger 
              value="cases" 
              className="h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-xs sm:text-sm font-medium transition-all"
            >
              <PawPrint className="w-4 h-4" />
              <span className="text-[10px] sm:text-sm">{t('profile.cases')}</span>
              {casesCount > 0 && (
                <span className="hidden sm:inline text-xs bg-background/20 px-1.5 py-0.5 rounded-full">{casesCount}</span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="impact" 
              className="h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-xs sm:text-sm font-medium transition-all"
            >
              <Heart className="w-4 h-4" />
              <span className="text-[10px] sm:text-sm">{t('profile.impact')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="badges" 
              className="h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-xs sm:text-sm font-medium transition-all"
            >
              <Award className="w-4 h-4" />
              <span className="text-[10px] sm:text-sm">{t('profile.badges')}</span>
            </TabsTrigger>
            {profile.isOwnProfile && (
              <TabsTrigger 
                value="saved" 
                className="h-full rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-xs sm:text-sm font-medium transition-all"
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-[10px] sm:text-sm">{t('profile.saved')}</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="cases" className="mt-4 space-y-3">
            {userCases && userCases.length > 0 ? (
              <ProfileCases cases={userCases} />
            ) : (
              <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-8 text-center">
                <PawPrint className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">{t('profile.noCases')}</h3>
                <p className="text-sm text-muted-foreground">{t('profile.noCasesDesc')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="impact" className="mt-4">
            <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-4">
              {/* Main stat */}
              <div className="text-center pb-4 border-b border-border mb-4">
                <div className="text-3xl font-bold text-primary">
                  {profileStats?.totalAmount ?? 0}
                  <span className="text-base font-normal text-muted-foreground ml-1">EUR</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('profile.totalContributed')}</p>
              </div>
              
              {/* Secondary stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profileStats?.totalDonations ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{t('profile.donations')}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xl font-bold text-foreground">{profileStats?.animalsHelped ?? 0}</span>
                    <PawPrint className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('profile.animalsHelped')}</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{profileStats?.casesCreated ?? 0}</div>
                  <p className="text-xs text-muted-foreground">{t('profile.casesCreated')}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-4">
            <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs overflow-hidden">
              <ProfileBadges badges={profile.badges ?? []} />
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-4 space-y-3">
            {savedCaseItems.length > 0 ? (
              <ProfileCases cases={savedCaseItems} />
            ) : (
              <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-8 text-center">
                <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">{t('profile.noSavedCases')}</h3>
                <p className="text-sm text-muted-foreground">{t('profile.noSavedCasesDesc')}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Edit Drawer (for own profile) */}
      {profile.isOwnProfile && (
        <ProfileEditDrawer 
          open={editDrawerOpen} 
          onOpenChange={setEditDrawerOpen}
          currentUser={currentUser}
        />
      )}

      {!profile.isOwnProfile && actualUserId && (
        <MonthlySupportDrawer
          open={monthlySupportOpen}
          onOpenChange={setMonthlySupportOpen}
          targetType="user"
          targetId={actualUserId}
          targetTitle={profile.displayName}
          currency="EUR"
        />
      )}

      {/* Contextual Bottom Action Bar - Only when viewing other user's profile on mobile */}
      {!profile.isOwnProfile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border p-3 pb-safe md:hidden">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <FollowButton userId={actualUserId!} isFollowing={!!isFollowing} className="flex-1 h-11" />
            <Button
              variant="donate"
              className="flex-1 h-11 rounded-xl gap-2 font-semibold"
              onClick={() => setMonthlySupportOpen(true)}
            >
              <Heart className="w-4 h-4" />
              {t('actions.supportMonthly', 'Support Monthly')}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-11 rounded-xl gap-2 font-semibold" 
              asChild
            >
              <Link to={`/messages/${actualUserId}`}>
                <MessageCircle className="w-5 h-5" />
                {t('profile.message')}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile;
