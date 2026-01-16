import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, HeartHandshake, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// TODO: Replace with real data from Convex
const unreadNotifications = 5;
const unreadPosts = 5;

export function HomeHeader() {
  const location = useLocation();

  return (
    <header className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <HeartHandshake className="size-6 text-primary" />
          <span className="font-semibold text-lg text-foreground">Pawtreon</span>
        </NavLink>

        {/* Actions - 44px touch targets */}
        <div className="flex items-center -mr-1.5">
          <Button variant="iconHeader" size="iconTouch" className="relative" asChild>
            <NavLink to="/community">
              <MessageCircle className={cn(
                "size-6",
                location.pathname === '/community' ? "text-primary fill-primary/20" : "text-muted-foreground"
              )} />
              {unreadPosts > 0 && location.pathname !== '/community' && (
                <Badge
                  variant="secondary"
                  className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background"
                >
                  {unreadPosts > 9 ? '9+' : unreadPosts}
                </Badge>
              )}
            </NavLink>
          </Button>
          <Button variant="iconHeader" size="iconTouch" className="relative" asChild>
            <NavLink to="/notifications">
              <Bell className={cn(
                "size-6",
                location.pathname === '/notifications' ? "text-primary" : "text-muted-foreground"
              )} />
              {unreadNotifications > 0 && (
                <Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Badge>
              )}
            </NavLink>
          </Button>
          <Button variant="iconHeader" size="iconTouch" asChild>
            <NavLink to="/account">
              <User className={cn(
                "size-6",
                location.pathname === '/account' ? "text-primary" : "text-muted-foreground"
              )} />
            </NavLink>
          </Button>
        </div>
      </div>
    </header>
  );
}
