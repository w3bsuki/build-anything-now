import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Megaphone, Users, User, Stethoscope, Plus, Bell, Heart, MessageCircle, HeartHandshake, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

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
// Empty since all main tabs now have their own contextual headers
const mobileHeaderPages: string[] = [];

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
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-lg border-b border-border/40 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10">
                <HeartHandshake className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground">PawsSafe</span>
            </NavLink>

            {/* Actions - Community, Notifications, Profile */}
            <div className="flex items-center gap-1">
              <NavLink
                to="/community"
                className={cn(
                  "relative",
                  buttonVariants({ variant: "iconHeader", size: "icon" }),
                  location.pathname === '/community' && "bg-primary/10 text-primary"
                )}
              >
                <MessageCircle className={cn(
                  "size-[22px]",
                  location.pathname === '/community' ? "text-primary fill-primary/20" : "text-foreground/80"
                )} strokeWidth={1.75} />
                {unreadPosts > 0 && location.pathname !== '/community' && (
                  <Badge
                    variant="secondary"
                    className="absolute top-0 right-0 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background"
                  >
                    {unreadPosts > 9 ? '9+' : unreadPosts}
                  </Badge>
                )}
              </NavLink>
              <NavLink
                to="/notifications"
                className={cn("relative", buttonVariants({ variant: "iconHeader", size: "icon" }))}
              >
                <Bell className="size-[22px] text-foreground/80" strokeWidth={1.75} />
                {unreadNotifications > 0 && (
                  <Badge
                    className="absolute top-0 right-0 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background"
                  >
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </Badge>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className={cn(
                  buttonVariants({ variant: "iconHeader", size: "icon" }),
                  location.pathname === '/profile' && "bg-primary/10 text-primary"
                )}
              >
                <User className={cn(
                  "size-[22px]",
                  location.pathname === '/profile' ? "text-primary" : "text-foreground/80"
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
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center shadow-sm">
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
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center shadow-sm">
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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto w-full max-w-md px-4 pb-2">
            <div className="grid grid-cols-5 items-center rounded-2xl bg-white dark:bg-zinc-900 px-2 py-1.5 shadow-xl shadow-black/10 dark:shadow-black/30">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                // Special handling for center Create button
                if (item.isCreate) {
                  return (
                    <button
                      key="create"
                      onClick={() => setIsCreateOpen(true)}
                      className="flex flex-col items-center justify-center"
                      aria-label={t(item.labelKey)}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                        <Plus className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                    </button>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors active:bg-muted/60',
                      isActive && 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', isActive && 'text-primary')} strokeWidth={1.9} />
                    <span className="leading-none">{t(item.labelKey)}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* Create Action Drawer */}
      <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DrawerContent className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <DrawerHeader>
            <DrawerTitle className="text-center text-lg">{t('create.title')}</DrawerTitle>
            <DrawerDescription className="text-center sr-only">
              {t('create.title')}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 space-y-3">
            <Link
              to="/create-case"
              onClick={() => setIsCreateOpen(false)}
              className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
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
              className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl hover:bg-accent/20 transition-colors active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t('actions.listForAdoption')}</p>
                <p className="text-sm text-muted-foreground">{t('create.adoptionDesc')}</p>
              </div>
            </Link>
          </div>

          <DrawerFooter className="pt-4 px-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full text-base h-11 rounded-xl">
                {t('actions.cancel')}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
