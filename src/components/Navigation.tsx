import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Megaphone, Users, User, Plus, Bell, Heart, MessageCircle, HeartHandshake, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

// Bottom nav: Home, Campaigns, Create (center), Community, Partners
const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/campaigns', labelKey: 'nav.campaigns', icon: Megaphone },
  { path: 'create', labelKey: 'actions.create', icon: Plus, isCreate: true },
  { path: '/community', labelKey: 'nav.community', icon: MessageCircle },
  { path: '/partners', labelKey: 'nav.partners', icon: Handshake },
];

const desktopNavItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/campaigns', labelKey: 'nav.campaigns', icon: Megaphone },
  { path: '/community', labelKey: 'nav.community', icon: MessageCircle },
  { path: '/partners', labelKey: 'nav.partners', icon: Handshake },
];

// TODO: Replace with real data from Convex
const unreadNotifications = 2;

// Pages that show the mobile header
const mobileHeaderPages = ['/', '/campaigns', '/community', '/partners', '/profile'];

export function Navigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Hide entire navigation on presentation, partner, auth, and onboarding pages (immersive experience)
  if (location.pathname === '/presentation' ||
    location.pathname === '/partner' ||
    location.pathname.startsWith('/sign-in') ||
    location.pathname.startsWith('/sign-up') ||
    location.pathname.startsWith('/onboarding')) {
    return null;
  }

  // Show mobile header on main pages
  const showMobileHeader = mobileHeaderPages.includes(location.pathname);

  // Hide bottom nav on detail pages and create pages (they have their own action bars)
  const hideBottomNav = location.pathname.includes('/case/') ||
    location.pathname.includes('/campaigns/') ||
    location.pathname.includes('/clinics/') ||
    location.pathname.includes('/partners/') ||
    ['/create-case', '/create-adoption', '/donations', '/history', '/achievements', '/payment', '/notifications', '/settings'].includes(location.pathname);

  return (
    <>
      {/* Mobile Top Header */}
      {showMobileHeader && (
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg flex items-center justify-center bg-primary/10">
                <HeartHandshake className="size-4 text-primary" />
              </div>
              <span className="font-semibold text-lg text-foreground">Pawtreon</span>
            </NavLink>

            {/* Actions - Notifications + Profile */}
            <div className="flex items-center -mr-1.5">
              <Button
                variant="iconHeader"
                size="iconTouch"
                className="relative"
                asChild
              >
                <NavLink to="/notifications">
                  <Bell className={cn(
                    location.pathname === '/notifications' ? "text-primary" : "text-muted-foreground"
                  )} />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </NavLink>
              </Button>
              <Button
                variant="iconHeader"
                size="iconTouch"
                asChild
              >
                <NavLink to="/profile">
                  <User className={cn(
                    location.pathname === '/profile' ? "text-primary" : "text-muted-foreground"
                  )} />
                </NavLink>
              </Button>
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
              <span className="font-bold text-lg text-foreground">Pawtreon</span>
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

            {/* Right Actions - Create button, notifications, profile */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <Plus className="size-4" strokeWidth={2.5} />
                <span>{t('actions.create')}</span>
              </button>
              <Button
                variant="iconHeader"
                size="icon"
                className="relative"
                asChild
              >
                <NavLink to="/notifications">
                  <Bell className={cn(
                    location.pathname === '/notifications' ? "text-primary" : "text-muted-foreground"
                  )} />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute top-0.5 right-0.5 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </NavLink>
              </Button>
              <Button
                variant="iconHeader"
                size="icon"
                className={cn(location.pathname === '/profile' && "bg-primary/10")}
                asChild
              >
                <NavLink to="/profile">
                  <User className={cn(
                    location.pathname === '/profile' ? "text-primary" : "text-muted-foreground"
                  )} />
                </NavLink>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {!hideBottomNav && (
        <nav
          data-tour="navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="flex items-center justify-around h-14 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const isCreateButton = 'isCreate' in item && item.isCreate;

              // Special handling for center create button
              if (isCreateButton) {
                return (
                  <button
                    key={item.path}
                    onClick={() => setIsCreateOpen(true)}
                    className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-[56px]"
                  >
                    <div className="size-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground -mt-3 shadow-lg">
                      <Icon className="size-5" strokeWidth={2.5} />
                    </div>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center gap-0.5 py-1.5 min-w-[56px]"
                >
                  <Icon
                    className={cn(
                      'h-[22px] w-[22px]',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                    strokeWidth={1.75}
                  />
                  <span className={cn(
                    'text-[10px] font-medium',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {t(item.labelKey)}
                  </span>
                </NavLink>
              );
            })}
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
              className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors active:opacity-90"
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
              className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl hover:bg-accent/20 transition-colors active:opacity-90"
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
