/**
 * Static data specifically for the investor presentation page.
 * This data is intentionally hardcoded to ensure the presentation
 * works offline and remains consistent across demo sessions.
 */

import type { AnimalCase, Campaign, Partner, Volunteer } from '@/types';

// Sample cases for presentation
export const presentationCases: AnimalCase[] = [
  {
    id: 'case-1',
    title: 'Luna - Hit by car, needs surgery',
    description: 'Beautiful stray dog found injured after being hit by a car. Needs emergency surgery.',
    story: 'Luna was found by a kind passerby who noticed she couldn\'t walk. X-rays show she needs immediate surgery on her hind legs.',
    status: 'critical',
    verificationStatus: 'clinic',
    species: 'dog',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    location: {
      city: 'Sofia',
      neighborhood: 'Lozenets'
    },
    fundraising: {
      goal: 1500,
      current: 890,
      currency: 'BGN'
    },
    updates: [
      {
        id: 'u1',
        date: new Date().toISOString(),
        title: 'Surgery scheduled',
        description: 'Luna\'s surgery is scheduled for tomorrow morning.',
        type: 'medical'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'case-2',
    title: 'Mila - Abandoned kitten with infection',
    description: 'Tiny kitten found abandoned with severe eye infection.',
    story: 'Mila was found in a cardboard box, barely 4 weeks old with a severe eye infection that needs treatment.',
    status: 'urgent',
    verificationStatus: 'community',
    species: 'cat',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
    ],
    location: {
      city: 'Plovdiv',
      neighborhood: 'Center'
    },
    fundraising: {
      goal: 400,
      current: 320,
      currency: 'BGN'
    },
    updates: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'case-3',
    title: 'Max - Senior dog needs dental care',
    description: 'Elderly stray with severe dental problems causing pain.',
    story: 'Max is estimated to be around 12 years old. He was found with infected teeth that are causing him constant pain.',
    status: 'recovering',
    verificationStatus: 'community',
    species: 'dog',
    images: [
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
    ],
    location: {
      city: 'Varna',
      neighborhood: 'Sea Garden'
    },
    fundraising: {
      goal: 600,
      current: 600,
      currency: 'BGN'
    },
    updates: [
      {
        id: 'u2',
        date: new Date().toISOString(),
        title: 'Fully funded!',
        description: 'Thanks to amazing donors, Max\'s treatment is fully funded!',
        type: 'milestone'
      }
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample campaigns for presentation
export const presentationCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    title: 'Winter Shelter Fund 2024',
    description: 'Help us provide warm shelters for street animals this winter.',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    goal: 5000,
    current: 3200,
    unit: 'BGN',
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'campaign-2',
    title: 'Spay/Neuter Initiative',
    description: 'Free sterilization for 100 stray cats in Sofia.',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
    goal: 8000,
    current: 5600,
    unit: 'BGN',
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Sample clinics for presentation
export const presentationClinics = [
  {
    id: 'clinic-1',
    name: 'Animal Care Sofia',
    address: 'ul. Vitosha 45',
    city: 'Sofia',
    phone: '+359 2 123 4567',
    hours: '24/7',
    is24h: true,
    specializations: ['Emergency', 'Surgery', 'X-Ray'],
    verified: true,
  },
  {
    id: 'clinic-2',
    name: 'VetPlus Plovdiv',
    address: 'bul. Bulgaria 12',
    city: 'Plovdiv',
    phone: '+359 32 987 6543',
    hours: '08:00 - 20:00',
    is24h: false,
    specializations: ['General', 'Dental', 'Vaccination'],
    verified: true,
  },
];

// Sample partners for presentation
export const presentationPartners: Partner[] = [
  {
    id: 'partner-1',
    name: 'Happy Paws Foundation',
    logo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
    type: 'sponsor',
    contribution: 'Funds emergency surgeries and supports rescue operations.',
    description: 'Leading animal welfare organization in Bulgaria.',
    website: 'https://happypaws.bg',
    since: '2024',
    animalsHelped: 1200,
    totalContributed: 85000,
    featured: true,
  },
  {
    id: 'partner-2',
    name: 'PetShop Bulgaria',
    logo: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200',
    type: 'pet-shop',
    contribution: 'Donates supplies and hosts adoption days with local rescues.',
    description: 'Largest pet supply chain donating 5% of sales.',
    website: 'https://petshop.bg',
    since: '2024',
    animalsHelped: 450,
    totalContributed: 42000,
  },
];

// Sample volunteers for presentation
export const presentationVolunteers: Volunteer[] = [
  {
    id: 'volunteer-1',
    name: 'Maria Petrova',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Animal lover and rescue coordinator with 5+ years experience.',
    location: 'Sofia',
    rating: 4.9,
    memberSince: '2023-03-15',
    isTopVolunteer: true,
    badges: ['Top Rescuer', 'Verified', '100+ Rescues'],
    stats: {
      animalsHelped: 127,
      adoptions: 43,
      campaigns: 12,
      donationsReceived: 18500,
      hoursVolunteered: 640,
    },
  },
  {
    id: 'volunteer-2',
    name: 'Ivan Dimitrov',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Veterinary student volunteering weekends.',
    location: 'Plovdiv',
    rating: 4.8,
    memberSince: '2023-06-01',
    isTopVolunteer: false,
    badges: ['Medical Support', 'Verified'],
    stats: {
      animalsHelped: 45,
      adoptions: 12,
      campaigns: 5,
      donationsReceived: 4200,
      hoursVolunteered: 180,
    },
  },
];
