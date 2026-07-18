import type { Schema } from '@google/genai';
import { env } from '../config/env';
import * as gemini from './gemini';
import * as groq from './groq';

/**
 * Provider-agnostic LLM entry point. Switch providers with the
 * LLM_PROVIDER env var ("gemini" | "groq") — no code changes needed.
 */
const provider = env.LLM_PROVIDER === 'groq' ? groq : gemini;

export function generateJsonContent(params: {
  systemInstruction: string;
  userPrompt: string;
  responseSchema: Schema;
}): Promise<string> {
  return provider.generateJsonContent(params);
}

export function generateTextContent(params: {
  systemInstruction: string;
  userPrompt: string;
}): Promise<string> {
  return provider.generateTextContent(params);
}

export { Type, type Schema } from './gemini';
