import { HeroAvatar, AddCaseCircle } from './HeroAvatar';
import { cn } from '@/lib/utils';

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

// Story circle for system messages, cases, or helpers
function StoryCircle({ name, image, isNew = true, type, onClick }: StoryCircleProps) {
  const isEmoji = image.length <= 2;
  const size = 52;

  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0"
    >
      <div
        className={cn(
          "rounded-full p-[2px]",
          isNew
            ? "bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500"
            : "bg-muted"
        )}
        style={{ width: size + 4, height: size + 4 }}
      >
        <div className="rounded-full bg-background p-[2px] w-full h-full">
          {isEmoji ? (
            <div
              className="rounded-full bg-muted flex items-center justify-center w-full h-full text-xl"
              style={{ width: size - 4, height: size - 4 }}
            >
              {image}
            </div>
          ) : (
            <img
              src={image}
              alt={name}
              className="rounded-full object-cover w-full h-full"
              style={{ width: size - 4, height: size - 4 }}
            />
          )}
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground truncate max-w-[56px]">
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
    <div className="flex flex-col items-center gap-1 flex-shrink-0 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-muted" />
      <div className="w-10 h-3 rounded bg-muted" />
      <div className="w-8 h-3 rounded bg-muted" />
    </div>
  );
}

export function HeroCircles({ heroes, isLoading, className }: HeroCirclesProps) {
  const hasHeroes = heroes.length > 0;

  return (
    <div className={cn('overflow-x-auto scrollbar-hide', className)}>
      <div className="flex gap-3 px-4 py-3" style={{ width: 'max-content' }}>
        {/* Add Case Circle - Always first */}
        <AddCaseCircle />

        {/* Loading State */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <HeroAvatarSkeleton key={i} />
          ))
        ) : hasHeroes ? (
          /* Hero Avatars when we have data */
          heroes.map((hero) => (
            <HeroAvatar
              key={hero.id}
              id={hero.id}
              name={hero.name}
              avatar={hero.avatar}
              count={hero.animalsHelped}
            />
          ))
        ) : (
          /* Placeholder stories when no heroes yet */
          placeholderStories.map((story) => (
            <StoryCircle
              key={story.id}
              {...story}
            />
          ))
        )}
      </div>
    </div>
  );
}

