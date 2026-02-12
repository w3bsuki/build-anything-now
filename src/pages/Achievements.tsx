import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { ArrowLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '../../convex/_generated/api';

type AchievementRowItem = {
  _id: string;
  type: string;
  unlockedAt: number;
  title?: string;
  description?: string;
  icon?: string;
};

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function AchievementRow({ achievement }: { achievement: AchievementRowItem }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 min-h-[64px]">
      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-primary/10">
        {achievement.icon ?? '🏆'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm leading-tight truncate text-foreground">
            {achievement.title ?? achievement.type}
          </h3>
          <div className="shrink-0 w-4 h-4 rounded-full bg-success flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-success-foreground" strokeWidth={3} />
          </div>
        </div>
        {achievement.description ? (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {achievement.description}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(achievement.unlockedAt)}
        </p>
      </div>
    </div>
  );
}

const Achievements = () => {
  const { t } = useTranslation();
  const achievementsRaw = useQuery(api.achievements.getMyAchievements);
  const isLoading = achievementsRaw === undefined;
  const achievements = (achievementsRaw ?? []) as AchievementRowItem[];

  return (
    <div className="min-h-screen bg-background pb-8 md:pb-8 md:pt-16">
      <header className="sticky top-0 md:top-14 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            to="/account"
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-muted/80 active:bg-muted transition-colors"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground leading-tight">
              {t('achievements.title')}
            </h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="bg-surface-elevated rounded-2xl border border-border/60 shadow-xs p-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              🏆
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {isLoading ? '—' : achievements.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('achievements.unlocked', 'Unlocked')}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('achievements.subtitle', 'Your earned badges and milestones.')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 text-sm text-muted-foreground">{t('common.loading', 'Loading…')}</div>
      ) : achievements.length > 0 ? (
        <section>
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('achievements.unlocked', 'Unlocked')}
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {achievements.length}
            </span>
          </div>

          <div className="bg-card border-y border-border divide-y divide-border">
            {achievements
              .slice()
              .sort((a, b) => b.unlockedAt - a.unlockedAt)
              .map((achievement) => (
                <AchievementRow key={achievement._id} achievement={achievement} />
              ))}
          </div>
        </section>
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center text-3xl mb-4">
            🏆
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            {t('achievements.noAchievements', 'No achievements yet')}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('achievements.startHelping', 'Start helping animals to unlock achievements!')}
          </p>
          <Link
            to="/"
            className={cn(
              'inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors',
            )}
          >
            {t('achievements.exploreAnimals', 'Explore Animals')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Achievements;
