import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ScanSearch,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { 
  presentationCampaigns as mockCampaigns, 
  presentationCases as mockCases, 
  presentationClinics as mockClinics, 
  presentationPartners as mockPartners, 
  presentationVolunteers as mockVolunteers 
} from '@/data/presentationData';
import { CampaignCard } from '@/components/CampaignCard';
import { CaseCard } from '@/components/CaseCard';
import { ClinicCard } from '@/components/ClinicCard';
import { PartnerCard } from '@/components/PartnerCard';
import { UpdatesTimeline } from '@/components/UpdatesTimeline';
import type { Volunteer } from '@/types';

type SlideDefinition = {
  id: string;
  render: () => ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function Presentation() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const contactEmailRaw = import.meta.env['VITE_INVESTOR_CONTACT_EMAIL'];
  const contactEmail = typeof contactEmailRaw === 'string' ? contactEmailRaw.trim() : '';
  const deckLanguage = searchParams.get('lang') || 'en';

  useEffect(() => {
    const previousLanguage = i18n.language;
    if (deckLanguage && deckLanguage !== previousLanguage) {
      i18n.changeLanguage(deckLanguage);
    }

    return () => {
      if (previousLanguage && i18n.language !== previousLanguage) {
        i18n.changeLanguage(previousLanguage);
      }
    };
  }, [deckLanguage, i18n]);

  const copyDeckLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      const { dismiss } = toast({
        title: 'Link copied!',
        description: <span className="font-mono text-xs break-all">{url}</span>,
      });
      window.setTimeout(() => dismiss(), 2500);
      return;
    } catch (error) {
      void error;
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Pawtreon deck', url });
        return;
      } catch {
        // user cancelled or share unsupported
      }
    }

    window.prompt('Copy this link:', url);
  }, []);

  const slides = useMemo<SlideDefinition[]>(
    () => [
      {
        id: 'title',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-5xl">
            <div className="text-6xl md:text-8xl">🐾</div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:mt-6 md:text-7xl">
              Paw<span className="text-primary">treon</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:mt-4 md:text-2xl">
              Crowdfunded emergency care for street animals
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Badge>Live MVP</Badge>
              <Button
                asChild
                variant="link"
                size="sm"
                className="h-auto p-0 text-base"
              >
                <a
                  href="https://pawtreon.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  pawtreon.org
                  <ExternalLink className="ml-1.5 size-4" />
                </a>
              </Button>
            </div>
          </div>
        ),
      },
      {
        id: 'problem',
        render: () => {
          const problemCards = [
            {
              icon: '🚑',
              title: 'Emergency care gap',
              description:
                'Good Samaritans find injured animals but can’t afford €200–€2000 vet bills. Animals suffer or die waiting.',
            },
            {
              icon: '💸',
              title: 'Clinics need payment',
              description:
                'Veterinary clinics require upfront payment. No guarantee often means no treatment—even for critical cases.',
            },
            {
              icon: '📱',
              title: 'No dedicated platform',
              description:
                'Generic crowdfunding tools lack vet integration, verification, and the trust signals animal rescue needs.',
            },
          ];

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
              <Kicker>The problem</Kicker>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
                600M+ stray animals need help
              </h2>

              <div className="mt-8 md:hidden">
                <div
                  data-deck-swipe="ignore"
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {problemCards.map((card) => (
                    <div key={card.title} className="w-80 shrink-0 snap-start">
                      <InfoCard {...card} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  Swipe to preview
                </div>
              </div>

              <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
                {problemCards.map((card) => (
                  <InfoCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: 'solution',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Our solution</Kicker>
            <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                  A focused platform for animal emergency funding
                </h2>
                <ul className="mt-6 space-y-3 text-base text-muted-foreground md:text-lg">
                  {[
                    'Create cases in minutes',
                    'Funds go to verified clinics (not to individuals)',
                    'Emergency clinic directory (24/7, specialties, verified)',
                    'Real-time updates + proof donors can trust',
                    'Mobile-first sharing built in',
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Card className="shadow-lg">
                <CardHeader className="p-4 pb-3 md:p-6">
                  <div className="flex items-center justify-between gap-4">     
                    <div className="font-semibold">🐾 Pawtreon</div>
                    <Badge variant="secondary">Campaign feed</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
                  <MockCampaign
                    emoji="🐕"
                    title="Freezing puppy in Sofia"
                    progress={64}
                    current="320 BGN"
                    goal="500 BGN"
                  />
                  <MockCampaign
                    emoji="🐈"
                    title="Cat needs surgery"
                    progress={56}
                    current="450 BGN"
                    goal="800 BGN"
                  />
                  <MockCampaign
                    emoji="🐕‍🦺"
                    title="Mama dog with puppies"
                    progress={18}
                    current="180 BGN"
                    goal="1000 BGN"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: 'product-real-ui',
        render: () => {
          const featuredCases = mockCases.slice(0, 2);
          const featuredCampaigns = mockCampaigns.slice(0, 2);
          const updatesCase = mockCases[0];
          const updatesPreview = updatesCase.updates
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
              <Kicker>Product</Kicker>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
                Show the real app UI
              </h2>
              <p className="mt-3 text-base text-muted-foreground md:text-xl">
                Real UI components from the app (cases, campaigns, updates).
              </p>

              <div className="mt-8 md:hidden">
                <Tabs defaultValue="cases" className="w-full">
                  <TabsList className="grid h-11 w-full grid-cols-3">
                    <TabsTrigger value="cases">Cases</TabsTrigger>
                    <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                    <TabsTrigger value="updates">Updates</TabsTrigger>
                  </TabsList>

                  <TabsContent value="cases" className="mt-4">
                    <div
                      data-deck-swipe="ignore"
                      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredCases.map((caseData) => (
                        <div
                          key={caseData.id}
                          className="w-72 shrink-0 snap-start pointer-events-none [&_button[aria-label='Share']]:hidden"
                        >
                          <CaseCard caseData={caseData} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      Swipe to preview more
                    </div>
                  </TabsContent>

                  <TabsContent value="campaigns" className="mt-4">
                    <div
                      data-deck-swipe="ignore"
                      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="w-72 shrink-0 snap-start pointer-events-none [&_button[aria-label='Share']]:hidden"
                        >
                          <CampaignCard campaign={campaign} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      Swipe to preview more
                    </div>
                  </TabsContent>

                  <TabsContent value="updates" className="mt-4">
                    <Card>
                      <CardHeader className="p-4 pb-3 md:p-6">
                        <CardTitle className="text-base">Clinic-verified updates</CardTitle>
                        <CardDescription>
                          A medical-style timeline with proof and progress
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                        <UpdatesTimeline updates={updatesPreview} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-8 hidden gap-6 md:grid md:grid-cols-2 md:gap-10">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-semibold">Emergency cases</div>
                    <div
                      data-deck-swipe="ignore"
                      className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredCases.map((caseData) => (
                        <div
                          key={caseData.id}
                          className="w-72 shrink-0 snap-start pointer-events-none [&_button[aria-label='Share']]:hidden"
                        >
                          <CaseCard caseData={caseData} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Fundraising campaigns</div>
                    <div
                      data-deck-swipe="ignore"
                      className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredCampaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="w-72 shrink-0 snap-start pointer-events-none [&_button[aria-label='Share']]:hidden"
                        >
                          <CampaignCard campaign={campaign} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Card className="h-fit">
                  <CardHeader className="p-4 pb-3 md:p-6">
                    <CardTitle className="text-xl">Clinic-verified updates</CardTitle>
                    <CardDescription>
                      Donors see progress and medical proof—without generic crowdfunding noise.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                    <UpdatesTimeline updates={updatesPreview} />
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        },
      },
      {
        id: 'create-case',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Flow</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
              Create a case in minutes
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              A guided, mobile-first form that collects the essentials and routes to partner clinics.
            </p>

            <div className="mt-8 md:hidden">
              <Tabs defaultValue="case" className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-2">
                  <TabsTrigger value="case">Case</TabsTrigger>
                  <TabsTrigger value="donation">Donation</TabsTrigger>
                </TabsList>

                <TabsContent value="case" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Case details</CardTitle>
                      <CardDescription>What happened and where the animal is</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                      <Field label="Title" value="Max needs urgent surgery" />
                      <Field label="Location" value="Sofia • Center" />
                      <Field label="Photo proof" value="Upload 2–5 photos" />
                      <Field label="Funding goal" value="€500" />
                      <Field
                        label="Story"
                        value="Short story + what the clinic said"
                        multiline
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="donation" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Donation experience</CardTitle>
                      <CardDescription>Fast, trustworthy checkout + receipts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                      <div className="rounded-2xl border bg-muted/30 p-4">
                        <div className="text-sm font-semibold">Donor journey</div>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>Donate in a few taps</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>Funds reserved for clinic payouts</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>See updates + proof as the case progresses</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                            <span>Optional “thank you” tip to sustain the platform</span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-8 hidden gap-6 md:grid md:grid-cols-2 md:items-start">
              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Case details</CardTitle>
                  <CardDescription>What happened and where the animal is</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                  <Field label="Title" value="Max needs urgent surgery" />
                  <Field label="Location" value="Sofia • Center" />
                  <Field label="Photo proof" value="Upload 2–5 photos" />
                  <Field label="Funding goal" value="€500" />
                  <Field label="Story" value="Short story + what the clinic said" multiline />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Donation experience</CardTitle>
                  <CardDescription>Fast, trustworthy checkout + receipts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                  <div className="rounded-2xl border bg-muted/30 p-4">
                    <div className="text-sm font-semibold">Donor journey</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>Donate in a few taps</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>Funds reserved for clinic payouts</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>See updates + proof as the case progresses</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>Optional “thank you” tip to sustain the platform</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: 'ecosystem',
        render: () => {
          const featuredClinics = mockClinics.filter((clinic) => clinic.verified).slice(0, 4);
          const featuredPartners = mockPartners.filter((partner) => partner.featured).slice(0, 4);
          const featuredVolunteers = mockVolunteers
            .filter((volunteer) => volunteer.isTopVolunteer)
            .slice(0, 4);

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
              <Kicker>Network</Kicker>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
                A trusted ecosystem
              </h2>
              <p className="mt-3 text-base text-muted-foreground md:text-xl">
                Clinics, volunteers, and sponsors—organized into a single, mobile-first directory.
              </p>

              <div className="mt-8 md:hidden">
                <Tabs defaultValue="clinics" className="w-full">
                  <TabsList className="grid h-11 w-full grid-cols-3">
                    <TabsTrigger value="clinics">Clinics</TabsTrigger>
                    <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
                    <TabsTrigger value="partners">Partners</TabsTrigger>
                  </TabsList>

                  <TabsContent value="clinics" className="mt-4">
                    <div
                      data-deck-swipe="ignore"
                      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredClinics.map((clinic) => (
                        <div
                          key={clinic.id}
                          className="w-80 shrink-0 snap-start pointer-events-none [&_button[aria-label='Share']]:hidden"
                        >
                          <ClinicCard clinic={clinic} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      Verified clinics, 24/7 filters, and specialties for emergencies
                    </div>
                  </TabsContent>

                  <TabsContent value="volunteers" className="mt-4">
                    <div
                      data-deck-swipe="ignore"
                      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredVolunteers.map((volunteer) => (
                        <div key={volunteer.id} className="w-72 shrink-0 snap-start">
                          <VolunteerMiniCard volunteer={volunteer} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      A community layer for rescues, fosters, and coordinators
                    </div>
                  </TabsContent>

                  <TabsContent value="partners" className="mt-4">
                    <div
                      data-deck-swipe="ignore"
                      className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                    >
                      {featuredPartners.map((partner) => (
                        <div key={partner.id} className="w-80 shrink-0 snap-start pointer-events-none">
                          <PartnerCard partner={partner} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      Sponsorships and in-kind support (food, supplies, matching drives)
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-10 hidden gap-8 md:grid md:grid-cols-3">
                <div>
                  <div className="text-sm font-semibold">Clinic directory</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Verified clinics, 24/7 availability, and specialties
                  </div>
                  <div className="mt-4 space-y-3">
                    {featuredClinics.slice(0, 2).map((clinic) => (
                      <div
                        key={clinic.id}
                        className="pointer-events-none [&_button[aria-label='Share']]:hidden"
                      >
                        <ClinicCard clinic={clinic} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold">Top volunteers</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Trust signals + recognition helps coordination
                  </div>
                  <div className="mt-4 space-y-3">
                    {featuredVolunteers.slice(0, 3).map((volunteer) => (
                      <VolunteerMiniCard key={volunteer.id} volunteer={volunteer} />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold">Sponsors & partners</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Food brands, pet shops, and CSR sponsors
                  </div>
                  <div className="mt-4 space-y-3">
                    {featuredPartners.slice(0, 2).map((partner) => (
                      <div key={partner.id} className="pointer-events-none">
                        <PartnerCard partner={partner} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'growth',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Growth</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
              Launch plan, then scale city-by-city
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              We start in Bulgaria with a repeatable playbook: clinics → volunteers → sponsors → trust.
            </p>

            <div className="mt-8 md:hidden">
              <Tabs defaultValue="outreach" className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-3">
                  <TabsTrigger value="outreach">Outreach</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                  <TabsTrigger value="expand">Expand</TabsTrigger>
                </TabsList>

                <TabsContent value="outreach" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Clinic outreach</CardTitle>
                      <CardDescription>Simple onboarding, strong verification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground md:p-6 md:pt-0">
                      <DeckBullet>Build a full Bulgaria clinic list (city, 24/7, specialties)</DeckBullet>
                      <DeckBullet>Email + call outreach with a clear “how payouts work” story</DeckBullet>
                      <DeckBullet>Onboard pilot clinics in Sofia first, then expand</DeckBullet>
                      <DeckBullet>Make the clinic directory useful from day one</DeckBullet>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sponsors" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Sponsorship & in-kind</CardTitle>
                      <CardDescription>Food, supplies, matching drives</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground md:p-6 md:pt-0">
                      <DeckBullet>Food brands sponsor monthly nutrition for cases</DeckBullet>
                      <DeckBullet>Pet shops sponsor adoption days and supply drops</DeckBullet>
                      <DeckBullet>CSR sponsors fund matching campaigns + operations</DeckBullet>
                      <DeckBullet>Everything is transparently labeled (trust-first)</DeckBullet>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="expand" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Expansion</CardTitle>
                      <CardDescription>Repeatable “city launch pack”</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground md:p-6 md:pt-0">
                      <DeckBullet>Start Sofia → Plovdiv → Varna → Burgas</DeckBullet>
                      <DeckBullet>Localize language + currency as we expand</DeckBullet>
                      <DeckBullet>Keep trust systems consistent across regions</DeckBullet>
                      <DeckBullet>Then scale to new EU markets with the same playbook</DeckBullet>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
              <Card className="h-full">
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Clinic outreach</CardTitle>
                  <CardDescription>Simple onboarding, strong verification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground md:p-6 md:pt-0">
                  <DeckBullet>Build a full Bulgaria clinic list (city, 24/7, specialties)</DeckBullet>
                  <DeckBullet>Email + call outreach with a clear “how payouts work” story</DeckBullet>
                  <DeckBullet>Onboard pilot clinics in Sofia first, then expand</DeckBullet>
                  <DeckBullet>Make the clinic directory useful from day one</DeckBullet>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Sponsorship & in-kind</CardTitle>
                  <CardDescription>Food, supplies, matching drives</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground md:p-6 md:pt-0">
                  <DeckBullet>Food brands sponsor monthly nutrition for cases</DeckBullet>
                  <DeckBullet>Pet shops sponsor adoption days and supply drops</DeckBullet>
                  <DeckBullet>CSR sponsors fund matching campaigns + operations</DeckBullet>
                  <DeckBullet>Everything is transparently labeled (trust-first)</DeckBullet>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Expansion</CardTitle>
                  <CardDescription>Repeatable “city launch pack”</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0 text-sm text-muted-foreground md:p-6 md:pt-0">
                  <DeckBullet>Start Sofia → Plovdiv → Varna → Burgas</DeckBullet>
                  <DeckBullet>Localize language + currency as we expand</DeckBullet>
                  <DeckBullet>Keep trust systems consistent across regions</DeckBullet>
                  <DeckBullet>Then scale to new EU markets with the same playbook</DeckBullet>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: 'market',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-6xl">
            <Kicker className="mx-auto w-fit">Market opportunity</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
              A massive and growing market
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              <StatCard number="$281B" label="Global pet care market (2023)" />
              <StatCard number="600M" label="Stray animals worldwide" />
              <StatCard number="€2.1B" label="Pet charity donations (EU)" />
              <StatCard number="89%" label="People want to help animals" />
            </div>
          </div>
        ),
      },
      {
        id: 'business-model',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker className="mx-auto w-fit">Business model</Kicker>
            <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-6xl">
              Sustainable and scalable revenue
            </h2>
            <div className="mt-8 md:hidden">
              <div
                data-deck-swipe="ignore"
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
              >
                <div className="w-72 shrink-0 snap-start">
                  <RevenueCard
                    icon="💛"
                    title="Donor-first"
                    description="0% platform fee + an optional “thank you” tip (processing fees still apply)."
                    value="0%"
                  />
                </div>
                <div className="w-72 shrink-0 snap-start">
                  <RevenueCard
                    icon="🤝"
                    title="Sponsorships"
                    description="CSR + brand sponsorships, matching drives, and featured campaigns."
                    value="Planned"
                  />
                </div>
                <div className="w-72 shrink-0 snap-start">
                  <RevenueCard
                    icon="🛍️"
                    title="Partner perks"
                    description="Optional marketplace/affiliate perks for donors—never required to help."
                    value="Optional"
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Clinics are beneficiaries—we don’t charge them for payouts.
              </p>
            </div>

            <div className="mt-10 hidden gap-6 md:grid md:grid-cols-3">
              <RevenueCard
                icon="💛"
                title="Donor-first"
                description="0% platform fee + an optional “thank you” tip (processing fees still apply)."
                value="0%"
              />
              <RevenueCard
                icon="🤝"
                title="Sponsorships"
                description="CSR + brand sponsorships, matching drives, and featured campaigns."
                value="Planned"
              />
              <RevenueCard
                icon="🛍️"
                title="Partner perks"
                description="Optional marketplace/affiliate perks for donors—never required to help."
                value="Optional"
              />
            </div>
          </div>
        ),
      },
      {
        id: 'traction',
        render: () => {
          const shippedItems = [
            'Live MVP deployed at pawtreon.org',
            'Mobile-first UI across core flows',
            'Bilingual support (Bulgarian + English)',
            'iOS & Android ready via Capacitor',
            'Real-time updates with Convex',
            'Early interest from vet clinics in Sofia',
          ];

          const momentumWeeks = [
            { label: 'Week 1', value: 15 },
            { label: 'Week 2', value: 32 },
            { label: 'Week 3', value: 49 },
            { label: 'Week 4', value: 66 },
            { label: 'Week 5', value: 83 },
            { label: 'Week 6', value: 96 },
          ];

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Traction</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
              Early signals are strong
            </h2>
            <div className="mt-8 md:hidden">
              <Tabs defaultValue="shipped" className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-2">
                  <TabsTrigger value="shipped">Shipped</TabsTrigger>
                  <TabsTrigger value="momentum">Momentum</TabsTrigger>
                </TabsList>

                <TabsContent value="shipped" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">What we’ve shipped</CardTitle>
                      <CardDescription>MVP and foundation already live</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
                      {shippedItems.slice(0, 5).map((item) => (
                        <div key={item} className="flex gap-3">
                          <span className="mt-0.5 text-base">🚀</span>
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="momentum" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Momentum</CardTitle>
                      <CardDescription>Weekly progress (illustrative)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                      {momentumWeeks.slice(0, 4).map(({ label, value }) => (
                        <div key={label} className="grid gap-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className="font-medium tabular-nums">{value}%</span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-10 hidden items-center gap-8 md:grid md:grid-cols-2 md:gap-12">
              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">What we’ve shipped</CardTitle>
                  <CardDescription>
                    MVP and platform foundation already live
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                  {shippedItems.map((item) => (
                    <div key={item} className="flex gap-3">
                      <span className="mt-1 text-lg">🚀</span>
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Momentum</CardTitle>
                  <CardDescription>Weekly progress (illustrative)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                  {momentumWeeks.map(({ label, value }) => (
                    <div key={label} className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <Progress value={value} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
          );
        },
      },
      {
        id: 'trust-safety',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Trust</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
              Built for trust and safety
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Animal rescue needs proof, verification, and fast fraud response.
            </p>

            <div className="mt-8 md:hidden">
              <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid h-11 w-full grid-cols-2">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="next">Roadmap</TabsTrigger>
                </TabsList>

                <TabsContent value="today" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Today</CardTitle>
                      <CardDescription>What the MVP already supports</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                      <TrustItem
                        icon={<ShieldCheck className="size-4" />}
                        title="Partner verification"
                        description="Onboard clinics and trusted volunteers to increase donor confidence."
                      />
                      <TrustItem
                        icon={<BadgeCheck className="size-4" />}
                        title="Status + updates"
                        description="Clear case status and a medical-style update timeline for transparency."
                      />
                      <TrustItem
                        icon={<ScanSearch className="size-4" />}
                        title="Shareable proof"
                        description="Cases are easy to share, while keeping a consistent verification story."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="next" className="mt-4">
                  <Card>
                    <CardHeader className="p-4 pb-3 md:p-6">
                      <CardTitle className="text-base">Next (roadmap)</CardTitle>
                      <CardDescription>AI-assisted trust features (planned)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                      <TrustItem
                        icon={<ScanSearch className="size-4" />}
                        title="AI media integrity checks"
                        description="Flag likely manipulated/AI-generated images, duplicates, and low-quality evidence (human review in the loop)."
                      />
                      <TrustItem
                        icon={<ShieldCheck className="size-4" />}
                        title="Fraud signals + escalation"
                        description="Risk scoring, anomaly detection, and rapid takedown workflows for malicious campaigns."
                      />
                      <TrustItem
                        icon={<BadgeCheck className="size-4" />}
                        title="Clinic payout verification"
                        description="Attach invoices and clinic confirmations so donors know where funds went."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-8 hidden gap-6 md:grid md:grid-cols-2 md:gap-10">
              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Today</CardTitle>
                  <CardDescription>What the MVP already supports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                  <TrustItem
                    icon={<ShieldCheck className="size-4" />}
                    title="Partner verification"
                    description="Onboard clinics and trusted volunteers to increase donor confidence."
                  />
                  <TrustItem
                    icon={<BadgeCheck className="size-4" />}
                    title="Status + updates"
                    description="Clear case status and a medical-style update timeline for transparency."
                  />
                  <TrustItem
                    icon={<ScanSearch className="size-4" />}
                    title="Shareable proof"
                    description="Cases are easy to share, while keeping a consistent verification story."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Next (roadmap)</CardTitle>
                  <CardDescription>AI-assisted trust features (planned)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 pt-0 md:p-6 md:pt-0">
                  <TrustItem
                    icon={<ScanSearch className="size-4" />}
                    title="AI media integrity checks"
                    description="Flag likely manipulated/AI-generated images, duplicates, and low-quality evidence (human review in the loop)."
                  />
                  <TrustItem
                    icon={<ShieldCheck className="size-4" />}
                    title="Fraud signals + escalation"
                    description="Risk scoring, anomaly detection, and rapid takedown workflows for malicious campaigns."
                  />
                  <TrustItem
                    icon={<BadgeCheck className="size-4" />}
                    title="Clinic payout verification"
                    description="Attach invoices and clinic confirmations so donors know where funds went."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },
      {
        id: 'team',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-6xl">
            <Kicker className="mx-auto w-fit">The team</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-6xl">
              Built by builders who care
            </h2>
            <div
              data-deck-swipe="ignore"
              className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide md:mt-10 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0"
            >
              <div className="w-72 shrink-0 snap-start md:w-auto md:shrink">
                <TeamCard
                  emoji="👨‍💻"
                  name="Founder"
                  role="CEO & full‑stack"
                  description="Hands-on builder, focused on shipping fast and building trust with clinics and donors."
                />
              </div>
              <div className="w-72 shrink-0 snap-start md:w-auto md:shrink">
                <TeamCard
                  emoji="🐕"
                  name="Advisor"
                  role="Clinic partner"
                  description="Veterinary partner guiding workflow, compliance, and partner network expansion."
                />
              </div>
              <div className="w-72 shrink-0 snap-start md:w-auto md:shrink">
                <TeamCard
                  emoji="📱"
                  name="Hiring"
                  role="Growth lead"
                  description="Looking for someone passionate about community building and rescue partnerships."
                />
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground md:hidden">
              Swipe to preview
            </div>
          </div>
        ),
      },
      {
        id: 'ask',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-5xl">
            <Kicker className="mx-auto w-fit">The ask</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Pre‑seed round
            </h2>
            <div className="mt-5 text-5xl font-extrabold tracking-tight text-primary md:mt-6 md:text-8xl">
              €150K
            </div>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              6‑month runway to product‑market fit
            </p>
            <div
              data-deck-swipe="ignore"
              className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide md:mt-10 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:pb-0"
            >
              <div className="w-72 shrink-0 snap-start md:w-auto md:shrink">
                <AllocationCard title="Product & engineering" amount="€70K" />
              </div>
              <div className="w-72 shrink-0 snap-start md:w-auto md:shrink">
                <AllocationCard title="Marketing & growth" amount="€50K" />
              </div>
              <div className="w-72 shrink-0 snap-start md:w-auto md:shrink">
                <AllocationCard title="Operations & legal" amount="€30K" />
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground md:hidden">
              Swipe to preview
            </div>
          </div>
        ),
      },
      {
        id: 'cta',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-5xl">
            <div className="text-6xl">🤝</div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight md:text-6xl">
              Let’s save animals together
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:max-w-3xl md:text-2xl">
              Join us in building the infrastructure for animal emergency care—first in
              Bulgaria, then worldwide.
            </p>

            <div className="mx-auto mt-8 max-w-md md:mt-10 md:max-w-3xl">       
              <Card>
                <CardHeader className="p-4 pb-3 md:p-6">
                  <CardTitle className="text-xl">Next steps</CardTitle>
                  <CardDescription>
                    Happy to share numbers, product roadmap, and a live demo    
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 p-4 pt-0 md:p-6 md:pt-0">
                  <div className="grid gap-3 md:grid-cols-2">
                    {contactEmail ? (
                      <Button asChild size="lg" className="w-full">
                        <a href={`mailto:${contactEmail}?subject=Pawtreon%20Investor%20Intro`}>
                          Email intro
                        </a>
                      </Button>
                    ) : (
                      <Button size="lg" className="w-full" onClick={copyDeckLink}>
                        Copy deck link
                      </Button>
                    )}
                    <Button asChild size="lg" variant="secondary" className="w-full">
                      <a
                        href="https://pawtreon.org"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View live demo
                      </a>
                    </Button>
                  </div>

                  <Separator />

                  <div className="text-sm text-muted-foreground">
                    Press <kbd className="rounded-md border bg-muted px-2 py-1">Esc</kbd>{' '}
                    to exit
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },
    ],
    [contactEmail, copyDeckLink],
  );

  const totalSlides = slides.length;
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentSlide(clamp(index, 0, totalSlides - 1));
    },
    [totalSlides],
  );

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => clamp(prev + 1, 0, totalSlides - 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => clamp(prev - 1, 0, totalSlides - 1));
  }, [totalSlides]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
        return;
      }

      if (e.key === 'ArrowLeft') {
        prevSlide();
        return;
      }

      if (e.key === 'Home') {
        goToSlide(0);
        return;
      }

      if (e.key === 'End') {
        goToSlide(totalSlides - 1);
        return;
      }

      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToSlide, navigate, nextSlide, prevSlide, totalSlides]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let shouldHandleSwipe = false;

    const shouldIgnoreSwipe = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest('[data-deck-swipe="ignore"]')) return true;
      if (target.closest('button, a, input, textarea, select, [role="button"]')) return true;
      return false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      shouldHandleSwipe = !shouldIgnoreSwipe(e.target);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!shouldHandleSwipe) return;
      if (e.changedTouches.length !== 1) return;
      const touch = e.changedTouches[0];
      const diffX = touchStartX - touch.clientX;
      const diffY = touchStartY - touch.clientY;

      if (Math.abs(diffX) <= 60) return;
      if (Math.abs(diffX) < Math.abs(diffY) * 1.2) return;

      if (diffX > 0) nextSlide();
      else prevSlide();
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextSlide, prevSlide]);

  const progressValue = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background text-foreground">
      <Progress
        value={progressValue}
        className="fixed left-0 top-0 z-50 h-1 w-full rounded-none bg-muted"
      />

      <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 border-b bg-card/95 px-4 py-3 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-muted hover:bg-muted/80"
            onClick={() => navigate('/')}
            aria-label="Exit presentation"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Investor deck</div>
            <div className="truncate text-xs text-muted-foreground">Pawtreon</div>
          </div>
          <div className="text-xs text-muted-foreground tabular-nums">
            {currentSlide + 1}/{totalSlides}
          </div>
        </div>
      </header>

      <div className="relative h-full w-full">
        {slides.map((slide, index) => (
          <Slide key={slide.id} active={currentSlide === index}>
            {slide.render()}
          </Slide>
        ))}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="border-t bg-card/95 px-4 py-3 backdrop-blur-md">
          <div className="mx-auto w-full max-w-md md:max-w-none">
            <div className="flex items-center justify-between md:hidden">
              <Button
                variant="outline"
                className="h-10 rounded-full px-4"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="mr-1.5 size-4" />
                Prev
              </Button>
              <div className="text-xs text-muted-foreground tabular-nums">
                {currentSlide + 1} / {totalSlides}
              </div>
              <Button
                className="h-10 rounded-full px-4"
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
              >
                Next
                <ChevronRight className="ml-1.5 size-4" />
              </Button>
            </div>

            <div className="hidden flex-col items-center gap-3 md:flex">
              <div className="flex items-center gap-3 rounded-full border bg-card/90 px-4 py-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="size-5" />
                </Button>

                <div className="flex items-center gap-1">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className="group flex size-8 items-center justify-center rounded-full"
                    >
                      <span
                        className={cn(
                          'h-3 w-3 rounded-full transition',
                          i === currentSlide
                            ? 'bg-primary'
                            : 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50',
                        )}
                      />
                    </button>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  aria-label="Next slide"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Press <kbd className="rounded-md border bg-muted px-2 py-1">←</kbd>{' '}
                <kbd className="rounded-md border bg-muted px-2 py-1">→</kbd> or{' '}
                <kbd className="rounded-md border bg-muted px-2 py-1">Space</kbd> to navigate
              </div>
            </div>

            {currentSlide === 0 ? (
              <div className="mt-2 text-center text-xs text-muted-foreground md:hidden">
                Swipe left/right or tap Next
              </div>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Slide({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        'absolute inset-0 overflow-y-auto overscroll-contain scrollbar-hide scroll-touch transition-opacity duration-300',
        active ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="flex min-h-full flex-col items-center justify-start px-4 pb-28 pt-16 md:justify-center md:px-10 md:pb-32 md:pt-28">
        {children}
      </div>
    </div>
  );
}

function Kicker({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className={cn('mb-4 w-fit uppercase tracking-wider', className)}
    >
      {children}
    </Badge>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-3 md:p-6">
        <div className="text-4xl">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function MockCampaign({
  emoji,
  title,
  progress,
  current,
  goal,
}: {
  emoji: string;
  title: string;
  progress: number;
  current: string;
  goal: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-background p-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl">
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{title}</div>
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{current}</span>
            <span>
              {goal} • {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {       
  return (
    <Card className="text-left shadow-sm">
      <CardHeader className="p-4 pb-2 md:p-6">
        <div className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          {number}
        </div>
        <CardDescription className="text-sm">{label}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function RevenueCard({
  icon,
  title,
  description,
  value,
}: {
  icon: string;
  title: string;
  description: string;
  value: string;
}) {
  return (
    <Card className="h-full text-center">
      <CardHeader className="p-4 pb-3 md:p-6">
        <div className="text-4xl">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="text-3xl font-extrabold text-primary">{value}</div>
      </CardContent>
    </Card>
  );
}

function TeamCard({
  emoji,
  name,
  role,
  description,
}: {
  emoji: string;
  name: string;
  role: string;
  description: string;
}) {
  return (
    <Card className="h-full text-left">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-2xl">
            {emoji}
          </div>
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{name}</div>
            <div className="truncate text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function AllocationCard({ title, amount }: { title: string; amount: string }) {
  return (
    <Card className="h-full text-left">
      <CardHeader className="p-4 pb-3 md:p-6">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Allocation</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="text-2xl font-bold text-primary">{amount}</div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div
        className={cn(
          'rounded-xl border bg-background px-3 py-2 text-sm',
          multiline ? 'min-h-20' : 'h-10 flex items-center',
        )}
      >
        <span className={cn('text-foreground', multiline && 'leading-relaxed')}>
          {value}
        </span>
      </div>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-0.5 text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function DeckBullet({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm text-muted-foreground">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function VolunteerMiniCard({ volunteer }: { volunteer: Volunteer }) {
  const initials =
    volunteer.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join('') || 'V';

  return (
    <Card className="h-full text-left">
      <CardHeader className="p-4 pb-3 md:p-6">
        <div className="flex items-start gap-3">
          <Avatar className="size-12">
            <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="truncate text-base font-semibold md:text-lg">
              {volunteer.name}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="truncate">{volunteer.location}</span>
              <span aria-hidden="true">•</span>
              <span className="tabular-nums">Since {volunteer.memberSince}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <Star className="size-3.5 text-primary" />
              <span className="font-medium tabular-nums">
                {volunteer.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">rating</span>
            </div>
          </div>
          {volunteer.isTopVolunteer ? (
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
            >
              Top
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0 md:p-6 md:pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {volunteer.bio}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="text-base font-semibold tabular-nums text-foreground">
              {volunteer.stats.animalsHelped}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">Animals helped</div>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <div className="text-base font-semibold tabular-nums text-foreground">
              {volunteer.stats.hoursVolunteered}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">Hours volunteered</div>
          </div>
        </div>
        {volunteer.badges.length ? (
          <>
            {/* Mobile: Short badges */}
            <div className="flex gap-2 overflow-hidden sm:hidden">
              {(volunteer.badgesMobile || volunteer.badges).slice(0, 2).map((badge) => (
                <Badge key={badge} variant="secondary" className="rounded-full whitespace-nowrap flex-shrink-0">
                  {badge}
                </Badge>
              ))}
            </div>
            {/* Desktop: Full badges */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {volunteer.badges.slice(0, 2).map((badge) => (
                <Badge key={badge} variant="secondary" className="rounded-full">
                  {badge}
                </Badge>
              ))}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
