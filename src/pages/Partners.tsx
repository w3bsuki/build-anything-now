import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslatedMockData } from '@/hooks/useTranslatedMockData';
import { PartnerCard } from '@/components/PartnerCard';
import { FilterPills } from '@/components/FilterPills';
import { PartnerCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Button } from '@/components/ui/button';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { 
  Handshake, 
  Heart, 
  ShoppingBag, 
  Stethoscope, 
  Bone, 
  HandHeart,
  Star,
  PawPrint,
  Calendar,
  MapPin,
  Home,
  Shield,
  MessageCircle,
  Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Mock Pet Sitters Data
const mockPetSitters = [
  {
    id: 's1',
    name: 'Ana Koleva',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Experienced pet sitter with 5+ years caring for dogs and cats. Your pets will feel at home!',
    location: 'Sofia',
    services: ['Dog Walking', 'Cat Sitting', 'Overnight Stay'],
    rating: 4.9,
    reviewCount: 47,
    hourlyRate: 15,
    verified: true,
  },
  {
    id: 's2',
    name: 'Dimitar Petrov',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Veterinary assistant offering pet sitting on weekends. Special care for senior pets.',
    location: 'Sofia',
    services: ['Drop-in Visits', 'Medical Care', 'Cat Sitting'],
    rating: 4.8,
    reviewCount: 32,
    hourlyRate: 20,
    verified: true,
  },
  {
    id: 's3',
    name: 'Viktoria Stoyanova',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    bio: 'Dog lover with a big backyard! Perfect for active dogs who need space to play.',
    location: 'Plovdiv',
    services: ['Dog Walking', 'Overnight Stay', 'Daycare'],
    rating: 4.7,
    reviewCount: 28,
    hourlyRate: 12,
    verified: false,
  },
  {
    id: 's4',
    name: 'Martin Georgiev',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    bio: 'Professional dog trainer offering boarding and training combo packages.',
    location: 'Varna',
    services: ['Training', 'Overnight Stay', 'Dog Walking'],
    rating: 5.0,
    reviewCount: 19,
    hourlyRate: 25,
    verified: true,
  },
];

const Partners = () => {
  const { t } = useTranslation();
  const { mockPartners, mockVolunteers } = useTranslatedMockData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const isLoading = useSimulatedLoading(600);

  // Combined filter options - all in one row
  const filterOptions = [
    { id: 'all', label: t('partners.all') },
    { id: 'volunteers', label: t('partners.volunteers'), icon: <HandHeart className="w-3.5 h-3.5" /> },
    { id: 'sitters', label: t('community.petSitters'), icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'pet-shop', label: t('partners.petShops'), icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'food-brand', label: t('partners.petFood'), icon: <Bone className="w-3.5 h-3.5" /> },
    { id: 'veterinary', label: t('partners.veterinary'), icon: <Stethoscope className="w-3.5 h-3.5" /> },
  ];

  // Determine what to show based on filter
  const showPartners = activeFilter === 'all' || ['pet-shop', 'food-brand', 'veterinary', 'sponsor'].includes(activeFilter);
  const showVolunteers = activeFilter === 'volunteers';
  const showSitters = activeFilter === 'sitters';

  // Filter partners
  const filteredPartners = mockPartners.filter((partner) => {
    const matchesDomain = activeFilter === 'all' || partner.type === activeFilter;
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contribution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  // Filter volunteers
  const filteredVolunteers = mockVolunteers.filter((volunteer) => {
    const matchesSearch = !searchQuery || 
      volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Filter sitters
  const filteredSitters = mockPetSitters.filter((sitter) => {
    const matchesSearch = !searchQuery || 
      sitter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sitter.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sitter.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Stats
  const totalAnimalsHelped = mockVolunteers.reduce((sum, v) => sum + v.stats.animalsHelped, 0);
  const totalHours = mockVolunteers.reduce((sum, v) => sum + v.stats.hoursVolunteered, 0);

  // Get search placeholder based on filter
  const getSearchPlaceholder = () => {
    if (showVolunteers) return t('partners.searchVolunteers');
    if (showSitters) return t('community.searchSitters');
    return t('partners.searchPlaceholder');
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-16">
      {/* Mobile Header with Search */}
      <MobilePageHeader
        title={t('nav.partners')}
        showLogo
        searchPlaceholder={getSearchPlaceholder()}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <FilterPills
          options={filterOptions}
          selected={activeFilter}
          onSelect={(id) => {
            setActiveFilter(id);
            setSearchQuery('');
          }}
        />
      </MobilePageHeader>

      {/* Desktop Search + Filters */}
      <div className="hidden md:block sticky top-14 bg-background/95 backdrop-blur-md z-30 py-2">
        <div className="container mx-auto px-4 space-y-2">
          <FilterPills
            options={filterOptions}
            selected={activeFilter}
            onSelect={(id) => {
              setActiveFilter(id);
              setSearchQuery('');
            }}
          />
        </div>
      </div>

      {/* Content */}
      {showPartners && (
        <>
          {/* Partners Grid */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {activeFilter === 'all' ? t('partners.partners') : filterOptions.find(f => f.id === activeFilter)?.label}
                </h2>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    ({filteredPartners.length})
                  </span>
                )}
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
                  <p className="text-xs text-muted-foreground">{t('partners.eurContributed')}</p>
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
      )}

      {showVolunteers && (
        <>
          {/* Volunteers Grid */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {t('partners.volunteers')}
                </h2>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    ({filteredVolunteers.length})
                  </span>
                )}
              </div>
              
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <VolunteerCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredVolunteers.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {showSitters && (
        <>
          {/* Pet Sitters Grid */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-accent/20 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">{t('community.petSittersTitle')}</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('community.petSittersDesc')}
                </p>
              </div>

              {/* Section Header */}
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  {t('community.availableSitters')}
                </h2>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    ({filteredSitters.length})
                  </span>
                )}
              </div>
              
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PetSitterCardSkeleton key={i} />
                  ))}
                </div>
              ) : filteredSitters.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredSitters.map((sitter) => (
                    <PetSitterCard key={sitter.id} sitter={sitter} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {t('community.noSittersFound')}
                </div>
              )}
            </div>
          </section>

          {/* Sitter Stats */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-3 gap-4 text-center bg-muted/50 rounded-xl py-4">
                <div>
                  <p className="text-xl font-bold text-primary">{mockPetSitters.length}</p>
                  <p className="text-xs text-muted-foreground">{t('community.petSitters')}</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{mockPetSitters.filter(s => s.verified).length}</p>
                  <p className="text-xs text-muted-foreground">Verified</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">4.9</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Sitter */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="bg-muted/50 rounded-xl p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-3">
                  <Home className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {t('community.offerSitting')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                  {t('community.offerSittingDesc')}
                </p>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Home className="w-4 h-4 mr-2" />
                  {t('community.becomeSitter')}
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
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center">
            <Star className="w-3 h-3 text-warning-foreground fill-current" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-foreground truncate">{volunteer.name}</h3>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({
                  title: volunteer.name,
                  text: volunteer.bio,
                  url: `${window.location.origin}/volunteers/${volunteer.id}`,
                });
              } else {
                navigator.clipboard.writeText(`${window.location.origin}/volunteers/${volunteer.id}`);
              }
            }}
            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
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

    {/* Inline Stats Row */}
    <div className="flex items-center gap-3 mb-3 text-xs">
      <div className="flex items-center gap-1">
        <PawPrint className="w-3.5 h-3.5 text-primary" />
        <span className="font-semibold text-foreground">{volunteer.stats.animalsHelped}</span>
        <span className="text-muted-foreground">Helped</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="w-3.5 h-3.5 text-accent" />
        <span className="font-semibold text-foreground">{volunteer.stats.adoptions}</span>
        <span className="text-muted-foreground">Adoptions</span>
      </div>
    </div>

    {/* Badges - Mobile: single row with short labels, Desktop: full labels */}
    {volunteer.badges.length > 0 && (
      <>
        {/* Mobile: Short badges in single row */}
        <div className="flex gap-1 overflow-hidden sm:hidden">
          {(volunteer.badgesMobile || volunteer.badges).slice(0, 3).map((badge, index) => (
            <span
              key={badge}
              className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full whitespace-nowrap flex-shrink-0"
            >
              {badge}
            </span>
          ))}
          {volunteer.badges.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full whitespace-nowrap flex-shrink-0">
              +{volunteer.badges.length - 3}
            </span>
          )}
        </div>
        {/* Desktop: Full badges with wrap */}
        <div className="hidden sm:flex flex-wrap gap-1">
          {volunteer.badges.slice(0, 3).map((badge) => (
            <span
              key={badge}
              className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
            >
              {badge}
            </span>
          ))}
          {volunteer.badges.length > 3 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
              +{volunteer.badges.length - 3}
            </span>
          )}
        </div>
      </>
    )}
  </Link>
);

