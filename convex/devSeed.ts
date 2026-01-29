/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

function requireDevSecret(secret: string) {
  const expected = process.env.DEV_SEED_SECRET;
  if (!expected) {
    throw new Error(
      "DEV_SEED_SECRET is not set. Set it with `npx convex env set DEV_SEED_SECRET <value>`.",
    );
  }
  if (secret !== expected) throw new Error("Invalid DEV_SEED_SECRET");
}

// Demo user IDs (predictable for cleanup)
const DEMO_CLERK_IDS = {
  admin: "demo_admin_pawtreon",
  volunteer1: "demo_volunteer_maria",
  volunteer2: "demo_volunteer_georgi",
  volunteer3: "demo_volunteer_elena",
  user1: "demo_user_ivan",
  user2: "demo_user_peter",
};

// ============================================
// MAIN SEED FUNCTION - Seeds all demo data
// ============================================
export const seedAll = mutation({
  args: { 
    secret: v.string(), 
    reset: v.optional(v.boolean()) 
  },
  handler: async (ctx, args) => {
    requireDevSecret(args.secret);
    const now = Date.now();

    // If reset, delete all demo data first
    if (args.reset) {
      await cleanupDemoDataInternal(ctx);
    }

    // 1. Create demo users
    const users = await seedUsersInternal(ctx, now);

    // 2. Seed clinics
    const clinicIds = await seedClinicsInternal(ctx);

    // 3. Seed cases (owned by demo volunteer)
    const caseIds = await seedCasesInternal(ctx, users.volunteer1, clinicIds[0], now);

    // 4. Seed donations (from demo users to cases)
    const donationIds = await seedDonationsInternal(ctx, [users.user1, users.user2], caseIds, now);

    // 5. Seed achievements for demo user
    const achievementCount = await seedAchievementsInternal(ctx, users.user1, now);

    // 6. Seed adoptions
    const adoptionIds = await seedAdoptionsInternal(ctx, users.volunteer1, now);

    // 7. Seed notifications for demo user
    const notificationCount = await seedNotificationsInternal(ctx, users.user1, caseIds, now);

    // 8. Seed user settings
    await seedUserSettingsInternal(ctx, users.user1);

    // 9. Seed campaigns
    const campaignIds = await seedCampaignsInternal(ctx, users.volunteer1, now);

    // 10. Seed partners
    const partnerIds = await seedPartnersInternal(ctx);

    // 11. Seed volunteers
    const volunteerIds = await seedVolunteersInternal(ctx, [users.volunteer1, users.volunteer2, users.volunteer3], now);

    // 12. Seed community posts
    const postIds = await seedCommunityPostsInternal(ctx, [users.user1, users.user2, users.volunteer1], now);

    return {
      success: true,
      counts: {
        users: Object.keys(users).length,
        clinics: clinicIds.length,
        cases: caseIds.length,
        donations: donationIds.length,
        achievements: achievementCount,
        adoptions: adoptionIds.length,
        notifications: notificationCount,
        campaigns: campaignIds.length,
        partners: partnerIds.length,
        volunteers: volunteerIds.length,
        communityPosts: postIds.length,
      },
    };
  },
});

// ============================================
// CLEANUP FUNCTION - Remove all demo data
// ============================================
export const cleanupDemoData = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    requireDevSecret(args.secret);
    return await cleanupDemoDataInternal(ctx);
  },
});

// ============================================
// INTERNAL HELPER FUNCTIONS
// ============================================

