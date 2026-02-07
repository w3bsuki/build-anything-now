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
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

type SlideDefinition = {
  id: string;
  render: () => ReactNode;
};

type ApplyRole = 'clinic' | 'shelter' | 'pet_store' | 'sponsor';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function PartnerPresentation() {
  const navigate = useNavigate();
  const contactEmail = import.meta.env['VITE_PARTNER_CONTACT_EMAIL'] || import.meta.env['VITE_INVESTOR_CONTACT_EMAIL'] || '';
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyRole, setApplyRole] = useState<ApplyRole>('clinic');

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
        await navigator.share({ title: 'Pawtreon partner deck', url });
        return;
      } catch (error) {
        void error;
      }
    }

    window.prompt('Copy this link:', url);
  }, []);

  const openApply = useCallback((role: ApplyRole) => {
    setApplyRole(role);
    setApplyOpen(true);
  }, []);

  const applyRoleLabel =
    applyRole === 'clinic'
      ? 'Clinic'
      : applyRole === 'shelter'
        ? 'Shelter'
        : applyRole === 'pet_store'
          ? 'Pet Store'
          : 'Sponsor';

  const applyEmailSubject = `Pawtreon Partnership Inquiry — ${applyRoleLabel}`;

  const slides = useMemo<SlideDefinition[]>(
    () => [
      // SLIDE 1: Title - Partner Focus
      {
        id: 'title',
        render: () => (
          <div className="mx-auto w-full max-w-md text-center md:max-w-5xl">
            <div className="text-6xl md:text-8xl">🤝</div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:mt-6 md:text-7xl">
              Paw<span className="text-primary">treon</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground md:mt-4 md:text-2xl">
              Partner with the animal rescue network
            </p>
            
            <div className="mt-8 grid grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center md:justify-center md:gap-4">
              <PartnerTypeBadge icon={<Stethoscope className="size-4" />} label="Clinics" />
              <PartnerTypeBadge icon={<Home className="size-4" />} label="Shelters" />
              <PartnerTypeBadge icon={<Store className="size-4" />} label="Pet Stores" />
              <PartnerTypeBadge icon={<Users className="size-4" />} label="Volunteers" />
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground">
              Free to join · No hidden fees · Start in 5 minutes
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
              <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                600M+ stray animals need help
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:mt-3 md:text-lg">
                The system is broken. Here's why animals suffer.
              </p>

              {/* Mobile: Vertical stacked cards - all visible */}
              <div className="mt-6 space-y-3 md:hidden">
                {problemCards.map((card) => (
                  <InfoCard key={card.title} {...card} />
                ))}
              </div>

              {/* Desktop: 3-column grid */}
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
              color: 'bg-destructive',
            },
            {
              icon: '📱',
              title: 'Open App',
              description: 'Opens Pawtreon, sees nearest partner clinic',
              color: 'bg-warning',
            },
            {
              icon: '🏥',
              title: 'Deliver',
              description: 'Takes animal to verified partner clinic',
              color: 'bg-accent',
            },
            {
              icon: '🤖',
              title: 'AI Case',
              description: 'Clinic creates case in seconds with AI',
              color: 'bg-success',
            },
            {
              icon: '🏠',
              title: 'Adopt',
              description: 'Animal recovers & finds forever home',
              color: 'bg-primary',
            },
          ];

          return (
            <div className="mx-auto w-full max-w-md md:max-w-6xl">
              <Kicker>How it works</Kicker>
              <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
                From Street to Forever Home
              </h2>
              <p className="mt-2 text-sm text-muted-foreground md:mt-3 md:text-xl">
                The complete rescue journey—powered by our partner network
              </p>

              {/* Mobile: Compact vertical steps */}
              <div className="mt-4 space-y-2 md:hidden">
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
                        <div className={cn("flex size-16 items-center justify-center rounded-full text-3xl shadow-sm", step.color)}>
                          {step.icon}
                        </div>
                        <div className="mt-3 font-semibold">{step.title}</div>
                        <div className="mt-1 max-w-32 text-sm text-muted-foreground">
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
                    <div className="size-3 rounded-full bg-destructive" />
                    <div className="size-3 rounded-full bg-warning" />
                    <div className="size-3 rounded-full bg-success" />
                    <span className="ml-2 text-sm text-muted-foreground">Pawtreon Clinic Portal</span>
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
              {/* Mobile: Vertical stacked cards - all visible */}
              <div className="space-y-3 md:hidden">
                {[
                  { icon: <BadgeCheck className="size-6" />, title: 'Verified Badge', description: 'Stand out as a trusted partner. Donors fund your cases faster.' },
                  { icon: <Stethoscope className="size-6" />, title: 'Clear Payouts', description: 'Transparent audit trail. No chasing payments. Funds released on verification.' },
                  { icon: <Sparkles className="size-6" />, title: 'AI Case Creation', description: 'Create fundraiser cases in seconds, not hours. We handle the marketing.' },
                  { icon: <MapPin className="size-6" />, title: 'Directory Listing', description: 'Rescuers find you when searching for nearby clinics. Free visibility.' },
                  { icon: <Users className="size-6" />, title: 'Community Support', description: 'Help more animals without financial risk. We bring the donors.' },
                ].map((item) => (
                  <ValueCard key={item.title} {...item} />
                ))}
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

            <Card className="mt-8 border-success/40 bg-success/5 md:mt-10">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-success text-success-foreground">
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

            <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <PawPrint className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Adoption Day Partnerships</CardTitle>
                  <CardDescription className="text-sm">
                    Host adoption events at your store. We coordinate with shelters.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Store className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Supply Drop-Off Point</CardTitle>
                  <CardDescription className="text-sm">
                    Customers donate pet supplies at your store. Great foot traffic.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Heart className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Sponsor Campaigns</CardTitle>
                  <CardDescription className="text-sm">
                    Your brand featured on rescue cases. CSR storytelling.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MapPin className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Directory Listing</CardTitle>
                  <CardDescription className="text-sm">
                    Pet owners find you when searching for pet services.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <Badge variant="outline" className="text-sm px-3 py-1.5">
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
              <div className="grid gap-3 md:grid-cols-2">
                <Card className="md:col-span-2">
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">📢</span> Campaign Tools
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Launch fundraisers with a few taps. AI helps write compelling stories.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">🐕</span> Adoption Listings
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Global visibility for your adoptable pets. Digital applications.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">💰</span> Donor Transparency
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Donors see exactly where their money goes.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">🔒</span> Verification Badge
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Stand out as a verified, trusted organization.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-xl">📊</span> Impact Reports
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Show your community what you've achieved.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card className="mt-4 border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="font-semibold">Free to start. Upgrade when you're ready.</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Basic features free forever.
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
                <div className="relative h-64 bg-surface-overlay/40 md:h-80">
                  {/* Fake map pins */}
                  <div className="absolute left-[20%] top-[30%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Stethoscope className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-background px-2 py-0.5 text-xs shadow">0.5 km</div>
                  </div>
                  <div className="absolute left-[60%] top-[20%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Stethoscope className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-background px-2 py-0.5 text-xs shadow">1.2 km</div>
                  </div>
                  <div className="absolute left-[45%] top-[55%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm">
                      <Clock className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-success px-2 py-0.5 text-xs text-success-foreground shadow-sm">24/7</div>
                  </div>
                  <div className="absolute left-[75%] top-[65%] flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Stethoscope className="size-4" />
                    </div>
                    <div className="mt-1 rounded bg-background px-2 py-0.5 text-xs shadow">2.8 km</div>
                  </div>
                  
                  {/* User location */}
                  <div className="absolute left-[40%] top-[45%]">
                    <div className="size-4 rounded-full border-4 border-primary bg-background" />
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
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
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
                <Badge className="text-base px-4 py-2 bg-success text-success-foreground">🏠 Adopted!</Badge>
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

              <Card className="mt-8 border-success/40 bg-success/5">
                <CardContent className="p-6">
                  <div className="text-4xl font-extrabold text-success">10,000+</div>
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

            <div className="mt-8 grid gap-3 md:mt-10 md:grid-cols-2">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="size-4 text-primary" />
                    Partner Verification
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Every clinic and shelter is manually verified.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BadgeCheck className="size-4 text-primary" />
                    Transparent Updates
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Medical-style timeline for every case.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="size-4 text-primary" />
                    Clinic Payouts
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Funds go to verified clinics, not individuals.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="size-4 text-primary" />
                    AI Fraud Detection
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Flag manipulated images and suspicious patterns.
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
              {/* Mobile: Vertical stacked cards - all visible */}
              <div className="space-y-3 md:hidden">
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
              Join the Pawtreon partner network. It takes 5 minutes to apply.
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
                    <Button size="lg" className="w-full" onClick={() => openApply('clinic')}>
                      <Stethoscope className="mr-2 size-5" />
                      Apply as Clinic
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => openApply('shelter')}>
                      <Building2 className="mr-2 size-5" />
                      Apply as Shelter
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button size="lg" variant="outline" className="w-full" onClick={() => openApply('pet_store')}>
                      <Store className="mr-2 size-5" />
                      Apply as Pet Store
                    </Button>
                    <Button size="lg" variant="outline" className="w-full" onClick={() => openApply('sponsor')}>
                      <Heart className="mr-2 size-5" />
                      Become a Sponsor
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    {contactEmail ? (
                      <Button asChild variant="link">
                        <a href={`mailto:${contactEmail}?subject=Pawtreon%20Partnership%20Inquiry`}>
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
                      <a href="https://pawtreon.org" target="_blank" rel="noreferrer">
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
    [contactEmail, copyDeckLink, openApply],
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
            <div className="hidden truncate text-xs text-muted-foreground sm:block">Pawtreon Partner Network</div>
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
        <div className="border-t bg-background/95 px-4 py-3 backdrop-blur-md md:px-4 md:py-3">
          <div className="mx-auto w-full max-w-md md:max-w-none">
            {/* Mobile navigation - simplified with progress bar */}
            <div className="flex items-center justify-between gap-3 md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full"
                onClick={prevSlide}
                disabled={currentSlide === 0}
                aria-label="Previous slide"
              >
                <ChevronLeft className="size-5" />
              </Button>
              
              {/* Progress indicator - cleaner than dots */}
              <div className="flex flex-1 flex-col items-center gap-1.5">
                <Progress 
                  value={(currentSlide + 1) / totalSlides * 100} 
                  className="h-1.5 w-full max-w-32" 
                />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {currentSlide + 1} of {totalSlides}
                </span>
              </div>
              
              <Button
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full"
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                aria-label="Next slide"
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>

            {/* Desktop navigation */}
            <div className="hidden flex-col items-center gap-3 md:flex">
              <div className="flex items-center gap-3 rounded-full border bg-card/90 px-4 py-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
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
                  className="h-10 w-10"
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
              <div className="mt-2 text-center text-xs text-muted-foreground md:hidden">
                Swipe or tap arrows to navigate
              </div>
            )}
          </div>
        </div>
      </footer>

      <Sheet open={applyOpen} onOpenChange={setApplyOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <SheetHeader className="text-left">
            <SheetTitle className="text-lg">{applyRoleLabel} onboarding</SheetTitle>
            <SheetDescription>
              We’re onboarding partners manually during beta. Reach out and we’ll follow up with next steps.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-border/60 bg-card/40 p-3">
              <div className="font-semibold text-foreground">What happens next</div>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>We confirm basic details and availability.</li>
                <li>We verify partner credentials (where applicable).</li>
                <li>We enable your partner badge and onboarding.</li>
              </ul>
            </div>
          </div>

          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setApplyOpen(false)}>
              Close
            </Button>
            {contactEmail ? (
              <Button asChild>
                <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(applyEmailSubject)}`}>
                  Email us
                </a>
              </Button>
            ) : (
              <Button onClick={copyDeckLink}>
                Copy presentation link
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
      <div className="flex min-h-full flex-col items-center justify-start px-4 pb-28 pt-20 md:justify-center md:px-8 md:pb-32 md:pt-28 lg:px-10">
        {children}
      </div>
    </div>
  );
}

function Kicker({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className={cn('mb-3 w-fit text-xs uppercase tracking-wider md:mb-4', className)}
    >
      {children}
    </Badge>
  );
}

function PartnerTypeBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium">
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
    </div>
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
      <CardHeader className="p-4 md:p-6">
        <div className="mb-2 text-4xl">{icon}</div>
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        <CardDescription className="text-sm leading-relaxed md:text-base">
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
              <BadgeCheck className="size-4 text-success" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
