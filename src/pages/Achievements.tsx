import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Lock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Achievement definitions with progress tracking
const allAchievements = [
  {
    type: 'first_donation',
    titleKey: 'achievements.firstSteps',
    descriptionKey: 'achievements.firstStepsDesc',
    icon: '🎉',
    tier: 'bronze' as const,
    unlocked: true,
    unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    xp: 100,
  },
  {
    type: 'big_heart',
    titleKey: 'achievements.bigHeart',
    descriptionKey: 'achievements.bigHeartDesc',
    icon: '💖',
    tier: 'silver' as const,
    unlocked: true,
    unlockedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    xp: 250,
  },
  {
    type: 'helped_10',
    titleKey: 'achievements.helpingHand',
    descriptionKey: 'achievements.helpingHandDesc',
    icon: '🐾',
    tier: 'silver' as const,
    unlocked: true,
    unlockedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    xp: 500,
  },
  {
    type: 'monthly_donor',
    titleKey: 'achievements.monthlyHero',
    descriptionKey: 'achievements.monthlyHeroDesc',
    icon: '📅',
    tier: 'gold' as const,
    unlocked: false,
    progress: { current: 2, total: 3 },
    xp: 750,
  },
  {
    type: 'helped_50',
    titleKey: 'achievements.animalGuardian',
    descriptionKey: 'achievements.animalGuardianDesc',
    icon: '🛡️',
    tier: 'gold' as const,
    unlocked: false,
    progress: { current: 12, total: 50 },
    xp: 1000,
  },
  {
    type: 'helped_100',
    titleKey: 'achievements.legend',
    descriptionKey: 'achievements.legendDesc',
    icon: '👑',
    tier: 'platinum' as const,
    unlocked: false,
    progress: { current: 12, total: 100 },
    xp: 2500,
  },
  {
    type: 'early_supporter',
    titleKey: 'achievements.earlySupporter',
    descriptionKey: 'achievements.earlySupporterDesc',
    icon: '⭐',
    tier: 'platinum' as const,
    unlocked: false,
    xp: 500,
  },
  {
    type: 'community_hero',
    titleKey: 'achievements.communityHero',
    descriptionKey: 'achievements.communityHeroDesc',
    icon: '🦸',
    tier: 'gold' as const,
    unlocked: false,
    progress: { current: 3, total: 10 },
    xp: 1500,
  },
];

// Compact Achievement Row - Twitter list item style
interface AchievementRowProps {
  achievement: typeof allAchievements[0];
  formatDate: (timestamp: number) => string;
  t: (key: string, options?: Record<string, unknown>) => string;
}

function AchievementRow({ achievement, formatDate, t }: AchievementRowProps) {
  const progressPercent = achievement.progress 
    ? (achievement.progress.current / achievement.progress.total) * 100 
    : 0;
  
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 min-h-[64px] transition-colors',
        achievement.unlocked 
          ? 'active:bg-muted/50' 
          : 'opacity-70'
      )}
    >
      {/* Emoji Icon */}
      <div 
        className={cn(
          'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl',
          achievement.unlocked ? 'bg-primary/10' : 'bg-muted grayscale'
        )}
      >
        {achievement.icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            'font-semibold text-sm leading-tight truncate',
            achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {t(achievement.titleKey)}
          </h3>
          {achievement.unlocked && (
            <div className="shrink-0 w-4 h-4 rounded-full bg-success flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-success-foreground" strokeWidth={3} />
            </div>
          )}
        </div>
        
        {/* Progress or Date */}
        {achievement.unlocked && achievement.unlockedAt ? (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(achievement.unlockedAt)} · +{achievement.xp} XP
          </p>
        ) : achievement.progress ? (
          <div className="flex items-center gap-2 mt-1.5">
            <Progress value={progressPercent} className="h-1 flex-1 bg-muted" />
            <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
              {achievement.progress.current}/{achievement.progress.total}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            🏆 {achievement.xp} XP
          </p>
        )}
      </div>
      
      {/* Lock icon for locked achievements */}
      {!achievement.unlocked && (
        <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
      )}
    </div>
  );
}

const Achievements = () => {
  const { t } = useTranslation();
  // TODO: Replace with useQuery(api.achievements.getMyAchievements)
  const unlockedAchievements = allAchievements.filter((a) => a.unlocked);
  const lockedAchievements = allAchievements.filter((a) => !a.unlocked);
  const unlockedCount = unlockedAchievements.length;
  const totalXP = unlockedAchievements.reduce((sum, a) => sum + a.xp, 0);
  const progressPercent = (unlockedCount / allAchievements.length) * 100;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8 md:pb-8 md:pt-16">
      {/* Twitter-Style Sticky Header */}
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

      {/* Compact Stats Overview */}
      <div className="px-4 py-4">
        <div className="bg-card rounded-xl border border-border p-4">
          {/* Progress + Stats in one row */}
          <div className="flex items-center gap-4">
            {/* Trophy emoji */}
            <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              🏆
            </div>
            
            {/* Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {unlockedCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {allAchievements.length} {t('achievements.unlocked').toLowerCase()}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2">
                <Progress value={progressPercent} className="h-1.5 bg-muted" />
              </div>
            </div>
            
            {/* XP badge */}
            <div className="shrink-0 text-right">
              <span className="text-lg font-bold text-primary tabular-nums">{totalXP}</span>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">XP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('achievements.unlocked')}
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {unlockedAchievements.length}
            </span>
          </div>
          
          <div className="bg-card border-y border-border divide-y divide-border">
            {unlockedAchievements.map((achievement) => (
              <AchievementRow
                key={achievement.type}
                achievement={achievement}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </div>
        </section>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('achievements.locked')}
            </h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {lockedAchievements.length}
            </span>
          </div>
          
          <div className="bg-card border-y border-border divide-y divide-border">
            {lockedAchievements.map((achievement) => (
              <AchievementRow
                key={achievement.type}
                achievement={achievement}
                formatDate={formatDate}
                t={t}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {allAchievements.length === 0 && (
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
            className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            {t('achievements.exploreAnimals', 'Explore Animals')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Achievements;
