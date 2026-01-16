import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, MessageCircle, Search, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from Convex
const unreadNotifications = 5;
const unreadPosts = 5;

interface MobilePageHeaderProps {
  title: string;
  showLogo?: boolean; // Show small logo before title (for homepage)
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode; // For filter pills or other controls below search
}

export function MobilePageHeader({ 
  title, 
  showLogo = false,
  searchPlaceholder, 
  searchValue = '', 
  onSearchChange,
  children 
}: MobilePageHeaderProps) {
  const location = useLocation();

  return (
    <header className="md:hidden sticky top-0 z-50 bg-background/98 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      {/* Title Row */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Page Title with optional Logo */}
        <div className="flex items-center gap-2">
          {showLogo && (
            <HeartHandshake className="size-5 text-primary" strokeWidth={2} />
          )}
          <h1 className="font-bold text-lg tracking-tight text-foreground">{title}</h1>
        </div>

        {/* Action Icons - min 44px touch targets */}
        <div className="flex items-center -mr-1.5">
          <Button
            variant="iconHeader"
            size="iconTouch"
            className={cn(
              "relative",
              location.pathname === '/community' && "text-primary"
            )}
            asChild
          >
            <NavLink to="/community">
              <MessageCircle className={cn(
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
                <Badge
                  className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background"
                >
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
              <User className={cn(
                location.pathname === '/account' ? "text-primary" : "text-muted-foreground"
              )} />
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Search + Filters Area */}
      {(searchPlaceholder || children) && (
        <div className="px-4 pt-1 pb-2 space-y-2">
          {searchPlaceholder && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full rounded-full bg-muted/80 pl-10 pr-4 py-2 text-base font-normal text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-sm"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          {children}
        </div>
      )}
    </header>
  );
}
