import { NavLink, useLocation } from 'react-router-dom';
import { Home, Megaphone, Users, User, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/partners', label: 'Partners', icon: Users },
  { path: '/profile', label: 'Profile', icon: User },
];

export function Navigation() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">PawsSafe</span>
            </NavLink>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200',
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
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'nav-item flex-1 py-2',
                  isActive && 'nav-item-active'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-all duration-200',
                    isActive && 'bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-transform',
                      isActive && 'scale-110'
                    )}
                  />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
