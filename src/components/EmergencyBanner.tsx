import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, ChevronRight, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyBannerProps {
  className?: string;
}

export const EmergencyBanner = ({ className }: EmergencyBannerProps) => {
  const { t } = useTranslation();

  return (
    <Link
      to="/clinics?filter=24h"
      className={cn(
        "group flex items-center gap-3 p-3 rounded-xl",
        "bg-destructive/10",
        "border border-destructive/30",
        "hover:border-destructive/40",
        "hover:shadow-sm transition-all",
        className
      )}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-destructive/15 flex items-center justify-center">
        <AlertCircle className="w-4.5 h-4.5 text-destructive" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-destructive text-sm leading-tight">
          {t('clinics.petEmergency', 'Pet Emergency?')}
        </h3>
        <p className="text-[11px] text-destructive/80 mt-0.5">
          {t('clinics.tapToFind247', 'Tap to find 24/7 emergency care')}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-destructive/70 group-hover:text-destructive group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </Link>
  );
};

// Alternative: Compact Emergency Banner (for tighter spaces)
export const EmergencyBannerCompact = ({ className }: EmergencyBannerProps) => {
  const { t } = useTranslation();

  return (
    <a
      href="tel:+359888123456"
      className={cn(
        "flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-xl",
        "bg-destructive/10",
        "border border-destructive/30",
        "active:scale-[0.98] transition-transform",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-destructive/15 flex items-center justify-center">
          <Phone className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <span className="text-sm font-semibold text-destructive">
            {t('clinics.emergencyHotline', 'Emergency Hotline')}
          </span>
          <span className="text-xs text-destructive/75 block">
            {t('clinics.available247', 'Available 24/7')}
          </span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-destructive/70 flex-shrink-0" />
    </a>
  );
};
