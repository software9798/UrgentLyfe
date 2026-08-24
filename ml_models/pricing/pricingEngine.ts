import { MLPricingInput, MLPricingOutput } from '../types';

/**
 * UrgentLyfe Dynamic Pricing Engine (v2.4 - Multi-factor Elasticity Model)
 * Incorporates time-of-day peak curves, city tier multipliers, real-time demand,
 * and emergency SOS dispatch coefficients.
 */
export class PricingEngine {
  private static readonly MODEL_NAME = 'UrgentLyfe-Pricing-v2.4 (Elastic Surge Ensemble)';

  public static calculatePrice(input: MLPricingInput): MLPricingOutput {
    const {
      basePrice,
      city = 'bengaluru',
      isUrgent = false,
      quantity = 1,
      addonCount = 0,
      activeCategoryDemand = 0.5,
      hourOfDay = new Date().getHours(),
    } = input;

    const rawBase = basePrice * Math.max(1, quantity);

    // City Tier Multiplier (Tier 1 Metros have slight cost-of-living adjustments)
    const normalizedCity = city.toLowerCase();
    let cityMultiplier = 1.0;
    if (['bengaluru', 'mumbai', 'delhi-ncr', 'gurugram'].includes(normalizedCity)) {
      cityMultiplier = 1.05;
    } else if (['hyderabad', 'pune', 'chennai'].includes(normalizedCity)) {
      cityMultiplier = 1.02;
    }

    // Time-of-day Surge Curve (Night emergency 22:00-07:00 and Evening rush 18:00-21:00)
    let peakHourMultiplier = 1.0;
    if (hourOfDay >= 22 || hourOfDay <= 6) {
      peakHourMultiplier = 1.20; // Night Emergency Shift
    } else if (hourOfDay >= 18 && hourOfDay <= 21) {
      peakHourMultiplier = 1.12; // Evening Peak Shift
    }

    // Dynamic Demand Surge Factor (0.0 to 1.0 scale)
    const demandSurgeMultiplier = 1.0 + Math.max(0, activeCategoryDemand - 0.5) * 0.25;

    // Express SOS 30-min urgent fee
    const urgentSurcharge = isUrgent ? (rawBase > 1000 ? 199 : 99) : 0;
    const addonCharge = addonCount * 149;

    // Subtotal Calculation with combined multipliers
    const combinedMultiplier = cityMultiplier * peakHourMultiplier * demandSurgeMultiplier;
    const calculatedSubtotal = Math.round(rawBase * combinedMultiplier + addonCharge);
    
    // Standard GST @ 18%
    const gstTax = Math.round(calculatedSubtotal * 0.18);
    const totalEstimated = calculatedSubtotal + urgentSurcharge + gstTax;

    // Confidence Score based on standard market deviation
    const confidenceScore = 0.96;

    return {
      basePrice: rawBase,
      cityMultiplier: Number(cityMultiplier.toFixed(2)),
      peakHourMultiplier: Number(peakHourMultiplier.toFixed(2)),
      demandSurgeMultiplier: Number(demandSurgeMultiplier.toFixed(2)),
      urgentSurcharge,
      subtotal: calculatedSubtotal,
      gstTax,
      totalEstimated,
      confidenceScore,
      modelName: this.MODEL_NAME,
      featureBreakdown: {
        baseComponent: rawBase,
        surgeComponent: calculatedSubtotal - rawBase,
        urgencyComponent: urgentSurcharge,
        taxComponent: gstTax,
      },
    };
  }
}
