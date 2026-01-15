import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Newspaper, PenSquare, Users, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// Community-specific navigation items
const communityNavItems = [
  { path: '/', labelKey: 'nav.home', icon: Home },
  { path: '/community', labelKey: 'community.feed', icon: Newspaper, exact: true },
  { path: 'create-post', labelKey: 'community.newPost', icon: PenSquare, isCreate: true },
  { path: '/community/members', labelKey: 'community.members', icon: Users },
  { path: '/community/activity', labelKey: 'community.activity', icon: Activity },
];

export function CommunityBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const handleCreatePost = () => {
    // TODO: Open create post modal/drawer or navigate to create post page
    console.log('Create post clicked');
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-md px-4 pb-2">
        <div className="grid grid-cols-5 items-center rounded-2xl bg-card px-2 py-1.5 shadow-xl border border-border/50">
          {communityNavItems.map((item) => {
            // Check if this item is active
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            // Special handling for center Create Post button
            if (item.isCreate) {
              return (
                <button
                  key="create-post"
                  onClick={handleCreatePost}
                  className="flex flex-col items-center justify-center"
                  aria-label={t(item.labelKey)}
                >
                  {/* Different styling from main nav - outlined/secondary style */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-primary bg-primary/10 text-primary shadow-sm hover:bg-primary/20 transition-colors">
                    <PenSquare className="h-5 w-5" strokeWidth={2} />
                  </div>
                </button>
              );
            }

            // Home button - always goes to main home
            if (item.path === '/') {
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors active:bg-muted/60'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                  <span className="leading-none">{t(item.labelKey)}</span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors active:bg-muted/60',
                  isActive && 'bg-primary/10 text-primary'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} strokeWidth={1.9} />
                <span className="leading-none">{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
