export interface NLPIntentResult {
  detectedCategory: 'cat-ac' | 'cat-elec' | 'cat-plumb' | 'cat-carp' | 'cat-clean' | 'cat-ro' | 'cat-appliance';
  urgencyLevel: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY_SOS';
  matchedKeywords: string[];
  suggestedServiceIds: string[];
  confidence: number;
}

/**
 * Fast Rule & Dictionary-Based NLP Intent Parser
 * Used as high-speed instant fallback or pre-processor for Gemini LLM.
 */
export class IntentClassifier {
  private static readonly CATEGORY_KEYWORDS: Record<string, { category: any; serviceIds: string[] }> = {
    ac: { category: 'cat-ac', serviceIds: ['srv-ac-01', 'srv-ac-02'] },
    cooling: { category: 'cat-ac', serviceIds: ['srv-ac-01'] },
    gas: { category: 'cat-ac', serviceIds: ['srv-ac-02'] },
    leak: { category: 'cat-plumb', serviceIds: ['srv-plumb-01'] },
    pipe: { category: 'cat-plumb', serviceIds: ['srv-plumb-01', 'srv-plumb-02'] },
    plumb: { category: 'cat-plumb', serviceIds: ['srv-plumb-01'] },
    tap: { category: 'cat-plumb', serviceIds: ['srv-plumb-01'] },
    drain: { category: 'cat-plumb', serviceIds: ['srv-plumb-02'] },
    spark: { category: 'cat-elec', serviceIds: ['srv-elec-01'] },
    mcb: { category: 'cat-elec', serviceIds: ['srv-elec-01'] },
    short: { category: 'cat-elec', serviceIds: ['srv-elec-01'] },
    fan: { category: 'cat-elec', serviceIds: ['srv-elec-02'] },
    switch: { category: 'cat-elec', serviceIds: ['srv-elec-01'] },
    wood: { category: 'cat-carp', serviceIds: ['srv-carp-01'] },
    door: { category: 'cat-carp', serviceIds: ['srv-carp-01'] },
    lock: { category: 'cat-carp', serviceIds: ['srv-carp-02'] },
    clean: { category: 'cat-clean', serviceIds: ['srv-clean-01'] },
    sofa: { category: 'cat-clean', serviceIds: ['srv-clean-02'] },
    water: { category: 'cat-ro', serviceIds: ['srv-ro-01'] },
    filter: { category: 'cat-ro', serviceIds: ['srv-ro-01'] },
    purifier: { category: 'cat-ro', serviceIds: ['srv-ro-01'] },
    fridge: { category: 'cat-appliance', serviceIds: ['srv-app-01'] },
    washing: { category: 'cat-appliance', serviceIds: ['srv-app-02'] },
    oven: { category: 'cat-appliance', serviceIds: ['srv-app-03'] },
  };

  private static readonly EMERGENCY_KEYWORDS = [
    'burst', 'flooding', 'sparking', 'fire', 'smoke', 'shock', 'urgent', 'emergency', 'immediately', 'now', 'blast'
  ];

  public static classifyQuery(query: string): NLPIntentResult {
    const tokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    
    let isEmergency = false;
    for (const token of tokens) {
      if (this.EMERGENCY_KEYWORDS.includes(token)) {
        isEmergency = true;
        break;
      }
    }

    const matchedKeywords: string[] = [];
    const categoryHits: Record<string, { count: number; serviceIds: string[] }> = {};

    for (const token of tokens) {
      for (const [key, mapping] of Object.entries(this.CATEGORY_KEYWORDS)) {
        if (token.includes(key)) {
          matchedKeywords.push(token);
          if (!categoryHits[mapping.category]) {
            categoryHits[mapping.category] = { count: 0, serviceIds: mapping.serviceIds };
          }
          categoryHits[mapping.category].count += 1;
        }
      }
    }

    let topCategory = 'cat-ac';
    let topCount = 0;
    let suggestedServiceIds: string[] = ['srv-ac-01'];

    for (const [cat, data] of Object.entries(categoryHits)) {
      if (data.count > topCount) {
        topCount = data.count;
        topCategory = cat;
        suggestedServiceIds = data.serviceIds;
      }
    }

    return {
      detectedCategory: topCategory as any,
      urgencyLevel: isEmergency ? 'EMERGENCY_SOS' : 'NORMAL',
      matchedKeywords,
      suggestedServiceIds,
      confidence: topCount > 0 ? 0.88 : 0.65,
    };
  }
}
