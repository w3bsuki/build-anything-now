import { useTranslation } from 'react-i18next';
import { Partner } from '@/types';
import { cn } from '@/lib/utils';
import { Building2, Utensils, Stethoscope, Award, ExternalLink, Calendar, Heart, Coins, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PartnerCardProps {
  partner: Partner;
}

const typeConfig = {
  'pet-shop': {
    icon: Building2,
    labelKey: 'partners.petShops',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
  },
  'food-brand': {
    icon: Utensils,
    labelKey: 'partners.petFood',
    color: 'text-amber-600 dark:text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  veterinary: {
    icon: Stethoscope,
    labelKey: 'partners.veterinary',
    color: 'text-emerald-600 dark:text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  sponsor: {
    icon: Award,
    labelKey: 'partners.sponsors',
    color: 'text-violet-600 dark:text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
};

export function PartnerCard({ partner }: PartnerCardProps) {
  const { t } = useTranslation();
  const config = typeConfig[partner.type];
  const Icon = config.icon;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all overflow-hidden group">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted ring-1 ring-border/50">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {partner.featured && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center ring-2 ring-background">
                <Star className="w-3 h-3 text-warning-foreground fill-current" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {partner.name}
              </h3>
              {partner.website && (
                <a 
                  href={partner.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs mt-1 flex-wrap">
              <Badge 
                variant="secondary" 
                className={cn('text-xs px-1.5 py-0 h-5 border', config.bgColor, config.color, config.borderColor)}
              >
                <Icon className="w-3 h-3 mr-1" />
                {t(config.labelKey)}
              </Badge>
              <span className="text-muted-foreground inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="hidden sm:inline">{t('partners.since')}</span>
                {partner.since}
              </span>
            </div>
          </div>
        </div>

        {/* Contribution & Description */}
        <div className="mt-3 space-y-1">
          <p className="text-xs text-foreground font-medium leading-snug">
            {partner.contribution}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {partner.description}
          </p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="bg-muted/30 px-4 py-2.5 border-t border-border/50">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500 shrink-0" />
            <span className="font-semibold text-foreground">{partner.animalsHelped}</span>
            <span className="text-muted-foreground">{t('partners.helped')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
            <span className="font-semibold text-foreground">€{formatCurrency(partner.totalContributed)}</span>
            <span className="text-muted-foreground hidden sm:inline">Contributed</span>
          </div>
        </div>
      </div>
    </div>
  );
}