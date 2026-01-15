import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Users } from 'lucide-react';
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

interface InstagramCaseCardProps {
  caseData: AnimalCase;
  className?: string;
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

export function InstagramCaseCard({ caseData, className }: InstagramCaseCardProps) {
  const { t } = useTranslation();
  
  // Memoize counts based on case ID for consistency
  const initialLikeCount = useMemo(() => getLikeCount(caseData.id), [caseData.id]);
  const helpersCount = useMemo(() => getHelpersCount(caseData.id), [caseData.id]);
  const commentCount = useMemo(() => getCommentCount(caseData.id), [caseData.id]);
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  
  const timeAgo = getTimeAgo(caseData.createdAt);
  const animalName = getAnimalName(caseData.title);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
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
    // Navigate to case detail with comments section focused
    window.location.href = `/case/${caseData.id}#comments`;
  };

  return (
    <article
      className={cn(
        'bg-card rounded-xl overflow-hidden border border-border/50',
        className
      )}
    >
      {/* User Header - Instagram style */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Avatar placeholder - would be real user avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">🐾</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">
              Pawtreon
            </span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{timeAgo}</span>
              <span>•</span>
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">
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

      {/* Image with Status Badge - 16:9 on mobile, square on tablet+ */}
      <Link to={`/case/${caseData.id}`} className="block relative">
        <div className="relative aspect-video sm:aspect-square overflow-hidden bg-muted">
          <img
            src={caseData.images[0]}
            alt={caseData.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient scrim for badge visibility */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <StatusBadge status={caseData.status} size="sm" />
          </div>
          
          {/* Image count indicator if multiple images */}
          {caseData.images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              1/{caseData.images.length}
            </div>
          )}
        </div>
      </Link>

      {/* Action Bar - Instagram style */}
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <div className="flex items-center gap-3">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 group"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-all',
                isLiked
                  ? 'fill-red-500 text-red-500 scale-110'
                  : 'text-foreground group-hover:text-red-500'
              )}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={handleComment}
            className="flex items-center gap-1 group"
          >
            <MessageCircle className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            <span className="text-sm font-medium">
              {commentCount}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="group"
          >
            <Share2 className="w-4.5 h-4.5 text-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-2.5 pb-1.5 space-y-1">
        {/* Title */}
        <Link to={`/case/${caseData.id}`}>
          <h3 className="font-semibold text-sm text-foreground line-clamp-1 hover:underline">
            {caseData.title}
          </h3>
        </Link>

        {/* Description - truncated */}
        <p className="text-xs text-muted-foreground line-clamp-1">
          {caseData.description}
        </p>

        {/* Social Proof - Helpers count */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          <span>
            <span className="font-medium text-foreground">{helpersCount}</span> helping
          </span>
        </div>
      </div>

      {/* Funding Progress */}
      <div className="px-2.5 pb-1.5">
        <ProgressBar
          current={caseData.fundraising.current}
          goal={caseData.fundraising.goal}
          currency={caseData.fundraising.currency}
          layout="compact"
          size="sm"
        />
      </div>

      {/* CTA Button - Social proof style */}
      <div className="px-2.5 pb-2.5">
        <Button
          asChild
          variant="default"
          className="w-full h-9 rounded-lg font-semibold text-xs bg-primary hover:bg-primary/90"
        >
          <Link to={`/case/${caseData.id}`}>
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Join {helpersCount} • Help {animalName}
          </Link>
        </Button>
      </div>
    </article>
  );
}
