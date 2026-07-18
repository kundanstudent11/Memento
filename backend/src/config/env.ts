import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),
  GOOGLE_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3001/api/v1/auth/google/callback'),
  GOOGLE_GMAIL_CALLBACK_URL: z
    .string()
    .url()
    .default('http://localhost:3001/api/v1/gmail/callback'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SESSION_COOKIE_NAME: z.string().default('memento_session'),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY must be at least 32 characters'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GMAIL_SYNC_WINDOW_DAYS: z.coerce.number().int().positive().default(30),
  GMAIL_MAX_MESSAGES: z.coerce.number().int().positive().default(100),
  GMAIL_LLM_BATCH_SIZE: z.coerce.number().int().positive().default(15),
  GMAIL_MIN_CONFIDENCE: z.coerce.number().min(0).max(1).default(0.4),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
