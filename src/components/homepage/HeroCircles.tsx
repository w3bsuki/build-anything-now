import { useState, useCallback } from 'react';
import { HeroAvatar, AddCaseCircle } from './HeroAvatar';
import { StoryViewer, type StoryGroup } from './StoryViewer';
import { cn } from '@/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

export interface TopHero {
  id: string;
  name: string;
  avatar?: string;
  animalsHelped: number;
}

interface StoryCircleProps {
  id: string;
  name: string;
  image: string; // URL or emoji
  isNew?: boolean;
  type: 'system' | 'case' | 'helper';
  onClick?: () => void;
}

// Activity item from Convex
interface ActivityItem {
  id: string;
  type: string;
  userId?: Id<"users">;
  caseId?: Id<"cases">;
  timestamp: number;
  user: { id: Id<"users">; name: string; avatar?: string } | null;
  case: { id: Id<"cases">; title: string; type: string; imageUrl?: string | null } | null;
}

// Story circle for system messages, cases, or helpers
function StoryCircle({ name, image, isNew = true, type, onClick }: StoryCircleProps) {
  const isEmoji = image.length <= 2;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 shrink-0"
    >
      <div
        className={cn(
          "rounded-full p-0.5 size-16",
          isNew
            ? "bg-linear-to-tr from-sky-400 via-primary to-blue-500"
            : "bg-muted"
        )}
      >
        <div className="rounded-full bg-background p-0.5 size-full">
          {isEmoji ? (
            <div className="rounded-full bg-muted flex items-center justify-center size-14 text-xl">
              {image}
            </div>
          ) : (
            <img
              src={image}
              alt={name}
              className="rounded-full object-cover size-14"
            />
          )}
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground truncate max-w-16">
        {name}
      </span>
    </button>
  );
}

// Placeholder stories for empty state
const placeholderStories: Omit<StoryCircleProps, 'onClick'>[] = [
  { id: 'welcome', type: 'system', name: 'Welcome', image: '🎉', isNew: true },
  { id: 'how', type: 'system', name: 'How it works', image: '📖', isNew: true },
  { id: 'mission', type: 'system', name: 'Our Mission', image: '🐾', isNew: true },
];

interface HeroCirclesProps {
  heroes: TopHero[];
  isLoading?: boolean;
  className?: string;
}

// Skeleton for loading state
function HeroAvatarSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0 animate-pulse">
      <div className="size-16 rounded-full bg-muted" />
      <div className="w-10 h-3 rounded bg-muted" />
    </div>
  );
}

// Activity circle - shows recent activity from the feed
function ActivityCircle({
  activity,
  onClick
}: {
  activity: ActivityItem;
  onClick: () => void;
}) {
  const hasCase = !!activity.case;
  const hasUser = !!activity.user;
  const image = activity.case?.imageUrl || activity.user?.avatar;
  const name = activity.case?.title || activity.user?.name || 'Activity';
  const displayName = name.length > 8 ? name.slice(0, 7) + '…' : name;

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 shrink-0"
    >
      <div className="rounded-full p-0.5 bg-linear-to-tr from-sky-400 via-primary to-blue-500 size-16">
        <div className="rounded-full bg-background p-0.5 size-full">
          {image ? (
            <img
              src={image}
              alt={name}
              className="rounded-full object-cover size-14"
            />
          ) : (
            <div className="rounded-full bg-muted flex items-center justify-center size-14">
              <span className="text-lg">
                {hasCase ? '🐾' : hasUser ? name.charAt(0).toUpperCase() : '📢'}
              </span>
            </div>
          )}
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground truncate max-w-16">
        {displayName}
      </span>
    </button>
  );
}

export function HeroCircles({ heroes, isLoading, className }: HeroCirclesProps) {
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryGroup | null>(null);

  // Fetch recent activities for story circles
  const recentActivities = useQuery(api.activity.getRecentActivities, { limit: 10 });
  const isLoadingActivities = recentActivities === undefined;

  // Handle opening story viewer for a system story
  const handleSystemStoryClick = useCallback((storyId: string, name: string, emoji: string) => {
    setSelectedStoryGroup({
      id: storyId,
      name,
      avatar: undefined,
      type: 'system',
    });
    setStoryViewerOpen(true);
  }, []);

  // Handle opening story viewer for an activity
  const handleActivityClick = useCallback((activity: ActivityItem) => {
    if (activity.case) {
      // Open case stories
      setSelectedStoryGroup({
        id: `case-${activity.case.id}`,
        name: activity.case.title,
        avatar: activity.case.imageUrl ?? undefined,
        type: 'case',
        caseId: activity.case.id,
      });
    } else if (activity.user) {
      // Open user stories
      setSelectedStoryGroup({
        id: `user-${activity.user.id}`,
        name: activity.user.name,
        avatar: activity.user.avatar,
        type: 'user',
        userId: activity.user.id,
      });
    }
    setStoryViewerOpen(true);
  }, []);

  // Handle opening story viewer for a hero
  const handleHeroClick = useCallback((hero: TopHero) => {
    setSelectedStoryGroup({
      id: `hero-${hero.id}`,
      name: hero.name,
      avatar: hero.avatar,
      type: 'user',
      userId: hero.id as Id<"users">,
    });
    setStoryViewerOpen(true);
  }, []);

  const handleCloseStoryViewer = useCallback(() => {
    setStoryViewerOpen(false);
    setSelectedStoryGroup(null);
  }, []);

  const hasHeroes = heroes.length > 0;
  const hasActivities = recentActivities && recentActivities.length > 0;
  const showLoading = isLoading || isLoadingActivities;

  return (
    <>
      <div className={cn('overflow-x-auto scrollbar-hide', className)}>
        <div className="flex gap-3 px-4 py-3" style={{ width: 'max-content' }}>
          {/* Add Case Circle - Always first */}
          <AddCaseCircle />

          {/* Loading State */}
          {showLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <HeroAvatarSkeleton key={i} />
            ))
          ) : hasActivities ? (
            /* Recent activities when we have data */
            recentActivities.map((activity) => (
              <ActivityCircle
                key={activity.id}
                activity={activity}
                onClick={() => handleActivityClick(activity)}
              />
            ))
          ) : hasHeroes ? (
            /* Hero Avatars as fallback */
            heroes.map((hero) => (
              <HeroAvatar
                key={hero.id}
                id={hero.id}
                name={hero.name}
                avatar={hero.avatar}
                count={hero.animalsHelped}
                onClick={() => handleHeroClick(hero)}
              />
            ))
          ) : (
            /* Placeholder stories when no data */
            placeholderStories.map((story) => (
              <StoryCircle
                key={story.id}
                {...story}
                onClick={() => handleSystemStoryClick(story.id, story.name, story.image)}
              />
            ))
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      <StoryViewer
        isOpen={storyViewerOpen}
        onClose={handleCloseStoryViewer}
        storyGroup={selectedStoryGroup}
      />
    </>
  );
}

