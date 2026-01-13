import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FilterPills } from '@/components/FilterPills';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { mockVolunteers, mockCommunityPosts } from '@/data/mockData';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  MessageCircle, 
  Users, 
  Heart,
  Award,
  PawPrint,
  HandHeart,
  Calendar,
  ThumbsUp,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Star,
  Clock,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { CommunityPost } from '@/types';
import type { TFunction } from 'i18next';

type CommunityTab = 'feed' | 'volunteers' | 'members';
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
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedSort, setFeedSort] = useState<FeedSort>('newest');
  const [compactFeed, setCompactFeed] = useState(true);
  const isLoading = useSimulatedLoading(600);

  const tabOptions = [
    { id: 'feed', label: t('community.feed'), icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { id: 'volunteers', label: t('community.volunteers'), icon: <HandHeart className="w-3.5 h-3.5" /> },
    { id: 'members', label: t('community.members'), icon: <Users className="w-3.5 h-3.5" /> },
  ];

  const [membersSort, setMembersSort] = useState<FeedSort>('newest');

  const filteredVolunteers = mockVolunteers.filter((volunteer) => {
    const matchesSearch = !searchQuery || 
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
    <div className="min-h-screen pt-14 pb-20 md:pb-8 md:pt-16">
      {/* Search + Tabs */}
      <div className="sticky top-14 md:top-14 bg-background z-30 pt-3 pb-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeTab === 'feed' ? t('community.searchPosts') : t('community.searchVolunteers')}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tab Pills */}
          <FilterPills
            options={tabOptions}
            selected={activeTab}
            onSelect={(id) => setActiveTab(id as CommunityTab)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* Header row with Newest/Popular toggle */}
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
                <Label htmlFor="feed-sort-toggle" className="text-xs font-medium cursor-pointer whitespace-nowrap">
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
        )}

        {/* Volunteers Tab */}
        {activeTab === 'volunteers' && (
          <div className="space-y-4">
            {/* Top Volunteers Banner */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">{t('community.topVolunteersMonth')}</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {t('community.topVolunteersDesc')}
              </p>
              <div className="flex -space-x-2">
                {mockVolunteers.slice(0, 5).map((v, i) => (
                  <img
                    key={v.id}
                    src={v.avatar}
                    alt={v.name}
                    className="w-8 h-8 rounded-full border-2 border-background object-cover"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{mockVolunteers.length - 5}
                </div>
              </div>
            </div>

            {/* Volunteer Cards */}
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-muted" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-12 bg-muted rounded" />
                      <div className="h-12 bg-muted rounded" />
                      <div className="h-12 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVolunteers.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredVolunteers.map((volunteer) => (
                  <Link
                    key={volunteer.id}
                    to={`/volunteers/${volunteer.id}`}
                    className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <img
                          src={volunteer.avatar}
                          alt={volunteer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {volunteer.isTopVolunteer && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-warning-foreground fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground truncate">{volunteer.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-warning fill-warning" />
                          <span>{volunteer.rating.toFixed(1)}</span>
                          <span className="mx-1">·</span>
                          <span>Since {volunteer.memberSince}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{volunteer.bio}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-primary/5 rounded-lg py-2">
                        <PawPrint className="w-4 h-4 text-primary mx-auto mb-0.5" />
                        <span className="text-xs font-semibold text-foreground">{volunteer.stats.animalsHelped}</span>
                        <p className="text-[10px] text-muted-foreground">{t('partners.helped')}</p>
                      </div>
                      <div className="bg-accent/5 rounded-lg py-2">
                        <Heart className="w-4 h-4 text-accent mx-auto mb-0.5" />
                        <span className="text-xs font-semibold text-foreground">{volunteer.stats.adoptions}</span>
                        <p className="text-[10px] text-muted-foreground">{t('partners.adoptions')}</p>
                      </div>
                      <div className="bg-warning/5 rounded-lg py-2">
                        <Calendar className="w-4 h-4 text-warning mx-auto mb-0.5" />
                        <span className="text-xs font-semibold text-foreground">{volunteer.stats.campaigns}</span>
                        <p className="text-[10px] text-muted-foreground">Campaigns</p>
                      </div>
                    </div>

                    {/* Badges */}
                    {volunteer.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {volunteer.badges.slice(0, 3).map((badge) => (
                          <span
                            key={badge}
                            className="px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded-full"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {t('community.noVolunteers')}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">{t('community.communityMembers')}</h2>
              <span className="text-xs text-muted-foreground">(1,234)</span>
              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  id="members-sort-toggle"
                  checked={membersSort === 'top'}
                  onCheckedChange={(checked) => setMembersSort(checked ? 'top' : 'newest')}
                  className="scale-90"
                />
                <Label htmlFor="members-sort-toggle" className="text-xs font-medium cursor-pointer whitespace-nowrap">
                  {t('community.sortTop')}
                </Label>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-4 animate-pulse flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-3 w-24 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[...mockVolunteers, ...mockVolunteers].slice(0, 10).map((member, i) => (
                  <div
                    key={`${member.id}-${i}`}
                    className="bg-card rounded-xl p-3 border border-border flex items-center gap-3"
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-foreground truncate">{member.name}</span>
                        {i < 3 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                            {t('community.volunteer')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{t('community.memberSince')} {member.memberSince}</span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                      {t('actions.follow')}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