async function seedUsersInternal(ctx: any, now: number) {
  const usersData = [
    {
      clerkId: DEMO_CLERK_IDS.admin,
      name: "Pawtreon Admin",
      email: "admin@pawtreon.local",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
      role: "admin" as const,
      displayName: "Admin",
      bio: "Platform administrator. Here to help the community grow!",
      isPublic: true,
      userType: "individual" as const,
      city: "Sofia",
      onboardingCompleted: true,
    },
    {
      clerkId: DEMO_CLERK_IDS.volunteer1,
      name: "Maria Petrova",
      email: "maria@pawtreon.local",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      role: "volunteer" as const,
      displayName: "Maria 🐾",
      bio: "Animal rescuer & foster mom. 5+ years helping strays find homes. Based in Sofia, always ready to help! 💕",
      isPublic: true,
      userType: "volunteer" as const,
      volunteerCapabilities: ["transport", "fostering", "rescue", "events"],
      volunteerAvailability: "available" as const,
      volunteerCity: "Sofia",
      city: "Sofia",
      onboardingCompleted: true,
    },
    {
      clerkId: DEMO_CLERK_IDS.volunteer2,
      name: "Georgi Ivanov",
      email: "georgi@pawtreon.local",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      role: "volunteer" as const,
      displayName: "Georgi",
      bio: "Dog trainer & transport volunteer. Weekend warrior for animal rescue ops.",
      isPublic: true,
      userType: "volunteer" as const,
      volunteerCapabilities: ["transport", "rescue"],
      volunteerAvailability: "available" as const,
      volunteerCity: "Plovdiv",
      city: "Plovdiv",
      onboardingCompleted: true,
    },
    {
      clerkId: DEMO_CLERK_IDS.volunteer3,
      name: "Elena Dimitrova",
      email: "elena@pawtreon.local",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      role: "volunteer" as const,
      displayName: "Elena",
      bio: "Cat lover & TNR advocate. Managing a small colony in Varna. 🐱",
      isPublic: true,
      userType: "volunteer" as const,
      volunteerCapabilities: ["fostering", "social_media"],
      volunteerAvailability: "busy" as const,
      volunteerCity: "Varna",
      city: "Varna",
      onboardingCompleted: true,
    },
    {
      clerkId: DEMO_CLERK_IDS.user1,
      name: "Ivan Georgiev",
      email: "ivan@pawtreon.local",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
      role: "user" as const,
      displayName: "Ivan G.",
      bio: "Pet parent of 2 rescue dogs. Monthly donor supporting local shelters. 🐕",
      isPublic: true,
      userType: "pet_lover" as const,
      hasPets: true,
      petTypes: ["dog"],
      city: "Sofia",
      onboardingCompleted: true,
    },
    {
      clerkId: DEMO_CLERK_IDS.user2,
      name: "Peter Todorov",
      email: "peter@pawtreon.local",
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200",
      role: "user" as const,
      displayName: "Peter T.",
      bio: "Animal welfare supporter. Adopted my cat from a rescue!",
      isPublic: true,
      userType: "pet_lover" as const,
      hasPets: true,
      petTypes: ["cat"],
      city: "Burgas",
      onboardingCompleted: true,
    },
  ];

  const userIds: Record<string, Id<"users">> = {};

  for (const userData of usersData) {
    // Check if exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", userData.clerkId))
      .unique();

    if (existing) {
      const key = Object.entries(DEMO_CLERK_IDS).find(([_, v]) => v === userData.clerkId)?.[0];
      if (key) userIds[key] = existing._id;
      continue;
    }

    const id = await ctx.db.insert("users", {
      ...userData,
      createdAt: now,
    });

    const key = Object.entries(DEMO_CLERK_IDS).find(([_, v]) => v === userData.clerkId)?.[0];
    if (key) userIds[key] = id;
  }

  return userIds;
}

