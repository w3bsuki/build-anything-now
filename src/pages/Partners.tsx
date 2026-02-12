import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { PartnerCard } from '@/components/PartnerCard';
import { FilterPills } from '@/components/FilterPills';
import { PartnerCardSkeleton } from '@/components/skeletons/CardSkeleton';
import { MobilePageHeader } from '@/components/MobilePageHeader';
import { StickySegmentRail } from '@/components/layout/StickySegmentRail';
import { PageSection } from '@/components/layout/PageSection';
import { PageShell } from '@/components/layout/PageShell';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { StatsGrid, type StatsGridItem } from '@/components/common/StatsGrid';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Calendar,
  Coins,
  ExternalLink,
  HandHeart,
  Handshake,
  Heart,
  MapPin,
  PawPrint,
  Phone,
  Share2,
  Shield,
  ShoppingBag,
  Star,
} from 'lucide-react';
import type { DirectorySegment, Partner, StoreServiceCardViewModel, Volunteer } from '@/types';

type ServiceFilter = 'all' | 'pet_store' | 'grooming' | 'training' | 'shelter' | 'pet_sitting' | 'pet_hotel' | 'pharmacy' | 'other';

const segmentValues: DirectorySegment[] = ['partners', 'volunteers', 'stores_services'];

const serviceTypeLabels: Record<Exclude<ServiceFilter, 'all'>, string> = {
  pet_store: 'Pet Stores',
  grooming: 'Grooming',
  training: 'Training',
  shelter: 'Shelters',
  pet_sitting: 'Pet Sitting',
  pet_hotel: 'Pet Hotels',
  pharmacy: 'Pharmacies',
  other: 'Other',
};

function getSegmentFromQuery(value: string | null): DirectorySegment {
  if (value && segmentValues.includes(value as DirectorySegment)) {
    return value as DirectorySegment;
  }
  return 'partners';
}

