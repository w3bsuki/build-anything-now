import { useCallback } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { useProductTour } from '@/hooks/useProductTour';
import { getHomepageTourSteps } from './tourSteps';

/**
 * Product tour component using react-joyride.
 * Shows a guided tour for new users after onboarding.
 */
export function ProductTour() {
  const { isRunning, handleTourComplete, handleTourSkip } = useProductTour();

  const handleCallback = useCallback((data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as (typeof STATUS.FINISHED | typeof STATUS.SKIPPED))) {
      if (status === STATUS.SKIPPED) {
        handleTourSkip();
      } else {
        handleTourComplete();
      }
    }
  }, [handleTourComplete, handleTourSkip]);

  if (!isRunning) return null;

  const steps = getHomepageTourSteps();

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling={false}
      callback={handleCallback}
      floaterProps={{
        disableAnimation: false,
      }}
      styles={{
        options: {
          primaryColor: 'var(--primary)',
          textColor: 'var(--foreground)',
          backgroundColor: 'var(--card)',
          arrowColor: 'var(--card)',
          overlayColor: 'var(--overlay-dim)',
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 16,
        },
        tooltip: {
          borderRadius: 16,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: 14,
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: 'var(--primary)',
          borderRadius: 12,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: 'var(--foreground)',
          marginRight: 8,
        },
        buttonSkip: {
          color: 'var(--muted-foreground)',
        },
        buttonClose: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started! 🐾',
        next: 'Next',
        open: 'Open',
        skip: 'Skip Tour',
      }}
    />
  );
}
