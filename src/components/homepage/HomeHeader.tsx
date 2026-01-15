import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, MessageCircle, Search, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from Convex
const unreadNotifications = 2;
const unreadPosts = 5;

interface HomeHeaderProps {
  onSearchClick: () => void;
}

export function HomeHeader({ onSearchClick }: HomeHeaderProps) {
  const location = useLocation();

  return (
    <header className="md:hidden sticky top-0 z-50 bg-background/98 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-12 px-4 pt-1.5">
        {/* Logo + Title */}
        <div className="flex items-center gap-2 -ml-1">
          <HeartHandshake className="w-5 h-5 text-primary" strokeWidth={2} />
          <h1 className="font-bold text-lg tracking-tight text-foreground">Pawtreon</h1>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 -mr-2">
          {/* Search Icon */}
          <button
            onClick={onSearchClick}
            className={cn(buttonVariants({ variant: 'iconHeader', size: 'icon' }))}
          >
            <Search className="size-[22px] text-foreground/80" strokeWidth={1.75} />
          </button>

          {/* Community */}
          <NavLink
            to="/community"
            className={cn(
              'relative',
              buttonVariants({ variant: 'iconHeader', size: 'icon' }),
              location.pathname === '/community' && 'text-primary'
            )}
          >
            <MessageCircle
              className={cn(
                'size-[22px]',
                location.pathname === '/community'
                  ? 'text-primary fill-primary/20'
                  : 'text-foreground/80'
              )}
              strokeWidth={1.75}
            />
            {unreadPosts > 0 && location.pathname !== '/community' && (
              <Badge
                variant="secondary"
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background"
              >
                {unreadPosts > 9 ? '9+' : unreadPosts}
              </Badge>
            )}
          </NavLink>

          {/* Notifications */}
          <NavLink
            to="/notifications"
            className={cn('relative', buttonVariants({ variant: 'iconHeader', size: 'icon' }))}
          >
            <Bell className="size-[22px] text-foreground/80" strokeWidth={1.75} />
            {unreadNotifications > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Badge>
            )}
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={cn(
              buttonVariants({ variant: 'iconHeader', size: 'icon' }),
              location.pathname === '/profile' && 'text-primary'
            )}
          >
            <User
              className={cn(
                'size-[22px]',
                location.pathname === '/profile' ? 'text-primary' : 'text-foreground/80'
              )}
              strokeWidth={1.75}
            />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
