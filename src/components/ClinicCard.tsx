import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from './ShareButton';
import { Phone, MapPin, Clock, BadgeCheck, Stethoscope } from 'lucide-react';

interface ClinicCardProps {
  clinic: {
    _id?: string;
    id?: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    hours?: string;
    is24h: boolean;
    specializations: string[];
    verified: boolean;
    ownerId?: string | null; // Added for ownership tracking
  };
}

export const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const { t } = useTranslation();
  const clinicId = clinic._id || clinic.id;

  // A clinic is truly verified if it has both verified=true AND an owner
  const isVerifiedAndClaimed = clinic.verified && !!clinic.ownerId;
  const showVerified = clinic.verified || isVerifiedAndClaimed;

  // Helper to get translated specialization
  const getSpecializationLabel = (spec: string) => {
    const key = `clinicSpecializations.${spec.toLowerCase().replace(/[\s/]+/g, '')}`;
    const translated = t(key, { defaultValue: '' });
    return translated || spec;
  };

  // Helper to get mobile-short translated specialization
  const getSpecializationLabelMobile = (spec: string) => {
    const key = `clinicSpecializationsMobile.${spec.toLowerCase().replace(/[\s/]+/g, '')}`;
    const translated = t(key, { defaultValue: '' });
    return translated || getSpecializationLabel(spec);
  };

  // Derive hours from is24h if not provided
  const displayHours = clinic.hours || (clinic.is24h ? '24/7' : t('clinics.contactForHours'));
  const addressLine = `${clinic.address}, ${clinic.city}`;

  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/clinics/${clinicId}`} className="block">
        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {showVerified && (
                <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
              )}
              <h3 className="font-semibold text-foreground line-clamp-1">{clinic.name}</h3>
            </div>
            <ShareButton
              title={clinic.name}
              text={`${clinic.name} - ${addressLine}`}
              url={`${window.location.origin}/clinics/${clinicId}`}
              size="sm"
            />
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{addressLine}</span>
          </div>

          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-primary font-medium">{clinic.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{displayHours}</span>
            </div>
          </div>

          {/* Specializations only - 24/7 shown via hours text and toggle filter */}
          {clinic.specializations.length > 0 && (
            <div className="mt-2 flex items-start gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-muted-foreground mt-1 flex-shrink-0" />
              {/* Mobile: Limited to 2 badges + count */}
              <div className="flex gap-1 sm:hidden">
                {clinic.specializations.slice(0, 2).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs whitespace-nowrap border-border/70 bg-background">
                    {getSpecializationLabelMobile(spec)}
                  </Badge>
                ))}
                {clinic.specializations.length > 2 && (
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    +{clinic.specializations.length - 2}
                  </Badge>
                )}
              </div>
              {/* Desktop: Full specializations with wrap */}
              <div className="hidden sm:flex flex-wrap gap-1">
                {clinic.specializations.map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs border-border/70 bg-background">
                    {getSpecializationLabel(spec)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};
