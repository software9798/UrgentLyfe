import { SentimentAnalysisOutput } from '../types';

/**
 * Text & Voice Review Sentiment Analysis Engine
 * Calculates polarity score, identifies negative pain points, and flags customer care tickets.
 */
export class SentimentScorer {
  private static readonly POSITIVE_LEXICON = [
    'excellent', 'great', 'awesome', 'quick', 'fast', 'punctual', 'polite', 'clean', 'professional',
    'perfect', 'satisfied', 'helpful', 'amazing', 'superb', 'best', 'smooth', 'on time', 'good'
  ];

  private static readonly NEGATIVE_LEXICON = [
    'late', 'rude', 'dirty', 'messy', 'unprofessional', 'worst', 'bad', 'damage', 'broken',
    'expensive', 'overcharged', 'slow', 'poor', 'terrible', 'horrible', 'cheat', 'scam', 'unresolved'
  ];

  public static analyze(text: string, ratingStar: number = 5): SentimentAnalysisOutput {
    const lower = text.toLowerCase();
    let posCount = 0;
    let negCount = 0;
    const keyThemes: string[] = [];

    for (const word of this.POSITIVE_LEXICON) {
      if (lower.includes(word)) {
        posCount++;
        keyThemes.push(`+ ${word}`);
      }
    }

    for (const word of this.NEGATIVE_LEXICON) {
      if (lower.includes(word)) {
        negCount++;
        keyThemes.push(`- ${word}`);
      }
    }

    let rawScore = (posCount - negCount) / Math.max(1, posCount + negCount);
    // Incorporate star rating
    const starWeight = (ratingStar - 3) / 2; // -1 to +1
    const combinedScore = Number((0.6 * rawScore + 0.4 * starWeight).toFixed(2));

    let sentiment: SentimentAnalysisOutput['sentiment'] = 'NEUTRAL';
    if (combinedScore > 0.2 || ratingStar >= 4) {
      sentiment = 'POSITIVE';
    } else if (combinedScore < -0.15 || ratingStar <= 2) {
      sentiment = 'NEGATIVE';
    }

    return {
      sentiment,
      sentimentScore: combinedScore,
      keyThemes: keyThemes.slice(0, 5),
      requiresCustomerFollowup: sentiment === 'NEGATIVE' || ratingStar <= 2,
    };
  }
}
