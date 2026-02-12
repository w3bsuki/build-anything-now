import { useCallback, useState } from 'react';
import { PawPrint } from 'lucide-react';
import { AddCaseCircle } from './HeroAvatar';
import { StoryViewer, type StoryGroup } from './StoryViewer';
import { cn } from '@/lib/utils';
import type { Id } from '../../../convex/_generated/dataModel';

export interface UrgentStoryCircleItem {
  id: string;
  type: string;
  caseId: string;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  timestamp: number;
  status: string;
}

interface HeroCirclesProps {
  stories: UrgentStoryCircleItem[];
  isLoading?: boolean;
  className?: string;
}

function HeroAvatarSkeleton() {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1 animate-pulse">
      <div className="size-14 rounded-full border border-border/55 bg-surface-sunken" />
      <div className="h-3 w-12 rounded bg-muted" />
    </div>
  );
}

function StoryCircle({ story, onClick }: { story: UrgentStoryCircleItem; onClick: () => void }) {
  const displayName = story.title.length > 11 ? `${story.title.slice(0, 10)}…` : story.title;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 flex-col items-center gap-1 rounded-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      )}
    >
      <div className="size-14 rounded-full border-2 border-primary/85 bg-surface p-0.5 ring-1 ring-background/90">
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={story.title}
            className="size-full rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center rounded-full bg-surface-sunken">
            <PawPrint className="size-5 text-muted-foreground/45" />
          </div>
        )}
      </div>
      <span className="w-14 line-clamp-1 text-center text-xs font-medium leading-none text-foreground/88">
        {displayName}
      </span>
    </button>
  );
}

export function HeroCircles({ stories, isLoading, className }: HeroCirclesProps) {
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState<StoryGroup | null>(null);

  const handleStoryClick = useCallback((story: UrgentStoryCircleItem) => {
    setSelectedStoryGroup({
      id: `case-${story.caseId}`,
      name: story.title,
      avatar: story.imageUrl ?? undefined,
      type: 'case',
      caseId: story.caseId as Id<'cases'>,
    });
    setStoryViewerOpen(true);
  }, []);

  const handleCloseStoryViewer = useCallback(() => {
    setStoryViewerOpen(false);
    setSelectedStoryGroup(null);
  }, []);

  return (
    <>
      <div className={cn('overflow-x-auto scrollbar-hide', className)}>
        <div className="flex w-max gap-3 px-4 py-2.5">
          <AddCaseCircle />

          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <HeroAvatarSkeleton key={i} />)
            : stories.map((story) => (
              <StoryCircle key={story.id} story={story} onClick={() => handleStoryClick(story)} />
            ))}
        </div>
      </div>

      <StoryViewer
        isOpen={storyViewerOpen}
        onClose={handleCloseStoryViewer}
        storyGroup={selectedStoryGroup}
      />
    </>
  );
}
