import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, PawPrint } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useMutation, useQuery } from 'convex/react';
import { AnimalCase } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';
import { CommentsSheet } from './CommentsSheet';

interface InstagramCaseCardProps {
  caseData: AnimalCase;
  className?: string;
  socialStats?: {
    likeCount: number;
    commentCount: number;
    liked: boolean;
  };
}

// Generate deterministic counts based on case ID
function getHelpersCount(caseId: string): number {
  // Simple hash from ID to generate consistent number
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash << 5) - hash) + caseId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 26) + 5; // 5-30 helpers
}

function getLikeCount(caseId: string): number {
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash << 3) - hash) + caseId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 41) + 10; // 10-50 likes
}

function getCommentCount(caseId: string): number {
  let hash = 0;
  for (let i = 0; i < caseId.length; i++) {
    hash = ((hash << 2) - hash) + caseId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 15) + 1; // 1-15 comments
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

// Extract first name from case title for personalized CTA
function getAnimalName(title: string): string {
  // Try to extract a name (usually first word or word after "Meet")
  const words = title.split(' ');
  if (words[0].toLowerCase() === 'meet' && words[1]) {
    return words[1].replace(/[^a-zA-Z]/g, '');
  }
  // Return first word if it looks like a name (capitalized, not too long)
  if (words[0].length <= 12 && /^[A-Z]/.test(words[0])) {
    return words[0].replace(/[^a-zA-Z]/g, '');
  }
  return 'them';
}

export function InstagramCaseCard({ caseData, className, socialStats }: InstagramCaseCardProps) {
  const { t } = useTranslation();

  // Embla carousel for swipeable images
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  
  // Image loading states
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  // Convex ID for social features
  const caseId = caseData.id as Id<"cases">;

  // Fallback to deterministic counts if no social stats provided
  const fallbackLikeCount = useMemo(() => getLikeCount(caseData.id), [caseData.id]);
  const fallbackCommentCount = useMemo(() => getCommentCount(caseData.id), [caseData.id]);
  const helpersCount = useMemo(() => getHelpersCount(caseData.id), [caseData.id]);

  // Use real stats if available, otherwise fallback
  const [optimisticLiked, setOptimisticLiked] = useState(socialStats?.liked ?? false);
  const [optimisticLikeCount, setOptimisticLikeCount] = useState(
    socialStats?.likeCount ?? fallbackLikeCount
  );
  const commentCount = socialStats?.commentCount ?? fallbackCommentCount;

  // Convex mutations
  const toggleLike = useMutation(api.social.toggleLike);

  // Track carousel slide changes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Subscribe to carousel events
  useMemo(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const timeAgo = getTimeAgo(caseData.createdAt);
  const animalName = getAnimalName(caseData.title);
  const hasMultipleImages = caseData.images.length > 1;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const wasLiked = optimisticLiked;
    setOptimisticLiked(!wasLiked);
    setOptimisticLikeCount(prev => wasLiked ? prev - 1 : prev + 1);

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      await toggleLike({ caseId });
    } catch (error) {
      // Revert on error
      setOptimisticLiked(wasLiked);
      setOptimisticLikeCount(prev => wasLiked ? prev + 1 : prev - 1);
      toast({
        title: 'Error',
        description: 'Please sign in to like cases',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/case/${caseData.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: caseData.title,
          text: caseData.description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Share this case with others.',
      });
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentsOpen(true);
  };

  return (
    <article
      className={cn(
        'bg-card rounded-xl overflow-hidden border border-border/50',
        className
      )}
    >
      {/* User Header - Instagram style */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder - would be real user avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">🐾</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">
              Pawtreon
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              <span>•</span>
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[160px]">
                {caseData.location.city}
              </span>
            </div>
          </div>
        </div>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 -mr-1.5 rounded-full hover:bg-muted transition-colors">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/case/${caseData.id}`}>
                View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Carousel with Status Badge - 3:2 aspect for compact layout */}
      <Link to={`/case/${caseData.id}`} className="block relative">
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          {hasMultipleImages ? (
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {caseData.images.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
                    {/* Loading skeleton */}
                    {!imageLoaded[index] && !imageError[index] && (
                      <div className="absolute inset-0 animate-pulse bg-muted" />
                    )}
                    {/* Error fallback */}
                    {imageError[index] ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <PawPrint className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    ) : (
                      <img
                        src={image}
                        alt={`${caseData.title} - Image ${index + 1}`}
                        className={cn(
                          "w-full h-full object-cover transition-opacity duration-300",
                          !imageLoaded[index] && "opacity-0"
                        )}
                        loading={index === 0 ? "eager" : "lazy"}
                        onLoad={() => setImageLoaded(prev => ({ ...prev, [index]: true }))}
                        onError={() => setImageError(prev => ({ ...prev, [index]: true }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Loading skeleton */}
              {!imageLoaded[0] && !imageError[0] && (
                <div className="absolute inset-0 animate-pulse bg-muted" />
              )}
              {/* Error fallback */}
              {imageError[0] ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <PawPrint className="w-12 h-12 text-muted-foreground/30" />
                </div>
              ) : (
                <img
                  src={caseData.images[0]}
                  alt={caseData.title}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    !imageLoaded[0] && "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(prev => ({ ...prev, [0]: true }))}
                  onError={() => setImageError(prev => ({ ...prev, [0]: true }))}
                />
              )}
            </>
          )}

          {/* Gradient scrim for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={caseData.status} size="sm" />
          </div>

          {/* Image count indicator / dot indicators */}
          {hasMultipleImages && (
            <>
              {/* Slide counter - top right */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                {currentSlide + 1}/{caseData.images.length}
              </div>

              {/* Dot indicators - bottom center */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {caseData.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      emblaApi?.scrollTo(index);
                    }}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      index === currentSlide
                        ? "bg-white w-3"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Link>

      {/* Action Bar - Instagram style */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group"
          >
            <Heart
              className={cn(
                'w-6 h-6 transition-all',
                optimisticLiked
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'text-foreground group-hover:text-red-500'
              )}
            />
            <span className="text-sm font-medium">{optimisticLikeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={handleComment}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">
              {commentCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="group"
          >
            <Share2 className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2 space-y-1.5">
        {/* Title */}
        <Link to={`/case/${caseData.id}`}>
          <h3 className="font-semibold text-base text-foreground line-clamp-2 hover:underline">
            {caseData.title}
          </h3>
        </Link>

        {/* Description - truncated */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {caseData.description}
        </p>
      </div>

      {/* Funding Progress */}
      <div className="px-4 pb-2">
        <ProgressBar
          current={caseData.fundraising.current}
          goal={caseData.fundraising.goal}
          currency={caseData.fundraising.currency}
          layout="compact"
          size="md"
        />
      </div>

      {/* Single, focused CTA - drives donations */}
      <div className="px-4 pb-4">
        <Button
          asChild
          variant="default"
          className="w-full h-10 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90"
        >
          <Link to={`/case/${caseData.id}`}>
            <Heart className="w-4 h-4 mr-1.5 fill-current" />
            Help {animalName}
          </Link>
        </Button>
      </div>

      {/* Comments Bottom Sheet */}
      <CommentsSheet
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        caseId={caseId}
        caseTitle={caseData.title}
      />
    </article>
  );
}
