import { AnimalCase, Campaign, Partner } from '@/types';

export const mockCases: AnimalCase[] = [
  {
    id: '1',
    title: 'Puppy found freezing in Sofia',
    description: 'A 3-month-old puppy was found shivering near Vitosha Boulevard. Needs immediate medical care.',
    story: 'Little Max was discovered by a kind passerby on a freezing January morning, huddled behind a dumpster near Vitosha Boulevard. His tiny body was trembling, and he was barely conscious from hypothermia. Our rescue team rushed him to the emergency vet where he was diagnosed with severe malnutrition and a respiratory infection.\n\nMax is a fighter. Despite his rough start, he wags his tail at everyone who visits him. He needs continued medical care, warm shelter, and lots of love before he can find his forever home.',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
      'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800',
    ],
    status: 'urgent',
    location: { city: 'Sofia', neighborhood: 'Center' },
    fundraising: { current: 320, goal: 500, currency: 'BGN' },
    updates: [
      { id: 'u1', date: '2024-01-15', title: 'Rescued!', description: 'Max was rescued and brought to the clinic.', type: 'milestone' },
      { id: 'u2', date: '2024-01-16', title: 'Treatment started', description: 'Antibiotics and IV fluids administered.', type: 'medical' },
      { id: 'u3', date: '2024-01-18', title: 'Eating on his own', description: 'Max started eating solid food today!', type: 'success' },
    ],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Injured cat needs surgery',
    description: 'A beautiful tabby was hit by a car in Plovdiv. Requires urgent leg surgery.',
    story: 'Luna, a beautiful tabby cat, was found by residents of a quiet Plovdiv neighborhood after being hit by a speeding car. Her back leg was badly injured, and she was in tremendous pain.\n\nThe veterinary team has stabilized her, but Luna needs surgery to repair her fractured leg. Without it, she may never walk properly again. Luna is incredibly gentle despite her pain, purring whenever someone pets her.',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800',
    ],
    status: 'critical',
    location: { city: 'Plovdiv', neighborhood: 'Kapana' },
    fundraising: { current: 450, goal: 800, currency: 'BGN' },
    updates: [
      { id: 'u1', date: '2024-01-14', title: 'Emergency intake', description: 'Luna was brought in after the accident.', type: 'medical' },
      { id: 'u2', date: '2024-01-15', title: 'X-rays completed', description: 'Fracture confirmed, surgery scheduled.', type: 'medical' },
    ],
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    title: 'Bella found her forever home!',
    description: 'After 6 months of recovery, Bella was adopted by a loving family in Burgas.',
    story: "Bella's journey is one of resilience and hope. Found abandoned and malnourished, she spent six months in our care, slowly regaining her health and trust in humans.\n\nToday, we're thrilled to announce that Bella has been adopted by a wonderful family in Burgas! She now has a warm bed, regular meals, and all the love she deserves.",
    images: [
      'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ],
    status: 'adopted',
    location: { city: 'Burgas', neighborhood: 'Sea Garden' },
    fundraising: { current: 600, goal: 600, currency: 'BGN' },
    updates: [
      { id: 'u1', date: '2023-07-10', title: 'Rescued', description: 'Bella was found and brought to the shelter.', type: 'milestone' },
      { id: 'u2', date: '2023-09-15', title: 'Fully recovered', description: 'Bella is now healthy and ready for adoption.', type: 'success' },
      { id: 'u3', date: '2024-01-10', title: 'Adopted!', description: 'Bella found her forever family!', type: 'success' },
    ],
    createdAt: '2023-07-10',
  },
  {
    id: '4',
    title: 'Stray mama dog with puppies',
    description: 'A mother dog with 5 puppies was found under a bridge in Varna. All need care.',
    story: "A brave mama dog has been protecting her 5 puppies under a bridge in Varna through rain and cold. She's exhausted but refuses to leave her babies.\n\nAll six dogs need immediate medical checkups, vaccinations, and a safe place to stay. The puppies are about 4 weeks old and will soon need proper nutrition to grow strong.",
    images: [
      'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=800',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    ],
    status: 'recovering',
    location: { city: 'Varna', neighborhood: 'Asparuhovo' },
    fundraising: { current: 180, goal: 1000, currency: 'BGN' },
    updates: [
      { id: 'u1', date: '2024-01-17', title: 'Family rescued', description: 'All 6 dogs are now safe at the shelter.', type: 'milestone' },
      { id: 'u2', date: '2024-01-18', title: 'Health check', description: 'Vet exams scheduled for tomorrow.', type: 'update' },
    ],
    createdAt: '2024-01-17',
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    title: 'Winter is Coming: Build 50 Homes',
    description: 'Help us build insulated winter shelters for stray animals across Bulgaria. Each home protects a life from the freezing cold.',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
    goal: 50,
    current: 23,
    unit: 'Homes',
    endDate: '2024-03-01',
  },
  {
    id: 'c2',
    title: 'Spay & Neuter Initiative',
    description: 'Reduce stray animal population humanely. Every surgery prevents future suffering.',
    image: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800',
    goal: 100,
    current: 67,
    unit: 'Surgeries',
  },
  {
    id: 'c3',
    title: 'Emergency Medical Fund',
    description: 'A reserve fund for unexpected emergencies. When animals need immediate care, every second counts.',
    image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=800',
    goal: 10000,
    current: 4250,
    unit: 'BGN',
  },
];

export const mockPartners: Partner[] = [
  {
    id: 'p1',
    name: 'PetMart Bulgaria',
    logo: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=200',
    contribution: 'Provided 500kg of premium dog food',
    type: 'pet-shop',
  },
  {
    id: 'p2',
    name: 'Royal Canin BG',
    logo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
    contribution: 'Monthly food sponsor for 20 animals',
    type: 'food-brand',
  },
  {
    id: 'p3',
    name: 'VetCare Sofia',
    logo: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=200',
    contribution: 'Free consultations every Saturday',
    type: 'veterinary',
  },
  {
    id: 'p4',
    name: 'Animal Friends Foundation',
    logo: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200',
    contribution: 'Major sponsor - 5000 BGN monthly',
    type: 'sponsor',
  },
];
