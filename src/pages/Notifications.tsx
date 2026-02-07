import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bell, CheckCheck, Heart, Award, AlertCircle, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data - will be replaced with Convex data
const mockNotifications = [
  {
    id: '1',
    type: 'donation_received' as const,
    title: 'Donation Successful',
    message: 'Your donation of 50 EUR to Luna was received. Thank you for helping!',
    read: false,
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  },
  {
    id: '2',
    type: 'case_update' as const,
    title: 'Case Update: Luna',
    message: 'Great news! Luna completed her surgery successfully and is now recovering.',
    read: false,
    createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
  },
  {
    id: '3',
    type: 'achievement_unlocked' as const,
    title: 'Achievement Unlocked!',
    message: 'You earned the "Big Heart" badge for your generous donation!',
    read: true,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
  },
  {
    id: '4',
    type: 'campaign_ended' as const,
    title: 'Campaign Completed',
    message: 'The Winter Shelter campaign you supported has reached its goal!',
    read: true,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 1 week ago
  },
  {
    id: '5',
    type: 'system' as const,
    title: 'Welcome to Pawtreon!',
    message: 'Thank you for joining our community of animal lovers.',
    read: true,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 1 month ago
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'donation_received':
      return { icon: Heart, bg: 'bg-primary/10', color: 'text-primary' };
    case 'case_update':
      return { icon: AlertCircle, bg: 'bg-primary/10', color: 'text-primary' };
    case 'achievement_unlocked':
      return { icon: Award, bg: 'bg-accent/10', color: 'text-accent-foreground' };
    case 'campaign_ended':
      return { icon: Megaphone, bg: 'bg-success/10', color: 'text-success' };
    default:
      return { icon: Bell, bg: 'bg-muted', color: 'text-muted-foreground' };
  }
};

const formatTimeAgo = (timestamp: number, t: (key: string, options?: Record<string, unknown>) => string) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return t('time.justNow');
  if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
  if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });
  
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const Notifications = () => {
  const { t } = useTranslation();
  // TODO: Replace with useQuery(api.notifications.getMyNotifications)
  const notifications = mockNotifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    // TODO: Implement with useMutation(api.notifications.markAllAsRead)
    console.log('Mark all read');
  };

  const handleMarkRead = (id: string) => {
    // TODO: Implement with useMutation(api.notifications.markAsRead)
    console.log('Mark read', id);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('notifications.title')}</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? t('notifications.unread', { count: unreadCount }) : t('notifications.allCaughtUp')}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              {t('actions.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const { icon: Icon, bg, color } = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => !notification.read && handleMarkRead(notification.id)}
                    className={cn(
                      "bg-card rounded-xl border border-border p-4 flex items-start gap-3 cursor-pointer transition-colors",
                      !notification.read && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", bg)}>
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "font-medium text-foreground",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(notification.createdAt, t)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">{t('notifications.noNotifications')}</p>
              <p className="text-muted-foreground text-xs mt-1">{t('notifications.willNotify')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Notifications;
