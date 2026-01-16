import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignedIn, SignedOut, SignOutButton, useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Heart, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronRight,
  Award,
  CreditCard,
  PawPrint,
  ArrowLeft,
  Pencil,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ProfileEditDrawer } from '@/components/profile/ProfileEditDrawer';

const Account = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Real data from Convex
  const currentUser = useQuery(api.users.me);
  const stats = useQuery(api.donations.getMyStats);
  const unreadNotifications = useQuery(api.notifications.getUnreadCount) ?? 0;
  const achievements = useQuery(api.achievements.getMyAchievements);

  const achievementCount = achievements?.length ?? 0;
  const donationStats = stats ?? { totalDonations: 0, totalAmount: 0, animalsHelped: 0 };

  // Main menu items
  const menuItems = [
    { icon: Heart, labelKey: 'profile.myDonations', badge: donationStats.totalDonations > 0 ? donationStats.totalDonations.toString() : undefined, path: '/donations' },
    { icon: Award, labelKey: 'profile.achievements', badge: achievementCount > 0 ? achievementCount.toString() : undefined, path: '/achievements' },
    { icon: CreditCard, labelKey: 'profile.paymentMethods', path: '/payment' },
    { icon: Bell, labelKey: 'profile.notifications', badge: unreadNotifications > 0 ? unreadNotifications.toString() : undefined, path: '/notifications' },
    { icon: Settings, labelKey: 'profile.settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16 bg-background">
      {/* Contextual Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border md:hidden">
        <div className="flex items-center gap-3 h-14 px-4 pt-[env(safe-area-inset-top)]">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground flex-1">{t('profile.accountSettings')}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        {/* Compact Profile Card - Twitter style */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* User Info Row */}
          <div className="p-4 flex items-center gap-3">
            <SignedIn>
              <Link 
                to={currentUser ? `/u/${currentUser._id}` : '#'}
                className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-border hover:ring-primary/50 transition-all"
              >
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-primary" />
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link 
                  to={currentUser ? `/u/${currentUser._id}` : '#'}
                  className="hover:underline"
                >
                  <h1 className="text-base font-semibold text-foreground truncate">
                    {currentUser?.displayName || user?.fullName || user?.firstName || t('profile.guestUser')}
                  </h1>
                </Link>
                {currentUser?.bio ? (
                  <p className="text-sm text-muted-foreground truncate">{currentUser.bio}</p>
                ) : user?.primaryEmailAddress?.emailAddress && (
                  <p className="text-sm text-muted-foreground truncate">
                    {user.primaryEmailAddress.emailAddress}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditDrawerOpen(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label={t('profile.editProfile')}
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <Link
                  to={currentUser ? `/u/${currentUser._id}` : '#'}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                  aria-label={t('profile.viewProfile')}
                >
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </Link>
              </div>
            </SignedIn>
            <SignedOut>
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-border">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-semibold text-foreground">
                  {t('profile.guestUser')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('profile.signInPrompt')}
                </p>
              </div>
              <Button variant="donate" size="sm" asChild>
                <Link to="/sign-in">{t('actions.signIn')}</Link>
              </Button>
            </SignedOut>
          </div>
          
          {/* Compact Stats Row - Inside the card */}
          <SignedIn>
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{donationStats.totalDonations}</p>
                  <p className="text-xs text-muted-foreground">{t('profile.donations')}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{donationStats.totalAmount} <span className="text-sm font-normal text-muted-foreground">EUR</span></p>
                  <p className="text-xs text-muted-foreground">{t('profile.contributed')}</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center flex flex-col items-center">
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-bold text-foreground">{donationStats.animalsHelped}</p>
                    <PawPrint className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">{t('profile.animalsHelped')}</p>
                </div>
              </div>
            </div>
          </SignedIn>
        </div>

        {/* Menu Card */}
        <div className="mt-4 bg-card rounded-xl border border-border overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === menuItems.length - 1;

            return (
              <Link
                key={item.labelKey}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 active:bg-muted transition-colors',
                  !isLast && 'border-b border-border'
                )}
              >
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-muted-foreground" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {t(item.labelKey)}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}
        </div>

        {/* Sign Out Button */}
        <SignedIn>
          <div className="mt-4">
            <SignOutButton>
              <button className="w-full flex items-center justify-center gap-2 py-3 text-destructive hover:bg-destructive/5 active:bg-destructive/10 rounded-xl border border-border transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('actions.signOut')}</span>
              </button>
            </SignOutButton>
          </div>
        </SignedIn>
      </div>

      {/* Profile Edit Drawer */}
      <ProfileEditDrawer 
        open={editDrawerOpen} 
        onOpenChange={setEditDrawerOpen}
        currentUser={currentUser}
      />
    </div>
  );
};

export default Account;
