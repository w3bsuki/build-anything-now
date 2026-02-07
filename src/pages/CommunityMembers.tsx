import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Trophy,
  Heart,
  Clock,
  Star,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for community members
const mockMembers = [
  {
    id: '1',
    name: 'Мария Иванова',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    joinedDate: '2024-03',
    animalsHelped: 47,
    postsCount: 23,
    isTopVolunteer: true,
    badge: 'gold',
  },
  {
    id: '2', 
    name: 'Ivan Georgiev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    joinedDate: '2024-06',
    animalsHelped: 31,
    postsCount: 15,
    isTopVolunteer: true,
    badge: 'silver',
  },
  {
    id: '3',
    name: 'Peter Todorov',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    joinedDate: '2024-08',
    animalsHelped: 24,
    postsCount: 12,
    isTopVolunteer: false,
    badge: 'bronze',
  },
  {
    id: '4',
    name: 'Elena Dimitrova',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    joinedDate: '2024-09',
    animalsHelped: 18,
    postsCount: 8,
    isTopVolunteer: false,
    badge: null,
  },
  {
    id: '5',
    name: 'Georgi Petrov',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    joinedDate: '2024-10',
    animalsHelped: 12,
    postsCount: 6,
    isTopVolunteer: false,
    badge: null,
  },
  {
    id: '6',
    name: 'Anna Koleva',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    joinedDate: '2024-11',
    animalsHelped: 8,
    postsCount: 4,
    isTopVolunteer: false,
    badge: null,
  },
];

const getBadgeColor = (badge: string | null) => {
  switch (badge) {
    case 'gold':
      return 'border-warning/40 bg-warning/15 text-warning-foreground';
    case 'silver':
      return 'border-border bg-muted text-foreground';
    case 'bronze':
      return 'border-urgent/35 bg-urgent/15 text-urgent';
    default:
      return '';
  }
};

const CommunityMembers = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = mockMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('bg-BG', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <section className="mb-4 space-y-2">
          <h2 className="text-base font-semibold text-foreground">{t('community.members')}</h2>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-foreground/50" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('community.searchMembers')}
              className="w-full rounded-full border border-search-border bg-search-bg pl-10 pr-4 py-2 text-base font-normal text-foreground placeholder:text-muted-foreground/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-sm"
            />
          </div>
        </section>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <div className="text-2xl font-bold text-primary">{mockMembers.length}</div>
            <div className="text-xs text-muted-foreground">{t('community.totalMembers')}</div>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <div className="text-2xl font-bold text-success">
              {mockMembers.reduce((acc, m) => acc + m.animalsHelped, 0)}
            </div>
            <div className="text-xs text-muted-foreground">{t('community.animalsHelped')}</div>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <div className="text-2xl font-bold text-accent">
              {mockMembers.filter(m => m.isTopVolunteer).length}
            </div>
            <div className="text-xs text-muted-foreground">{t('community.topVolunteers')}</div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-warning" />
            <h2 className="font-semibold text-foreground">{t('community.leaderboard')}</h2>
          </div>
          
          <div className="space-y-2">
            {filteredMembers.slice(0, 3).map((member, index) => (
              <div
                key={member.id}
                className={cn(
                  'flex items-center gap-3 p-3 bg-card rounded-xl border',
                  index === 0 && 'border-warning/35 bg-warning/10',
                  index === 1 && 'border-border bg-muted/60',
                  index === 2 && 'border-urgent/35 bg-urgent/10'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 && 'bg-warning text-warning-foreground',
                  index === 1 && 'bg-secondary text-secondary-foreground',
                  index === 2 && 'bg-urgent text-urgent-foreground'
                )}>
                  {index + 1}
                </div>
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{member.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {member.animalsHelped}
                    </span>
                  </div>
                </div>
                {member.badge && (
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium border',
                    getBadgeColor(member.badge)
                  )}>
                    <Star className="w-3 h-3 inline mr-1" />
                    {member.badge}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* All Members */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground">{t('community.allMembers')}</h2>
            <span className="text-xs text-muted-foreground">({filteredMembers.length})</span>
          </div>
          
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{member.name}</span>
                    {member.isTopVolunteer && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        {t('community.volunteer')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatJoinDate(member.joinedDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {member.animalsHelped}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('community.noMembersFound')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityMembers;
