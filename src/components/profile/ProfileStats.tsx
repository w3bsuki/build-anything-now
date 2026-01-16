import { useTranslation } from 'react-i18next';
import { PawPrint, Heart, Calendar, Coins } from 'lucide-react';

interface ProfileStatsProps {
  stats: {
    totalDonations: number;
    totalAmount: number;
    animalsHelped: number;
    casesCreated?: number;
    activeCases?: number;
    fundedCases?: number;
  } | undefined | null;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const { t } = useTranslation();

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: PawPrint,
      value: stats.animalsHelped,
      label: t('profile.animalsHelped'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Heart,
      value: stats.totalDonations,
      label: t('profile.donations'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Coins,
      value: `${stats.totalAmount}`,
      suffix: 'EUR',
      label: t('profile.contributed'),
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    ...(stats.casesCreated && stats.casesCreated > 0 ? [{
      icon: Calendar,
      value: stats.casesCreated,
      label: t('profile.casesCreated'),
      color: 'text-success',
      bgColor: 'bg-success/10',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-card rounded-xl p-4 border border-border text-center">
            <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <p className="text-xl font-bold text-foreground">
              {item.value}
              {item.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{item.suffix}</span>}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
