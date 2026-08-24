import { Router } from 'express';
import { db } from '../data/database';
import { AIDiagnosis } from '../types';
import { getGeminiClient, cleanJsonResponse } from '../config/gemini';
import { PricingEngine, PartnerMatcher, IntentClassifier } from '../../ml_models';

export const aiRouter = Router();

// ML Price Estimator
aiRouter.post('/ml/estimate-price', (req, res) => {
  const { serviceId, isUrgent, city, quantity = 1, addonCount = 0 } = req.body;
  const service = db.services.get(serviceId);

  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found for ML pricing' });
  }

  const result = PricingEngine.calculatePrice({
    serviceId,
    basePrice: service.price,
    city,
    isUrgent,
    quantity,
    addonCount,
  });

  res.json({
    success: true,
    data: {
      serviceTitle: service.title,
      ...result,
    },
  });
});

// ML Match Partner
aiRouter.post('/ml/match-partner', (req, res) => {
  const { categoryId, isUrgent, customerLat, customerLng } = req.body;
  const allPartners = Array.from(db.providers.values()).map((p) => ({
    id: p.id,
    name: p.fullName,
    phone: p.phone,
    rating: p.rating,
    reviewsCount: Math.round(p.totalJobs * 0.8),
    experienceYears: p.experienceYears,
    tier: (p.hourlyRate >= 700 ? 'DIAMOND' : p.hourlyRate >= 450 ? 'GOLD' : 'STANDARD') as any,
    availability: p.availability as any,
    completedJobs: p.totalJobs,
    lat: 12.9716, // Default Bangalore coordinates
    lng: 77.5946,
    badge: p.badge,
    categoryId: p.categoryId,
  }));

  const result = PartnerMatcher.matchAndRank(allPartners, {
    categoryId,
    isUrgent,
    customerLat,
    customerLng,
  });

  res.json({
    success: true,
    data: result,
  });
});



// Gemini AI Diagnostic Wizard
aiRouter.post('/ai/diagnose', async (req, res) => {
  try {
    const { problemDescription, imageBase64, categoryHint } = req.body;

    if (!problemDescription || typeof problemDescription !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please describe the appliance or home issue in detail.',
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "UrgentLyfe AI Repair Doctor", an expert home service diagnostic engineer for India.
Analyze the user's issue description (and image if provided) regarding home appliances, electricals, plumbing, air conditioning, RO purifiers, etc.
Provide a clear, accurate, structured diagnostic report in JSON format matching this schema:
{
  "issueSummary": "Brief title of detected problem",
  "rootCause": "Technical explanation of what went wrong",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "recommendedServiceName": "Specific service requested (e.g. Power Foam Jet AC Service, MCB Replacement, Tap Leak Fix)",
  "estimatedLaborCost": number in INR (e.g. 399),
  "estimatedPartsCost": number in INR (e.g. 250),
  "estimatedTotalCost": number in INR,
  "estimatedDurationMinutes": number (e.g. 45),
  "safetyPrecautions": ["Array of safety instructions"],
  "recommendedParts": ["List of spare parts"],
  "explanation": "Friendly expert breakdown"
}`;

    const promptText = `User Issue Description: "${problemDescription}". Category context: "${categoryHint || 'Home Repair'}".`;
    let contents: any = promptText;

    if (imageBase64 && typeof imageBase64 === 'string') {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: promptText },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedDiagnosis: AIDiagnosis = cleanJsonResponse(response.text || '');
    res.json({ success: true, data: parsedDiagnosis });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'AI Diagnostic error',
      fallback: {
        issueSummary: 'Appliance Electrical / Mechanical Fault',
        rootCause: 'Wear & tear or component electrical overload.',
        severity: 'MEDIUM',
        recommendedServiceName: 'General Technician Inspection',
        estimatedLaborCost: 299,
        estimatedPartsCost: 200,
        estimatedTotalCost: 499,
        estimatedDurationMinutes: 45,
        safetyPrecautions: ['Turn off main power or water supply valve before technician arrival'],
        recommendedParts: ['Circuit fuses', 'Insulation tapes', 'Standard connectors'],
        explanation: 'Our technician will perform a physical multimeter check on site.',
      },
    });
  }
});

// AI Search & Smart Matching Engine
aiRouter.get('/ai/search', async (req, res) => {
  const query = String(req.query.q || '').trim();

  if (!query) {
    return res.json({ success: true, data: [] });
  }

  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are "UrgentLyfe Search Intent Extractor".
Match the query to available home service categories and return a JSON object:
{
  "detectedCategory": "cat-ac" | "cat-elec" | "cat-plumb" | "cat-carp" | "cat-clean" | "cat-ro" | "cat-appliance",
  "detectedProblem": "Specific issue extracted",
  "urgencyLevel": "LOW" | "NORMAL" | "HIGH" | "EMERGENCY_SOS",
  "suggestedServiceIds": ["srv-ac-01", "srv-plumb-01", "srv-elec-01"],
  "explanation": "Natural language summary explaining what service is matched"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User search query: "${query}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedSearch = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedSearch });
  } catch (error: any) {
    const fallbackIntent = IntentClassifier.classifyQuery(query);
    res.json({
      success: true,
      data: {
        detectedCategory: fallbackIntent.detectedCategory,
        detectedProblem: `Search query: ${query}`,
        urgencyLevel: fallbackIntent.urgencyLevel,
        suggestedServiceIds: fallbackIntent.suggestedServiceIds,
        explanation: 'Matched with real-time NLP Intent Classifier.',
      },
    });
  }
});
