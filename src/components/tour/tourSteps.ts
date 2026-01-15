import { Step } from 'react-joyride';
import i18n from '@/i18n';

/**
 * Tour steps for the homepage product tour.
 * Each step targets elements with data-tour attributes.
 */
export const getHomepageTourSteps = (): Step[] => {
  const t = i18n.t.bind(i18n);
  
  return [
    {
      target: 'body',
      content: t('tour.welcome', 'Welcome to Pawtreon! 🐾 Let me show you how to help animals in need.'),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="urgent-cases"]',
      content: t('tour.urgentCases', 'Here you\'ll find animals that need immediate help. Each case shows their story and how much funding they need.'),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="case-card"]',
      content: t('tour.caseCard', 'Click on any case to see details and make a donation. Every amount helps!'),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="navigation"]',
      content: t('tour.navigation', 'Explore campaigns, partner clinics, and shelters working with us.'),
      placement: 'top',
      disableBeacon: true,
    },
    {
      target: '[data-tour="profile-menu"]',
      content: t('tour.profile', 'Access your profile, donation history, and achievements here.'),
      placement: 'left',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: t('tour.complete', 'You\'re all set! Start exploring and helping animals today. 🐾💝'),
      placement: 'center',
      disableBeacon: true,
    },
  ];
};
