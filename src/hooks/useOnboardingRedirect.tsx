import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Hook that redirects new users to onboarding if they haven't completed it.
 * Should be used in the root App component or layout.
 */
export function useOnboardingRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const user = useQuery(api.users.me);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to load
    if (!isLoaded) return;
    
    // Not signed in - don't redirect
    if (!isSignedIn) return;
    
    // User query still loading
    if (user === undefined) return;
    
    // User doesn't exist in database yet (webhook might be processing)
    if (user === null) return;
    
    // Skip if already on onboarding or auth pages
    const isOnboardingPage = location.pathname.startsWith('/onboarding');
    const isAuthPage = location.pathname.startsWith('/sign-in') || location.pathname.startsWith('/sign-up');
    
    if (isOnboardingPage || isAuthPage) return;
    
    // If user hasn't completed onboarding, redirect to onboarding
    if (!user.onboardingCompleted) {
      navigate('/onboarding', { replace: true });
    }
  }, [isLoaded, isSignedIn, user, location.pathname, navigate]);
}

/**
 * Component wrapper that handles onboarding redirect
 */
export function OnboardingRedirect({ children }: { children: React.ReactNode }) {
  useOnboardingRedirect();
  return <>{children}</>;
}
