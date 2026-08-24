import { AnomalyCheckInput, AnomalyDetectionOutput } from '../types';

/**
 * UrgentLyfe AI Fraud Shield & Anomaly Detector (v1.8)
 * Evaluates high-velocity spam bookings, payment failure patterns,
 * abnormal cancellation rates, and account freshness anomalies.
 */
export class AnomalyDetector {
  public static evaluateRisk(input: AnomalyCheckInput): AnomalyDetectionOutput {
    const reasons: string[] = [];
    let riskScore = 0.05; // Base baseline risk

    // Rule 1: Rapid Booking Velocity Anomaly
    if (input.userBookingsLast24h >= 4) {
      riskScore += 0.35;
      reasons.push(`High booking velocity (${input.userBookingsLast24h} bookings in 24 hours)`);
    } else if (input.userBookingsLast24h >= 2) {
      riskScore += 0.10;
    }

    // Rule 2: Excessive Cancellation Ratio
    if (input.userCancelledLast24h >= 2) {
      riskScore += 0.25;
      reasons.push(`Frequent order cancellation pattern (${input.userCancelledLast24h} cancellations today)`);
    }

    // Rule 3: High-ticket Cash on Delivery with fresh account
    if (input.paymentMethod === 'CASH_AFTER_SERVICE' && input.bookingValue > 3500 && input.userAccountAgeDays < 2) {
      riskScore += 0.30;
      reasons.push('High-value Cash on Delivery requested on brand-new unverified account');
    }

    // Rule 4: Device Anomaly
    if (input.isNewDevice && input.userBookingsLast24h >= 2) {
      riskScore += 0.15;
      reasons.push('New device signature with multiple rapid consecutive orders');
    }

    riskScore = Math.min(1.0, Number(riskScore.toFixed(2)));

    let riskLevel: AnomalyDetectionOutput['riskLevel'] = 'LOW';
    let recommendedAction: AnomalyDetectionOutput['recommendedAction'] = 'ALLOW';

    if (riskScore >= 0.75) {
      riskLevel = 'CRITICAL';
      recommendedAction = 'REQUIRE_PREPAYMENT';
    } else if (riskScore >= 0.50) {
      riskLevel = 'HIGH';
      recommendedAction = 'REQUIRE_OTP';
    } else if (riskScore >= 0.30) {
      riskLevel = 'MODERATE';
      recommendedAction = 'FLAG_FOR_REVIEW';
    }

    return {
      riskScore,
      riskLevel,
      isAnomaly: riskScore >= 0.40,
      reasons: reasons.length > 0 ? reasons : ['Normal user activity pattern detected'],
      recommendedAction,
      timestamp: new Date().toISOString(),
    };
  }
}
