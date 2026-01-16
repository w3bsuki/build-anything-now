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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around h-14 px-2">
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
                className="flex items-center justify-center pb-1.5"
                aria-label={t(item.labelKey)}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary">
                  <PenSquare className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-end gap-0.5 py-1.5 min-w-[56px]"
            >
              <Icon 
                className={cn(
                  'h-[22px] w-[22px]',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} 
                strokeWidth={1.75} 
              />
              <span className={cn(
                'text-[10px] font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {t(item.labelKey)}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
