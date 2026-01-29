import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Megaphone, Plus, MessageCircle, HeartHandshake, Handshake, Stethoscope, Bell, User, Heart, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

// Bottom nav: Home, Campaigns, Create (center), Clinics, Partners
const navItems = [
  { path: '/', labelKey: 'nav.home', labelFallback: 'Home', icon: Home },
  { path: '/campaigns', labelKey: 'nav.campaigns', labelFallback: 'Campaigns', icon: Megaphone },
  { path: 'create', labelKey: 'actions.create', labelFallback: 'Create', icon: Plus, isCreate: true },
  { path: '/clinics', labelKey: 'nav.clinics', labelFallback: 'Clinics', icon: Stethoscope },
  { path: '/partners', labelKey: 'nav.partners', labelFallback: 'Partners', icon: Handshake },
];

const desktopNavItems = [
  { path: '/', labelKey: 'nav.home', labelFallback: 'Home', icon: Home },
  { path: '/campaigns', labelKey: 'nav.campaigns', labelFallback: 'Campaigns', icon: Megaphone },
  { path: '/community', labelKey: 'nav.community', labelFallback: 'Community', icon: MessageCircle },
  { path: '/partners', labelKey: 'nav.partners', labelFallback: 'Partners', icon: Handshake },
];

// TODO: Replace with real data from Convex
const unreadNotifications = 5;

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

  // Hide bottom nav on detail pages and create pages (they have their own action bars)
  const hideBottomNav = location.pathname.includes('/case/') ||
    location.pathname.includes('/campaigns/') ||
    location.pathname.includes('/clinics/') ||
    location.pathname.includes('/partners/') ||
    location.pathname.startsWith('/messages/') ||
    ['/create-case', '/create-case-ai', '/create-adoption', '/donations', '/history', '/achievements', '/payment', '/notifications', '/settings', '/profile/edit'].includes(location.pathname);

  return (
    <>
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
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors duration-150',
                      isActive
                        ? 'text-foreground font-bold bg-accent'
                        : 'text-muted-foreground font-medium hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t(item.labelKey, item.labelFallback)}</span>
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
                <span>{t('actions.create', 'Create')}</span>
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
                className={cn(location.pathname === '/account' && "bg-primary/10")}
                asChild
              >
                <NavLink to="/account">
                  <User className={cn(
                    location.pathname === '/account' ? "text-primary" : "text-muted-foreground"
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
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-nav-surface backdrop-blur-md border-t border-nav-border pb-[env(safe-area-inset-bottom)]"
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
                    <div className="size-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground border-2 border-background shadow-sm">
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
                      'h-[22px] w-[22px] transition-colors',
                      isActive ? 'text-foreground' : 'text-muted-foreground'
                    )}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span className={cn(
                    'text-[10px] transition-colors',
                    isActive ? 'text-foreground font-semibold' : 'text-muted-foreground font-medium'
                  )}>
                    {t(item.labelKey, item.labelFallback)}
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
            <DrawerTitle className="text-center text-lg">{t('create.title', 'Create')}</DrawerTitle>
            <DrawerDescription className="text-center sr-only">
              {t('create.title', 'Create')}
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
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{t('actions.reportAnimal', 'Create case')}</p>
                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-semibold text-foreground/80">
                    {t('create.manual', 'Manual')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{t('create.reportAnimalDesc', 'Guided step-by-step form')}</p>
              </div>
            </Link>

            <Link
              to="/create-case-ai"
              onClick={() => setIsCreateOpen(false)}
              className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors active:opacity-90"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{t('actions.listWithAi', 'List with AI')}</p>
                  <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-semibold text-foreground/80">
                    {t('common.preview', 'Preview')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{t('create.listWithAiDesc', 'Demo: photo → draft → review (publishing gated)')}</p>
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
                <p className="font-semibold text-foreground">{t('actions.listForAdoption', 'List for adoption')}</p>
                <p className="text-sm text-muted-foreground">{t('create.adoptionDesc', 'Help an animal find a home')}</p>
              </div>
            </Link>
          </div>

          <DrawerFooter className="pt-4 px-4">
            <DrawerClose asChild>
              <Button variant="outline" className="w-full text-base h-11 rounded-xl">
                {t('actions.cancel', 'Cancel')}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
