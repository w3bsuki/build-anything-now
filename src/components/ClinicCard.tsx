import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clinic } from '@/types';
import { ShareButton } from './ShareButton';
import { Phone, MapPin, Clock, BadgeCheck, Stethoscope } from 'lucide-react';

interface ClinicCardProps {
  clinic: Clinic;
}

export const ClinicCard = ({ clinic }: ClinicCardProps) => {
  const { t } = useTranslation();
  
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
  
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/clinics/${clinic.id}`}>
        <CardContent className="p-4">
          {/* Header with name and share */}
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-semibold text-foreground line-clamp-1">{clinic.name}</h3>
                {clinic.verified && (
                  <BadgeCheck className="w-4 h-4 text-white fill-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="line-clamp-1">{clinic.address}, {clinic.city}</span>
              </div>
            </div>
            <ShareButton 
              title={clinic.name} 
              text={`${clinic.name} - ${clinic.address}, ${clinic.city}`}
              url={`${window.location.origin}/clinics/${clinic.id}`}
              size="sm"
            />
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-primary font-medium">{clinic.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{clinic.hours}</span>
            </div>
          </div>

          {/* Specializations only - 24/7 shown via hours text and toggle filter */}
          {clinic.specializations.length > 0 && (
            <div className="flex items-start gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-muted-foreground mt-1 flex-shrink-0" />
              {/* Mobile: Limited to 2 badges + count */}
              <div className="flex gap-1.5 sm:hidden">
                {clinic.specializations.slice(0, 2).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs whitespace-nowrap">
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
              <div className="hidden sm:flex flex-wrap gap-1.5">
                {clinic.specializations.map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
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
