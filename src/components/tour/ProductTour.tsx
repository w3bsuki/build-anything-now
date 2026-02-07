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
          primaryColor: 'hsl(142.1, 76.2%, 36.3%)',
          textColor: 'hsl(240, 10%, 3.9%)',
          backgroundColor: 'hsl(0, 0%, 100%)',
          arrowColor: 'hsl(0, 0%, 100%)',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
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
          backgroundColor: 'hsl(142.1, 76.2%, 36.3%)',
          borderRadius: 12,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 500,
        },
        buttonBack: {
          color: 'hsl(240, 5.9%, 10%)',
          marginRight: 8,
        },
        buttonSkip: {
          color: 'hsl(240, 3.8%, 46.1%)',
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