async function seedClinicsInternal(ctx: any) {
  const clinicsData = [
    // === FEATURED CLINICS (Sofia) ===
    {
      name: "Vet Clinic Sofia Central",
      city: "Sofia",
      address: "ul. Vitosha 45, Center",
      phone: "+359 2 987 6543",
      is24h: true,
      specializations: ["Emergency", "Surgery", "Orthopedics", "Cardiology"],
      verified: true,
      featured: true,
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
      rating: 4.9,
      reviewCount: 127,
      distance: "0.8 km",
    },
    {
      name: "PetMed 24/7 Emergency",
      city: "Sofia",
      address: "bul. Tsarigradsko Shose 115",
      phone: "+359 2 999 8888",
      is24h: true,
      specializations: ["Emergency", "Critical Care", "Surgery", "ICU"],
      verified: true,
      featured: true,
      image: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
      rating: 4.8,
      reviewCount: 89,
      distance: "1.2 km",
    },
    {
      name: "Happy Tails Veterinary",
      city: "Sofia",
      address: "ul. Rakovski 156",
      phone: "+359 2 456 7890",
      is24h: false,
      specializations: ["General Practice", "Vaccination", "Dental", "Grooming"],
      verified: true,
      featured: true,
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80",
      rating: 4.7,
      reviewCount: 203,
      distance: "2.1 km",
    },
    // === REGULAR CLINICS (Sofia) ===
    {
      name: "Dr. Petrov Veterinary",
      city: "Sofia",
      address: "ul. Oborishte 42",
      phone: "+359 2 456 7890",
      is24h: false,
      specializations: ["Surgery", "Dermatology", "Cardiology"],
      verified: true,
      featured: false,
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80",
      rating: 4.6,
      reviewCount: 78,
      distance: "3.4 km",
    },
    {
      name: "Exotic Pets Care Center",
      city: "Sofia",
      address: "ul. Positano 5, Lozenets",
      phone: "+359 2 876 5432",
      is24h: false,
      specializations: ["Exotic Pets", "Birds", "Reptiles", "Small Mammals"],
      verified: true,
      featured: false,
      image: "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=800&q=80",
      rating: 4.5,
      reviewCount: 45,
      distance: "4.2 km",
    },
    // === PLOVDIV ===
    {
      name: "Animal Hospital Plovdiv",
      city: "Plovdiv",
      address: "bul. Bulgaria 123",
      phone: "+359 32 654 321",
      is24h: true,
      specializations: ["Emergency", "Internal Medicine", "Oncology", "MRI"],
      verified: true,
      featured: true,
      image: "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80",
      rating: 4.9,
      reviewCount: 156,
      distance: "0.5 km",
    },
    {
      name: "VetPlus Plovdiv",
      city: "Plovdiv",
      address: "ul. Kapana 15",
      phone: "+359 32 987 654",
      is24h: false,
      specializations: ["General Practice", "Dental", "Vaccination"],
      verified: true,
      featured: false,
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
      rating: 4.4,
      reviewCount: 67,
      distance: "1.8 km",
    },
    // === VARNA ===
    {
      name: "Pet Clinic Varna",
      city: "Varna",
      address: "ul. Primorski 78",
      phone: "+359 52 123 456",
      is24h: false,
      specializations: ["General Practice", "Dentistry", "Vaccination"],
      verified: true,
      featured: false,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80",
      rating: 4.3,
      reviewCount: 52,
      distance: "1.5 km",
    },
    {
      name: "Black Sea Vet Center",
      city: "Varna",
      address: "bul. Slivnitsa 166",
      phone: "+359 52 888 999",
      is24h: true,
      specializations: ["Emergency", "Surgery", "Orthopedics"],
      verified: true,
      featured: true,
      image: "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&q=80",
      rating: 4.7,
      reviewCount: 98,
      distance: "2.3 km",
    },
    // === BURGAS ===
    {
      name: "Happy Paws Clinic",
      city: "Burgas",
      address: "ul. Aleksandrovska 34",
      phone: "+359 56 789 012",
      is24h: false,
      specializations: ["General Practice", "Vaccination", "Microchipping"],
      verified: false,
      featured: false,
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
      rating: 4.1,
      reviewCount: 34,
      distance: "0.9 km",
    },
    {
      name: "Sunny Beach Vet",
      city: "Burgas",
      address: "ul. Morska 45",
      phone: "+359 56 123 789",
      is24h: true,
      specializations: ["Emergency", "General Practice", "Surgery"],
      verified: true,
      featured: false,
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&q=80",
      rating: 4.5,
      reviewCount: 61,
      distance: "3.1 km",
    },
  ];

  const ids: Id<"clinics">[] = [];

  for (const clinic of clinicsData) {
    // Check if exists by name + city
    const existing = await ctx.db
      .query("clinics")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("name"), clinic.name),
          q.eq(q.field("city"), clinic.city)
        )
      )
      .first();

    if (existing) {
      ids.push(existing._id);
      continue;
    }

    const id = await ctx.db.insert("clinics", clinic);
    ids.push(id);
  }

  return ids;
}

