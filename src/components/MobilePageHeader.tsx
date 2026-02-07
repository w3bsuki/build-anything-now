import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Bell, User, MessageCircle, Search, HeartHandshake } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface MobilePageHeaderProps {
  title: string;
  showLogo?: boolean; // Show small logo before title (for homepage)
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchMode?: 'inline' | 'icon' | 'adaptive';
  children?: React.ReactNode; // For filter pills or other controls below search
}

const COLLAPSE_SCROLL_Y = 40;
const EXPAND_SCROLL_Y = 16;

export function MobilePageHeader({ 
  title, 
  showLogo = false,
  searchPlaceholder, 
  searchValue = '', 
  onSearchChange,
  searchMode = 'inline',
  children 
}: MobilePageHeaderProps) {
  const location = useLocation();
  const unreadCounts = useQuery(api.home.getUnreadCounts, {});
  const [searchSheetOpen, setSearchSheetOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchValue);
  const [isAdaptiveCollapsed, setIsAdaptiveCollapsed] = useState(false);
  const [isInlineSearchFocused, setIsInlineSearchFocused] = useState(false);
  const inlineSearchRef = useRef<HTMLInputElement | null>(null);
  const unreadNotifications = unreadCounts?.notifications ?? 0;
  const unreadPosts = unreadCounts?.community ?? 0;

  useEffect(() => {
    setSearchDraft(searchValue);
  }, [searchValue]);

  const hasSearch = Boolean(searchPlaceholder);
  const isAdaptiveSearch = searchMode === 'adaptive' && hasSearch;

  useEffect(() => {
    if (!isAdaptiveSearch) {
      setIsAdaptiveCollapsed(false);
      return;
    }

    const updateCollapsedState = () => {
      if (isInlineSearchFocused || document.activeElement === inlineSearchRef.current) {
        return;
      }

      const scrollY = window.scrollY ?? window.pageYOffset ?? 0;
      setIsAdaptiveCollapsed((previous) => {
        if (!previous && scrollY > COLLAPSE_SCROLL_Y) return true;
        if (previous && scrollY < EXPAND_SCROLL_Y) return false;
        return previous;
      });
    };

    updateCollapsedState();
    window.addEventListener('scroll', updateCollapsedState, { passive: true });
    return () => window.removeEventListener('scroll', updateCollapsedState);
  }, [isAdaptiveSearch, isInlineSearchFocused]);

  const showInlineSearch = hasSearch && (
    searchMode === 'inline' || (isAdaptiveSearch && !isAdaptiveCollapsed)
  );
  const showIconSearch = hasSearch && (
    searchMode === 'icon' || (isAdaptiveSearch && isAdaptiveCollapsed)
  );
  const hasActiveSearch = searchValue.trim().length > 0;

  return (
    <>
      <header className="md:hidden sticky top-0 z-50 bg-nav-surface/95 backdrop-blur-lg pt-[env(safe-area-inset-top)] border-b border-nav-border/70">
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
          <div className="flex items-center -space-x-1 -mr-1">
            <Button
              variant="iconHeader"
              size="iconTouch"
              className="relative"
              asChild
            >
              <NavLink to="/community">
                <MessageCircle className={cn(
                  location.pathname === '/community' ? "text-primary fill-primary/20" : undefined
                )} />
                {unreadPosts > 0 && location.pathname !== '/community' && (
                  <Badge
                    variant="secondary"
                    className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-xs font-semibold leading-none ring-1 ring-background"
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
                  location.pathname === '/notifications' ? "text-primary" : undefined
                )} />
                {unreadNotifications > 0 && (
                  <Badge
                    className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-xs font-semibold leading-none ring-1 ring-background"
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
                  location.pathname === '/account' ? "text-primary" : undefined
                )} />
              </NavLink>
            </Button>
          </div>
        </div>
  
        {/* Search + Filters Area */}
        {(searchPlaceholder || children) && (
          <div className={cn(
            "px-4 pt-1 pb-2",
            showIconSearch ? "flex items-center gap-2" : "space-y-2",
          )}>
            {showInlineSearch && (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
                <input
                  ref={inlineSearchRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full rounded-full border border-search-border bg-search-bg pl-10 pr-4 py-2 text-base font-normal text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-sm"
                  value={searchValue}
                  onFocus={() => {
                    setIsInlineSearchFocused(true);
                    setIsAdaptiveCollapsed(false);
                  }}
                  onBlur={() => setIsInlineSearchFocused(false)}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
              </div>
            )}

            {showIconSearch && (
              <Button
                variant="iconHeader"
                size="iconTouch"
                className={cn(
                  "relative shrink-0 rounded-full border border-search-border bg-search-bg",
                  hasActiveSearch && "border-primary/35 bg-primary/10 text-primary"
                )}
                onClick={() => setSearchSheetOpen(true)}
                aria-label={searchPlaceholder}
              >
                <Search className="size-5" />
                {hasActiveSearch ? (
                  <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-primary" aria-hidden />
                ) : null}
              </Button>
            )}

            {children ? (
              <div className={cn(showIconSearch && "min-w-0 flex-1")}>
                {children}
              </div>
            ) : null}
          </div>
        )}
      </header>

      {showIconSearch && (
        <Sheet open={searchSheetOpen} onOpenChange={setSearchSheetOpen}>
          <SheetContent side="top" className="md:hidden px-4 pb-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <SheetHeader className="sr-only">
              <SheetTitle>{searchPlaceholder}</SheetTitle>
              <SheetDescription>Search and filter this list.</SheetDescription>
            </SheetHeader>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                autoFocus
                className="w-full rounded-full border border-search-border bg-search-bg pl-10 pr-10 py-2.5 text-base font-normal text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                value={searchDraft}
                onChange={(e) => {
                  setSearchDraft(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
