export type AnimalStatus = 'critical' | 'urgent' | 'recovering' | 'adopted';

export type AnimalSpecies = 'dog' | 'cat' | 'bird' | 'other';

export type CaseVerificationStatus = 'unverified' | 'community' | 'clinic';

export type CaseFundingStatus = 'active' | 'funded' | 'closed';

export type CaseLifecycleStage =
  | 'active_treatment'
  | 'seeking_adoption'
  | 'closed_success'
  | 'closed_transferred'
  | 'closed_other';

export type CaseUpdateType = 'medical' | 'milestone' | 'update' | 'success';

export type CaseUpdateEvidenceType = 'bill' | 'lab_result' | 'clinic_photo' | 'other';

export type CaseUpdateAuthorRole = 'owner' | 'clinic' | 'moderator';

export interface AnimalCase {
  id: string;
  title: string;
  description: string;
  story: string;
  images: string[];
  status: AnimalStatus;
  fundingStatus?: CaseFundingStatus;
  lifecycleStage?: CaseLifecycleStage;
  lifecycleUpdatedAt?: string | null;
  closedAt?: string | null;
  closedReason?: 'success' | 'transferred' | 'other' | null;
  closedNotes?: string | null;
  verificationStatus?: CaseVerificationStatus;
  riskLevel?: 'low' | 'medium' | 'high';
  riskFlags?: string[];
  isDonationAllowed?: boolean;
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
  ownerId?: string;
  canManageCase?: boolean;
  clinicId?: string | null;
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
  type: CaseUpdateType;
  evidenceType?: CaseUpdateEvidenceType | null;
  clinicId?: string | null;
  clinicName?: string | null;
  authorRole?: CaseUpdateAuthorRole;
  images?: string[];
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

export type DirectorySegment = 'partners' | 'volunteers' | 'stores_services';

export interface StoreServiceCardViewModel {
  id: string;
  name: string;
  type: 'pet_store' | 'grooming' | 'training' | 'shelter' | 'pet_sitting' | 'pet_hotel' | 'pharmacy' | 'other';
  city: string;
  address: string;
  phone: string;
  website?: string;
  description?: string;
  services: string[];
  verified: boolean;
  isClaimed: boolean;
  ownerId?: string;
  rating?: number;
  reviewCount?: number;
  is24h?: boolean;
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

export type ForumBoard = 'rescue' | 'community';

export type ForumCategory =
  | 'urgent_help'
  | 'case_update'
  | 'adoption'
  | 'advice'
  | 'general'
  | 'announcements';

export type ForumSort = 'local_recent' | 'newest' | 'top';

export type ForumAuthorBadge = 'mod' | 'clinic' | 'partner' | 'volunteer' | null;

export interface ForumAuthor {
  id: string | null;
  name: string;
  avatar: string | null;
  city: string | null;
  badge: ForumAuthorBadge;
}

export interface ForumThread {
  id: string;
  board: ForumBoard;
  category: ForumCategory;
  title: string;
  content: string;
  preview: string;
  image: string | null;
  cityTag: string | null;
  caseId: string | null;
  isPinned: boolean;
  isLocked: boolean;
  isDeleted: boolean;
  reactionCount: number;
  replyCount: number;
  createdAt: number;
  lastActivityAt: number;
  timeAgo: string;
  viewerReacted: boolean;
  author: ForumAuthor;
}

export interface ForumComment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  isDeleted: boolean;
  reactionCount: number;
  replyCount: number;
  createdAt: number;
  editedAt: number | null;
  timeAgo: string;
  viewerReacted: boolean;
  author: ForumAuthor;
  replies: ForumComment[];
}

export interface ForumReactionSummary {
  targetType: 'post' | 'comment';
  targetId: string;
  reactionType: 'upvote';
  reacted: boolean;
  count: number;
}

export interface ForumReportPayload {
  targetType: 'post' | 'comment';
  targetId: string;
  reason: 'spam' | 'harassment' | 'misinformation' | 'scam' | 'animal_welfare' | 'other';
  details?: string;
}
