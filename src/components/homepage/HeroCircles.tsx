import { useState, useCallback } from 'react';
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
    <div className="flex flex-col items-center gap-1 shrink-0 animate-pulse">
      <div className="size-16 rounded-full bg-muted" />
      <div className="w-12 h-3 rounded bg-muted" />
    </div>
  );
}

function StoryCircle({
  story,
  onClick,
}: {
  story: UrgentStoryCircleItem;
  onClick: () => void;
}) {
  const displayName = story.title.length > 11 ? `${story.title.slice(0, 10)}…` : story.title;

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 shrink-0">
      <div className="size-16 rounded-full border-2 border-primary/45 bg-surface-elevated p-0.5">
        {story.imageUrl ? (
          <img
            src={story.imageUrl}
            alt={story.title}
            className="size-full rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="size-full rounded-full bg-muted flex items-center justify-center text-lg">
            🐾
          </div>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground text-center line-clamp-1 w-16">
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
        <div className="flex gap-3 px-4 py-3" style={{ width: 'max-content' }}>
          <AddCaseCircle />

          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <HeroAvatarSkeleton key={i} />)
          ) : stories.length > 0 ? (
            stories.map((story) => (
              <StoryCircle key={story.id} story={story} onClick={() => handleStoryClick(story)} />
            ))
          ) : (
            <div className="flex items-center h-16 text-sm text-muted-foreground px-2">
              No urgent stories yet
            </div>
          )}
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
