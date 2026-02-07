import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PartnerCard } from '@/components/PartnerCard';
import { FilterPills } from '@/components/FilterPills';
import { PartnerCardSkeleton } from '@/components/skeletons/CardSkeleton';
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
  Share2,
  Coins
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Partner, Volunteer } from '@/types';

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from Convex
  const rawPartners = useQuery(api.partners.list, {});
  const rawVolunteers = useQuery(api.volunteers.list, {});
  const partnerStats = useQuery(api.partners.getStats, {});
  
  const isLoading = rawPartners === undefined || rawVolunteers === undefined;

  // Transform Convex data to match frontend types
  const partners: Partner[] = (rawPartners ?? []).map((p) => ({
    id: p._id,
    name: p.name,
    logo: p.logo,
    contribution: p.contribution,
    description: p.description,
    type: p.type,
    website: p.website,
    since: p.since,
    animalsHelped: p.animalsHelped,
    totalContributed: p.totalContributed,
    featured: p.featured,
  }));

  const volunteers: Volunteer[] = (rawVolunteers ?? []).map((v) => ({
    id: v._id,
    name: v.name ?? 'Unknown',
    avatar: v.avatar ?? '',
    bio: v.bio,
    location: v.location,
    rating: v.rating,
    memberSince: v.memberSince,
    isTopVolunteer: v.isTopVolunteer,
    badges: v.badges,
    stats: v.stats,
  }));

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
  const filteredPartners = partners.filter((partner) => {
    const matchesDomain = activeFilter === 'all' || partner.type === activeFilter;
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contribution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((volunteer) => {
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
  const totalAnimalsHelped = volunteers.reduce((sum, v) => sum + v.stats.animalsHelped, 0);
  const totalHours = volunteers.reduce((sum, v) => sum + v.stats.hoursVolunteered, 0);

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
        searchMode="adaptive"
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
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/50">
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2">
                      <Handshake className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {partnerStats?.totalPartners ?? partners.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('partners.partners')}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 mb-2">
                      <Heart className="w-5 h-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {partnerStats?.totalAnimalsHelped?.toLocaleString() ?? '1,200'}+
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('partners.animalsHelped')}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10 mb-2">
                      <Coins className="w-5 h-5 text-warning" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      €{partnerStats?.totalContributed?.toLocaleString() ?? '50,000'}+
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('partners.eurContributed')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Partner */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="overflow-hidden bg-surface border border-border/60 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 ring-4 ring-primary/5 mx-auto mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('partners.makeADifference')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
                  {t('partners.joinPartners')}
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/50">
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2">
                      <HandHeart className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {volunteers.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('partners.volunteers')}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-destructive/10 mb-2">
                      <Heart className="w-5 h-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {totalAnimalsHelped.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('partners.animalsHelped')}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {totalHours.toLocaleString()}+
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('partners.hoursGiven')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Volunteer */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="overflow-hidden bg-surface border border-border/60 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 ring-4 ring-primary/5 mx-auto mb-4">
                  <HandHeart className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('partners.makeADifference')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
                  {t('partners.joinVolunteers')}
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
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
              <div className="bg-surface border border-border/60 rounded-xl p-4 mb-4">
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
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-border/50">
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {mockPetSitters.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('community.petSitters')}
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-success/10 mb-2">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      {mockPetSitters.filter(s => s.verified).length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verified
                    </p>
                  </div>
                  <div className="p-4 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10 mb-2">
                      <Star className="w-5 h-5 text-warning" />
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-none">
                      4.9
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avg Rating
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Become a Sitter */}
          <section className="py-4">
            <div className="container mx-auto px-4">
              <div className="overflow-hidden bg-surface border border-border/60 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 ring-4 ring-accent/5 mx-auto mb-4">
                  <Home className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {t('community.offerSitting')}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
                  {t('community.offerSittingDesc')}
                </p>
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
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
  volunteer: Volunteer;
}

const VolunteerCard = ({ volunteer }: VolunteerCardProps) => (
  <Link to={`/volunteers/${volunteer.id}`} className="block group">
    <div className="bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-300 overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={volunteer.avatar}
              alt={volunteer.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border/50"
            />
            {volunteer.isTopVolunteer && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-warning rounded-full flex items-center justify-center ring-2 ring-background">
                <Star className="w-3 h-3 text-warning-foreground fill-current" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {volunteer.name}
              </h3>
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
                className="text-muted-foreground hover:text-primary transition-colors shrink-0 p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Star className="w-3.5 h-3.5 text-warning fill-warning" />
              <span className="font-medium">{volunteer.rating.toFixed(1)}</span>
              <span className="mx-0.5">·</span>
              <Calendar className="w-3.5 h-3.5" />
              <span>{volunteer.memberSince}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{volunteer.location}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
          {volunteer.bio}
        </p>
      </div>

      {/* Stats Section */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <PawPrint className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-none">
                {volunteer.stats.animalsHelped}
              </p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Helped
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-destructive/5 rounded-lg px-3 py-2">
            <div className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
              <Heart className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground leading-none">
                {volunteer.stats.adoptions}
              </p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Adoptions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Footer */}
      {volunteer.badges.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20">
          <div className="flex gap-1.5 flex-wrap">
            {volunteer.badges.slice(0, 3).map((badge) => (
              <span
                key={badge}
                className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
              >
                {badge}
              </span>
            ))}
            {volunteer.badges.length > 3 && (
              <span className="px-2.5 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full border border-border">
                +{volunteer.badges.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  </Link>
);

// Pet Sitter Card Component
const PetSitterCard = ({ sitter }: { sitter: typeof mockPetSitters[0] }) => (
  <div className="bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-300 overflow-hidden h-full flex flex-col">
    {/* Header */}
    <div className="p-4 pb-3">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <img
            src={sitter.avatar}
            alt={sitter.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-border/50"
          />
          {sitter.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center ring-2 ring-background">
              <Shield className="w-3 h-3 text-success-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-1">
            {sitter.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="font-medium">{sitter.rating.toFixed(1)}</span>
            <span className="mx-0.5">·</span>
            <span>{sitter.reviewCount} reviews</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{sitter.location}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="bg-primary/10 rounded-lg px-2.5 py-1.5">
            <span className="text-base font-bold text-primary leading-none block">
              €{sitter.hourlyRate}
            </span>
            <p className="text-xs text-muted-foreground leading-none mt-0.5">
              /hour
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-2">
        {sitter.bio}
      </p>
    </div>

    {/* Services */}
    <div className="px-4 pb-3 flex-1">
      <div className="flex flex-wrap gap-1.5">
        {sitter.services.map((service) => (
          <span
            key={service}
            className="px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full border border-primary/20"
          >
            {service}
          </span>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="p-4 pt-3 border-t border-border/50 bg-muted/20">
      <Button className="w-full" size="sm">
        <MessageCircle className="w-4 h-4 mr-2" />
        Contact
      </Button>
    </div>
  </div>
);

// Skeleton Components
const VolunteerCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border/50 overflow-hidden h-full animate-pulse">
    <div className="p-4 pb-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="w-8 h-8 bg-muted rounded" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-4/5 bg-muted rounded" />
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-16 bg-muted rounded-lg" />
      </div>
    </div>
    <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20">
      <div className="flex gap-1.5">
        <div className="h-7 w-20 bg-muted rounded-full" />
        <div className="h-7 w-24 bg-muted rounded-full" />
        <div className="h-7 w-16 bg-muted rounded-full" />
      </div>
    </div>
  </div>
);

const PetSitterCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border/50 overflow-hidden h-full animate-pulse">
    <div className="p-4 pb-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-3 w-24 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="w-16 h-12 bg-muted rounded-lg" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-3/4 bg-muted rounded" />
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="flex gap-1.5">
        <div className="h-7 w-20 bg-muted rounded-full" />
        <div className="h-7 w-24 bg-muted rounded-full" />
        <div className="h-7 w-16 bg-muted rounded-full" />
      </div>
    </div>
    <div className="p-4 pt-3 border-t border-border/50 bg-muted/20">
      <div className="h-8 w-full bg-muted rounded" />
    </div>
  </div>
);

export default Partners;
