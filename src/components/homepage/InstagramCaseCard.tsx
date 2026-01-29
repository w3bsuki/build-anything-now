import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, PawPrint } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useMutation } from 'convex/react';
import { AnimalCase } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    supporterAvatars?: (string | null)[];
    helperCount?: number;
    helperAvatars?: (string | null)[];
  };
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
  // Common words to skip when looking for a pet name
  const skipWords = ['a', 'an', 'the', 'meet', 'help', 'found', 'rescue', 'save', 'this'];
  const words = title.split(/[\s\-–—]+/).filter(w => w.length > 0);

  // Find the first word that looks like a name (capitalized, not in skip list)
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 2) continue;
    if (skipWords.includes(cleanWord.toLowerCase())) continue;
    if (/^[A-Z]/.test(cleanWord)) {
      return cleanWord.length > 12 ? cleanWord.slice(0, 12) : cleanWord;
    }
  }
  return 'them';
}

export function InstagramCaseCard({ caseData, className, socialStats }: InstagramCaseCardProps) {
  // Embla carousel for swipeable images
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  // Image loading states
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  // Convex ID for social features
  const caseId = caseData.id as Id<"cases">;

  const baseLiked = socialStats?.liked ?? false;
  const baseLikeCount = socialStats?.likeCount ?? 0;
  const commentCount = socialStats?.commentCount ?? 0;
  const supporterAvatars = socialStats?.supporterAvatars ?? [];
  const helperCount = socialStats?.helperCount ?? baseLikeCount;
  const helperAvatars = socialStats?.helperAvatars ?? supporterAvatars;

  // Only store the override; counts are derived from Convex state + the override delta.
  const [optimisticLikedOverride, setOptimisticLikedOverride] = useState<boolean | null>(null);

  const optimisticLiked = optimisticLikedOverride ?? baseLiked;
  const optimisticLikeCount =
    baseLikeCount + (optimisticLiked ? 1 : 0) - (baseLiked ? 1 : 0);

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
  const authorName = caseData.author?.name ?? 'Rescuer';
  const authorAvatar = caseData.author?.avatar;
  const progressPercent = Math.min(
    (caseData.fundraising.current / caseData.fundraising.goal) * 100,
    100
  );

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextLiked = !optimisticLiked;
    setOptimisticLikedOverride(nextLiked);

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    try {
      await toggleLike({ caseId });
    } catch (error) {
      // Revert on error
      setOptimisticLikedOverride(null);
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
        'group bg-card rounded-2xl overflow-hidden shadow-sm ring-1 ring-border/30 transition-all duration-300 hover:ring-border/50 hover:shadow-lg',
        className
      )}
    >
      {/* User Header - Instagram style with improved visuals */}
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <div className="flex items-center gap-3">
          {/* Animated avatar with gradient ring */}
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary via-pink-500 to-orange-400 rounded-full opacity-75 animate-pulse" />
            <div className="relative w-9 h-9 rounded-full bg-background ring-2 ring-background overflow-hidden flex items-center justify-center">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-sm font-bold text-primary">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground leading-tight">
                {authorName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium">{timeAgo}</span>
              <span className="text-muted-foreground/50">•</span>
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[140px] font-medium">
                {caseData.location.city}
              </span>
            </div>
          </div>
        </div>

        {/* More menu with improved touch target */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 -mr-2 rounded-full hover:bg-muted/80 active:bg-muted transition-colors">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Share this story
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2">
              <Link to={`/case/${caseData.id}`}>
                <PawPrint className="w-4 h-4" />
                View full story
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image Carousel with Status Badge - 3:2 aspect for compact layout */}
      <Link to={`/case/${caseData.id}`} className="block relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {hasMultipleImages ? (
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {caseData.images.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 h-full relative">
                    {/* Loading skeleton */}
                    {!imageLoaded[index] && !imageError[index] && (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <PawPrint className="w-10 h-10 text-muted-foreground/20 animate-pulse" />
                      </div>
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
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <PawPrint className="w-10 h-10 text-muted-foreground/20 animate-pulse" />
                </div>
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

      {/* Action Bar - compact social engagement */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="flex items-center">
          {/* Like - with animation */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full group hover:bg-destructive/10 active:bg-destructive/20 transition-all min-h-[44px]"
          >
            <Heart
              className={cn(
                'size-[22px] transition-all duration-200',
                optimisticLiked
                  ? 'fill-destructive text-destructive scale-110'
                  : 'text-muted-foreground group-hover:text-destructive group-hover:scale-110'
              )}
            />
            <span className={cn(
              "text-sm font-semibold transition-colors",
              optimisticLiked ? "text-destructive" : "text-muted-foreground group-hover:text-destructive"
            )}>{optimisticLikeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={handleComment}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full group hover:bg-primary/10 active:bg-primary/20 transition-all min-h-[44px]"
          >
            <MessageCircle className="size-[22px] text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
            <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              {commentCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center px-3 py-2 rounded-full group hover:bg-primary/10 active:bg-primary/20 transition-all min-h-[44px]"
          >
            <Share2 className="size-[22px] text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
          </button>
        </div>

        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-9 rounded-full px-4 font-semibold"
        >
          <Link to={`/case/${caseData.id}`}>Help {animalName}</Link>
        </Button>
      </div>

      {/* Content */}
      <div className="px-3.5 pb-2 space-y-1">
        {/* Title with hover effect */}
        <Link to={`/case/${caseData.id}`}>
          <h3 className="font-bold text-base text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            {caseData.title}
          </h3>
        </Link>
      </div>

      {/* Funding progress (compact) */}
      <div className="px-3.5 pb-3.5">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">
              {caseData.fundraising.current.toLocaleString()}
            </span>
            {' / '}
            {caseData.fundraising.goal.toLocaleString()} {caseData.fundraising.currency}
          </span>
          <span className="font-semibold text-foreground">
            {Math.round(progressPercent)}%
          </span>
        </div>

        {/* Social proof: supporters (currently based on likes; later can be donors/volunteers) */}
        {helperCount > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(3, helperCount) }).map((_, index) => {
                  const src = helperAvatars[index] ?? null;
                  return (
                    <Avatar key={index} className="h-6 w-6 border-2 border-background ring-1 ring-background">
                      {src ? <AvatarImage src={src} alt="" /> : null}
                      <AvatarFallback className="text-[10px] font-semibold">🐾</AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
              <span className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{helperCount}</span> helping
              </span>
            </div>
          </div>
        )}
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
