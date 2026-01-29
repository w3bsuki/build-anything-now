export type AnimalStatus = 'critical' | 'urgent' | 'recovering' | 'adopted';

export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'other';

export type CaseVerificationStatus = 'unverified' | 'community' | 'clinic';

export interface AnimalCase {
  id: string;
  title: string;
  description: string;
  story: string;
  images: string[];
  status: AnimalStatus;
  verificationStatus?: CaseVerificationStatus;
  species: AnimalSpecies;
  location: {
    city: string;
    neighborhood: string;
  };
  fundraising: {
    current: number;
    goal: number;
    currency: string;
  };
  updates: CaseUpdate[];
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  } | null;
}

export interface CaseUpdate {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'medical' | 'milestone' | 'update' | 'success';
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  current: number;
  unit: string;
  endDate?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  contribution: string;
  description: string;
  type: 'pet-shop' | 'food-brand' | 'veterinary' | 'sponsor';
  website?: string;
  since: string;
  animalsHelped: number;
  totalContributed: number;
  featured?: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  is24h: boolean;
  specializations: string[];
  verified: boolean;
}

export interface Volunteer {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  rating: number;
  memberSince: string;
  isTopVolunteer: boolean;
  badges: string[];
  badgesMobile?: string[];
  stats: {
    animalsHelped: number;
    adoptions: number;
    campaigns: number;
    donationsReceived: number;
    hoursVolunteered: number;
  };
}

export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVolunteer: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  timeAgo: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    isVolunteer: boolean;
  };
  content: string;
  likes: number;
  timeAgo: string;
  createdAt: string;
  replies?: PostComment[];
}