const Partners = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');

  const segment = getSegmentFromQuery(searchParams.get('segment'));

  const setSegment = (next: DirectorySegment) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'partners') {
      params.delete('segment');
    } else {
      params.set('segment', next);
    }
    setSearchQuery('');
    setServiceFilter('all');
    setSearchParams(params, { replace: true });
  };

  const rawPartners = useQuery(api.partners.list, {});
  const partnerStats = useQuery(api.partners.getStats, {});
  const rawVolunteers = useQuery(api.volunteers.list, {});
  const rawServices = useQuery(api.petServices.list, {
    excludeClinics: true,
    type: serviceFilter === 'all' ? undefined : serviceFilter,
    search: searchQuery.trim() || undefined,
    limit: 120,
  });

  const partners: Partner[] = (rawPartners ?? []).map((partner) => ({
    id: partner._id,
    name: partner.name,
    logo: partner.logo,
    contribution: partner.contribution,
    description: partner.description,
    type: partner.type,
    website: partner.website,
    since: partner.since,
    animalsHelped: partner.animalsHelped,
    totalContributed: partner.totalContributed,
    featured: partner.featured,
  }));

  const volunteers: Volunteer[] = (rawVolunteers ?? []).map((volunteer) => ({
    id: volunteer._id,
    name: volunteer.name ?? 'Unknown',
    avatar: volunteer.avatar ?? '',
    bio: volunteer.bio,
    location: volunteer.location,
    rating: volunteer.rating,
    memberSince: volunteer.memberSince,
    isTopVolunteer: volunteer.isTopVolunteer,
    badges: volunteer.badges,
    stats: volunteer.stats,
  }));

  const services: StoreServiceCardViewModel[] = (rawServices ?? []).map((service) => ({
    id: service._id,
    name: service.name,
    type: service.type as StoreServiceCardViewModel['type'],
    city: service.city,
    address: service.address,
    phone: service.phone,
    website: service.website,
    description: service.description,
    services: service.services,
    verified: service.verified,
    isClaimed: service.isClaimed,
    ownerId: service.ownerId,
    rating: service.rating,
    reviewCount: service.reviewCount,
    is24h: service.is24h,
  }));

  const searchLower = searchQuery.trim().toLowerCase();

  const filteredPartners = useMemo(
    () =>
      partners.filter((partner) =>
        searchLower.length === 0
          ? true
          : partner.name.toLowerCase().includes(searchLower) ||
            partner.contribution.toLowerCase().includes(searchLower) ||
            partner.description.toLowerCase().includes(searchLower),
      ),
    [partners, searchLower],
  );

  const filteredVolunteers = useMemo(
    () =>
      volunteers.filter((volunteer) =>
        searchLower.length === 0
          ? true
          : volunteer.name.toLowerCase().includes(searchLower) ||
            volunteer.location.toLowerCase().includes(searchLower) ||
            volunteer.bio.toLowerCase().includes(searchLower),
      ),
    [volunteers, searchLower],
  );

  const segmentOptions = [
    { id: 'partners', label: t('partners.partners', 'Partners'), icon: <Handshake className="w-3.5 h-3.5" /> },
    { id: 'volunteers', label: t('partners.volunteers', 'Volunteers'), icon: <HandHeart className="w-3.5 h-3.5" /> },
    { id: 'stores_services', label: t('partners.services', 'Stores & Services'), icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  const serviceOptions: { id: ServiceFilter; label: string }[] = [
    { id: 'all', label: t('partners.all', 'All') },
    { id: 'pet_store', label: t('partners.petShops', 'Pet Stores') },
    { id: 'grooming', label: t('partners.grooming', 'Grooming') },
    { id: 'training', label: t('partners.training', 'Training') },
    { id: 'shelter', label: t('partners.shelters', 'Shelters') },
    { id: 'pet_sitting', label: t('partners.petSitting', 'Pet Sitting') },
    { id: 'pet_hotel', label: t('partners.petHotels', 'Pet Hotels') },
    { id: 'pharmacy', label: t('partners.pharmacies', 'Pharmacies') },
    { id: 'other', label: t('partners.other', 'Other') },
  ];

  const partnerStatsItems: StatsGridItem[] = [
    {
      id: 'partners',
      label: t('partners.partners', 'Partners'),
      value: String(partnerStats?.totalPartners ?? partners.length),
      icon: <Handshake className="w-5 h-5" />,
      tone: 'primary',
    },
    {
      id: 'animals-helped',
      label: t('partners.animalsHelped', 'Animals Helped'),
      value: (partnerStats?.totalAnimalsHelped ?? 0).toLocaleString(),
      icon: <Heart className="w-5 h-5" />,
      tone: 'destructive',
    },
    {
      id: 'contributed',
      label: t('partners.eurContributed', 'EUR Contributed'),
      value: `€${(partnerStats?.totalContributed ?? 0).toLocaleString()}`,
      icon: <Coins className="w-5 h-5" />,
      tone: 'warning',
    },
  ];

  const volunteerStatsItems: StatsGridItem[] = [
    {
      id: 'volunteers',
      label: t('partners.volunteers', 'Volunteers'),
      value: String(filteredVolunteers.length),
      icon: <HandHeart className="w-5 h-5" />,
      tone: 'primary',
    },
    {
      id: 'animals-helped',
      label: t('partners.animalsHelped', 'Animals Helped'),
      value: filteredVolunteers.reduce((acc, volunteer) => acc + volunteer.stats.animalsHelped, 0).toLocaleString(),
      icon: <Heart className="w-5 h-5" />,
      tone: 'destructive',
    },
    {
      id: 'hours',
      label: t('partners.hoursGiven', 'Hours Given'),
      value: filteredVolunteers.reduce((acc, volunteer) => acc + volunteer.stats.hoursVolunteered, 0).toLocaleString(),
      icon: <Calendar className="w-5 h-5" />,
      tone: 'primary',
    },
  ];

  const servicesStatsItems: StatsGridItem[] = [
    {
      id: 'services-total',
      label: t('partners.services', 'Stores & Services'),
      value: String(services.length),
      icon: <Building2 className="w-5 h-5" />,
      tone: 'primary',
    },
    {
      id: 'services-verified',
      label: t('partners.verified', 'Verified'),
      value: String(services.filter((service) => service.verified).length),
      icon: <Shield className="w-5 h-5" />,
      tone: 'success',
    },
    {
      id: 'services-claimed',
      label: t('partners.claimed', 'Claimed'),
      value: String(services.filter((service) => service.isClaimed).length),
      icon: <PawPrint className="w-5 h-5" />,
      tone: 'accent',
    },
  ];

  const searchPlaceholder =
    segment === 'volunteers'
      ? t('partners.searchVolunteers', 'Search volunteers...')
      : segment === 'stores_services'
        ? t('partners.searchServices', 'Search stores and services...')
        : t('partners.searchPlaceholder', 'Search partners...');

  const isPartnersLoading = rawPartners === undefined || partnerStats === undefined;
  const isVolunteersLoading = rawVolunteers === undefined;
  const isServicesLoading = rawServices === undefined;

  return (
    <PageShell>
      <MobilePageHeader
        title={t('nav.partners', 'Partners')}
        showLogo
        searchPlaceholder={searchPlaceholder}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchMode="adaptive"
      >
        <div className="space-y-2">
          <FilterPills
            options={segmentOptions}
            selected={segment}
            onSelect={(id) => setSegment(id as DirectorySegment)}
          />
          {segment === 'stores_services' ? (
            <FilterPills
              options={serviceOptions}
              selected={serviceFilter}
              onSelect={(id) => setServiceFilter(id as ServiceFilter)}
            />
          ) : null}
        </div>
      </MobilePageHeader>

      <StickySegmentRail contentClassName="space-y-2">
        <FilterPills
          options={segmentOptions}
          selected={segment}
          onSelect={(id) => setSegment(id as DirectorySegment)}
        />
        {segment === 'stores_services' ? (
          <FilterPills
            options={serviceOptions}
            selected={serviceFilter}
            onSelect={(id) => setServiceFilter(id as ServiceFilter)}
          />
        ) : null}
      </StickySegmentRail>

      {segment === 'partners' ? (
        <>
          <PageSection>
            <SectionHeader title={t('partners.partners', 'Partners')} count={isPartnersLoading ? undefined : filteredPartners.length} />
            {isPartnersLoading ? (
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
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t('partners.noPartnersFound', 'No partners found.')}
              </div>
            )}
          </PageSection>

          <PageSection>
            <StatsGrid items={partnerStatsItems} />
          </PageSection>

          <PageSection>
            <div className="rounded-2xl border border-border/60 bg-surface-elevated p-6 text-center shadow-xs">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-4 ring-primary/5">
                <Handshake className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display mb-2 text-lg font-bold text-foreground">{t('partners.makeADifference', 'Make a difference')}</h3>
              <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t('partners.joinPartners', 'Join Pawtreon as a partner and support transparent, trust-first rescue work.')}
              </p>
              <Button asChild size="lg">
                <Link to="/onboarding/claim">{t('partners.becomePartner', 'Become a partner')}</Link>
              </Button>
            </div>
          </PageSection>
        </>
      ) : null}

      {segment === 'volunteers' ? (
        <>
          <PageSection>
            <SectionHeader
              title={t('partners.volunteers', 'Volunteers')}
              count={isVolunteersLoading ? undefined : filteredVolunteers.length}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link to="/volunteers">{t('partners.openVolunteerDirectory', 'Open directory')}</Link>
                </Button>
              }
            />
            {isVolunteersLoading ? (
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
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t('partners.noVolunteersFound', 'No volunteers found.')}
              </div>
            )}
          </PageSection>

          <PageSection>
            <StatsGrid items={volunteerStatsItems} />
          </PageSection>

          <PageSection>
            <div className="rounded-2xl border border-border/60 bg-surface-elevated p-6 text-center shadow-xs">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-4 ring-primary/5">
                <HandHeart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display mb-2 text-lg font-bold text-foreground">{t('partners.joinVolunteers', 'Join volunteers')}</h3>
              <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t('partners.volunteerCtaBody', 'Help with transport, fostering, and on-the-ground rescue operations.')}
              </p>
              <Button asChild size="lg">
                <Link to="/onboarding">{t('partners.becomeVolunteer', 'Become a volunteer')}</Link>
              </Button>
            </div>
          </PageSection>
        </>
      ) : null}

      {segment === 'stores_services' ? (
        <>
          <PageSection>
            <SectionHeader
              title={t('partners.services', 'Stores & Services')}
              count={isServicesLoading ? undefined : services.length}
              description={t(
                'partners.servicesReferralOnly',
                'Referral-only directory: discover trusted providers and contact them directly.',
              )}
            />
            {isServicesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <StoreServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {t('partners.noServicesFound', 'No services found for this filter.')}
              </div>
            )}
          </PageSection>

          <PageSection>
            <StatsGrid items={servicesStatsItems} />
          </PageSection>

          <PageSection>
            <div className="rounded-2xl border border-border/60 bg-surface-elevated p-6 text-center shadow-xs">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-4 ring-primary/5">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display mb-2 text-lg font-bold text-foreground">{t('partners.listYourService', 'List your service')}</h3>
              <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t(
                  'partners.servicesCtaBody',
                  'Own a pet store or service business? Join the directory and support rescue-first outcomes.',
                )}
              </p>
              <Button asChild size="lg">
                <Link to="/onboarding/claim">{t('partners.claimBusiness', 'Claim your business')}</Link>
              </Button>
            </div>
          </PageSection>
        </>
      ) : null}
    </PageShell>
  );
};

