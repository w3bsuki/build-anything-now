import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShareButton } from '@/components/ShareButton';
import { cn } from '@/lib/utils';
import {
  Search,
  MapPin,
  Phone,
  Clock,
  BadgeCheck,
  Stethoscope,
  Star,
  Navigation,
  AlertCircle,
  ChevronRight,
  X,
  Filter,
  Grid3X3,
  List,
  Heart,
  Shield,
  Calendar,
  ExternalLink,
  Building2,
  Siren,
  PhoneCall,
  Bell,
  User,
  MessageCircle,
} from 'lucide-react';

// Mock clinic data with rich information
const mockClinics = [
  {
    id: '1',
    name: 'Vet Clinic Sofia Central',
    address: 'ul. Vitosha 45',
    city: 'Sofia',
    phone: '+359 2 123 4567',
    hours: 'Mon-Fri: 8:00-20:00',
    is24h: false,
    specializations: ['Surgery', 'Dentistry', 'Cardiology'],
    verified: true,
    ownerId: 'owner1',
    rating: 4.9,
    reviewCount: 127,
    distance: '0.8 km',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400',
    emergency: false,
    featured: true,
    services: ['X-Ray', 'Ultrasound', 'Lab Tests', 'Grooming'],
  },
  {
    id: '2',
    name: '24/7 Emergency Pet Hospital',
    address: 'bul. Bulgaria 102',
    city: 'Sofia',
    phone: '+359 2 987 6543',
    hours: '24/7',
    is24h: true,
    specializations: ['Emergency Care', 'Surgery', 'ICU'],
    verified: true,
    ownerId: 'owner2',
    rating: 4.8,
    reviewCount: 234,
    distance: '1.2 km',
    imageUrl: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400',
    emergency: true,
    featured: true,
    services: ['24/7 Emergency', 'Surgery', 'Blood Bank', 'Oxygen Therapy'],
  },
  {
    id: '3',
    name: 'Happy Paws Veterinary',
    address: 'ul. Rakovski 78',
    city: 'Sofia',
    phone: '+359 2 456 7890',
    hours: 'Mon-Sat: 9:00-19:00',
    is24h: false,
    specializations: ['General Care', 'Vaccinations', 'Dermatology'],
    verified: true,
    ownerId: null,
    rating: 4.7,
    reviewCount: 89,
    distance: '2.1 km',
    imageUrl: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=400',
    emergency: false,
    featured: false,
    services: ['Vaccinations', 'Microchipping', 'Health Certificates'],
  },
  {
    id: '4',
    name: 'Varna Pet Care Center',
    address: 'ul. Slivnitsa 12',
    city: 'Varna',
    phone: '+359 52 123 456',
    hours: 'Daily: 8:00-22:00',
    is24h: false,
    specializations: ['Surgery', 'Orthopedics', 'Neurology'],
    verified: true,
    ownerId: 'owner4',
    rating: 4.9,
    reviewCount: 156,
    distance: null,
    imageUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cf1f0876?w=400',
    emergency: false,
    featured: true,
    services: ['MRI', 'CT Scan', 'Rehabilitation'],
  },
  {
    id: '5',
    name: 'Plovdiv Animal Hospital',
    address: 'ul. Gladstone 23',
    city: 'Plovdiv',
    phone: '+359 32 654 321',
    hours: '24/7',
    is24h: true,
    specializations: ['Emergency Care', 'Exotic Animals', 'Surgery'],
    verified: true,
    ownerId: 'owner5',
    rating: 4.6,
    reviewCount: 98,
    distance: null,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
    emergency: true,
    featured: false,
    services: ['Exotic Pet Care', 'Emergency Surgery', 'Hospitalization'],
  },
  {
    id: '6',
    name: 'Burgas Vet Clinic',
    address: 'ul. Alexandrovska 56',
    city: 'Burgas',
    phone: '+359 56 789 012',
    hours: 'Mon-Fri: 9:00-18:00',
    is24h: false,
    specializations: ['General Care', 'Dentistry'],
    verified: false,
    ownerId: null,
    rating: 4.4,
    reviewCount: 45,
    distance: null,
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400',
    emergency: false,
    featured: false,
    services: ['Dental Cleaning', 'Vaccinations', 'Checkups'],
  },
  {
    id: '7',
    name: 'Sofia Pet Emergency',
    address: 'bul. Tsarigradsko Shose 115',
    city: 'Sofia',
    phone: '+359 2 111 2222',
    hours: '24/7',
    is24h: true,
    specializations: ['Emergency Care', 'Critical Care', 'Trauma'],
    verified: true,
    ownerId: 'owner7',
    rating: 4.8,
    reviewCount: 312,
    distance: '3.5 km',
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
    emergency: true,
    featured: true,
    services: ['Trauma Care', 'Poisoning Treatment', 'Emergency Surgery'],
  },
  {
    id: '8',
    name: 'Animal Wellness Clinic',
    address: 'ul. Graf Ignatiev 89',
    city: 'Sofia',
    phone: '+359 2 333 4444',
    hours: 'Mon-Sat: 10:00-20:00',
    is24h: false,
    specializations: ['Holistic Care', 'Acupuncture', 'Rehabilitation'],
    verified: true,
    ownerId: 'owner8',
    rating: 4.7,
    reviewCount: 67,
    distance: '1.8 km',
    imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400',
    emergency: false,
    featured: false,
    services: ['Acupuncture', 'Physiotherapy', 'Nutritional Counseling'],
  },
];

