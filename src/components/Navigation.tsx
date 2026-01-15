import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Megaphone, Users, User, Stethoscope, Plus, Bell, Heart, MessageCircle, HeartHandshake, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';

// Bottom nav: Home, Campaigns, + (Create), Clinics, Partners
const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/campaigns', labelKey: 'nav.campaigns', icon: Megaphone },
  { path: 'create', labelKey: 'nav.create', icon: Plus, isCreate: true }, // Special create button
  { path: '/clinics', labelKey: 'nav.clinics', icon: Stethoscope },
  { path: '/partners', labelKey: 'nav.partners', icon: Handshake },
];

const desktopNavItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/campaigns', labelKey: 'nav.campaigns', icon: Megaphone },
  { path: '/clinics', labelKey: 'nav.clinics', icon: Stethoscope },
  { path: '/partners', labelKey: 'nav.partners', icon: Handshake },
];

// TODO: Replace with real data from Convex
const unreadNotifications = 2;
const unreadPosts = 5; // New community posts

// Pages that show the mobile header (root/main pages only)
const mobileHeaderPages = ['/', '/campaigns', '/clinics', '/partners', '/community', '/profile'];

export function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Hide entire navigation on presentation and partner pages (immersive experience)
  if (location.pathname === '/presentation' || location.pathname === '/partner') {
    return null;
  }
  
  // Only show mobile header on main pages, not detail pages or sub-pages
  const showMobileHeader = mobileHeaderPages.includes(location.pathname);
  
  // Hide bottom nav on detail pages and create pages (they have their own action bars)
  const hideBottomNav = location.pathname.includes('/case/') ||
    location.pathname.includes('/campaigns/') ||
    location.pathname.includes('/clinics/') ||
    location.pathname.includes('/partners/') ||
    ['/create-case', '/create-adoption', '/donations', '/history', '/achievements', '/payment', '/notifications', '/settings'].includes(location.pathname);

  return (
    <>
      {/* Mobile Top Header - only on root pages */}
      {showMobileHeader && (
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="flex items-center justify-between h-12 px-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HeartHandshake className="w-[18px] h-[18px] text-primary" />
              </div>
              <span className="font-semibold text-[15px] text-foreground">PawsSafe</span>
            </NavLink>

            {/* Actions - Community, Notifications, Profile */}
            <div className="flex items-center gap-0.5">
              <NavLink
                to="/community"
                className={cn(
                  "relative size-9 flex items-center justify-center rounded-full active:bg-muted transition-colors",
                  location.pathname === '/community' && "bg-primary/10"
                )}
              >
                <MessageCircle className={cn(
                  "size-[22px]",
                  location.pathname === '/community' ? "text-primary fill-primary/20" : "text-foreground/70"
                )} strokeWidth={1.75} />
                {unreadPosts > 0 && location.pathname !== '/community' && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-accent text-[9px] font-bold text-accent-foreground flex items-center justify-center">
                    {unreadPosts > 9 ? '9+' : unreadPosts}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/notifications"
                className="relative size-9 flex items-center justify-center rounded-full active:bg-muted transition-colors"
              >
                <Bell className="size-[22px] text-foreground/70" strokeWidth={1.75} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className={cn(
                  "size-9 flex items-center justify-center rounded-full active:bg-muted transition-colors",
                  location.pathname === '/profile' && "bg-primary/10"
                )}
              >
                <User className={cn(
                  "size-[22px]",
                  location.pathname === '/profile' ? "text-primary" : "text-foreground/70"
                )} strokeWidth={1.75} />
              </NavLink>
            </div>
          </div>
        </header>
      )}

      {/* Desktop Navigation */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-14">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg text-foreground">PawsSafe</span>
            </NavLink>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {desktopNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Right Actions - Create button, Community, notifications, profile */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                <span>{t('actions.create')}</span>
              </button>
              <NavLink
                to="/community"
                className={cn(
                  "relative size-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                  location.pathname === '/community' && "bg-primary/10"
                )}
              >
                <MessageCircle className={cn(
                  "size-5",
                  location.pathname === '/community' ? "text-primary fill-primary/20" : "text-foreground/70"
                )} />
                {unreadPosts > 0 && location.pathname !== '/community' && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center shadow-sm">
                    {unreadPosts > 9 ? '9+' : unreadPosts}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/notifications"
                className="relative size-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
              >
                <Bell className="size-5 text-foreground/70" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-sm">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className={cn(
                  "size-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors",
                  location.pathname === '/profile' && "bg-primary/10"
                )}
              >
                <User className={cn(
                  "size-5",
                  location.pathname === '/profile' ? "text-primary" : "text-foreground/70"
                )} />
              </NavLink>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {!hideBottomNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              // Special handling for center Create button
              if (item.isCreate) {
                return (
                  <button
                    key="create"
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full bg-primary shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                  >
                    <Plus className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'nav-item flex-1 py-2 rounded-lg active:bg-muted/50 transition-colors',
                    isActive && 'nav-item-active'
                  )}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                  <span className="text-[10px] font-medium mt-0.5">{t(item.labelKey)}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}

      {/* Create Action Sheet */}
      {isCreateOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{t('create.title')}</h3>
            <div className="space-y-3">
              <Link
                to="/create-case"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t('actions.reportAnimal')}</p>
                  <p className="text-sm text-muted-foreground">{t('create.reportAnimalDesc')}</p>
                </div>
              </Link>
              <Link
                to="/create-adoption"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl hover:bg-accent/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t('actions.listForAdoption')}</p>
                  <p className="text-sm text-muted-foreground">{t('create.adoptionDesc')}</p>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="w-full mt-4 p-3 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
            >
              {t('actions.cancel')}
            </button>
          </div>
        </>
      )}
    </>
  );
}
