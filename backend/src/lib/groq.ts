import type { Schema } from '@google/genai';
import { env } from '../config/env';
import { AiExtractionError } from './AppError';
import { logger } from './logger';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

type GroqMessage = { role: 'system' | 'user'; content: string };

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function requireApiKey(): string {
  if (!env.GROQ_API_KEY) {
    throw new AiExtractionError('GROQ_API_KEY is not configured');
  }
  return env.GROQ_API_KEY;
}

async function chatCompletion(params: {
  messages: GroqMessage[];
  temperature: number;
  jsonMode: boolean;
}): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${requireApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.GROQ_MODEL,
      messages: params.messages,
      temperature: params.temperature,
      ...(params.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new AiExtractionError(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as GroqChatResponse;
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new AiExtractionError('Groq returned an empty response');
  }
  return text;
}

/**
 * Generates structured JSON from Groq using JSON mode.
 * The response schema is embedded in the system prompt because Groq's
 * json_object mode does not accept a Gemini-style schema object.
 */
export async function generateJsonContent(params: {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: Schema;
}): Promise<string> {
  try {
    const systemWithSchema = `${params.systemInstruction}

Your response MUST be a single valid JSON object conforming EXACTLY to this JSON schema (types follow the Google GenAI schema convention; "nullable": true means the value may be null):
${JSON.stringify(params.responseSchema)}

Return ONLY the JSON object — no markdown, no code fences, no commentary.`;

    return await chatCompletion({
      messages: [
        { role: 'system', content: systemWithSchema },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: 0.1,
      jsonMode: true,
    });
  } catch (err) {
    if (err instanceof AiExtractionError) throw err;
    logger.error('Groq generation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw new AiExtractionError(
      err instanceof Error ? err.message : 'Groq extraction failed'
    );
  }
}

/**
 * Generates a free-text (conversational) answer from Groq.
 * Used for grounded Q&A where the response is prose, not structured JSON.
 */
export async function generateTextContent(params: {
  systemInstruction: string;
  userPrompt: string;
}): Promise<string> {
  try {
    return await chatCompletion({
      messages: [
        { role: 'system', content: params.systemInstruction },
        { role: 'user', content: params.userPrompt },
      ],
      temperature: 0.3,
      jsonMode: false,
    });
  } catch (err) {
    if (err instanceof AiExtractionError) throw err;
    logger.error('Groq text generation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw new AiExtractionError(
      err instanceof Error ? err.message : 'Groq query failed'
    );
  }
}
