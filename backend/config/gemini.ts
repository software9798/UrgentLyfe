import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '' && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }

  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
    });
  }

  return geminiClient;
}

export async function generateGeminiContent(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
  timeoutMs?: number;
}): Promise<string> {
  const client = getGeminiClient();
  const primaryModel = params.preferredModel || 'gemini-3.8-flash';
  const candidateModels = [
    primaryModel,
    'gemini-3.6-flash',
  ];

  // Remove duplicates while preserving order
  const modelsToTry = Array.from(new Set(candidateModels));
  let lastError: any = null;
  const defaultTimeout = params.timeoutMs || 15000;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const currentTimeout = i === 0 ? defaultTimeout : 10000;

    try {
      const callPromise = client.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Model ${model} call timeout after ${currentTimeout}ms`)), currentTimeout)
      );

      const response: any = await Promise.race([callPromise, timeoutPromise]);

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      lastError = err;
      // Immediately fallback to next model candidate
      continue;
    }
  }

  throw lastError || new Error('All Gemini model candidates failed');
}

export function cleanJsonResponse(rawText: string): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, '').replace(/\s*```$/gi, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt to locate first { and last }
    const firstOpen = cleaned.indexOf('{');
    const lastClose = cleaned.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose > firstOpen) {
      try {
        const jsonSubstr = cleaned.substring(firstOpen, lastClose + 1);
        return JSON.parse(jsonSubstr);
      } catch (innerErr) {
        // pass through to fallback
      }
    }
    return { reply: rawText };
  }
}

