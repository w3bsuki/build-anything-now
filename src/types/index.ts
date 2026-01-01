export type AnimalStatus = 'critical' | 'urgent' | 'recovering' | 'adopted';

export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'other';

export interface AnimalCase {
  id: string;
  title: string;
  description: string;
  story: string;
  images: string[];
  status: AnimalStatus;
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
  type: 'pet-shop' | 'food-brand' | 'veterinary' | 'sponsor';
}
