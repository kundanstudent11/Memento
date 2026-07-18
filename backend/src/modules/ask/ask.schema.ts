import { z } from 'zod';

export const askBodySchema = z.object({
  question: z.string().min(1, 'question is required').max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(4000),
      })
    )
    .max(12)
    .optional(),
});

export type AskBody = z.infer<typeof askBodySchema>;
