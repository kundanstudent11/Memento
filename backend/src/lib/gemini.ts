import { GoogleGenAI, Type, type Schema } from '@google/genai';
import { env } from '../config/env';
import { AiExtractionError } from './AppError';
import { logger } from './logger';

let client: GoogleGenAI | null = null;

/**
 * Returns a configured Gemini client. Throws if GEMINI_API_KEY is missing.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!env.GEMINI_API_KEY) {
    throw new AiExtractionError('GEMINI_API_KEY is not configured');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
}

/**
 * Generates structured JSON from Gemini using constrained decoding.
 */
export async function generateJsonContent(params: {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: Schema;
}): Promise<string> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: params.userPrompt,
      config: {
        systemInstruction: params.systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: params.responseSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new AiExtractionError('Gemini returned an empty response');
    }
    return text;
  } catch (err) {
    if (err instanceof AiExtractionError) throw err;
    logger.error('Gemini generation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw new AiExtractionError(
      err instanceof Error ? err.message : 'Gemini extraction failed'
    );
  }
}

export { Type };
export type { Schema };
