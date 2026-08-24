export interface MLPricingInput {
  serviceId: string;
  basePrice: number;
  city?: string;
  isUrgent?: boolean;
  quantity?: number;
  addonCount?: number;
  activeCategoryDemand?: number; // 0 to 1 scale
  hourOfDay?: number;
}

export interface MLPricingOutput {
  serviceTitle?: string;
  basePrice: number;
  cityMultiplier: number;
  peakHourMultiplier: number;
  demandSurgeMultiplier: number;
  urgentSurcharge: number;
  subtotal: number;
  gstTax: number;
  totalEstimated: number;
  confidenceScore: number;
  modelName: string;
  featureBreakdown: {
    baseComponent: number;
    surgeComponent: number;
    urgencyComponent: number;
    taxComponent: number;
  };
}

export interface MLPartnerMatchInput {
  categoryId: string;
  customerLat?: number;
  customerLng?: number;
  isUrgent?: boolean;
  minRating?: number;
}

export interface PartnerCandidate {
  id: string;
  name: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  tier: 'STANDARD' | 'GOLD' | 'DIAMOND';
  availability: 'available' | 'busy' | 'offline';
  completedJobs: number;
  lat?: number;
  lng?: number;
  badge?: string;
  categoryId: string;
}

export interface MLPartnerMatchOutput {
  matchedPartner: PartnerCandidate | null;
  rankedPartners: Array<{
    partner: PartnerCandidate;
    score: number;
    estimatedEtaMinutes: number;
    distanceKm: number;
    matchReason: string;
  }>;
  matchScore: number;
  etaMinutes: number;
  matchReason: string;
  algorithmVersion: string;
}

export interface AnomalyCheckInput {
  userId: string;
  userBookingsLast24h: number;
  userCancelledLast24h: number;
  paymentMethod: 'CASH_AFTER_SERVICE' | 'UPI_ONLINE' | 'WALLET';
  bookingValue: number;
  userAccountAgeDays: number;
  isNewDevice?: boolean;
}

export interface AnomalyDetectionOutput {
  riskScore: number; // 0.0 to 1.0
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isAnomaly: boolean;
  reasons: string[];
  recommendedAction: 'ALLOW' | 'REQUIRE_OTP' | 'REQUIRE_PREPAYMENT' | 'FLAG_FOR_REVIEW' | 'BLOCK';
  timestamp: string;
}

export interface SentimentAnalysisOutput {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore: number; // -1.0 to 1.0
  keyThemes: string[];
  requiresCustomerFollowup: boolean;
}
