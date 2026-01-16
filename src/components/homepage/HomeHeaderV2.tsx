import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, HeartHandshake, Search, X, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// TODO: Replace with real data from Convex
const unreadNotifications = 5;
const unreadPosts = 5;

interface HomeHeaderV2Props {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  children?: React.ReactNode; // For filter pills or other controls below search
}

export function HomeHeaderV2({ searchQuery, onSearchChange, onSearchSubmit, children }: HomeHeaderV2Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <header className="md:hidden sticky top-0 z-50 bg-background/98 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      {/* Top Row: Logo + Actions */}
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <HeartHandshake className="size-5 text-primary" strokeWidth={2} />
          <span className="font-bold text-lg tracking-tight text-foreground">Pawtreon</span>
        </NavLink>

        {/* Actions */}
        <div className="flex items-center -mr-1.5">
          <Button variant="iconHeader" size="iconTouch" className="relative" asChild>
            <NavLink to="/community">
              <MessageCircle className={cn(
                "size-5",
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
                "size-5",
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
                "size-5",
                location.pathname === '/account' ? "text-primary" : "text-muted-foreground"
              )} />
            </NavLink>
          </Button>
        </div>
      </div>

      {/* Search Bar Row + Filter Pills */}
      <div className="px-4 pt-1 pb-2 space-y-2">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={t('home.searchPlaceholder', 'Search cases, rescuers, locations...')}
            className={cn(
              "w-full rounded-full bg-muted/80 pl-10 pr-10 py-2 text-base text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "transition-colors"
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted-foreground/20"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </form>
        {children}
      </div>
    </header>
  );
}
