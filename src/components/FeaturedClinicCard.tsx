import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, MapPin, Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeaturedClinicCardProps {
  clinic: {
    _id?: string;
    id?: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    is24h: boolean;
    specializations: string[];
    verified: boolean;
    image?: string;
    rating?: number;
    reviewCount?: number;
    distance?: string;
    featured?: boolean;
  };
  variant?: 'horizontal' | 'compact';
}

export const FeaturedClinicCard = ({ clinic, variant = 'horizontal' }: FeaturedClinicCardProps) => {
  const { t } = useTranslation();
  const clinicId = clinic._id || clinic.id;

  const fallbackImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80';

  if (variant === 'compact') {
    // Square image card for horizontal scroll - matches screenshot right side
    return (
      <Link
        to={`/clinics/${clinicId}`}
        className="relative flex-shrink-0 w-[100px] overflow-hidden rounded-2xl group"
      >
        {/* Square Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <img
            src={clinic.image || fallbackImage}
            alt={clinic.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* 24/7 Badge */}
          {clinic.is24h && (
            <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              24/7
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Horizontal card for featured section - matches screenshot left side
  return (
    <Link
      to={`/clinics/${clinicId}`}
      className="flex items-center gap-3 p-2 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all group"
    >
      {/* Circular Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-muted ring-2 ring-background">
          <img
            src={clinic.image || fallbackImage}
            alt={clinic.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          {clinic.verified && (
            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
          )}
          <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {clinic.name}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{clinic.city}</span>
          {clinic.distance && (
            <>
              <span className="text-primary font-medium">{clinic.distance}</span>
            </>
          )}
        </div>

        {/* Rating */}
        {clinic.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-foreground">{clinic.rating}</span>
            {clinic.reviewCount && (
              <span className="text-xs text-muted-foreground">
                ({clinic.reviewCount} {t('clinics.reviews')})
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

// Grid card for All Clinics section - beautiful image-first design
export const ClinicGridCard = ({ clinic }: { clinic: FeaturedClinicCardProps['clinic'] }) => {
  const { t } = useTranslation();
  const clinicId = clinic._id || clinic.id;
  const fallbackImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80';

  return (
    <Link
      to={`/clinics/${clinicId}`}
      className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-md transition-all"
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={clinic.image || fallbackImage}
          alt={clinic.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        {clinic.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-foreground">{clinic.rating}</span>
            {clinic.reviewCount && (
              <span className="text-xs text-muted-foreground">({clinic.reviewCount})</span>
            )}
          </div>
        )}

        {/* 24/7 Badge */}
        {clinic.is24h && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <Clock className="w-3 h-3" />
            24/7
          </div>
        )}

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center gap-1.5">
            {clinic.verified && (
              <BadgeCheck className="w-4 h-4 text-white flex-shrink-0" />
            )}
            <h3 className="font-semibold text-sm truncate">{clinic.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/80 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{clinic.city}</span>
            {clinic.distance && (
              <span className="text-white/90 font-medium ml-1">• {clinic.distance}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// List card for All Clinics section - compact detailed view
export const ClinicListCard = ({ clinic }: { clinic: FeaturedClinicCardProps['clinic'] }) => {
  const { t } = useTranslation();
  const clinicId = clinic._id || clinic.id;
  const fallbackImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80';

  return (
    <Link
      to={`/clinics/${clinicId}`}
      className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all group"
    >
      {/* Image */}
      <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
        <img
          src={clinic.image || fallbackImage}
          alt={clinic.name}
          className="w-full h-full object-cover"
        />
        {clinic.is24h && (
          <div className="absolute bottom-1.5 right-1.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            24/7
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          {clinic.verified && (
            <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
          )}
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {clinic.name}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{clinic.address}, {clinic.city}</span>
        </div>

        {/* Rating + Distance */}
        <div className="flex items-center gap-3 mt-1.5">
          {clinic.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold">{clinic.rating}</span>
              {clinic.reviewCount && (
                <span className="text-xs text-muted-foreground">({clinic.reviewCount})</span>
              )}
            </div>
          )}
          {clinic.distance && (
            <span className="text-xs text-primary font-medium">{clinic.distance}</span>
          )}
        </div>

        {/* Specializations */}
        {clinic.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {clinic.specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
              >
                {spec}
              </span>
            ))}
            {clinic.specializations.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                +{clinic.specializations.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};
