import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useMutation } from 'convex/react';
import { useConvexAuth } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type OnboardingOption = 'help' | 'organization' | 'exploring' | null;

interface OptionCardProps {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const OptionCard = ({ emoji, title, description, selected, onSelect }: OptionCardProps) => (
  <button
    onClick={onSelect}
    className={cn(
      "w-full text-left p-3.5 rounded-xl border transition-all duration-200 active:scale-[0.98]",
      "bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
      selected 
        ? "border-primary bg-primary/5 shadow-sm" 
        : "border-border/50 hover:border-primary/30"
    )}
  >
    <div className="flex items-center gap-3">
      <div className={cn(
        "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors",
        selected ? "bg-primary/10" : "bg-muted"
      )}>
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-foreground">{title}</h3>
          {selected && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground">
              <Check className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
    </div>
  </button>
);

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
  const completeOnboarding = useMutation(api.users.completeOnboarding);
  
  const [selected, setSelected] = useState<OnboardingOption>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug auth state
  console.log('Auth state:', { isLoaded, isSignedIn, isConvexLoading, isAuthenticated });

  // Redirect to sign-in if not authenticated (after Clerk has loaded)
  if (isLoaded && !isSignedIn) {
    navigate('/sign-in', { replace: true });
    return null;
  }

  const handleContinue = async () => {
    console.log('handleContinue called', { selected, isAuthenticated, isSignedIn, isConvexLoading });
    
    if (!selected) {
      console.log('No selection made');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (selected === 'organization') {
        navigate('/onboarding/claim');
      } else {
        console.log('Calling completeOnboarding mutation...');
        await completeOnboarding({ userType: 'individual' });
        console.log('Onboarding completed successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const options = [
    {
      id: 'help' as const,
      emoji: '💝',
      title: t('onboarding.options.help.title'),
      description: t('onboarding.options.help.description'),
    },
    {
      id: 'organization' as const,
      emoji: '🏥',
      title: t('onboarding.options.organization.title'),
      description: t('onboarding.options.organization.description'),
    },
    {
      id: 'exploring' as const,
      emoji: '👀',
      title: t('onboarding.options.exploring.title'),
      description: t('onboarding.options.exploring.description'),
    },
  ];

  // Loading state - wait for both Clerk and Convex to be ready
  if (!isLoaded || isConvexLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-3">
          <span className="text-3xl">🐾</span>
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">
          {t('onboarding.welcome.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('onboarding.welcome.subtitle')}
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 px-4 py-2 max-w-md mx-auto w-full">
        <div className="space-y-2.5">
          {options.map((option) => (
            <OptionCard
              key={option.id}
              emoji={option.emoji}
              title={option.title}
              description={option.description}
              selected={selected === option.id}
              onSelect={() => setSelected(option.id)}
            />
          ))}
        </div>
      </div>

      {/* Continue Button */}
      <div className="sticky bottom-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border/40">
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleContinue}
            disabled={!selected || isSubmitting}
            className="w-full h-11 rounded-xl text-sm font-semibold gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('actions.loading')}
              </>
            ) : (
              <>
                {t('actions.continue')}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            <div className="w-6 h-1 rounded-full bg-primary" />
            <div className="w-6 h-1 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
