import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  PawPrint, 
  Heart, 
  Calendar,
  Award,
  MessageCircle,
  MapPin,
  Share2,
  Lock,
  UserPlus,
  UserCheck,
  Bookmark,
  Pencil
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { ProfileBadges } from '@/components/profile/ProfileBadges';
import { ProfileCases } from '@/components/profile/ProfileCases';
import { FollowButton } from '@/components/profile/FollowButton';
import { useState } from 'react';
import { ProfileEditDrawer } from '@/components/profile/ProfileEditDrawer';
import type { Id } from '../../convex/_generated/dataModel';

const PublicProfile = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

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

  const isLoading = profile === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">{t('profile.userNotFound')}</h1>
          <Link to="/" className="text-primary hover:underline">
            {t('common.goHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Private profile view (not own profile)
  if (!profile.isPublic && !profile.isOwnProfile) {
    return (
      <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-3 h-14 px-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-medium text-sm text-foreground truncate flex-1">
              {profile.displayName}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Lock className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">{profile.displayName}</h1>
            <p className="text-muted-foreground mb-6">{t('profile.privateProfile')}</p>
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
          title: `${profile.displayName} - PawsSafe`,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      // TODO: Show toast notification
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3 h-14 px-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-medium text-sm text-foreground truncate flex-1">
            {profile.displayName}
          </h1>
          <button 
            onClick={handleShare}
            className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center active:bg-muted transition-colors"
          >
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>

          {/* Profile Header */}
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
            
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mx-auto border-4 border-background shadow-lg">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                    {profile.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {profile.role === 'volunteer' && (
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                  <Heart className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              {profile.displayName}
            </h1>

            {/* Follower/Following stats */}
            <div className="flex items-center justify-center gap-4 mb-3 text-sm">
              <span>
                <strong className="text-foreground">{profile.followerCount}</strong>{' '}
                <span className="text-muted-foreground">{t('profile.followers')}</span>
              </span>
              <span>
                <strong className="text-foreground">{profile.followingCount}</strong>{' '}
                <span className="text-muted-foreground">{t('profile.following')}</span>
              </span>
            </div>

            {profile.city && (
              <div className="flex items-center justify-center gap-1 mb-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{profile.city}</span>
              </div>
            )}

            {profile.memberSince && (
              <div className="flex items-center justify-center gap-1 mb-4 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{t('profile.memberSince')} {profile.memberSince}</span>
              </div>
            )}

            {profile.bio && (
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {profile.bio}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              {profile.isOwnProfile ? (
                <>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => setEditDrawerOpen(true)}>
                    <Pencil className="w-4 h-4" />
                    {t('profile.editProfile')}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    {t('common.share')}
                  </Button>
                </>
              ) : (
                <>
                  <FollowButton userId={actualUserId!} isFollowing={!!isFollowing} />
                  <Button size="sm" variant="outline" className="gap-2" asChild>
                    <Link to={`/messages/${actualUserId}`}>
                      <MessageCircle className="w-4 h-4" />
                      {t('profile.message')}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <ProfileStats stats={profileStats} />

          {/* Tabs */}
          <Tabs defaultValue={profile.isOwnProfile ? 'impact' : 'impact'} className="mt-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-4">
              <TabsTrigger value="impact" className="gap-1.5">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">{t('profile.impact')}</span>
              </TabsTrigger>
              {userCases && userCases.length > 0 && (
                <TabsTrigger value="cases" className="gap-1.5">
                  <PawPrint className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('profile.cases')}</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="badges" className="gap-1.5">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">{t('profile.badges')}</span>
              </TabsTrigger>
              {profile.isOwnProfile && (
                <TabsTrigger value="saved" className="gap-1.5">
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('profile.saved')}</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="impact" className="mt-4">
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {profileStats?.totalAmount ?? 0} EUR
                </div>
                <p className="text-muted-foreground mb-4">{t('profile.totalContributed')}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{profileStats?.totalDonations ?? 0}</div>
                    <p className="text-sm text-muted-foreground">{t('profile.donations')}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{profileStats?.animalsHelped ?? 0}</div>
                    <p className="text-sm text-muted-foreground">{t('profile.animalsHelped')}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {userCases && userCases.length > 0 && (
              <TabsContent value="cases" className="mt-4">
                <ProfileCases cases={userCases} />
              </TabsContent>
            )}

            <TabsContent value="badges" className="mt-4">
              <ProfileBadges badges={profile.badges ?? []} />
            </TabsContent>

            {profile.isOwnProfile && (
              <TabsContent value="saved" className="mt-4">
                {savedCases && savedCases.length > 0 ? (
                  <ProfileCases cases={savedCases} />
                ) : (
                  <div className="bg-card rounded-xl border border-border p-8 text-center">
                    <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">{t('profile.noSavedCases')}</h3>
                    <p className="text-sm text-muted-foreground">{t('profile.noSavedCasesDesc')}</p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Profile Edit Drawer (for own profile) */}
      {profile.isOwnProfile && (
        <ProfileEditDrawer 
          open={editDrawerOpen} 
          onOpenChange={setEditDrawerOpen}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default PublicProfile;