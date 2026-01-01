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
      {/* Logo */}
      <div className="w-14 h-14 rounded-lg overflow-hidden mx-auto mb-3 bg-muted">
        <img
          src={partner.logo}
          alt={partner.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-semibold text-sm text-foreground mb-1">{partner.name}</h3>
        <div className={cn('flex items-center justify-center gap-1 text-xs mb-2', config.color)}>
          <Icon className="w-3 h-3" />
          <span>{config.label}</span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{partner.contribution}</p>
      </div>
    </div>
  );
}
