import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// TODO: Replace with real data from Convex
const unreadNotifications = 2;

export function HomeHeader() {
  const location = useLocation();

  return (
    <header className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg flex items-center justify-center bg-primary/10">
            <HeartHandshake className="size-4 text-primary" />
          </div>
          <span className="font-semibold text-lg text-foreground">Pawtreon</span>
        </NavLink>

        {/* Actions - 44px touch targets */}
        <div className="flex items-center -mr-1.5">
          <Button variant="iconHeader" size="iconTouch" className="relative" asChild>
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
          <Button variant="iconHeader" size="iconTouch" asChild>
            <NavLink to="/profile">
              <User className={cn(
                location.pathname === '/profile' ? "text-primary" : "text-muted-foreground"
              )} />
            </NavLink>
          </Button>
        </div>
      </div>
    </header>
  );
}
