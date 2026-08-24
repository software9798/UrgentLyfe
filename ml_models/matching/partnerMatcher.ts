import { MLPartnerMatchInput, MLPartnerMatchOutput, PartnerCandidate } from '../types';

/**
 * Intelligent Partner Matcher & Ranking Algorithm (v3.1)
 * Multi-objective score = 0.40 * (Proximity Score) + 0.35 * (Bayesian Rating) + 0.15 * (Experience) + 0.10 * (Tier Bonus)
 */
export class PartnerMatcher {
  private static readonly VERSION = 'v3.1-GeodesicRanking';

  private static calculateDistanceKm(lat1?: number, lon1?: number, lat2?: number, lon2?: number): number {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return 2.5; // Default average neighborhood distance
    }
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  public static matchAndRank(
    candidates: PartnerCandidate[],
    input: MLPartnerMatchInput
  ): MLPartnerMatchOutput {
    const {
      categoryId,
      customerLat = 12.9716, // Default Bangalore Center
      customerLng = 77.5946,
      isUrgent = false,
    } = input;

    // Filter by matching category
    const categoryEligible = candidates.filter((c) => c.categoryId === categoryId);
    const pool = categoryEligible.length > 0 ? categoryEligible : candidates;

    const ranked = pool.map((partner) => {
      const distance = this.calculateDistanceKm(customerLat, customerLng, partner.lat, partner.lng);
      
      // Proximity score (closer is higher, normalized to 10km max)
      const proximityScore = Math.max(0, (10 - distance) / 10);

      // Bayesian Adjusted Rating (C=10 priors at 4.5 baseline)
      const bayesianRating = (partner.reviewsCount * partner.rating + 10 * 4.5) / (partner.reviewsCount + 10);
      const ratingScore = bayesianRating / 5.0;

      // Experience Score (capped at 10 years)
      const expScore = Math.min(1.0, partner.experienceYears / 10);

      // Tier Bonus
      let tierBonus = 0.05;
      if (partner.tier === 'DIAMOND') tierBonus = 0.15;
      else if (partner.tier === 'GOLD') tierBonus = 0.10;

      // Availability Penalty
      let availabilityFactor = 1.0;
      if (partner.availability === 'busy') availabilityFactor = 0.5;
      if (partner.availability === 'offline') availabilityFactor = 0.1;

      // Composite Weighted Score
      const rawScore =
        (0.40 * proximityScore + 0.35 * ratingScore + 0.15 * expScore + 0.10 * tierBonus) *
        availabilityFactor;

      const finalScore = Number(rawScore.toFixed(3));

      // Estimated ETA in minutes
      const baseTravelSpeedKmph = 20; // Urban traffic speed in Indian metros
      const travelMinutes = Math.round((distance / baseTravelSpeedKmph) * 60) + 5;
      const etaMinutes = isUrgent ? Math.min(25, travelMinutes) : Math.max(20, travelMinutes);

      const matchReason = `${partner.tier} Tech • ${partner.rating}★ (${partner.completedJobs}+ jobs) • ${distance} km away`;

      return {
        partner,
        score: finalScore,
        estimatedEtaMinutes: etaMinutes,
        distanceKm: distance,
        matchReason,
      };
    });

    // Sort descending by score
    ranked.sort((a, b) => b.score - a.score);

    const top = ranked[0];

    return {
      matchedPartner: top ? top.partner : null,
      rankedPartners: ranked,
      matchScore: top ? top.score : 0.85,
      etaMinutes: top ? top.estimatedEtaMinutes : (isUrgent ? 20 : 45),
      matchReason: top ? top.matchReason : 'Best available nearby technician assigned',
      algorithmVersion: this.VERSION,
    };
  }
}