// Pet Sitter Card Component
const PetSitterCard = ({ sitter }: { sitter: typeof mockPetSitters[0] }) => (
  <div className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all">
    <div className="flex items-start gap-3 mb-3">
      <div className="relative">
        <img
          src={sitter.avatar}
          alt={sitter.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {sitter.verified && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground truncate">{sitter.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 text-warning fill-warning" />
          <span>{sitter.rating.toFixed(1)}</span>
          <span className="mx-1">·</span>
          <span>{sitter.reviewCount} reviews</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <MapPin className="w-3 h-3" />
          <span>{sitter.location}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-bold text-primary">€{sitter.hourlyRate}</span>
        <p className="text-xs text-muted-foreground">/hour</p>
      </div>
    </div>

    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{sitter.bio}</p>

    <div className="flex flex-wrap gap-1 mb-3">
      {sitter.services.map((service) => (
        <span
          key={service}
          className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full"
        >
          {service}
        </span>
      ))}
    </div>

    <Button className="w-full" size="sm">
      <MessageCircle className="w-4 h-4 mr-2" />
      Contact
    </Button>
  </div>
);

// Skeleton Components
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

const PetSitterCardSkeleton = () => (
  <div className="bg-card rounded-xl p-4 animate-pulse border border-border">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-full bg-muted" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-3 w-16 bg-muted rounded" />
      </div>
      <div className="h-6 w-12 bg-muted rounded" />
    </div>
    <div className="h-10 bg-muted rounded mb-3" />
    <div className="flex gap-1 mb-3">
      <div className="h-5 w-16 bg-muted rounded-full" />
      <div className="h-5 w-20 bg-muted rounded-full" />
    </div>
    <div className="h-8 bg-muted rounded" />
  </div>
);

export default Partners;