interface VolunteerCardProps {
  volunteer: Volunteer;
}

const VolunteerCard = ({ volunteer }: VolunteerCardProps) => (
  <Link to={`/volunteers/${volunteer.id}`} className="block group">
    <div className="h-full overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated shadow-xs transition-all hover:border-primary/30 hover:shadow-sm">
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <img
              src={volunteer.avatar}
              alt={volunteer.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-border/50"
            />
            {volunteer.isTopVolunteer ? (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning ring-2 ring-background">
                <Star className="h-3 w-3 fill-current text-warning-foreground" />
              </div>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                {volunteer.name}
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const url = `${window.location.origin}/volunteers/${volunteer.id}`;
                  if (navigator.share) {
                    void navigator.share({
                      title: volunteer.name,
                      text: volunteer.bio,
                      url,
                    });
                    return;
                  }
                  void navigator.clipboard.writeText(url);
                }}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              <span className="font-medium">{volunteer.rating.toFixed(1)}</span>
              <span className="mx-0.5">·</span>
              <Calendar className="h-3.5 w-3.5" />
              <span>{volunteer.memberSince}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{volunteer.location}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{volunteer.bio}</p>
      </div>

      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20">
              <PawPrint className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-foreground">{volunteer.stats.animalsHelped}</p>
              <p className="mt-0.5 text-xs leading-none text-muted-foreground">Helped</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-destructive/20">
              <Heart className="h-3.5 w-3.5 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-bold leading-none text-foreground">{volunteer.stats.adoptions}</p>
              <p className="mt-0.5 text-xs leading-none text-muted-foreground">Adoptions</p>
            </div>
          </div>
        </div>
      </div>

      {volunteer.badges.length > 0 ? (
        <div className="border-t border-border/50 bg-surface-sunken/55 px-4 pb-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {volunteer.badges.slice(0, 3).map((badge) => (
              <span key={badge} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {badge}
              </span>
            ))}
            {volunteer.badges.length > 3 ? (
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                +{volunteer.badges.length - 3}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  </Link>
);

const StoreServiceCard = ({ service }: { service: StoreServiceCardViewModel }) => {
  const toneClass =
    service.type === 'pet_store'
      ? 'bg-primary/10 text-primary'
      : service.type === 'pharmacy'
        ? 'bg-warning/10 text-warning'
        : service.type === 'shelter'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-accent/15 text-accent-foreground';

  const typeLabel = serviceTypeLabels[service.type] ?? service.type;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-surface-elevated p-4 shadow-xs">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-1 font-display text-sm font-semibold text-foreground">{service.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{service.city}</span>
          </div>
        </div>
        {service.verified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
            <Shield className="h-3.5 w-3.5" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{typeLabel}</span>
        {service.is24h ? (
            <span className="rounded-full border border-border/50 bg-surface-sunken px-2.5 py-1 text-xs font-semibold text-foreground">24/7</span>
        ) : null}
        {service.rating ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-surface-sunken px-2.5 py-1 text-xs font-semibold text-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            {service.rating}
            {service.reviewCount ? ` (${service.reviewCount})` : ''}
          </span>
        ) : null}
      </div>

      {service.description ? (
        <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{service.description}</p>
      ) : null}

      {service.services.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {service.services.slice(0, 3).map((entry) => (
            <span key={entry} className="rounded-full border border-border/70 bg-surface-sunken/75 px-2 py-0.5 text-[11px] text-muted-foreground">
              {entry}
            </span>
          ))}
          {service.services.length > 3 ? (
            <span className="rounded-full border border-border/70 bg-surface-sunken/75 px-2 py-0.5 text-[11px] text-muted-foreground">
              +{service.services.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto border-t border-border/50 pt-3">
        <div className="flex gap-2">
          {service.website ? (
            <Button asChild size="sm" className="h-9 flex-1">
              <a href={service.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Visit Website
              </a>
            </Button>
          ) : null}
          {service.phone ? (
            <Button asChild size="sm" variant={service.website ? 'outline' : 'default'} className="h-9 flex-1">
              <a href={`tel:${service.phone}`}>
                <Phone className="mr-1.5 h-4 w-4" />
                Call
              </a>
            </Button>
          ) : null}
          {!service.website && !service.phone ? (
            <span className="w-full rounded-md border border-border/70 bg-surface-sunken px-3 py-2 text-center text-xs text-muted-foreground">
              Contact details pending
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

const VolunteerCardSkeleton = () => (
  <div className="h-full animate-pulse overflow-hidden rounded-2xl border border-border/60 bg-surface-elevated">
    <div className="p-4 pb-3">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-3 w-20 rounded bg-muted" />
        </div>
        <div className="h-8 w-8 rounded bg-muted" />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 rounded-lg bg-muted" />
        <div className="h-16 rounded-lg bg-muted" />
      </div>
    </div>
    <div className="border-t border-border/50 bg-surface-sunken/55 px-4 pb-4 pt-2">
      <div className="flex gap-1.5">
        <div className="h-7 w-20 rounded-full bg-muted" />
        <div className="h-7 w-24 rounded-full bg-muted" />
        <div className="h-7 w-16 rounded-full bg-muted" />
      </div>
    </div>
  </div>
);

const ServiceCardSkeleton = () => (
  <div className="h-full animate-pulse rounded-2xl border border-border/60 bg-surface-elevated p-4">
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="space-y-2">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="h-3 w-24 rounded bg-muted" />
      </div>
      <div className="h-6 w-20 rounded-full bg-muted" />
    </div>
    <div className="mb-3 flex gap-1.5">
      <div className="h-6 w-20 rounded-full bg-muted" />
      <div className="h-6 w-16 rounded-full bg-muted" />
    </div>
    <div className="mb-3 space-y-1.5">
      <div className="h-3 w-full rounded bg-muted" />
      <div className="h-3 w-4/5 rounded bg-muted" />
      <div className="h-3 w-3/5 rounded bg-muted" />
    </div>
    <div className="mt-3 border-t border-border/50 pt-3">
      <div className="h-9 rounded bg-muted" />
    </div>
  </div>
);

export default Partners;
