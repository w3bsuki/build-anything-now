import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import {
  Heart,
  MessageSquare,
  UserPlus,
  Trophy,
  PawPrint,
  Home as HomeIcon,
  Bell,
} from 'lucide-react';
import { api } from '../../convex/_generated/api';

type ActivityViewItem = {
  id: string;
  type: string;
  userName: string;
  avatar?: string;
  text: string;
  timeAgo: string;
};

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'donation':
      return <Heart className="w-4 h-4 text-destructive fill-destructive" />;
    case 'case_update':
      return <MessageSquare className="w-4 h-4 text-primary" />;
    case 'adoption':
      return <HomeIcon className="w-4 h-4 text-adopted" />;
    case 'volunteer_signup':
      return <UserPlus className="w-4 h-4 text-primary" />;
    case 'milestone':
      return <Trophy className="w-4 h-4 text-warning" />;
    case 'case_created':
      return <PawPrint className="w-4 h-4 text-urgent" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

const CommunityActivity = () => {
  const { t } = useTranslation();
  const rawActivities = useQuery(api.activity.getRecentActivities, { limit: 24 });
  const isLoading = rawActivities === undefined;

  const items = useMemo<ActivityViewItem[]>(() => {
    if (!rawActivities) return [];
    return rawActivities.map((activity) => {
      const userName = activity.user?.name ?? t('app.name', 'Pawtreon');
      const caseTitle = activity.case?.title ?? '';

      let text = t('community.activitySystem', 'posted an update');
      switch (activity.type) {
        case 'donation':
          text = t('community.activityDonated', 'donated to {{target}}', { target: caseTitle || t('community.aCase', 'a case') });
          break;
        case 'case_update':
          text = t('community.activityUpdated', 'updated {{target}}', { target: caseTitle || t('community.aCase', 'a case') });
          break;
        case 'adoption':
          text = t('community.activityAdopted', 'shared an adoption update');
          break;
        case 'volunteer_signup':
          text = t('community.activityVolunteer', 'joined as a volunteer');
          break;
        case 'case_created':
          text = t('community.activityCreated', 'created a new rescue case');
          break;
        case 'milestone':
          text = t('community.activityMilestone', 'shared a milestone');
          break;
        case 'system_announcement':
          text = t('community.activityAnnouncement', 'posted an announcement');
          break;
      }

      return {
        id: activity.id,
        type: activity.type,
        userName,
        avatar: activity.user?.avatar ?? activity.case?.imageUrl ?? undefined,
        text,
        timeAgo: timeAgo(activity.timestamp),
      };
    });
  }, [rawActivities, t]);

  const todayItems = items.slice(0, 8);
  const olderItems = items.slice(8);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        <h2 className="mb-4 text-base font-semibold text-foreground">{t('community.activity')}</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <section className="mb-6">
              <h2 className="text-sm font-semibold text-foreground mb-3">{t('community.today')}</h2>
              <div className="space-y-1">
                {todayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                            {item.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border">
                        {getActivityIcon(item.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{item.userName}</span>{' '}
                        <span className="text-muted-foreground">{item.text}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {olderItems.length > 0 ? (
              <section>
                <h2 className="text-sm font-semibold text-foreground mb-3">{t('community.earlier')}</h2>
                <div className="space-y-1">
                  {olderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                          {item.avatar ? (
                            <img src={item.avatar} alt={item.userName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-muted-foreground">
                              {item.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center border border-border">
                          {getActivityIcon(item.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-foreground">
                          <span className="font-medium">{item.userName}</span>{' '}
                          <span className="text-muted-foreground">{item.text}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {items.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {t('community.noActivity')}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityActivity;
