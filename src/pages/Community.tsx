import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { useTranslatedMockData } from '@/hooks/useTranslatedMockData';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Shield,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { CommunityPost } from '@/types';
import type { TFunction } from 'i18next';

type FeedSort = 'newest' | 'top';

const CommunityFeedPostCard = ({
  post,
  compact,
  t,
}: {
  post: CommunityPost;
  compact: boolean;
  t: TFunction;
}) => {
  const isRules = post.id === 'rules';

  return (
    <Link
      to={`/community/${post.id}`}
      className="block"
      aria-label={isRules ? t('community.rulesTitle') : t('community.openPost', { name: post.author.name })}
    >
      <article
        className={cn(
          'bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all',
          compact ? 'p-3' : 'p-4',
          isRules && 'border-primary/25 bg-primary/5'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className={cn('rounded-full object-cover', compact ? 'w-9 h-9' : 'w-10 h-10')}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-sm text-foreground truncate">{post.author.name}</span>
                {isRules ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary/15 text-primary rounded-full">
                    <Shield className="w-3 h-3" />
                    {t('community.rulesTitle')}
                  </span>
                ) : post.author.isVolunteer ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                    {t('community.volunteer')}
                  </span>
                ) : null}
                {isRules && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full">
                    {t('community.pinned')}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
            </div>
          </div>
          <button
            className="p-1.5 hover:bg-muted rounded-full transition-colors"
            onClick={(e) => e.preventDefault()}
            aria-label={t('community.more')}
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content + optional thumbnail */}
        <div className={cn('mt-2', compact ? 'mt-2' : 'mt-3')}>
          <div className={cn('flex gap-3', !compact && post.image ? 'items-start' : 'items-stretch')}>
            <div className="flex-1 min-w-0">
              {isRules && (
                <h3 className="text-sm font-semibold text-foreground mb-1">{t('community.rulesHeader')}</h3>
              )}
              <p
                className={cn(
                  'text-sm text-foreground leading-relaxed',
                  isRules ? 'whitespace-pre-line' : '',
                  compact ? 'line-clamp-3' : 'line-clamp-5'
                )}
              >
                {post.content}
              </p>
            </div>

            {!compact && post.image && !isRules && (
              <img
                src={post.image}
                alt=""
                className="w-24 h-24 rounded-lg object-cover border border-border shrink-0"
                loading="lazy"
              />
            )}
          </div>
        </div>

        {/* Actions (skip for rules) */}
        {!isRules && (
          <div className={cn('mt-3 flex items-center gap-4', compact ? 'pt-2 border-t border-border' : 'pt-3 border-t border-border')}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-medium">{post.likes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">{post.comments}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
        )}
      </article>
    </Link>
  );
};

const Community = () => {
  const { t } = useTranslation();
  const { mockCommunityPosts } = useTranslatedMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [feedSort, setFeedSort] = useState<FeedSort>('newest');
  const [compactFeed] = useState(true);
  const isLoading = useSimulatedLoading(600);

  const filteredPosts = mockCommunityPosts.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const rulesPost: CommunityPost = {
    id: 'rules',
    author: {
      id: 'system',
      name: t('app.name'),
      avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
      isVolunteer: false,
    },
    content: t('community.rulesSummary'),
    likes: 0,
    comments: 0,
    timeAgo: t('community.pinned'),
    createdAt: new Date().toISOString(),
  };

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (feedSort === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    const scoreA = a.likes + a.comments * 2;
    const scoreB = b.likes + b.comments * 2;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen pt-12 pb-20 md:pb-8 md:pt-16">
      {/* Search + Sort */}
      <div className="sticky top-12 md:top-14 bg-background z-30 pb-2 border-b border-border/50">
        <div className="container mx-auto px-4 space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input
              type="text"
              placeholder={t('community.searchPosts')}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-muted/80 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">
              {feedSort === 'newest' ? t('community.sortNewest') : t('community.sortTop')}
            </h2>
            {!isLoading && <span className="text-xs text-muted-foreground">({sortedPosts.length})</span>}
            <div className="flex items-center gap-2 ml-auto">
              <Switch
                id="feed-sort-toggle"
                checked={feedSort === 'top'}
                onCheckedChange={(checked) => setFeedSort(checked ? 'top' : 'newest')}
                className="scale-90"
              />
              <Label htmlFor="feed-sort-toggle" className="text-xs font-medium cursor-pointer whitespace-nowrap flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {t('community.sortTop')}
              </Label>
            </div>
          </div>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-3 w-16 bg-muted rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : sortedPosts.length > 0 ? (
            <>
              <CommunityFeedPostCard post={rulesPost} compact={compactFeed} t={t} />
              {sortedPosts.map((post) => (
                <CommunityFeedPostCard key={post.id} post={post} compact={compactFeed} t={t} />
              ))}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('community.noPosts')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
