import { useTranslation } from 'react-i18next';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { 
  Heart,
  MessageSquare,
  Share2,
  UserPlus,
  Trophy,
  PawPrint,
  Home as HomeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type ActivityType = 'like' | 'comment' | 'share' | 'follow' | 'achievement' | 'adoption' | 'rescue';

interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar: string;
  };
  target?: {
    type: 'post' | 'user' | 'case';
    name: string;
    id: string;
  };
  timeAgo: string;
  preview?: string;
}

// Mock activity data
const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'like',
    user: { name: 'Мария Иванова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    target: { type: 'post', name: 'Luna found her forever home!', id: 'post-1' },
    timeAgo: '2 мин',
  },
  {
    id: '2',
    type: 'comment',
    user: { name: 'Ivan Georgiev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    target: { type: 'post', name: 'Помогнете на Барсик', id: 'post-2' },
    timeAgo: '15 мин',
    preview: 'Страхотна новина! Много се радвам за Luna 🎉',
  },
  {
    id: '3',
    type: 'follow',
    user: { name: 'Elena Dimitrova', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
    target: { type: 'user', name: 'Peter Todorov', id: 'user-3' },
    timeAgo: '1 час',
  },
  {
    id: '4',
    type: 'achievement',
    user: { name: 'Peter Todorov', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
    timeAgo: '2 часа',
    preview: 'Получи значката "Топ Доброволец" 🏆',
  },
  {
    id: '5',
    type: 'adoption',
    user: { name: 'Georgi Petrov', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
    target: { type: 'case', name: 'Luna', id: 'case-5' },
    timeAgo: '3 часа',
  },
  {
    id: '6',
    type: 'rescue',
    user: { name: 'Anna Koleva', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
    target: { type: 'case', name: 'Котенце от Витоша', id: 'case-6' },
    timeAgo: '5 часа',
  },
  {
    id: '7',
    type: 'share',
    user: { name: 'Мария Иванова', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
    target: { type: 'post', name: 'Спешен случай - куче в Люлин', id: 'post-7' },
    timeAgo: '6 часа',
  },
];

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'like':
      return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
    case 'comment':
      return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case 'share':
      return <Share2 className="w-4 h-4 text-green-500" />;
    case 'follow':
      return <UserPlus className="w-4 h-4 text-primary" />;
    case 'achievement':
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'adoption':
      return <HomeIcon className="w-4 h-4 text-purple-500" />;
    case 'rescue':
      return <PawPrint className="w-4 h-4 text-orange-500" />;
  }
};

const getActivityText = (item: ActivityItem, t: (key: string, options?: Record<string, string>) => string) => {
  switch (item.type) {
    case 'like':
      return t('community.activityLiked', { target: item.target?.name || '' });
    case 'comment':
      return t('community.activityCommented', { target: item.target?.name || '' });
    case 'share':
      return t('community.activityShared', { target: item.target?.name || '' });
    case 'follow':
      return t('community.activityFollowed', { target: item.target?.name || '' });
    case 'achievement':
      return item.preview || t('community.activityAchievement');
    case 'adoption':
      return t('community.activityAdopted', { target: item.target?.name || '' });
    case 'rescue':
      return t('community.activityRescued', { target: item.target?.name || '' });
  }
};

const CommunityActivity = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <MobilePageHeader
        title={t('community.activity')}
        showLogo
      />

      <div className="container mx-auto px-4 py-4">
        {/* Today's Activity */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">{t('community.today')}</h2>
          <div className="space-y-1">
            {mockActivity.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="relative">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                    {getActivityIcon(item.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{item.user.name}</span>
                    {' '}
                    <span className="text-muted-foreground">
                      {getActivityText(item, t)}
                    </span>
                  </div>
                  {item.preview && item.type === 'comment' && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                      "{item.preview}"
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earlier Activity */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">{t('community.earlier')}</h2>
          <div className="space-y-1">
            {mockActivity.slice(4).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="relative">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center shadow-sm border border-border">
                    {getActivityIcon(item.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{item.user.name}</span>
                    {' '}
                    <span className="text-muted-foreground">
                      {getActivityText(item, t)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {mockActivity.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('community.noActivity')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityActivity;
