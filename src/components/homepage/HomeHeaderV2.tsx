import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, HeartHandshake, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HomeHeaderV2Props {
  onOpenSearch: () => void;
  topContent?: React.ReactNode;
  children?: React.ReactNode;
  unreadNotifications?: number;
}

export function HomeHeaderV2({
  onOpenSearch,
  topContent,
  children,
  unreadNotifications = 0,
}: HomeHeaderV2Props) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 border-b border-nav-border/80 bg-nav-surface pt-[env(safe-area-inset-top)]">
        <div className="flex h-14 items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/12 ring-1 ring-primary/30">
              <HeartHandshake className="size-4 text-primary" strokeWidth={2.3} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">Pawtreon</span>
          </NavLink>

          <div className="flex items-center -space-x-1 -mr-1">
            <Button
              variant="iconHeader"
              size="iconTouch"
              onClick={onOpenSearch}
              aria-label={t('home.searchPlaceholder', 'Search')}
            >
              <Search className="size-5" />
            </Button>
            <Button
              variant="iconHeader"
              size="iconTouch"
              className="relative"
              asChild
            >
              <NavLink to="/notifications">
                <Bell
                  className={cn(
                    'size-5',
                    location.pathname === '/notifications' ? 'text-primary' : undefined
                  )}
                />
                {unreadNotifications > 0 && (
                  <Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-xs font-semibold leading-none ring-1 ring-background">
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
              <NavLink to="/account">
                <User
                  className={cn(
                    'size-5',
                    location.pathname === '/account' ? 'text-primary' : undefined
                  )}
                />
              </NavLink>
            </Button>
          </div>
        </div>
      </header>

      {topContent ? (
        <section className="md:hidden border-b border-nav-border/70 bg-nav-surface">
          <div className="px-4 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/75">
              {t('home.urgentUpdates', 'Urgent Updates')}
            </p>
          </div>
          {topContent}
        </section>
      ) : null}

      <div className="md:hidden sticky top-[calc(env(safe-area-inset-top)+56px)] z-40 border-b border-nav-border/75 bg-nav-surface px-4 py-2">
        {children}
      </div>
    </>
  );
}