async function seedCasesInternal(
  ctx: any,
  userId: Id<"users">,
  clinicId: Id<"clinics">,
  now: number
) {
  const casesData = [
    {
      type: "urgent" as const,
      category: "medical" as const,
      language: "en",
      title: "Luna - Emergency Surgery Needed",
      description: "Luna was found injured on the street and needs immediate surgery for a broken leg.",
      story: "Luna is a sweet 2-year-old dog found by a kind passerby near Borisova Gradina park. She was limping badly and clearly in pain. X-rays revealed a complex fracture that requires surgical intervention.\n\nThe surgery is estimated at 500 EUR including post-operative care. Luna is currently stable but needs help urgently.",
      location: { city: "Sofia", neighborhood: "Center" },
      fundraising: { goal: 500, current: 320, currency: "EUR" },
      status: "active" as const,
    },
    {
      type: "critical" as const,
      category: "surgery" as const,
      language: "en",
      title: "Max - Critical Care After Accident",
      description: "Max was hit by a car and needs emergency surgery and intensive care.",
      story: "Max is a brave 4-year-old mixed breed who was struck by a vehicle in Plovdiv's Kapana district. He sustained multiple injuries including internal bleeding.\n\nThe veterinary team has stabilized him but he needs surgery within 48 hours. Every contribution can help save Max's life.",
      location: { city: "Plovdiv", neighborhood: "Kapana" },
      fundraising: { goal: 800, current: 450, currency: "EUR" },
      status: "active" as const,
    },
    {
      type: "adopted" as const,
      category: "rescue" as const,
      language: "en",
      title: "Bella - Success Story!",
      description: "Bella has found her forever home after a full recovery.",
      story: "Bella's journey started when she was found abandoned in Burgas. Thanks to the generosity of donors, she received full medical treatment, was vaccinated, and neutered.\n\nAfter 3 months of rehabilitation, Bella was adopted by a loving family in January 2024. She now lives happily with her new family and two kids!",
      location: { city: "Burgas", neighborhood: "Sea Garden" },
      fundraising: { goal: 600, current: 600, currency: "EUR" },
      status: "closed" as const,
    },
    {
      type: "recovering" as const,
      category: "shelter" as const,
      language: "en",
      title: "Charlie - Recovering Well",
      description: "Charlie is recovering from surgery and needs continued care and food.",
      story: "Charlie underwent successful surgery last week and is now in recovery. He's responding well to treatment but still needs 2 more weeks of special care, medication, and quality food.\n\nYour support helps us provide Charlie with everything he needs to make a full recovery and find his forever home.",
      location: { city: "Varna", neighborhood: "Asparuhovo" },
      fundraising: { goal: 1000, current: 180, currency: "EUR" },
      status: "active" as const,
    },
  ];

  const ids: Id<"cases">[] = [];

  for (const caseData of casesData) {
    const id = await ctx.db.insert("cases", {
      userId,
      type: caseData.type,
      category: caseData.category,
      language: caseData.language,
      title: caseData.title,
      description: caseData.description,
      story: caseData.story,
      images: [],
      location: {
        city: caseData.location.city,
        neighborhood: caseData.location.neighborhood,
      },
      clinicId,
      foundAt: now - 7 * 24 * 60 * 60 * 1000,
      fundraising: caseData.fundraising,
      status: caseData.status,
      updates: [
        {
          date: now - 5 * 24 * 60 * 60 * 1000,
          text: "Initial assessment completed. Treatment plan established.",
        },
        {
          date: now - 2 * 24 * 60 * 60 * 1000,
          text: "Progress update: Patient is responding well to treatment.",
        },
      ],
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function seedDonationsInternal(
  ctx: any,
  userIds: Id<"users">[],
  caseIds: Id<"cases">[],
  now: number
) {
  const donationsData = [
    { amount: 50, currency: "EUR", daysAgo: 2, message: "Get well soon!" },
    { amount: 30, currency: "EUR", daysAgo: 7, message: "Hope this helps" },
    { amount: 25, currency: "EUR", daysAgo: 14, message: undefined },
    { amount: 100, currency: "EUR", daysAgo: 30, message: "Supporting the cause" },
    { amount: 15, currency: "EUR", daysAgo: 3, message: undefined },
    { amount: 75, currency: "EUR", daysAgo: 10, message: "For Luna's surgery" },
    { amount: 20, currency: "EUR", daysAgo: 5, message: undefined },
    { amount: 40, currency: "EUR", daysAgo: 1, message: "Keep up the great work!" },
  ];

  const ids: Id<"donations">[] = [];

  for (let i = 0; i < donationsData.length; i++) {
    const donation = donationsData[i];
    const userId = userIds[i % userIds.length];
    const caseId = caseIds[i % caseIds.length];

    const id = await ctx.db.insert("donations", {
      userId,
      caseId,
      amount: donation.amount,
      currency: donation.currency,
      status: "completed",
      message: donation.message,
      anonymous: i % 3 === 0,
      createdAt: now - donation.daysAgo * 24 * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function seedAchievementsInternal(
  ctx: any,
  userId: Id<"users">,
  now: number
) {
  const achievementTypes = [
    "first_donation",
    "helped_10",
    "big_heart",
    "early_supporter",
  ] as const;

  for (const type of achievementTypes) {
    // Check if exists
    const existing = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .filter((q: any) => q.eq(q.field("type"), type))
      .first();

    if (!existing) {
      await ctx.db.insert("achievements", {
        userId,
        type,
        unlockedAt: now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
      });
    }
  }

  return achievementTypes.length;
}

async function seedAdoptionsInternal(
  ctx: any,
  userId: Id<"users">,
  now: number
) {
  const adoptionsData = [
    {
      animalType: "dog" as const,
      name: "Rocky",
      age: "2 years",
      description: "Rocky is an energetic and friendly dog who loves to play fetch. He's great with kids and other dogs. Fully vaccinated and neutered.",
      vaccinated: true,
      neutered: true,
      status: "available" as const,
      location: { city: "Sofia", neighborhood: "Mladost" },
    },
    {
      animalType: "cat" as const,
      name: "Whiskers",
      age: "1 year",
      description: "Whiskers is a calm and affectionate cat who enjoys lounging in sunny spots. Perfect for apartment living.",
      vaccinated: true,
      neutered: true,
      status: "available" as const,
      location: { city: "Plovdiv", neighborhood: "Center" },
    },
    {
      animalType: "dog" as const,
      name: "Buddy",
      age: "4 years",
      description: "Buddy is a gentle giant who loves cuddles. He's well-trained and walks great on a leash.",
      vaccinated: true,
      neutered: false,
      status: "pending" as const,
      location: { city: "Varna", neighborhood: "Levski" },
    },
    {
      animalType: "cat" as const,
      name: "Mimi",
      age: "6 months",
      description: "Mimi is a playful kitten full of energy! She loves toys and will keep you entertained for hours.",
      vaccinated: true,
      neutered: false,
      status: "available" as const,
      location: { city: "Sofia", neighborhood: "Lozenets" },
    },
  ];

  const ids: Id<"adoptions">[] = [];

  for (const adoption of adoptionsData) {
    const id = await ctx.db.insert("adoptions", {
      userId,
      animalType: adoption.animalType,
      name: adoption.name,
      age: adoption.age,
      description: adoption.description,
      images: [],
      location: adoption.location,
      vaccinated: adoption.vaccinated,
      neutered: adoption.neutered,
      status: adoption.status,
      createdAt: now - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function seedNotificationsInternal(
  ctx: any,
  userId: Id<"users">,
  caseIds: Id<"cases">[],
  now: number
) {
  const notificationsData = [
    {
      type: "donation_received" as const,
      title: "Thank you for your donation!",
      message: "Your 50 EUR donation to Luna's case has been received.",
      hoursAgo: 2,
      read: false,
    },
    {
      type: "case_update" as const,
      title: "Case Update: Luna",
      message: "Luna is recovering well after her surgery!",
      hoursAgo: 24,
      read: true,
    },
    {
      type: "achievement_unlocked" as const,
      title: "Achievement Unlocked!",
      message: "You've earned the 'First Steps' badge for your first donation.",
      hoursAgo: 48,
      read: true,
    },
    {
      type: "system" as const,
      title: "Welcome to Pawtreon!",
      message: "Thank you for joining our community. Together we can help more animals.",
      hoursAgo: 168,
      read: true,
    },
  ];

  let count = 0;
  for (const notification of notificationsData) {
    await ctx.db.insert("notifications", {
      userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      caseId: notification.type === "case_update" ? caseIds[0] : undefined,
      read: notification.read,
      createdAt: now - notification.hoursAgo * 60 * 60 * 1000,
    });
    count++;
  }

  return count;
}

async function seedUserSettingsInternal(ctx: any, userId: Id<"users">) {
  // Check if exists
  const existing = await ctx.db
    .query("userSettings")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .unique();

  if (!existing) {
    await ctx.db.insert("userSettings", {
      userId,
      emailNotifications: true,
      pushNotifications: true,
      donationReminders: true,
      marketingEmails: false,
      language: "en",
      currency: "EUR",
    });
  }
}

async function seedCampaignsInternal(
  ctx: any,
  userId: Id<"users">,
  now: number
) {
  const campaignsData = [
    {
      title: "Winter Shelter Fund",
      description: "Help us provide warm shelters for stray animals during the harsh Bulgarian winter. Every winter, hundreds of stray animals suffer from the cold.",
      image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
      goal: 5000,
      current: 3200,
      unit: "EUR",
      endDate: new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "active" as const,
    },
    {
      title: "Mass Vaccination Drive",
      description: "Support our initiative to vaccinate 500 stray dogs and cats against rabies and common diseases. Vaccination is crucial for both animal welfare and public health.",
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
      goal: 3000,
      current: 1800,
      unit: "EUR",
      endDate: new Date(now + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "active" as const,
    },
    {
      title: "Spay & Neuter Program",
      description: "Help reduce overpopulation by funding sterilization surgeries for stray animals. Sterilization is the most humane way to control the stray population.",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      goal: 4000,
      current: 2100,
      unit: "surgeries",
      endDate: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "active" as const,
    },
    {
      title: "Emergency Medical Fund",
      description: "A reserve fund for urgent medical cases that need immediate intervention. Some cases can't wait for individual fundraising.",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
      goal: 10000,
      current: 6500,
      unit: "EUR",
      endDate: new Date(now + 270 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "active" as const,
    },
    {
      title: "Adoption Center Renovation",
      description: "Help us renovate our adoption center to provide better conditions for animals awaiting homes. Better facilities mean happier animals!",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
      goal: 8000,
      current: 8000,
      unit: "EUR",
      endDate: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "completed" as const,
    },
    {
      title: "Food Bank for Strays",
      description: "Provide regular meals to feeding stations across the city. Our network of volunteers maintains feeding stations that provide daily meals.",
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800",
      goal: 2000,
      current: 850,
      unit: "meals",
      endDate: new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "active" as const,
    },
  ];

  const ids: Id<"campaigns">[] = [];

  for (const campaign of campaignsData) {
    const id = await ctx.db.insert("campaigns", {
      title: campaign.title,
      description: campaign.description,
      image: campaign.image,
      goal: campaign.goal,
      current: campaign.current,
      unit: campaign.unit,
      endDate: campaign.endDate,
      status: campaign.status,
      createdAt: now - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function seedPartnersInternal(ctx: any) {
  const now = Date.now();
  const partnersData = [
    {
      name: "Animal Rescue Sofia",
      logo: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200",
      type: "sponsor" as const,
      contribution: "Monthly shelter sponsorship",
      description: "Leading animal shelter in Sofia with over 20 years of experience rescuing and rehoming stray animals.",
      website: "https://animalrescue-sofia.bg",
      since: "2019",
      animalsHelped: 5420,
      totalContributed: 45000,
      featured: true,
    },
    {
      name: "VetCare Network",
      logo: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=200",
      type: "veterinary" as const,
      contribution: "Discounted veterinary services",
      description: "Network of veterinary clinics providing discounted services for rescued animals.",
      website: "https://vetcare.bg",
      since: "2020",
      animalsHelped: 12000,
      totalContributed: 80000,
      featured: true,
    },
    {
      name: "PetFood Bulgaria",
      logo: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200",
      type: "food-brand" as const,
      contribution: "Monthly food donations",
      description: "Pet food company donating supplies to shelters and rescue organizations nationwide.",
      website: "https://petfood.bg",
      since: "2021",
      animalsHelped: 8000,
      totalContributed: 35000,
      featured: true,
    },
    {
      name: "Happy Paws Shop",
      logo: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200",
      type: "pet-shop" as const,
      contribution: "Supplies and equipment",
      description: "Pet shop chain supporting rescue efforts with supplies, equipment, and adoption events.",
      website: "https://happypaws.bg",
      since: "2022",
      animalsHelped: 2300,
      totalContributed: 15000,
      featured: false,
    },
    {
      name: "Plovdiv Paws Foundation",
      logo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200",
      type: "sponsor" as const,
      contribution: "Adoption center support",
      description: "Non-profit organization dedicated to improving the lives of stray animals in Plovdiv region.",
      website: "https://plovdivpaws.org",
      since: "2018",
      animalsHelped: 1850,
      totalContributed: 28000,
      featured: false,
    },
    {
      name: "Black Sea Animal Welfare",
      logo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200",
      type: "sponsor" as const,
      contribution: "Coastal region programs",
      description: "Coastal region shelter caring for animals in Varna and Burgas areas.",
      website: "https://bsaw.bg",
      since: "2020",
      animalsHelped: 2300,
      totalContributed: 22000,
      featured: true,
    },
    {
      name: "Mountain Rescue Dogs",
      logo: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=200",
      type: "sponsor" as const,
      contribution: "Mountain rescue operations",
      description: "Specializing in rescuing abandoned dogs in mountain regions of Bulgaria.",
      website: "https://mountainrescuedogs.bg",
      since: "2023",
      animalsHelped: 380,
      totalContributed: 8000,
      featured: false,
    },
    {
      name: "Happy Tails Transport",
      logo: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200",
      type: "sponsor" as const,
      contribution: "Transport and logistics",
      description: "Volunteer transport network helping animals reach their forever homes across Europe.",
      website: "https://happytails-transport.eu",
      since: "2021",
      animalsHelped: 1200,
      totalContributed: 18000,
      featured: true,
    },
  ];

  const ids: Id<"partners">[] = [];

  for (const partner of partnersData) {
    const id = await ctx.db.insert("partners", {
      name: partner.name,
      logo: partner.logo,
      type: partner.type,
      contribution: partner.contribution,
      description: partner.description,
      website: partner.website,
      since: partner.since,
      animalsHelped: partner.animalsHelped,
      totalContributed: partner.totalContributed,
      featured: partner.featured,
      createdAt: now - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function seedVolunteersInternal(
  ctx: any,
  userIds: Id<"users">[],
  now: number
) {
  const volunteersData = [
    {
      bio: "Passionate animal lover with 5 years of experience in animal rescue. I specialize in rehabilitating traumatized dogs and finding them loving homes.",
      location: "Sofia, Bulgaria",
      rating: 4.9,
      memberSince: "2019",
      isTopVolunteer: true,
      badges: ["top_volunteer", "rescue_hero", "mentor"],
      stats: {
        animalsHelped: 85,
        adoptions: 32,
        campaigns: 12,
        donationsReceived: 4500,
        hoursVolunteered: 520,
      },
    },
    {
      bio: "Veterinary student volunteering on weekends. I help with medical checkups and post-surgery care.",
      location: "Plovdiv, Bulgaria",
      rating: 4.7,
      memberSince: "2022",
      isTopVolunteer: false,
      badges: ["medical_helper", "rising_star"],
      stats: {
        animalsHelped: 42,
        adoptions: 15,
        campaigns: 5,
        donationsReceived: 1200,
        hoursVolunteered: 180,
      },
    },
    {
      bio: "Retired teacher who found a new purpose in helping stray cats. I manage several feeding stations in Sofia.",
      location: "Sofia, Bulgaria",
      rating: 4.8,
      memberSince: "2020",
      isTopVolunteer: true,
      badges: ["community_hero", "cat_whisperer", "fundraiser"],
      stats: {
        animalsHelped: 200,
        adoptions: 45,
        campaigns: 8,
        donationsReceived: 3200,
        hoursVolunteered: 340,
      },
    },
  ];

  const ids: Id<"volunteers">[] = [];

  for (let i = 0; i < volunteersData.length; i++) {
    const volunteer = volunteersData[i];
    const userId = userIds[i];

    const id = await ctx.db.insert("volunteers", {
      userId,
      bio: volunteer.bio,
      location: volunteer.location,
      rating: volunteer.rating,
      memberSince: volunteer.memberSince,
      isTopVolunteer: volunteer.isTopVolunteer,
      badges: volunteer.badges,
      stats: volunteer.stats,
      createdAt: now - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function seedCommunityPostsInternal(
  ctx: any,
  userIds: Id<"users">[],
  now: number
) {
  const postsData = [
    {
      content: "Luna found her forever home! 🏠 After 3 months of rehabilitation, she was adopted by a wonderful family in Sofia! She now has a huge backyard to play in and two kids who adore her. Thank you to everyone who donated to her surgery fund!",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
      isPinned: false,
      isRules: false,
      likes: 47,
      commentsCount: 12,
      hoursAgo: 6,
    },
    {
      content: "Volunteer of the Month: Maria Petrova! 🌟 Maria has been volunteering with us for over a year and has helped rescue and rehabilitate more than 50 animals. Her dedication to our cause is truly inspiring. Thank you, Maria! 💜",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
      isPinned: true,
      isRules: false,
      likes: 82,
      commentsCount: 25,
      hoursAgo: 24,
    },
    {
      content: "📢 Upcoming Adoption Event - This Saturday! Join us at South Park, Sofia for our monthly adoption event! We'll have 15 dogs and 10 cats looking for loving homes. Free health checks for all adoptees. See you there!",
      image: undefined,
      isPinned: true,
      isRules: false,
      likes: 35,
      commentsCount: 8,
      hoursAgo: 48,
    },
    {
      content: "Tips for first-time foster parents? 🤔 I'm about to foster my first rescue dog and would love some advice from experienced foster parents. What should I prepare? Any tips for helping a scared dog adjust to a new environment?",
      image: undefined,
      isPinned: false,
      isRules: false,
      likes: 23,
      commentsCount: 31,
      hoursAgo: 72,
    },
    {
      content: "From street to sofa - Max's journey 🐕 Max was found starving on the streets of Plovdiv last year. Today, he celebrated his first birthday in his new home with a dog-friendly cake! His transformation is incredible. Never give up on any animal!",
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
      isPinned: false,
      isRules: false,
      likes: 156,
      commentsCount: 42,
      hoursAgo: 120,
    },
    {
      content: "🏠 Community Rules: 1) Be kind and supportive. 2) No spam or self-promotion. 3) Share only verified information. 4) Respect privacy of adopters. 5) Report any animal abuse immediately. Thank you for making this a safe space for all! 💜",
      image: undefined,
      isPinned: true,
      isRules: true,
      likes: 0,
      commentsCount: 0,
      hoursAgo: 1000,
    },
  ];

  const ids: Id<"communityPosts">[] = [];

  for (let i = 0; i < postsData.length; i++) {
    const post = postsData[i];
    const userId = userIds[i % userIds.length];

    const id = await ctx.db.insert("communityPosts", {
      userId,
      content: post.content,
      image: post.image,
      isPinned: post.isPinned,
      isRules: post.isRules,
      likes: post.likes,
      commentsCount: post.commentsCount,
      createdAt: now - post.hoursAgo * 60 * 60 * 1000,
    });
    ids.push(id);
  }

  return ids;
}

async function cleanupDemoDataInternal(ctx: any) {
  const demoClerkIds = Object.values(DEMO_CLERK_IDS);

  // Find all demo users
  const demoUsers = await Promise.all(
    demoClerkIds.map((clerkId) =>
      ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
        .unique()
    )
  );

  const demoUserIds = demoUsers.filter(Boolean).map((u: any) => u!._id);
  let deletedCount = 0;

  // Delete all data owned by demo users
  for (const userId of demoUserIds) {
    // Cases
    const cases = await ctx.db
      .query("cases")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const c of cases) {
      await ctx.db.delete(c._id);
      deletedCount++;
    }

    // Donations
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const d of donations) {
      await ctx.db.delete(d._id);
      deletedCount++;
    }

    // Notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const n of notifications) {
      await ctx.db.delete(n._id);
      deletedCount++;
    }

    // Achievements
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const a of achievements) {
      await ctx.db.delete(a._id);
      deletedCount++;
    }

    // Adoptions
    const adoptions = await ctx.db
      .query("adoptions")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const a of adoptions) {
      await ctx.db.delete(a._id);
      deletedCount++;
    }

    // Volunteers
    const volunteers = await ctx.db
      .query("volunteers")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const v of volunteers) {
      await ctx.db.delete(v._id);
      deletedCount++;
    }

    // Community posts
    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    for (const p of posts) {
      await ctx.db.delete(p._id);
      deletedCount++;
    }

    // User settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .unique();
    if (settings) {
      await ctx.db.delete(settings._id);
      deletedCount++;
    }

    // Delete user
    await ctx.db.delete(userId);
    deletedCount++;
  }

  // Delete campaigns (not user-specific)
  const campaigns = await ctx.db.query("campaigns").collect();
  for (const c of campaigns) {
    await ctx.db.delete(c._id);
    deletedCount++;
  }

  // Delete partners (not user-specific)
  const partners = await ctx.db.query("partners").collect();
  for (const p of partners) {
    await ctx.db.delete(p._id);
    deletedCount++;
  }

  return { deletedUsers: demoUserIds.length, deletedRecords: deletedCount };
}

// Legacy function for backwards compatibility
export const seedDemoData = seedAll;

// ============================================
// MIGRATION: Mark existing users as onboarded
// ============================================
export const migrateExistingUsersOnboarding = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    requireDevSecret(args.secret);
    
    // Get all users who haven't completed onboarding
    const users = await ctx.db.query("users").collect();
    let migratedCount = 0;
    
    for (const user of users) {
      // Skip if already has onboarding status
      if (user.onboardingCompleted !== undefined) continue;
      
      // Mark as onboarded (existing users shouldn't see onboarding)
      await ctx.db.patch(user._id, {
        onboardingCompleted: true,
        onboardingCompletedAt: Date.now(),
        userType: "individual", // Default to individual
        productTourCompleted: true, // Skip tour for existing users
        productTourCompletedAt: Date.now(),
      });
      
      migratedCount++;
    }
    
    return { 
      success: true, 
      migratedCount,
      message: `Migrated ${migratedCount} existing users to have onboarding status` 
    };
  },
});

// ============================================
// SEED: Bulgarian veterinary clinics
// ============================================
export const seedBulgarianClinics = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    requireDevSecret(args.secret);
    
    const bulgarianClinics = [
      {
        name: "Ветеринарна клиника Софиявет",
        city: "София",
        address: "ул. Витоша 45",
        phone: "+359 2 123 4567",
        is24h: true,
        specializations: ["хирургия", "вътрешни болести", "дерматология"],
        verified: false,
      },
      {
        name: "Animal Hospital Plovdiv",
        city: "Пловдив",
        address: "бул. Марица 12",
        phone: "+359 32 987 6543",
        is24h: false,
        specializations: ["хирургия", "ортопедия"],
        verified: false,
      },
      {
        name: "Варна Вет Клиник",
        city: "Варна",
        address: "ул. Приморска 78",
        phone: "+359 52 456 7890",
        is24h: true,
        specializations: ["спешна помощ", "кардиология"],
        verified: false,
      },
      {
        name: "Зоовет Бургас",
        city: "Бургас",
        address: "ул. Александровска 25",
        phone: "+359 56 123 4567",
        is24h: false,
        specializations: ["обща практика", "ваксинации"],
        verified: false,
      },
      {
        name: "Ветеринарен център Русе",
        city: "Русе",
        address: "бул. Липник 55",
        phone: "+359 82 876 5432",
        is24h: true,
        specializations: ["хирургия", "неврология", "спешна помощ"],
        verified: false,
      },
      {
        name: "Dr. Петров Ветеринарна клиника",
        city: "София",
        address: "ул. Раковски 156",
        phone: "+359 2 456 7890",
        is24h: false,
        specializations: ["хирургия", "дерматология", "кардиология"],
        verified: false,
      },
      {
        name: "Happy Paws Стара Загора",
        city: "Стара Загора",
        address: "ул. Христо Ботев 42",
        phone: "+359 42 654 321",
        is24h: false,
        specializations: ["обща практика", "зъболечение"],
        verified: false,
      },
      {
        name: "24/7 Спешна ветеринарна помощ",
        city: "София",
        address: "бул. Цариградско шосе 115",
        phone: "+359 2 999 8888",
        is24h: true,
        specializations: ["спешна помощ", "интензивни грижи", "хирургия"],
        verified: false,
      },
      {
        name: "Ветлайф Пловдив",
        city: "Пловдив",
        address: "ул. Капитан Райчо 88",
        phone: "+359 32 111 2222",
        is24h: true,
        specializations: ["онкология", "УЗИ диагностика", "хирургия"],
        verified: false,
      },
      {
        name: "Домашни любимци клиника",
        city: "Варна",
        address: "бул. Княз Борис I 101",
        phone: "+359 52 333 4444",
        is24h: false,
        specializations: ["обща практика", "офталмология"],
        verified: false,
      },
    ];
    
    let insertedCount = 0;
    
    for (const clinic of bulgarianClinics) {
      // Check if already exists
      const existing = await ctx.db
        .query("clinics")
        .filter((q: any) => 
          q.and(
            q.eq(q.field("name"), clinic.name),
            q.eq(q.field("city"), clinic.city)
          )
        )
        .first();
      
      if (existing) continue;
      
      await ctx.db.insert("clinics", clinic);
      insertedCount++;
    }
    
    return {
      success: true,
      insertedCount,
      message: `Inserted ${insertedCount} Bulgarian clinics`,
    };
  },
});
