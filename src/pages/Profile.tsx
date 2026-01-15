import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SignedIn, SignedOut, SignOutButton, UserButton, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Heart, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronRight,
  Award,
  History,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';

// TODO: Replace with real data from useQuery(api.donations.getMyStats)
const mockStats = {
  totalDonations: 12,
  totalAmount: 205,
  animalsHelped: 8,
};

// TODO: Replace with useQuery(api.achievements.getMyAchievements)
const achievementCount = 3;

// TODO: Replace with useQuery(api.notifications.getUnreadCount)
const unreadNotifications = 2;

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useUser();

  const menuItems = [
    { icon: Heart, labelKey: 'profile.myDonations', badge: mockStats.totalDonations.toString(), path: '/donations' },
    { icon: History, labelKey: 'profile.donationHistory', path: '/history' },
    { icon: Award, labelKey: 'profile.achievements', badge: achievementCount.toString(), path: '/achievements' },
    { icon: CreditCard, labelKey: 'profile.paymentMethods', path: '/payment' },
    { icon: Bell, labelKey: 'profile.notifications', badge: unreadNotifications > 0 ? unreadNotifications.toString() : undefined, path: '/notifications' },
    { icon: Settings, labelKey: 'profile.settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-20 pt-[env(safe-area-inset-top)]">
      {/* Profile Header */}
      <section className="bg-linear-to-br from-primary/10 via-background to-accent/5 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            <SignedIn>
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center mb-4 ring-4 ring-card">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt={user.fullName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {user?.fullName || user?.firstName || t('profile.guestUser')}
              </h1>
              {user?.primaryEmailAddress?.emailAddress && (
                <p className="text-muted-foreground mb-4">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              )}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-4 ring-card">
                <User className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">
                {t('profile.guestUser')}
              </h1>
              <p className="text-muted-foreground mb-4">
                {t('profile.signInPrompt')}
              </p>
              <Button variant="donate" asChild>
                <Link to="/sign-in">{t('actions.signIn')}</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{mockStats.totalDonations}</p>
              <p className="text-sm text-muted-foreground">{t('profile.donations')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockStats.totalAmount} EUR</p>
              <p className="text-sm text-muted-foreground">{t('profile.contributed')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mockStats.animalsHelped}</p>
              <p className="text-sm text-muted-foreground">{t('profile.animalsHelped')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === menuItems.length - 1;

              return (
                <Link
                  key={item.labelKey}
                  to={item.path}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 text-left hover:bg-muted/50 transition-colors',
                    !isLast && 'border-b border-border'
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 font-medium text-foreground">
                    {t(item.labelKey)}
                  </span>
                  {item.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <SignedIn>
        <section className="py-6">
          <div className="container mx-auto px-4">
            <SignOutButton>
              <button className="w-full flex items-center justify-center gap-2 p-4 text-destructive hover:bg-destructive/10 rounded-2xl transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('actions.signOut')}</span>
              </button>
            </SignOutButton>
          </div>
        </section>
      </SignedIn>
    </div>
  );
};

export default Profile;
