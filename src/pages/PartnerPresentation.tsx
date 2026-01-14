import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Heart,
  Home,
  MapPin,
  Phone,
  PawPrint,
  Sparkles,
  ShieldCheck,
  Store,
  Stethoscope,
  Upload,
  Users,
  Zap,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

type SlideDefinition = {
  id: string;
  render: () => ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function PartnerPresentation() {
  const navigate = useNavigate();
  const contactEmail = import.meta.env['VITE_PARTNER_CONTACT_EMAIL'] || import.meta.env['VITE_INVESTOR_CONTACT_EMAIL'] || '';

  const copyDeckLink = useCallback(async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }, []);

  const slides = useMemo<SlideDefinition[]>(
    () => [
      // SLIDE 1: Title - Partner Focus
      {
        id: 'title',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-5xl">
            <div className="text-5xl md:text-8xl">🐾</div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight md:mt-6 md:text-7xl">
              Paws<span className="text-primary">Safe</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground md:mt-4 md:text-2xl">
              Join the Partner Network for Animal Rescue
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-8 md:gap-3">
              <Badge variant="secondary" className="text-xs md:text-sm">Clinics</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">Pet Stores</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">Shelters</Badge>
              <Badge variant="secondary" className="text-xs md:text-sm">Sponsors</Badge>
            </div>
            <p className="mt-4 text-xs text-muted-foreground md:mt-6 md:text-sm">
              Together, we can save more animals
            </p>
          </div>
        ),
      },

      // SLIDE 2: The Problem
      {
        id: 'problem',
        render: () => {
          const problemCards = [
            {
              icon: '🚑',
              title: 'Emergency care gap',
              description:
                "Good Samaritans find injured animals but can't afford €200–€2000 vet bills. Animals suffer or die waiting.",
            },
            {
              icon: '💸',
              title: 'Clinics need payment',
              description:
                'Veterinary clinics require upfront payment. No guarantee often means no treatment—even for critical cases.',
            },
            {
              icon: '🔍',
              title: 'No coordination',
              description:
                "Rescuers don't know where to go. Clinics can't easily receive funded cases. Everyone works in silos.",
            },
          ];

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
              <Kicker>The problem</Kicker>
              <h2 className="text-2xl font-extrabold tracking-tight md:text-6xl">
                600M+ stray animals need help
              </h2>

              <div className="mt-6 md:hidden">
                <div
                  data-deck-swipe="ignore"
                  className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide"
                >
                  {problemCards.map((card) => (
                    <div key={card.title} className="w-[85vw] max-w-[300px] shrink-0 snap-center">
                      <InfoCard {...card} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center text-[11px] text-muted-foreground">
                  ← Swipe to see more →
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

      // SLIDE 3: The Rescue Journey - KEY SLIDE
      {
        id: 'journey',
        render: () => {
          const steps = [
            {
              icon: '👀',
              title: 'Spot',
              description: 'Someone finds a stray animal in distress',
              color: 'bg-red-500',
            },
            {
              icon: '📱',
              title: 'Open App',
              description: 'Opens PawsSafe, sees nearest partner clinic',
              color: 'bg-orange-500',
            },
            {
              icon: '🏥',
              title: 'Deliver',
              description: 'Takes animal to verified partner clinic',
              color: 'bg-yellow-500',
            },
            {
              icon: '🤖',
              title: 'AI Case',
              description: 'Clinic creates case in seconds with AI',
              color: 'bg-green-500',
            },
            {
              icon: '🏠',
              title: 'Adopt',
              description: 'Animal recovers & finds forever home',
              color: 'bg-blue-500',
            },
          ];

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
              <Kicker>How it works</Kicker>
              <h2 className="text-2xl font-extrabold tracking-tight md:text-5xl">
                From Street to Forever Home
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:mt-3 md:text-xl">
                The complete rescue journey—powered by our partner network
              </p>

              {/* Mobile: Compact vertical steps */}
              <div className="mt-5 space-y-2 md:hidden">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn("flex size-10 items-center justify-center rounded-full text-lg shadow-sm", step.color)}>
                        {step.icon}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="h-2 w-0.5 bg-border" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </div>
                ))}
                
                <Card className="mt-4 border-primary/50 bg-primary/5">
                  <CardContent className="flex items-center gap-3 p-3">
                    <Sparkles className="size-5 shrink-0 text-primary" />
                    <div className="text-xs">
                      <span className="font-medium">AI-Powered:</span>{' '}
                      <span className="text-muted-foreground">Clinic uploads photos → Case live in 30 seconds</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Desktop: Horizontal steps */}
              <div className="mt-10 hidden md:block">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => (
                    <div key={step.title} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center text-center">
                        <div className={cn("flex size-16 items-center justify-center rounded-full text-3xl shadow-lg", step.color)}>
                          {step.icon}
                        </div>
                        <div className="mt-3 font-semibold">{step.title}</div>
                        <div className="mt-1 max-w-[120px] text-sm text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="mx-2 flex-1">
                          <ArrowRight className="mx-auto size-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Card className="mt-10 border-primary/50 bg-primary/5">
                  <CardContent className="flex items-center gap-4 p-4 md:p-6">
                    <Sparkles className="size-8 text-primary" />
                    <div>
                      <div className="font-semibold">AI-Powered Case Creation</div>
                      <div className="text-sm text-muted-foreground">
                        Clinics upload photos → AI generates case description, suggests funding goal → Live in under 30 seconds
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        },
      },

      // SLIDE 4: AI Case Creation
      {
        id: 'ai-case',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>For clinics</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Create Cases in Seconds with AI
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              No more spending hours writing fundraiser posts
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2 md:mt-10">
              {/* Phone mockup */}
              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-red-500" />
                    <div className="size-3 rounded-full bg-yellow-500" />
                    <div className="size-3 rounded-full bg-green-500" />
                    <span className="ml-2 text-sm text-muted-foreground">PawsSafe Clinic Portal</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Step 1: Upload Photos</div>
                    <div className="flex gap-2">
                      <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-2xl">🐕</div>
                      <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-2xl">🩹</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Step 2: AI Analyzes</div>
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
                      <Sparkles className="size-5 text-primary animate-pulse" />
                      <span className="text-sm">Analyzing injury, generating description...</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Step 3: Review & Publish</div>
                    <div className="rounded-lg border p-3 space-y-2">
                      <div className="font-medium">Injured dog needs surgery</div>
                      <div className="text-sm text-muted-foreground">Found near Central Park with a broken leg. Needs immediate surgical intervention...</div>
                      <div className="flex items-center justify-between">
                        <Badge>Goal: €800</Badge>
                        <Button size="sm" className="h-8">Publish</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="space-y-4">
                <BenefitCard
                  icon={<Zap className="size-5" />}
                  title="30 seconds, not 30 minutes"
                  description="AI writes the case description, suggests the funding goal, and formats everything beautifully."
                />
                <BenefitCard
                  icon={<ShieldCheck className="size-5" />}
                  title="You stay in control"
                  description="AI suggests, you approve. Edit anything before publishing. Human review always."
                />
                <BenefitCard
                  icon={<Heart className="size-5" />}
                  title="Donors notified instantly"
                  description="The moment you publish, nearby donors get notified. Funding starts immediately."
                />
                <BenefitCard
                  icon={<BadgeCheck className="size-5" />}
                  title="Verified clinic badge"
                  description="Your cases show a verified badge. Donors trust you more, fund faster."
                />
              </div>
            </div>
          </div>
        ),
      },

      // SLIDE 5: Clinic Value Proposition
      {
        id: 'clinic-value',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>For veterinary clinics</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              What Partner Clinics Get
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              We don't charge you. You're our partner, not our customer.
            </p>

            <div className="mt-8 md:mt-10">
              {/* Mobile: Swipeable cards */}
              <div className="md:hidden">
                <div
                  data-deck-swipe="ignore"
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                >
                  {[
                    { icon: <BadgeCheck className="size-6" />, title: 'Verified Badge', description: 'Stand out as a trusted partner. Donors fund your cases faster.' },
                    { icon: <Stethoscope className="size-6" />, title: 'Clear Payouts', description: 'Transparent audit trail. No chasing payments. Funds released on verification.' },
                    { icon: <Sparkles className="size-6" />, title: 'AI Case Creation', description: 'Create fundraiser cases in seconds, not hours. We handle the marketing.' },
                    { icon: <MapPin className="size-6" />, title: 'Directory Listing', description: 'Rescuers find you when searching for nearby clinics. Free visibility.' },
                    { icon: <Users className="size-6" />, title: 'Community Support', description: 'Help more animals without financial risk. We bring the donors.' },
                  ].map((item) => (
                    <div key={item.title} className="w-72 shrink-0 snap-start">
                      <ValueCard {...item} />
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  Swipe to see more benefits
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden gap-4 md:grid md:grid-cols-3">
                <ValueCard
                  icon={<BadgeCheck className="size-6" />}
                  title="Verified Partner Badge"
                  description="Stand out as a trusted partner. Donors see the badge and fund your cases faster."
                />
                <ValueCard
                  icon={<Stethoscope className="size-6" />}
                  title="Clear Payout Workflow"
                  description="Transparent audit trail. No chasing payments. Funds released upon verification."
                />
                <ValueCard
                  icon={<Sparkles className="size-6" />}
                  title="AI-Powered Case Intake"
                  description="Create fundraiser cases in seconds, not hours. We handle the marketing copy."
                />
                <ValueCard
                  icon={<MapPin className="size-6" />}
                  title="Directory Visibility"
                  description="Rescuers find you when searching for nearby clinics. Free discovery."
                />
                <ValueCard
                  icon={<Users className="size-6" />}
                  title="Community of Donors"
                  description="Help more animals without financial risk. We bring the donors to you."
                />
                <ValueCard
                  icon={<Heart className="size-6" />}
                  title="Zero Cost to Join"
                  description="We don't charge clinics. You're beneficiaries and partners, not customers."
                />
              </div>
            </div>

            <Card className="mt-8 border-green-500/50 bg-green-500/5 md:mt-10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-500 text-white">
                    ✓
                  </div>
                  <div>
                    <div className="font-semibold">Free for clinics—always</div>
                    <div className="text-sm text-muted-foreground">
                      We sustain the platform through optional donor tips and sponsorships, not clinic fees.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      },

      // SLIDE 6: Pet Store Value Proposition
      {
        id: 'store-value',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>For pet stores & shops</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              What Pet Stores Get
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Become a hub for animal rescue in your community
            </p>

            <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PawPrint className="size-6" />
                  </div>
                  <CardTitle>Adoption Day Partnerships</CardTitle>
                  <CardDescription>
                    Host adoption events at your store. We bring the animals and coordinate with shelters. You become the hero in your community.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Store className="size-6" />
                  </div>
                  <CardTitle>Supply Drop-Off Point</CardTitle>
                  <CardDescription>
                    Customers can donate pet supplies at your store. We handle collection and distribution to shelters. Great foot traffic driver.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Heart className="size-6" />
                  </div>
                  <CardTitle>Sponsor Campaigns</CardTitle>
                  <CardDescription>
                    Your brand featured on rescue cases. CSR storytelling for your marketing. Show customers you care about animals.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="size-6" />
                  </div>
                  <CardTitle>Directory Listing</CardTitle>
                  <CardDescription>
                    Pet owners find you when searching for pet services. Free visibility in our growing user base.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Badge variant="outline" className="text-base px-4 py-2">
                Zero cost to become a drop-off point or adoption partner
              </Badge>
            </div>
          </div>
        ),
      },

      // SLIDE 7: Shelter Value Proposition
      {
        id: 'shelter-value',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>For shelters & rescues</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Fundraising That Actually Works
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Stop juggling 5 different tools. One platform for everything.
            </p>

            <div className="mt-8 md:mt-10">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">📢</span> Campaign Tools
                    </CardTitle>
                    <CardDescription className="text-base">
                      Launch fundraisers with a few taps. AI helps write compelling stories. Share to social media in one click.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🐕</span> Adoption Listings
                    </CardTitle>
                    <CardDescription>
                      Global visibility for your adoptable pets. Digital applications. Smart matching filters.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">💰</span> Donor Transparency
                    </CardTitle>
                    <CardDescription>
                      Donors see exactly where their money goes. They give more when they trust you.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">🔒</span> Verification Badge
                    </CardTitle>
                    <CardDescription>
                      Stand out as a verified, trusted organization. Beat the noise of fake campaigns.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">📊</span> Impact Reports
                    </CardTitle>
                    <CardDescription>
                      Show your community what you've achieved. Beautiful reports you can share.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="mt-6 border-primary/50 bg-primary/5">
                <CardContent className="p-4 md:p-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold">Free to start. Upgrade when you're ready.</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Basic features free forever. Pro features for growing organizations.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },

      // SLIDE 8: Clinic Finder / Map
      {
        id: 'map',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>For rescuers</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Find Help Instantly—Anywhere
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Your clinic shows up when someone needs help nearby
            </p>

            <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
              {/* Map mockup */}
              <Card className="overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 md:h-80">
                  {/* Fake map pins */}
                  <div className="absolute left-[20%] top-[30%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Stethoscope className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-background px-2 py-0.5 text-xs shadow">0.5 km</div>
                  </div>
                  <div className="absolute left-[60%] top-[20%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Stethoscope className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-background px-2 py-0.5 text-xs shadow">1.2 km</div>
                  </div>
                  <div className="absolute left-[45%] top-[55%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                      <Clock className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-green-500 px-2 py-0.5 text-xs text-white shadow">24/7</div>
                  </div>
                  <div className="absolute left-[75%] top-[65%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                      <Stethoscope className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-background px-2 py-0.5 text-xs shadow">2.8 km</div>
                  </div>
                  
                  {/* User location */}
                  <div className="absolute left-[40%] top-[45%]">
                    <div className="size-4 rounded-full border-4 border-blue-500 bg-white" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">4 clinics nearby</div>
                      <div className="text-sm text-muted-foreground">1 open 24/7</div>
                    </div>
                    <Button size="sm">
                      <Phone className="mr-2 size-4" />
                      Call Nearest
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="space-y-4">
                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Location-Based Search</div>
                      <div className="text-sm text-muted-foreground">
                        Rescuers see all partner clinics near them, sorted by distance
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <div className="font-semibold">24/7 Filter</div>
                      <div className="text-sm text-muted-foreground">
                        Emergency cases? Show only clinics open right now
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <div className="font-semibold">One-Tap Contact</div>
                      <div className="text-sm text-muted-foreground">
                        Call or get directions instantly. No searching for numbers
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BadgeCheck className="size-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Verified Partners Only</div>
                      <div className="text-sm text-muted-foreground">
                        Rescuers know they're going to a trusted clinic
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ),
      },

      // SLIDE 9: Worldwide Adoption
      {
        id: 'adoption',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-6xl">
            <Kicker className="mx-auto w-fit">The happy ending</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Every Animal Finds a Home
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Worldwide adoption reach. Local rescue, global forever homes.
            </p>

            <div className="mt-8 md:mt-10">
              {/* Journey recap with adoption */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Badge variant="outline" className="text-base px-4 py-2">🚨 Rescued</Badge>
                <ArrowRight className="size-5 text-muted-foreground hidden sm:block" />
                <Badge variant="outline" className="text-base px-4 py-2">🏥 Treated</Badge>
                <ArrowRight className="size-5 text-muted-foreground hidden sm:block" />
                <Badge variant="outline" className="text-base px-4 py-2">💰 Funded</Badge>
                <ArrowRight className="size-5 text-muted-foreground hidden sm:block" />
                <Badge variant="outline" className="text-base px-4 py-2">❤️ Recovered</Badge>
                <ArrowRight className="size-5 text-muted-foreground hidden sm:block" />
                <Badge className="text-base px-4 py-2 bg-green-500">🏠 Adopted!</Badge>
              </div>

              <div className="mt-8 grid gap-4 text-left md:grid-cols-3 md:mt-10">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🌍 Global Reach</CardTitle>
                    <CardDescription>
                      Animals listed are visible to adopters worldwide. Not just local—international families find their perfect pet.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📱 Digital Applications</CardTitle>
                    <CardDescription>
                      No paper forms. Adopters apply in minutes. Shelters review and approve digitally.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🎯 Smart Matching</CardTitle>
                    <CardDescription>
                      Filters for size, age, temperament, pet-friendly, kid-friendly. Right animal, right home.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="mt-8 border-green-500/50 bg-green-500/5">
                <CardContent className="p-6">
                  <div className="text-4xl font-extrabold text-green-500">10,000+</div>
                  <div className="mt-1 text-muted-foreground">Successful adoptions goal by 2027</div>
                </CardContent>
              </Card>
            </div>
          </div>
        ),
      },

      // SLIDE 10: Trust & Verification
      {
        id: 'trust',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Trust</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Built for Trust and Safety
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Donors give more when they trust the platform. We protect that trust.
            </p>

            <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="size-5 text-primary" />
                    Partner Verification
                  </CardTitle>
                  <CardDescription>
                    Every clinic and shelter is manually verified. Donors see the badge and trust you instantly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BadgeCheck className="size-5 text-primary" />
                    Transparent Updates
                  </CardTitle>
                  <CardDescription>
                    Medical-style timeline for every case. Donors see progress, proof, and outcomes.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="size-5 text-primary" />
                    Clinic Payouts
                  </CardTitle>
                  <CardDescription>
                    Funds go to verified clinics, not individuals. Invoices attached for full transparency.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    AI Fraud Detection (Roadmap)
                  </CardTitle>
                  <CardDescription>
                    Flag manipulated images, duplicates, and suspicious patterns. Human review in the loop.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ),
      },

      // SLIDE 11: Partnership Tiers
      {
        id: 'tiers',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Join us</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Partnership Tiers
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Start free. Grow with us. No hidden costs.
            </p>

            <div className="mt-8 md:mt-10">
              {/* Mobile: Swipeable */}
              <div className="md:hidden">
                <div
                  data-deck-swipe="ignore"
                  className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-hide"
                >
                  <div className="w-80 shrink-0 snap-start">
                    <TierCard
                      tier="Verified Partner"
                      price="Free"
                      description="For clinics, shelters, and rescues"
                      features={[
                        'Directory listing',
                        'Case creation tools',
                        'Payout processing',
                        'Basic analytics',
                        'Verified badge',
                      ]}
                    />
                  </div>
                  <div className="w-80 shrink-0 snap-start">
                    <TierCard
                      tier="Featured Partner"
                      price="Free (Earned)"
                      description="For active, high-impact partners"
                      features={[
                        'Everything in Verified',
                        'Homepage feature',
                        'Priority placement',
                        'Success stories',
                        'Partner spotlight',
                      ]}
                      highlighted
                    />
                  </div>
                  <div className="w-80 shrink-0 snap-start">
                    <TierCard
                      tier="Sponsor Partner"
                      price="Custom"
                      description="For brands and CSR programs"
                      features={[
                        'Co-branded campaigns',
                        'Matching drives',
                        'CSR impact reports',
                        'Employee giving portal',
                        'Press & marketing',
                      ]}
                    />
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground">
                  Swipe to see all tiers
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden gap-6 md:grid md:grid-cols-3">
                <TierCard
                  tier="Verified Partner"
                  price="Free"
                  description="For clinics, shelters, and rescues"
                  features={[
                    'Directory listing',
                    'Case creation tools',
                    'Payout processing',
                    'Basic analytics',
                    'Verified badge',
                  ]}
                />
                <TierCard
                  tier="Featured Partner"
                  price="Free (Earned)"
                  description="For active, high-impact partners"
                  features={[
                    'Everything in Verified',
                    'Homepage feature',
                    'Priority placement',
                    'Success stories',
                    'Partner spotlight',
                  ]}
                  highlighted
                />
                <TierCard
                  tier="Sponsor Partner"
                  price="Custom"
                  description="For brands and CSR programs"
                  features={[
                    'Co-branded campaigns',
                    'Matching drives',
                    'CSR impact reports',
                    'Employee giving portal',
                    'Press & marketing',
                  ]}
                />
              </div>
            </div>
          </div>
        ),
      },

      // SLIDE 12: Growth Together
      {
        id: 'growth',
        render: () => (
          <div className="mx-auto w-full max-w-md md:max-w-6xl">
            <Kicker>Vision</Kicker>
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              We're Growing—Together
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-xl">
              Starting in Bulgaria. Expanding city by city. You're part of the story.
            </p>

            <div className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🇧🇬 Bulgaria First</CardTitle>
                  <CardDescription>
                    Sofia → Plovdiv → Varna → Burgas. Building the playbook in our home market.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🇪🇺 Europe Next</CardTitle>
                  <CardDescription>
                    Germany, UK, and beyond. Same model, localized experience.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🌍 Worldwide Adoption</CardTitle>
                  <CardDescription>
                    Animals rescued locally find homes globally. No borders for love.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card className="mt-8 md:mt-10">
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Partner clinics (2026 goal)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">100+</div>
                    <div className="text-sm text-muted-foreground">Shelters & rescues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">€500K</div>
                    <div className="text-sm text-muted-foreground">Donations processed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-extrabold text-primary">5,000+</div>
                    <div className="text-sm text-muted-foreground">Animals helped</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      },

      // SLIDE 13: CTA - Become a Partner
      {
        id: 'cta',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-5xl">
            <div className="text-6xl">🤝</div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight md:text-5xl">
              Let's Save Animals Together
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground md:max-w-3xl md:text-xl">
              Join the PawsSafe partner network. It takes 5 minutes to apply.
            </p>

            <div className="mx-auto mt-8 max-w-md md:mt-10 md:max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Ready to join?</CardTitle>
                  <CardDescription>
                    We're actively onboarding clinics, shelters, and pet stores in Bulgaria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button size="lg" className="w-full">
                      <Stethoscope className="mr-2 size-5" />
                      Apply as Clinic
                    </Button>
                    <Button size="lg" variant="outline" className="w-full">
                      <Building2 className="mr-2 size-5" />
                      Apply as Shelter
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button size="lg" variant="outline" className="w-full">
                      <Store className="mr-2 size-5" />
                      Apply as Pet Store
                    </Button>
                    <Button size="lg" variant="outline" className="w-full">
                      <Heart className="mr-2 size-5" />
                      Become a Sponsor
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    {contactEmail ? (
                      <Button asChild variant="link">
                        <a href={`mailto:${contactEmail}?subject=PawsSafe%20Partnership%20Inquiry`}>
                          Or email us directly
                          <ExternalLink className="ml-2 size-4" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="link" onClick={copyDeckLink}>
                        Copy presentation link
                      </Button>
                    )}
                    <Button asChild variant="link">
                      <a href="https://paws-psi.vercel.app" target="_blank" rel="noreferrer">
                        View live app
                        <ExternalLink className="ml-2 size-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Press <kbd className="rounded-md border bg-muted px-2 py-1">Esc</kbd> to exit
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
        <div className="flex items-center gap-2 border-b bg-background/95 px-3 py-2 backdrop-blur-md md:gap-3 md:px-4 md:py-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full bg-muted/80 hover:bg-muted md:size-10"
            onClick={() => navigate('/')}
            aria-label="Exit presentation"
          >
            <ArrowLeft className="size-4 md:size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Partner Pitch</div>
            <div className="hidden truncate text-xs text-muted-foreground sm:block">PawsSafe Partner Network</div>
          </div>
          <Badge variant="outline" className="tabular-nums text-xs">
            {currentSlide + 1} / {totalSlides}
          </Badge>
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
        <div className="border-t bg-background/95 px-3 py-2.5 backdrop-blur-md md:px-4 md:py-3">
          <div className="mx-auto w-full max-w-md md:max-w-none">
            <div className="flex items-center justify-between gap-4 md:hidden">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full px-3"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="mr-1 size-4" />
                Prev
              </Button>
              
              {/* Progress dots for mobile */}
              <div className="flex items-center gap-1">
                {slides.slice(
                  Math.max(0, currentSlide - 2),
                  Math.min(totalSlides, currentSlide + 3)
                ).map((slide, i) => {
                  const actualIndex = Math.max(0, currentSlide - 2) + i;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(actualIndex)}
                      className="p-1"
                    >
                      <span
                        className={cn(
                          'block size-2 rounded-full transition-all',
                          actualIndex === currentSlide
                            ? 'bg-primary scale-125'
                            : 'bg-muted-foreground/30',
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              
              <Button
                size="sm"
                className="h-9 rounded-full px-3"
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
              >
                Next
                <ChevronRight className="ml-1 size-4" />
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

            {currentSlide === 0 && (
              <div className="mt-1.5 text-center text-[11px] text-muted-foreground md:hidden">
                Swipe or tap to navigate
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components

function Slide({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden={!active}
      className={cn(
        'absolute inset-0 overflow-y-auto overscroll-contain scrollbar-hide scroll-touch transition-opacity duration-300',
        active ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      <div className="flex min-h-full flex-col items-center justify-start px-5 pb-32 pt-24 md:justify-center md:px-10 md:pb-32 md:pt-28">
        {children}
      </div>
    </div>
  );
}

function Kicker({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className={cn('mb-3 w-fit text-[10px] uppercase tracking-wider md:mb-4 md:text-xs', className)}
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
      <CardHeader className="p-3 pb-2 md:p-6 md:pb-3">
        <div className="text-3xl md:text-4xl">{icon}</div>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="p-4 md:p-6">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function TierCard({
  tier,
  price,
  description,
  features,
  highlighted,
}: {
  tier: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card className={cn('h-full', highlighted && 'border-primary ring-2 ring-primary/20')}>
      <CardHeader className="p-4 md:p-6">
        {highlighted && (
          <Badge className="w-fit mb-2">Most Popular</Badge>
        )}
        <CardTitle className="text-xl">{tier}</CardTitle>
        <div className="text-2xl font-bold text-primary">{price}</div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <BadgeCheck className="size-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
