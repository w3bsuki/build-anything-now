import { useState } from 'react';
import { FilterPills } from '@/components/FilterPills';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { mockVolunteers, mockCommunityPosts } from '@/data/mockData';
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
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type CommunityTab = 'feed' | 'volunteers' | 'members';

const tabOptions = [
  { id: 'feed', label: 'Feed', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { id: 'volunteers', label: 'Volunteers', icon: <HandHeart className="w-3.5 h-3.5" /> },
  { id: 'members', label: 'Members', icon: <Users className="w-3.5 h-3.5" /> },
];

const Community = () => {
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

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

  return (
    <div className="min-h-screen pt-12 pb-20 md:pb-8 md:pt-16">
      {/* Search + Tabs */}
      <div className="sticky top-12 md:top-14 bg-background z-30 pt-3 pb-3 border-b border-border">
        <div className="container mx-auto px-4 space-y-2.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={activeTab === 'feed' ? 'Search posts...' : 'Search volunteers...'}
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
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Link to={`/community/${post.id}`} key={post.id} className="block">
                <article className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-md transition-all">
                  {/* Post Header */}
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm text-foreground">{post.author.name}</span>
                            {post.author.isVolunteer && (
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                                Volunteer
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-muted rounded-full transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full aspect-video object-cover"
                    />
                  )}

                  {/* Post Actions */}
                  <div className="p-4 pt-3 flex items-center gap-4 border-t border-border">
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
                </article>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No posts found
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
                <h3 className="font-semibold text-foreground">Top Volunteers This Month</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                These amazing people have made the biggest impact!
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
                        <p className="text-[10px] text-muted-foreground">Helped</p>
                      </div>
                      <div className="bg-accent/5 rounded-lg py-2">
                        <Heart className="w-4 h-4 text-accent mx-auto mb-0.5" />
                        <span className="text-xs font-semibold text-foreground">{volunteer.stats.adoptions}</span>
                        <p className="text-[10px] text-muted-foreground">Adoptions</p>
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
                No volunteers found
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">Community Members</h2>
              <span className="text-xs text-muted-foreground">(1,234)</span>
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
                            Volunteer
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">Member since {member.memberSince}</span>
                    </div>
                    <button className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                      Follow
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
