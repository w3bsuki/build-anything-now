import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockClinics } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/ShareButton';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Stethoscope,
  Navigation,
  Globe,
  Mail,
  Bookmark
} from 'lucide-react';

const ClinicProfile = () => {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const clinic = mockClinics.find((c) => c.id === id);

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Clinic not found</h1>
          <Link to="/clinics" className="text-primary hover:underline">
            Go back to clinics
          </Link>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    window.location.href = `tel:${clinic.phone}`;
  };

  const handleDirections = () => {
    const address = encodeURIComponent(`${clinic.address}, ${clinic.city}, Bulgaria`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-28 md:pb-8 md:pt-16">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border md:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link
            to="/clinics"
            className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Link>
          <h1 className="font-medium text-sm text-foreground truncate flex-1">
            {clinic.name}
          </h1>
          <ShareButton title={clinic.name} text={`${clinic.name} - ${clinic.address}, ${clinic.city}`} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">
        <div className="max-w-2xl mx-auto">
          {/* Desktop Back Button */}
          <Link
            to="/clinics"
            className="hidden md:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to clinics
          </Link>

          {/* Clinic Header */}
          <div className="bg-card rounded-xl border border-border p-5 mb-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{clinic.name}</h1>
                  {clinic.verified && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{clinic.address}, {clinic.city}</span>
                </div>
              </div>
              {clinic.is24h && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm">
                  24/7
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleCall} className="btn-donate h-11">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button onClick={handleDirections} variant="outline" className="h-11">
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card rounded-xl border border-border p-5 mb-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <a href={`tel:${clinic.phone}`} className="font-medium text-foreground hover:text-primary">
                    {clinic.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Working Hours</div>
                  <div className="font-medium text-foreground">{clinic.hours}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium text-foreground">{clinic.address}, {clinic.city}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Website</div>
                  <div className="font-medium text-muted-foreground">Not available</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium text-muted-foreground">Not available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="bg-card rounded-xl border border-border p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Specializations</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {clinic.specializations.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-sm py-1.5 px-3">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-card rounded-xl border border-border overflow-hidden mb-5">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Map view coming soon</p>
              </div>
            </div>
          </div>

          {/* Reviews Placeholder */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-lg font-semibold text-foreground mb-4">Reviews</h2>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No reviews yet</p>
              <p className="text-xs mt-1">Be the first to leave a review!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky-donate md:hidden">
        <div className="container mx-auto max-w-2xl flex gap-2.5">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={cn(
              "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors",
              isSaved 
                ? "bg-primary/10 border-primary text-primary" 
                : "bg-card border-border text-foreground"
            )}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </button>
          <Button onClick={handleCall} className="flex-1 h-12 btn-donate text-base">
            <Phone className="w-4 h-4 mr-2" />
            Call Clinic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClinicProfile;
