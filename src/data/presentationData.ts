/**
 * Static data specifically for the investor presentation page.
 * This data is intentionally hardcoded to ensure the presentation
 * works offline and remains consistent across demo sessions.
 */

import type { Campaign, Case, Volunteer } from '@/types';

// Sample cases for presentation
export const presentationCases: Case[] = [
  {
    id: 'case-1',
    title: 'Luna - Hit by car, needs surgery',
    description: 'Beautiful stray dog found injured after being hit by a car. Needs emergency surgery.',
    story: 'Luna was found by a kind passerby who noticed she couldn\'t walk. X-rays show she needs immediate surgery on her hind legs.',
    status: 'critical',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    location: {
      city: 'Sofia',
      neighborhood: 'Lozenets',
      coordinates: { lat: 42.6687, lng: 23.3088 }
    },
    fundraising: {
      goal: 1500,
      current: 890,
      currency: 'BGN',
      donorCount: 42
    },
    updates: [
      {
        id: 'u1',
        date: new Date().toISOString(),
        title: 'Surgery scheduled',
        content: 'Luna\'s surgery is scheduled for tomorrow morning.',
        type: 'medical'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'case-2',
    title: 'Mila - Abandoned kitten with infection',
    description: 'Tiny kitten found abandoned with severe eye infection.',
    story: 'Mila was found in a cardboard box, barely 4 weeks old with a severe eye infection that needs treatment.',
    status: 'urgent',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
    ],
    location: {
      city: 'Plovdiv',
      neighborhood: 'Center',
      coordinates: { lat: 42.1505, lng: 24.7489 }
    },
    fundraising: {
      goal: 400,
      current: 320,
      currency: 'BGN',
      donorCount: 28
    },
    updates: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'case-3',
    title: 'Max - Senior dog needs dental care',
    description: 'Elderly stray with severe dental problems causing pain.',
    story: 'Max is estimated to be around 12 years old. He was found with infected teeth that are causing him constant pain.',
    status: 'stable',
    images: [
      'https://images.unsplash.com/photo-1544568100-847a948585b9?w=800',
    ],
    location: {
      city: 'Varna',
      neighborhood: 'Sea Garden',
      coordinates: { lat: 43.2047, lng: 27.9116 }
    },
    fundraising: {
      goal: 600,
      current: 600,
      currency: 'BGN',
      donorCount: 35
    },
    updates: [
      {
        id: 'u2',
        date: new Date().toISOString(),
        title: 'Fully funded!',
        content: 'Thanks to amazing donors, Max\'s treatment is fully funded!',
        type: 'milestone'
      }
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
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
    raised: 3200,
    currency: 'BGN',
    donorCount: 89,
    daysLeft: 21,
    organizer: {
      id: 'org-1',
      name: 'Pawtreon Foundation',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      verified: true,
    },
    isFeatured: true,
  },
  {
    id: 'campaign-2',
    title: 'Spay/Neuter Initiative',
    description: 'Free sterilization for 100 stray cats in Sofia.',
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800',
    goal: 8000,
    raised: 5600,
    currency: 'BGN',
    donorCount: 124,
    daysLeft: 45,
    organizer: {
      id: 'org-2',
      name: 'Sofia Cat Rescue',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      verified: true,
    },
    isFeatured: false,
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
export const presentationPartners = [
  {
    id: 'partner-1',
    name: 'Happy Paws Foundation',
    logo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
    type: 'nonprofit' as const,
    description: 'Leading animal welfare organization in Bulgaria.',
    website: 'https://happypaws.bg',
    verified: true,
    joinedAt: '2024-01-15',
  },
  {
    id: 'partner-2',
    name: 'PetShop Bulgaria',
    logo: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200',
    type: 'business' as const,
    description: 'Largest pet supply chain donating 5% of sales.',
    website: 'https://petshop.bg',
    verified: true,
    joinedAt: '2024-02-01',
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
    },
  },
];
