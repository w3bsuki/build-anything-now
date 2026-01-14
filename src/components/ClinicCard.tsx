import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clinic } from '@/types';
import { ShareButton } from './ShareButton';
import { Phone, MapPin, Clock, CheckCircle, Stethoscope } from 'lucide-react';

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
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
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

          {/* Specializations with 24/7 badge */}
          {(clinic.specializations.length > 0 || clinic.is24h) && (
            <div className="flex items-start gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1.5">
                {clinic.is24h && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                    24/7
                  </Badge>
                )}
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
