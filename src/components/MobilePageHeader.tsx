import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, MessageCircle, Search, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// TODO: Replace with real data from Convex
const unreadNotifications = 2;
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
      <div className="flex items-center justify-between h-12 px-4 pt-1.5">
        {/* Page Title with optional Logo */}
        <div className="flex items-center gap-2 -ml-1">
          {showLogo && (
            <HeartHandshake className="w-5 h-5 text-primary" strokeWidth={2} />
          )}
          <h1 className="font-bold text-lg tracking-tight text-foreground">{title}</h1>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 -mr-2">
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
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background"
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
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px] font-semibold shadow-sm ring-2 ring-background"
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

      {/* Search + Filters Area */}
      {(searchPlaceholder || children) && (
        <div className="px-4 pb-2 space-y-2">
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
