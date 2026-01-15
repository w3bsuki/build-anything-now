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
  },
  'food-brand': {
    icon: Utensils,
    labelKey: 'partners.petFood',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  veterinary: {
    icon: Stethoscope,
    labelKey: 'partners.veterinary',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  sponsor: {
    icon: Award,
    labelKey: 'partners.sponsors',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
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
    <div className="bg-card rounded-xl border border-border/50 card-hover overflow-hidden">
      {/* Header with logo and basic info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="relative w-14 h-14 flex-shrink-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            </div>
            {partner.featured && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-background">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-foreground line-clamp-1">{partner.name}</h3>
              {partner.website && (
                <a 
                  href={partner.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <div className={cn('flex items-center gap-1.5 text-xs mt-1', config.color)}>
              <Badge variant="secondary" className={cn('text-xs px-1.5 py-0 h-5', config.bgColor, config.color)}>
                <Icon className="w-3 h-3 mr-1" />
                {t(config.labelKey)}
              </Badge>
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t('partners.since')} {partner.since}
              </span>
            </div>
          </div>
        </div>

        {/* Contribution highlight */}
        <p className="text-xs text-foreground mt-3 font-medium">{partner.contribution}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{partner.description}</p>
      </div>

      {/* Stats footer */}
      <div className="bg-muted/30 px-4 py-2.5 flex items-center justify-between border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs">
          <Heart className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-foreground font-medium">{partner.animalsHelped}</span>
          <span className="text-muted-foreground">{t('partners.helped')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-foreground font-medium">{formatCurrency(partner.totalContributed)}</span>
          <span className="text-muted-foreground">EUR</span>
        </div>
      </div>
    </div>
  );
}