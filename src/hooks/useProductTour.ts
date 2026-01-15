import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useLocation } from 'react-router-dom';
import { api } from '../../convex/_generated/api';

/**
 * Hook to manage product tour state
 */
export function useProductTour() {
  const user = useQuery(api.users.me);
  const completeProductTour = useMutation(api.users.completeProductTour);
  const location = useLocation();
  
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Determine if tour should run
  const shouldShowTour = 
    user?.onboardingCompleted && 
    !user?.productTourCompleted &&
    location.pathname === '/' &&
    !hasStarted;

  // Start tour automatically when conditions are met
  useEffect(() => {
    if (shouldShowTour && !isRunning) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setIsRunning(true);
        setHasStarted(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowTour, isRunning]);

  const handleTourComplete = useCallback(async () => {
    setIsRunning(false);
    try {
      await completeProductTour();
    } catch (error) {
      console.error('Failed to complete product tour:', error);
    }
  }, [completeProductTour]);

  const handleTourSkip = useCallback(async () => {
    setIsRunning(false);
    try {
      await completeProductTour();
    } catch (error) {
      console.error('Failed to skip product tour:', error);
    }
  }, [completeProductTour]);

  const startTour = useCallback(() => {
    setIsRunning(true);
    setHasStarted(true);
  }, []);

  return {
    isRunning,
    shouldShowTour,
    startTour,
    handleTourComplete,
    handleTourSkip,
  };
}
