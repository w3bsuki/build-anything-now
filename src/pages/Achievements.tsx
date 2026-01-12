import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Award, Lock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Achievement definitions with progress tracking
const allAchievements = [
  {
    type: 'first_donation',
    titleKey: 'achievements.firstSteps',
    descriptionKey: 'achievements.firstStepsDesc',
    icon: '🎉',
    unlocked: true,
    unlockedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  },
  {
    type: 'big_heart',
    titleKey: 'achievements.bigHeart',
    descriptionKey: 'achievements.bigHeartDesc',
    icon: '💖',
    unlocked: true,
    unlockedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
  },
  {
    type: 'helped_10',
    titleKey: 'achievements.helpingHand',
    descriptionKey: 'achievements.helpingHandDesc',
    icon: '🐾',
    unlocked: true,
    unlockedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
  },
  {
    type: 'monthly_donor',
    titleKey: 'achievements.monthlyHero',
    descriptionKey: 'achievements.monthlyHeroDesc',
    icon: '📅',
    unlocked: false,
    progress: { current: 2, total: 3 },
  },
  {
    type: 'helped_50',
    titleKey: 'achievements.animalGuardian',
    descriptionKey: 'achievements.animalGuardianDesc',
    icon: '🛡️',
    unlocked: false,
    progress: { current: 12, total: 50 },
  },
  {
    type: 'helped_100',
    titleKey: 'achievements.legend',
    descriptionKey: 'achievements.legendDesc',
    icon: '👑',
    unlocked: false,
    progress: { current: 12, total: 100 },
  },
  {
    type: 'early_supporter',
    titleKey: 'achievements.earlySupporter',
    descriptionKey: 'achievements.earlySupporterDesc',
    icon: '⭐',
    unlocked: false,
  },
  {
    type: 'community_hero',
    titleKey: 'achievements.communityHero',
    descriptionKey: 'achievements.communityHeroDesc',
    icon: '🦸',
    unlocked: false,
    progress: { current: 3, total: 10 },
  },
];

const Achievements = () => {
  const { t } = useTranslation();
  // TODO: Replace with useQuery(api.achievements.getMyAchievements)
  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8 md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/profile"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">{t('achievements.title')}</h1>
            <p className="text-xs text-muted-foreground">{unlockedCount} {t('common.of')} {allAchievements.length} {t('achievements.unlocked').toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-accent/10 via-card to-primary/5 rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-3xl">
                🏆
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{unlockedCount}/{allAchievements.length}</p>
                <p className="text-sm text-muted-foreground">{t('achievements.achievementsUnlocked')}</p>
                <div className="w-32 h-2 bg-muted rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(unlockedCount / allAchievements.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unlocked Achievements */}
      <section className="py-2">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            {t('achievements.unlocked')}
          </h2>
          
          <div className="grid gap-3">
            {allAchievements.filter(a => a.unlocked).map((achievement) => (
              <div
                key={achievement.type}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t(achievement.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(achievement.descriptionKey)}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-success mt-1">
                      {t('achievements.unlockedOn', { date: formatDate(achievement.unlockedAt) })}
                    </p>
                  )}
                </div>
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locked Achievements */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            {t('achievements.locked')}
          </h2>
          
          <div className="grid gap-3">
            {allAchievements.filter(a => !a.unlocked).map((achievement) => (
              <div
                key={achievement.type}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 opacity-75"
              >
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl grayscale">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{t(achievement.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(achievement.descriptionKey)}</p>
                  {achievement.progress && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>{t('achievements.progress')}</span>
                        <span>{achievement.progress.current}/{achievement.progress.total}</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/50 rounded-full transition-all"
                          style={{ width: `${(achievement.progress.current / achievement.progress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Achievements;
