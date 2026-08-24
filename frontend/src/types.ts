export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
export type ProviderTier = 'JUNIOR' | 'INTERMEDIATE' | 'ADVANCED';

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  line1: string;
  locality: string;
  city: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  city: string;
  addresses: Address[];
  walletBalance: number;
  loyaltyPoints: number;
  createdAt: string;
  updatedAt?: string;
  isBlocked?: boolean;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  avatar: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  categoryId: string;
  city: string;
  availability: 'available' | 'busy' | 'offline';
  rating: number;
  totalJobs: number;
  hourlyRate: number;
  verified: boolean;
  badge?: string;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  providerProfile?: ProviderProfile | null;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  providerProfile?: ProviderProfile;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  description: string;
  popular?: boolean;
  serviceCount: number;
}

export interface ServiceItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  durationMinutes: number;
  description: string;
  includes: string[];
  excludes: string[];
  image: string;
  isUrgentAvailable: boolean;
  urgentFee: number;
  tags: string[];
}

export interface Partner {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  categoryIds: string[];
  city: string;
  rating: number;
  totalJobs: number;
  experienceYears: number;
  verified: boolean;
  currentLat?: number;
  currentLng?: number;
  skills: string[];
  status: 'available' | 'busy' | 'offline';
  badge?: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PARTNER_ASSIGNED'
  | 'PARTNER_EN_ROUTE'
  | 'WORK_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: {
    line1: string;
    locality: string;
    city: string;
    pincode: string;
    landmark?: string;
  };
  service: ServiceItem;
  quantity: number;
  isUrgent: boolean;
  scheduledDate: string; // YYYY-MM-DD or 'INSTANT_SOS'
  scheduledTimeSlot: string; // e.g. '09:00 AM - 10:00 AM' or '30 Mins Express'
  status: BookingStatus;
  partner?: Partner;
  providerTier?: 'JUNIOR' | 'INTERMEDIATE' | 'ADVANCED';
  providerTierTitle?: string;
  subtotal: number;
  urgentFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'CARD' | 'CASH' | 'WALLET';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
  notes?: string;
  aiDiagnosis?: AIDiagnosis;
  etaMinutes?: number;
  otpCode?: string;
  voiceFeedbackText?: string;
  voiceFeedbackSentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  voiceFeedbackRating?: number;
  voiceFeedbackSummary?: string;
  voiceFeedbackAt?: string;
  workPhotos?: string[];
  userReviewText?: string;
  userStarRating?: number;
  oneHourAlertSent?: boolean;
  oneHourAlertSentAt?: string;
  destinationCoords?: { lat: number; lng: number };
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  providerId: string;
  rating: number;
  comment: string;
  workPhotos?: string[];
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  paymentMethod: 'UPI' | 'CARD' | 'CASH' | 'WALLET';
  transactionId: string;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  message: string;
  category: string;
  rating: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: 'BOOKING' | 'OFFER' | 'SYSTEM' | 'SECURITY' | 'REMINDER_1HR';
  bookingId?: string;
  directionsUrl?: string;
  actionUrl?: string;
  is1HourAlert?: boolean;
  scheduledTime?: string;
  destinationAddress?: string;
}

export interface LocationItem {
  id: string;
  city: string;
  state: string;
  locality: string;
  pincode: string;
}

export interface ChatHistoryItem {
  id: string;
  userId: string;
  sender: 'user' | 'assistant';
  message: string;
  timestamp: string;
}

export interface VoiceHistoryItem {
  id: string;
  userId: string;
  audioUrl?: string;
  transcript: string;
  language?: string;
  intentDetected?: string;
  aiResponseText?: string;
  audioDurationSec?: number;
  aiResponse?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface ProviderScore {
  id: string;
  providerId: string;
  providerName?: string;
  ratingScore: number;
  speedScore: number; // e.g. 98%
  completionRate: number; // e.g. 99%
  overallScore: number; // e.g. 4.9
  qualityScore?: number;
  behaviorScore?: number;
  punctualityScore?: number;
  priceSatisfactionScore?: number;
  overallAIScore?: number;
  voiceFeedbackCount?: number;
  positiveSentimentPercentage?: number;
  rank?: number;
  rankPosition?: string;
  recentSentiments?: Array<{ text: string; sentiment: string; rating: number; date?: string }>;
  aiSuggestions?: string[];
  updatedAt: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  recommendedServiceId: string;
  serviceTitle: string;
  score: number;
  reason: string;
  createdAt: string;
}

export interface AIDiagnosis {
  issueSummary: string;
  rootCause: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedServiceId?: string;
  recommendedServiceName: string;
  estimatedLaborCost: number;
  estimatedPartsCost: number;
  estimatedTotalCost: number;
  estimatedDurationMinutes: number;
  safetyPrecautions: string[];
  recommendedParts: string[];
  explanation: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  walletBalance: number;
  loyaltyPoints: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  localities: string[];
  popular: boolean;
  lat?: number;
  lng?: number;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  description: string;
}

export interface ReferralRecord {
  id: string;
  referrerUserId: string;
  referredName: string;
  referredPhone: string;
  referredEmail?: string;
  serviceName?: string;
  bookingId?: string;
  rewardAmount: number; // e.g. 250
  status: 'PENDING_FIRST_SERVICE' | 'REWARD_CREDITED' | 'EXPIRED';
  createdAt: string;
  completedAt?: string;
}

export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  walletBalance: number;
  rewardPerReferral: number;
  friendDiscount: number;
  referrals: ReferralRecord[];
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

