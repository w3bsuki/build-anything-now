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
    <div className="bg-card rounded-2xl p-5 shadow-card card-hover animate-fade-in">
      {/* Logo */}
      <div className="w-20 h-20 rounded-xl overflow-hidden mx-auto mb-4 bg-muted">
        <img
          src={partner.logo}
          alt={partner.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="text-center">
        <h3 className="font-bold text-foreground mb-1">{partner.name}</h3>
        <div className={cn('flex items-center justify-center gap-1.5 text-sm mb-3', config.color)}>
          <Icon className="w-4 h-4" />
          <span>{config.label}</span>
        </div>
        <p className="text-sm text-muted-foreground">{partner.contribution}</p>
      </div>
    </div>
  );
}
