import { Partner } from '@/types';
import { cn } from '@/lib/utils';
import { Building2, Utensils, Stethoscope, Award } from 'lucide-react';

interface PartnerCardProps {
  partner: Partner;
}

const typeConfig = {
  'pet-shop': {
    icon: Building2,
    label: 'Pet Shop',
    color: 'text-primary',
  },
  'food-brand': {
    icon: Utensils,
    label: 'Food Brand',
    color: 'text-warning',
  },
  veterinary: {
    icon: Stethoscope,
    label: 'Veterinary',
    color: 'text-accent',
  },
  sponsor: {
    icon: Award,
    label: 'Sponsor',
    color: 'text-success',
  },
};

export function PartnerCard({ partner }: PartnerCardProps) {
  const config = typeConfig[partner.type];
  const Icon = config.icon;

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 card-hover">
      <div className="flex items-start gap-3">
        {/* Logo */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img
            src={partner.logo}
            alt={partner.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-1">{partner.name}</h3>
          <div className={cn('flex items-center gap-1 text-xs mb-1.5', config.color)}>
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{partner.contribution}</p>
        </div>
      </div>
    </div>
  );
}
