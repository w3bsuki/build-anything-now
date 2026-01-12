import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Megaphone, Users, User, PawPrint, Stethoscope, Plus, Bell, Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/clinics', label: 'Clinics', icon: Stethoscope },
  { path: '/partners', label: 'Partners', icon: Users },
  { path: '/community', label: 'Community', icon: MessageCircle },
];

const desktopNavItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/clinics', label: 'Clinics', icon: Stethoscope },
  { path: '/partners', label: 'Partners', icon: Users },
  { path: '/community', label: 'Community', icon: MessageCircle },
];

// TODO: Replace with real data from Convex
const unreadNotifications = 2;

// Pages that show the mobile header (root/main pages only)
const mobileHeaderPages = ['/', '/campaigns', '/clinics', '/partners', '/community', '/profile'];

export function Navigation() {
  const location = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Only show mobile header on main pages, not detail pages or sub-pages
  const showMobileHeader = mobileHeaderPages.includes(location.pathname);
  
  // Hide bottom nav on detail pages and create pages (they have their own action bars)
  const hideBottomNav = location.pathname.includes('/case/') ||
    location.pathname.includes('/campaigns/') ||
    location.pathname.includes('/clinics/') ||
    location.pathname.includes('/partners/') ||
    ['/create-case', '/create-adoption', '/donations', '/history', '/achievements', '/payment', '/notifications', '/settings'].includes(location.pathname);

  return (
    <>
      {/* Mobile Top Header - only on root pages */}
      {showMobileHeader && (
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-12 px-4">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-base text-foreground">PawsSafe</span>
            </NavLink>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
              <NavLink
                to="/notifications"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors",
                  location.pathname === '/profile' && "bg-primary/10"
                )}
              >
                <User className={cn(
                  "w-5 h-5",
                  location.pathname === '/profile' ? "text-primary" : "text-muted-foreground"
                )} />
              </NavLink>
            </div>
          </div>
        </header>
      )}

      {/* Desktop Navigation */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-14">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">PawsSafe</span>
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
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
              <NavLink
                to="/notifications"
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors",
                  location.pathname === '/profile' && "bg-primary/10"
                )}
              >
                <User className={cn(
                  "w-5 h-5",
                  location.pathname === '/profile' ? "text-primary" : "text-muted-foreground"
                )} />
              </NavLink>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {!hideBottomNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
          <div className="flex items-center justify-around h-14 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'nav-item flex-1 py-1.5',
                    isActive && 'nav-item-active'
                  )}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}

      {/* Create Action Sheet */}
      {isCreateOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={() => setIsCreateOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom duration-200">
            <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">What would you like to do?</h3>
            <div className="space-y-3">
              <Link
                to="/create-case"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <PawPrint className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Report Animal</p>
                  <p className="text-sm text-muted-foreground">Found a stray that needs help</p>
                </div>
              </Link>
              <Link
                to="/create-adoption"
                onClick={() => setIsCreateOpen(false)}
                className="flex items-center gap-4 p-4 bg-accent/10 rounded-xl hover:bg-accent/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                  <Heart className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">List for Adoption</p>
                  <p className="text-sm text-muted-foreground">Help a pet find a home</p>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setIsCreateOpen(false)}
              className="w-full mt-4 p-3 text-muted-foreground font-medium hover:bg-muted rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </>
  );
}
