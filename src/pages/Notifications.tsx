import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Bell, CheckCheck, Heart, Award, AlertCircle, Megaphone, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackAnalytics } from '@/lib/analytics';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

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

const formatTimeAgo = (
  timestamp: number,
  t: (key: string, options?: Record<string, unknown>) => string,
  locale: string,
) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return t('time.justNow');
  if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
  if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });
  
  return new Date(timestamp).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
};

const Notifications = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const notifications = useQuery(api.notifications.getMyNotifications);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const remove = useMutation(api.notifications.remove);

  const unreadCount = (notifications ?? []).filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllAsRead({});
  };

  const handleMarkRead = async (id: Id<'notifications'>) => {
    await markAsRead({ id });
  };

  const handleOpen = async (notification: {
    _id: Id<'notifications'>;
    type: string;
    read: boolean;
    caseId?: Id<'cases'> | undefined;
  }) => {
    if (!notification.read) {
      await handleMarkRead(notification._id);
    }

    trackAnalytics('notification_opened', {
      notificationId: String(notification._id),
      type: notification.type,
      hasCaseId: Boolean(notification.caseId),
    });

    if (notification.caseId) {
      navigate(`/case/${notification.caseId}`);
      return;
    }

    if (notification.type === 'achievement_unlocked') {
      navigate('/achievements');
      return;
    }

    if (notification.type === 'campaign_ended') {
      navigate('/campaigns');
    }
  };

  const handleRemove = async (id: Id<'notifications'>) => {
    await remove({ id });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-nav-surface/95 backdrop-blur-md border-b border-nav-border/70">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/account"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-sunken hover:bg-surface-sunken/90 transition-colors"
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
          {notifications === undefined ? (
            <div className="text-sm text-muted-foreground">{t('common.loading', 'Loading…')}</div>
          ) : notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const { icon: Icon, bg, color } = getNotificationIcon(notification.type);
                
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleOpen(notification)}
                    className={cn(
                      "bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-4 flex items-start gap-3 cursor-pointer transition-colors",
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
                          {formatTimeAgo(notification.createdAt, t, i18n.language)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="w-9 h-9 -mr-1 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleRemove(notification._id);
                      }}
                      aria-label={t('actions.remove', 'Remove')}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
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
