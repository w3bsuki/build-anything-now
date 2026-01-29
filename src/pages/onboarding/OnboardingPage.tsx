import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useConvexAuth } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Loader2, Heart, Building2, Eye, PawPrint } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ============================================
// TYPES - Simplified per plan: 3 options only
// ============================================

type UserTypeOption = 'helper' | 'organization' | 'exploring' | null;

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

// ============================================
// COMPONENTS - Clean, following shadcn patterns
// ============================================

function OptionCard({ icon, title, description, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        // Base: proper touch target, consistent padding
        "w-full text-left min-h-[88px] rounded-xl cursor-pointer",
        "border transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // State styling using design tokens only
        selected 
          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/50"
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Icon container - consistent sizing */}
        <div className={cn(
          "shrink-0 size-12 rounded-xl flex items-center justify-center",
          selected ? "bg-primary/10" : "bg-muted"
        )}>
          {icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-foreground">{title}</h3>
            {selected && (
              <span className="flex items-center justify-center size-5 rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        </div>
      </div>
    </button>
  );
}

// ============================================
// MAIN COMPONENT - Single step flow (90% of users!)
// ============================================

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { isLoading: isConvexLoading } = useConvexAuth();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  
  const [selectedType, setSelectedType] = useState<UserTypeOption>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleContinue = async () => {
    if (!selectedType) return;

    if (selectedType === 'organization') {
      // Organizations get the claim flow
      navigate('/onboarding/claim');
      return;
    }

    // Helper & Exploring → Complete immediately (no extra steps!)
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        enhancedUserType: selectedType === 'helper' ? 'pet_lover' : 'exploring',
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };

  // ============================================
  // DATA - Only 3 options per approved plan
  // ============================================

  const userTypeOptions = [
    {
      id: 'helper' as const,
      icon: <Heart className="size-6 text-primary" />,
      title: t('onboarding.options.helper.title', 'I want to help animals'),
      description: t('onboarding.options.helper.description', 'Donate, adopt, volunteer, or find pet services'),
    },
    {
      id: 'organization' as const,
      icon: <Building2 className="size-6 text-primary" />,
      title: t('onboarding.options.organization.title', 'I represent a clinic/organization'),
      description: t('onboarding.options.organization.description', 'Vet clinic, shelter, groomer, or pet business'),
    },
    {
      id: 'exploring' as const,
      icon: <Eye className="size-6 text-muted-foreground" />,
      title: t('onboarding.options.exploring.title', 'Just exploring'),
      description: t('onboarding.options.exploring.description', 'Looking around to see what Pawtreon offers'),
    },
  ];

  // ============================================
  // LOADING STATE
  // ============================================

  if (!isLoaded || isConvexLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  // ============================================
  // RENDER - Clean, single-step flow
  // ============================================

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - Clean, no gradients */}
      <div className="px-4 pt-12 pb-8 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-primary/10 mb-4">
          <PawPrint className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('onboarding.welcome.title', 'Welcome to Pawtreon!')}
        </h1>
        <p className="text-base text-muted-foreground max-w-xs mx-auto">
          {t('onboarding.welcome.subtitle', 'What brings you here?')}
        </p>
      </div>

      {/* Options - Proper spacing and touch targets */}
      <div className="flex-1 px-4 pb-4 max-w-lg mx-auto w-full">
        <div className="space-y-3">
          {userTypeOptions.map((option) => (
            <OptionCard
              key={option.id}
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={selectedType === option.id}
              onSelect={() => setSelectedType(option.id)}
            />
          ))}
        </div>
      </div>

      {/* Footer - Sticky, proper padding for safe areas */}
      <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background border-t border-border/50">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleContinue}
            disabled={!selectedType || isSubmitting}
            size="lg"
            className="w-full min-h-12 text-base font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                {t('actions.loading', 'Loading...')}
              </>
            ) : (
              <>
                {t('actions.continue', 'Continue')}
                <ArrowRight className="size-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
