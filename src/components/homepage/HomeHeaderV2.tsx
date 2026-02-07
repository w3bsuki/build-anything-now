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
      <header className="md:hidden sticky top-0 z-50 bg-nav-surface/95 backdrop-blur-xl pt-[env(safe-area-inset-top)] border-b border-nav-border/70">
        <div className="flex items-center justify-between h-14 px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <HeartHandshake className="size-5 text-primary" strokeWidth={2} />
            <span className="font-bold text-lg tracking-tight text-foreground">Pawtreon</span>
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
        <section className="md:hidden border-b border-nav-border/60 bg-nav-surface/90 backdrop-blur-md">
          <div className="px-4 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t('home.urgentUpdates', 'Urgent Updates')}
            </p>
          </div>
          {topContent}
        </section>
      ) : null}

      <div className="md:hidden sticky top-[calc(env(safe-area-inset-top)+56px)] z-40 bg-nav-surface/95 backdrop-blur-xl border-b border-nav-border/60 px-4 py-2">
        {children}
      </div>
    </>
  );
}
