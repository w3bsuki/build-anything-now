import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clinic } from '@/types';
import { ShareButton } from './ShareButton';
import { Phone, MapPin, Clock, CheckCircle, Stethoscope } from 'lucide-react';

interface ClinicCardProps {
  clinic: Clinic;
}

export const ClinicCard = ({ clinic }: ClinicCardProps) => {
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      {/* Share Button */}
      <div className="absolute top-3 right-3 z-10">
        <ShareButton 
          title={clinic.name} 
          text={`${clinic.name} - ${clinic.address}, ${clinic.city}`}
          url={`${window.location.origin}/clinics/${clinic.id}`}
        />
      </div>

      <Link to={`/clinics/${clinic.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{clinic.name}</h3>
                {clinic.verified && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{clinic.address}, {clinic.city}</span>
              </div>
            </div>
            {clinic.is24h && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                24/7
              </Badge>
            )}
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-primary font-medium">{clinic.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{clinic.hours}</span>
            </div>
          </div>

          {clinic.specializations.length > 0 && (
            <div className="flex items-start gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {clinic.specializations.map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
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