const cities = ['all', 'Sofia', 'Varna', 'Plovdiv', 'Burgas'];
const specializations = [
  'Surgery',
  'Emergency Care',
  'Dentistry',
  'Cardiology',
  'Dermatology',
  'Orthopedics',
  'Neurology',
  'Exotic Animals',
];

// Enhanced Clinic Card Component
interface ClinicCardEnhancedProps {
  clinic: (typeof mockClinics)[0];
  viewMode: 'grid' | 'list';
}

const ClinicCardEnhanced = ({ clinic, viewMode }: ClinicCardEnhancedProps) => {
  const { t } = useTranslation();
  const isVerified = clinic.verified && !!clinic.ownerId;
  
  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden border-border/60 hover:shadow-md transition-all">
        <Link to={`/clinics/${clinic.id}`} className="flex gap-3 p-3">
          {/* Image */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
            <img
              src={clinic.imageUrl}
              alt={clinic.name}
              className="w-full h-full object-cover"
            />
            {clinic.is24h && (
              <div className="absolute top-1 left-1">
                <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0 h-4">
                  24/7
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {isVerified && (
                  <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                )}
                <h3 className="font-semibold text-sm text-foreground truncate">
                  {clinic.name}
                </h3>
              </div>
              {clinic.rating && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-medium">{clinic.rating}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{clinic.address}, {clinic.city}</span>
              {clinic.distance && (
                <span className="text-primary font-medium ml-auto shrink-0">
                  {clinic.distance}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5">
              <a
                href={`tel:${clinic.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-primary font-medium"
              >
                <Phone className="w-3 h-3" />
                Call
              </a>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {clinic.hours}
              </span>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="overflow-hidden border-border/60 hover:shadow-lg transition-all group">
      <Link to={`/clinics/${clinic.id}`} className="block">
        {/* Image Header */}
        <div className="relative aspect-16/10 bg-muted overflow-hidden">
          <img
            src={clinic.imageUrl}
            alt={clinic.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Overlay Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {clinic.is24h && (
              <Badge className="bg-emerald-500 text-white text-xs shadow-sm">
                <Clock className="w-3 h-3 mr-1" />
                24/7
              </Badge>
            )}
            {clinic.emergency && (
              <Badge className="bg-red-500 text-white text-xs shadow-sm">
                <Siren className="w-3 h-3 mr-1" />
                Emergency
              </Badge>
            )}
          </div>

          {/* Rating Badge */}
          {clinic.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-medium">{clinic.rating}</span>
              <span className="text-white/70">({clinic.reviewCount})</span>
            </div>
          )}

          {/* Distance Badge */}
          {clinic.distance && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
              <Navigation className="w-3 h-3" />
              {clinic.distance}
            </div>
          )}
        </div>

        <CardContent className="p-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {isVerified && (
                <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
              )}
              <h3 className="font-semibold text-foreground line-clamp-1">
                {clinic.name}
              </h3>
            </div>
            <ShareButton
              title={clinic.name}
              text={`${clinic.name} - ${clinic.address}`}
              url={`${window.location.origin}/clinics/${clinic.id}`}
              size="sm"
            />
          </div>

          {/* Address */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="line-clamp-1">{clinic.address}, {clinic.city}</span>
          </div>

          {/* Contact & Hours */}
          <div className="flex items-center gap-4 mt-2">
            <a
              href={`tel:${clinic.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{clinic.phone}</span>
            </a>
          </div>

          {/* Specializations */}
          {clinic.specializations.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {clinic.specializations.slice(0, 3).map((spec) => (
                <Badge
                  key={spec}
                  variant="outline"
                  className="text-xs bg-muted/50 border-border/50"
                >
                  {spec}
                </Badge>
              ))}
              {clinic.specializations.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{clinic.specializations.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.preventDefault();
                window.open(`https://maps.google.com/?q=${encodeURIComponent(clinic.address + ', ' + clinic.city)}`, '_blank');
              }}
            >
              <Navigation className="w-3.5 h-3.5 mr-1" />
              Directions
            </Button>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `tel:${clinic.phone}`;
              }}
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1" />
              Call Now
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

// Compact Emergency Strip for mobile
const EmergencyStrip = ({ onEmergencyClick }: { onEmergencyClick: () => void }) => {
  return (
    <button
      onClick={onEmergencyClick}
      className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-left hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
    >
      <div className="p-2 bg-red-500 rounded-lg shrink-0">
        <Siren className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Pet Emergency?</p>
        <p className="text-xs text-red-600/80 dark:text-red-400/70">Tap to find 24/7 emergency care</p>
      </div>
      <ChevronRight className="w-5 h-5 text-red-400 shrink-0" />
    </button>
  );
};

// Featured Clinics Strip
const FeaturedClinicsStrip = ({ clinics }: { clinics: typeof mockClinics }) => {
  const featured = clinics.filter((c) => c.featured);
  
  if (featured.length === 0) return null;
  
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Building2 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Featured Clinics</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {featured.map((clinic) => (
          <Link
            key={clinic.id}
            to={`/clinics/${clinic.id}`}
            className="shrink-0 w-[280px]"
          >
            <Card className="overflow-hidden border-border/60 hover:shadow-md transition-all">
              <div className="flex gap-3 p-2.5">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img
                    src={clinic.imageUrl}
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                  />
                  {clinic.is24h && (
                    <div className="absolute inset-0 bg-linear-to-t from-emerald-500/80 to-transparent flex items-end justify-center pb-1">
                      <span className="text-white text-[10px] font-bold">24/7</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {clinic.verified && clinic.ownerId && (
                      <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                    )}
                    <h3 className="font-semibold text-sm truncate">{clinic.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{clinic.city}</span>
                    {clinic.distance && (
                      <span className="text-primary ml-1">{clinic.distance}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-medium">{clinic.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({clinic.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main Demo Clinics Page
const ClinicsDemo = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [show24hOnly, setShow24hOnly] = useState(false);
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter clinics
  const filteredClinics = useMemo(() => {
    return mockClinics.filter((clinic) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          clinic.name.toLowerCase().includes(query) ||
          clinic.address.toLowerCase().includes(query) ||
          clinic.specializations.some((s) => s.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // City filter
      if (cityFilter !== 'all' && clinic.city !== cityFilter) return false;

      // 24h filter
      if (show24hOnly && !clinic.is24h) return false;

      // Emergency filter
      if (showEmergencyOnly && !clinic.emergency) return false;

      // Specialization filter
      if (
        selectedSpecs.length > 0 &&
        !selectedSpecs.some((spec) => clinic.specializations.includes(spec))
      ) {
        return false;
      }

      return true;
    });
  }, [searchQuery, cityFilter, show24hOnly, showEmergencyOnly, selectedSpecs]);

  // Count of active filters
  const activeFilterCount =
    (cityFilter !== 'all' ? 1 : 0) +
    (show24hOnly ? 1 : 0) +
    (showEmergencyOnly ? 1 : 0) +
    selectedSpecs.length;

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const clearFilters = () => {
    setCityFilter('all');
    setShow24hOnly(false);
    setShowEmergencyOnly(false);
    setSelectedSpecs([]);
  };

  const location = useLocation();
  
  // Mock notification counts
  const unreadNotifications = 3;
  const unreadPosts = 2;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Mobile Header - matches MobilePageHeader pattern */}
      <header className="md:hidden sticky top-0 z-50 bg-background/98 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
        {/* Title Row with Navigation */}
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" strokeWidth={2} />
            <h1 className="font-bold text-lg tracking-tight text-foreground">
              Vet Clinics
            </h1>
          </div>
          
          {/* Action Icons - matching MobilePageHeader */}
          <div className="flex items-center -mr-1.5">
            <Button variant="ghost" size="icon" className="h-11 w-11 relative" asChild>
              <NavLink to="/community">
                <MessageCircle className={cn(
                  location.pathname === '/community' ? "text-primary fill-primary/20" : "text-muted-foreground"
                )} />
                {unreadPosts > 0 && location.pathname !== '/community' && (
                  <Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background">
                    {unreadPosts}
                  </Badge>
                )}
              </NavLink>
            </Button>
            <Button variant="ghost" size="icon" className="h-11 w-11 relative" asChild>
              <NavLink to="/notifications">
                <Bell className={cn(
                  location.pathname === '/notifications' ? "text-primary" : "text-muted-foreground"
                )} />
                {unreadNotifications > 0 && (
                  <Badge className="absolute top-1 right-1 size-4 justify-center rounded-full p-0 text-[10px] font-semibold ring-2 ring-background">
                    {unreadNotifications}
                  </Badge>
                )}
              </NavLink>
            </Button>
            <Button variant="ghost" size="icon" className="h-11 w-11" asChild>
              <NavLink to="/account">
                <User className={cn(
                  location.pathname === '/account' ? "text-primary" : "text-muted-foreground"
                )} />
              </NavLink>
            </Button>
          </div>
        </div>

        {/* Search Row */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search clinics, specializations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-10 rounded-full bg-muted border-0 focus-visible:ring-1"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills Row */}
        <div className="px-4 pb-3 border-b border-border/50">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                activeFilterCount > 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-xs px-1.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* City Pills */}
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  cityFilter === city
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                {city === 'all' ? (
                  'All Cities'
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5" />
                    {city}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="px-4 py-3 bg-muted/50 border-b border-border/50 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Specializations</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => toggleSpec(spec)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    selectedSpecs.includes(spec)
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search clinics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-full"
              />
            </div>

            {/* City Filter */}
            <Tabs value={cityFilter} onValueChange={setCityFilter}>
              <TabsList className="h-9">
                {cities.map((city) => (
                  <TabsTrigger key={city} value={city} className="text-xs px-3">
                    {city === 'all' ? 'All' : city}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Toggles */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch checked={show24hOnly} onCheckedChange={setShow24hOnly} />
                <span className="text-sm">24/7</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Switch
                  checked={showEmergencyOnly}
                  onCheckedChange={setShowEmergencyOnly}
                />
                <span className="text-sm text-red-500">Emergency</span>
              </label>
            </div>

            {/* View Toggle */}
            <div className="flex border rounded-lg p-0.5">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:pt-20">
        {/* Emergency Strip - Compact on mobile */}
        <div className="md:hidden mb-4">
          <EmergencyStrip onEmergencyClick={() => setShowEmergencyOnly(true)} />
        </div>

        {/* Featured Clinics Strip */}
        <FeaturedClinicsStrip clinics={mockClinics} />

        {/* Results Header with Toggles and View Mode */}
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-semibold text-foreground shrink-0">
              {showEmergencyOnly
                ? 'Emergency Clinics'
                : show24hOnly
                ? '24/7 Clinics'
                : 'All Clinics'}
            </h2>
            <span className="text-xs text-muted-foreground shrink-0">
              ({filteredClinics.length})
            </span>
          </div>
          
          {/* Toggles + View Mode - Right side */}
          <div className="flex items-center gap-3">
            {/* Quick Toggles */}
            <div className="hidden sm:flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                  checked={show24hOnly}
                  onCheckedChange={setShow24hOnly}
                  className="scale-75"
                />
                <span className="text-xs font-medium">24/7</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <Switch
                  checked={showEmergencyOnly}
                  onCheckedChange={setShowEmergencyOnly}
                  className="scale-75"
                />
                <span className="text-xs font-medium text-red-500">Emergency</span>
              </label>
            </div>
            
            {/* Mobile Toggles - More compact */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setShow24hOnly(!show24hOnly)}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium transition-all",
                  show24hOnly
                    ? "bg-emerald-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                24/7
              </button>
              <button
                onClick={() => setShowEmergencyOnly(!showEmergencyOnly)}
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium transition-all",
                  showEmergencyOnly
                    ? "bg-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Siren className="w-3 h-3" />
              </button>
            </div>
            
            {/* View Toggle */}
            <div className="flex border rounded-lg p-0.5 bg-muted/50">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'grid'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewMode === 'list'
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Clinic Grid/List */}
        {filteredClinics.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col gap-2'
            )}
          >
            {filteredClinics.map((clinic) => (
              <ClinicCardEnhanced
                key={clinic.id}
                clinic={clinic}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No clinics found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Verified Clinics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Look for the verified badge for trusted veterinary care
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">24/7 Availability</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Emergency care available around the clock
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Community Reviews</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real ratings from pet owners like you
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClinicsDemo;
