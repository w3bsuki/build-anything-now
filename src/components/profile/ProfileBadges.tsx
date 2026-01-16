import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';

// Achievement details - matches convex/achievements.ts
// Using semantic tokens for consistent theming
const BADGE_DETAILS: Record<string, { title: string; icon: string; color: string }> = {
  first_donation: { title: 'First Steps', icon: '🎉', color: 'bg-warning/10 border-warning/30' },
  monthly_donor: { title: 'Monthly Hero', icon: '📅', color: 'bg-primary/10 border-primary/30' },
  helped_10: { title: 'Helping Hand', icon: '🐾', color: 'bg-success/10 border-success/30' },
  helped_50: { title: 'Animal Guardian', icon: '🛡️', color: 'bg-accent/20 border-accent/40' },
  helped_100: { title: 'Legend', icon: '👑', color: 'bg-warning/10 border-warning/30' },
  big_heart: { title: 'Big Heart', icon: '💖', color: 'bg-destructive/10 border-destructive/30' },
  early_supporter: { title: 'Early Supporter', icon: '⭐', color: 'bg-warning/10 border-warning/30' },
  community_hero: { title: 'Community Hero', icon: '🦸', color: 'bg-destructive/10 border-destructive/30' },
  verified_volunteer: { title: 'Verified Volunteer', icon: '✅', color: 'bg-success/10 border-success/30' },
  verified_veterinarian: { title: 'Verified Vet', icon: '🏥', color: 'bg-primary/10 border-primary/30' },
  verified_groomer: { title: 'Verified Groomer', icon: '✂️', color: 'bg-accent/20 border-accent/40' },
  verified_trainer: { title: 'Verified Trainer', icon: '🎓', color: 'bg-primary/10 border-primary/30' },
  verified_business: { title: 'Verified Business', icon: '🏪', color: 'bg-muted border-border' },
  verified_shelter: { title: 'Verified Shelter', icon: '🏠', color: 'bg-recovering/10 border-recovering/30' },
  top_transporter: { title: 'Top Transporter', icon: '🚗', color: 'bg-primary/10 border-primary/30' },
  foster_hero: { title: 'Foster Hero', icon: '🏡', color: 'bg-success/10 border-success/30' },
  rescue_champion: { title: 'Rescue Champion', icon: '🦸‍♂️', color: 'bg-destructive/10 border-destructive/30' },
  event_organizer: { title: 'Event Organizer', icon: '📋', color: 'bg-warning/10 border-warning/30' },
  founding_member: { title: 'Founding Member', icon: '🏆', color: 'bg-warning/10 border-warning/30' },
  ambassador: { title: 'Ambassador', icon: '🌟', color: 'bg-warning/10 border-warning/30' },
};

interface ProfileBadgesProps {
  badges: string[];
}

export function ProfileBadges({ badges }: ProfileBadgesProps) {
  const { t } = useTranslation();

  if (!badges || badges.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center">
        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{t('profile.noBadges')}</h3>
        <p className="text-sm text-muted-foreground">{t('profile.noBadgesDesc')}</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-warning" />
        {t('profile.badgesAchievements')}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge) => {
          const details = BADGE_DETAILS[badge] || { 
            title: badge.replace(/_/g, ' '), 
            icon: '🏅', 
            color: 'bg-muted border-border' 
          };
          return (
            <div
              key={badge}
              className={`flex items-center gap-3 p-3 rounded-lg border ${details.color}`}
            >
              <span className="text-2xl">{details.icon}</span>
              <span className="text-sm font-medium text-foreground">{details.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
