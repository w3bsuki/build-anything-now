import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mockPartners, mockVolunteers } from '@/data/mockData';
import { PartnerCard } from '@/components/PartnerCard';
import { FilterPills } from '@/components/FilterPills';
import { PartnerCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Handshake, 
  Heart, 
  ShoppingBag, 
  Stethoscope, 
  Bone, 
  Search, 
  HandHeart,
  Users,
  Star,
  PawPrint,
  Calendar,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Partners = () => {
  const { t } = useTranslation();
  const [showVolunteers, setShowVolunteers] = useState(false);
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [volunteerFilter, setVolunteerFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

  // Partner filters
  const partnerFilters = [
    { id: 'all', label: t('partners.all') },
    { id: 'pet-shop', label: t('partners.petShops'), icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'food-brand', label: t('partners.petFood'), icon: <Bone className="w-3.5 h-3.5" /> },
    { id: 'veterinary', label: t('partners.veterinary'), icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'sponsor', label: t('partners.sponsors'), icon: <Heart className="w-3.5 h-3.5" /> },
  ];

  // Volunteer location filters
  const volunteerFilters = [
    { id: 'all', label: t('partners.all') },
    { id: 'top', label: 'Top', icon: <Star className="w-3.5 h-3.5 fill-current" /> },
    { id: 'Sofia', label: 'Sofia', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'Plovdiv', label: 'Plovdiv', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'Varna', label: 'Varna', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'Burgas', label: 'Burgas', icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  // Filter partners
  const filteredPartners = mockPartners.filter((partner) => {
    const matchesDomain = partnerFilter === 'all' || partner.type === partnerFilter;
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contribution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  // Filter volunteers
  const filteredVolunteers = mockVolunteers.filter((volunteer) => {
    const matchesFilter = volunteerFilter === 'all' || 
      (volunteerFilter === 'top' && volunteer.isTopVolunteer) ||
      volunteer.location === volunteerFilter;
    const matchesSearch = !searchQuery || 
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const totalAnimalsHelped = mockVolunteers.reduce((sum, v) => sum + v.stats.animalsHelped, 0);
  const totalHours = mockVolunteers.reduce((sum, v) => sum + v.stats.hoursVolunteered, 0);

  return (
    <div className="min-h-screen pt-14 pb-20 md:pb-8 md:pt-16">
      {/* Search + Filters */}
      <div className="sticky top-14 md:top-14 bg-background/95 backdrop-blur-sm z-30 pt-2.5 pb-3">
        <div className="container mx-auto px-4 space-y-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50" />
            <input
              type="text"
              placeholder={showVolunteers ? t('partners.searchVolunteers') : t('partners.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/70 border-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-muted transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Pills - different for each view */}
          {showVolunteers ? (
            <FilterPills
              options={volunteerFilters}
              selected={volunteerFilter}
              onSelect={setVolunteerFilter}
            />
          ) : (
            <FilterPills
              options={partnerFilters}
              selected={partnerFilter}
              onSelect={setPartnerFilter}
            />
          )}
        </div>
      </div>

      {/* Content */}
      {!showVolunteers ? (
        <>
          {/* Partners Grid */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              {/* Section Header with Toggle */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {partnerFilter === 'all' ? t('partners.partners') : partnerFilters.find(f => f.id === partnerFilter)?.label}
                </h2>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    ({filteredPartners.length})
                  </span>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Switch
                    id="view-toggle"
                    checked={showVolunteers}
                    onCheckedChange={setShowVolunteers}
                    className="scale-90"
                  />
                  <Label htmlFor="view-toggle" className="text-xs font-medium cursor-pointer whitespace-nowrap flex items-center gap-1">
                    <HandHeart className="w-3.5 h-3.5" />
                    {t('partners.volunteers')}
                  </Label>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <PartnerCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredPartners.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPartners.map((partner) => (
                    <PartnerCard key={partner.id} partner={partner} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {t('partners.noPartnersFound')}
                </div>
              )}
            </div>
          </section>

          {/* Partner Stats */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-3 gap-4 text-center bg-muted/50 rounded-xl py-4">
                <div>
                  <p className="text-xl font-bold text-primary">{mockPartners.length}</p>
                  <p className="text-xs text-muted-foreground">{t('partners.partners')}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">1,200+</p>
                  <p className="text-xs text-muted-foreground">{t('partners.animalsHelped')}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">50,000+</p>
                  <p className="text-xs text-muted-foreground">{t('partners.bgnContributed')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Partner */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="bg-muted/50 rounded-xl p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {t('partners.makeADifference')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  {t('partners.joinPartners')}
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Handshake className="w-4 h-4 mr-2" />
                  {t('partners.becomePartner')}
                </Button>
              </div>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Volunteers Grid */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              {/* Section Header with Toggle */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {volunteerFilter === 'all' ? t('partners.volunteers') : volunteerFilter === 'top' ? t('partners.topVolunteers') : volunteerFilter}
                </h2>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    ({filteredVolunteers.length})
                  </span>
                )}
                <div className="flex items-center gap-1.5 ml-auto">
                  <Switch
                    id="view-toggle"
                    checked={showVolunteers}
                    onCheckedChange={setShowVolunteers}
                    className="scale-75"
                  />
                  <Label htmlFor="view-toggle" className="text-xs font-medium cursor-pointer whitespace-nowrap flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {t('partners.partners')}
                  </Label>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <VolunteerCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredVolunteers.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredVolunteers.map((volunteer) => (
                    <VolunteerCard key={volunteer.id} volunteer={volunteer} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {t('partners.noVolunteersFound')}
                </div>
              )}
            </div>
          </section>

          {/* Volunteer Stats */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-3 gap-4 text-center bg-muted/50 rounded-xl py-4">
                <div>
                  <p className="text-xl font-bold text-primary">{mockVolunteers.length}</p>
                  <p className="text-xs text-muted-foreground">{t('partners.volunteers')}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{totalAnimalsHelped.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{t('partners.animalsHelped')}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{totalHours.toLocaleString()}+</p>
                  <p className="text-xs text-muted-foreground">{t('partners.hoursGiven')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Volunteer */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="bg-muted/50 rounded-xl p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <HandHeart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {t('partners.makeADifference')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  {t('partners.joinVolunteers')}
                </p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <HandHeart className="w-4 h-4 mr-2" />
                  {t('partners.becomeVolunteer')}
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

// Volunteer Card Component
interface VolunteerCardProps {
  volunteer: typeof mockVolunteers[0];
}

const VolunteerCard = ({ volunteer }: VolunteerCardProps) => (
  <Link
    to={`/volunteers/${volunteer.id}`}
    className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all block"
  >
    {/* Header */}
    <div className="flex items-start gap-3 mb-3">
      <div className="relative">
        <img
          src={volunteer.avatar}
          alt={volunteer.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {volunteer.isTopVolunteer && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-warning-foreground fill-current" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground truncate">{volunteer.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span>{volunteer.rating.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>Since {volunteer.memberSince}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="w-3 h-3" />
          <span>{volunteer.location}</span>
        </div>
      </div>
    </div>

    {/* Bio */}
    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{volunteer.bio}</p>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-2 text-center">
      <div className="bg-primary/5 rounded-lg py-2">
        <PawPrint className="w-4 h-4 text-primary mx-auto mb-0.5" />
        <span className="text-xs font-semibold text-foreground">{volunteer.stats.animalsHelped}</span>
        <p className="text-[10px] text-muted-foreground">Helped</p>
      </div>
      <div className="bg-accent/5 rounded-lg py-2">
        <Heart className="w-4 h-4 text-accent mx-auto mb-0.5" />
        <span className="text-xs font-semibold text-foreground">{volunteer.stats.adoptions}</span>
        <p className="text-[10px] text-muted-foreground">Adoptions</p>
      </div>
      <div className="bg-warning/5 rounded-lg py-2">
        <Calendar className="w-4 h-4 text-warning mx-auto mb-0.5" />
        <span className="text-xs font-semibold text-foreground">{volunteer.stats.campaigns}</span>
        <p className="text-[10px] text-muted-foreground">Campaigns</p>
      </div>
    </div>

    {/* Badges */}
    {volunteer.badges.length > 0 && (
      <div className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-hide">
        {volunteer.badges.map((badge) => (
          <span
            key={badge}
            className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full whitespace-nowrap flex-shrink-0"
          >
            {badge}
          </span>
        ))}
      </div>
    )}
  </Link>
);

// Skeleton Component
const VolunteerCardSkeleton = () => (
  <div className="bg-card rounded-xl p-4 animate-pulse border border-border">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-full bg-muted" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
    </div>
    <div className="h-8 bg-muted rounded mb-3" />
    <div className="grid grid-cols-3 gap-2">
      <div className="h-14 bg-muted rounded" />
      <div className="h-14 bg-muted rounded" />
      <div className="h-14 bg-muted rounded" />
    </div>
  </div>
);

export default Partners;
