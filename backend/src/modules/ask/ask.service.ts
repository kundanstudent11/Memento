import type { AskResponse } from '@shared/types';
import { logger } from '../../lib/logger';
import { generateTextContent } from '../../lib/gemini';
import { gmailInsightRepository } from '../gmail/gmail-insight.repository';
import { getGmailStats } from '../gmail/gmail.stats.service';
import { ASK_SYSTEM_PROMPT, buildAskContext } from './ask.prompt';
import type { AskBody } from './ask.schema';

export const askService = {
  async ask(userId: string, body: AskBody): Promise<AskResponse> {
    logger.info('Ask Memento query', { userId, question: body.question });

    const [insights, stats] = await Promise.all([
      gmailInsightRepository.findAllForStats(userId),
      getGmailStats(userId),
    ]);

    if (insights.length === 0) {
      return {
        question: body.question,
        answer:
          "I don't have any data yet. Connect your Gmail and run a sync, then ask me again.",
        usedInsightCount: 0,
      };
    }

    const history = (body.history ?? [])
      .map((t) => `${t.role === 'user' ? 'User' : 'Memento'}: ${t.content}`)
      .join('\n');

    const userPrompt = [
      `DATA CONTEXT:\n${buildAskContext(insights, stats)}`,
      history ? `CONVERSATION SO FAR:\n${history}` : '',
      `QUESTION: ${body.question}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const answer = await generateTextContent({
      systemInstruction: ASK_SYSTEM_PROMPT,
      userPrompt,
    });

    return {
      question: body.question,
      answer: answer.trim(),
      usedInsightCount: insights.length,
    };
  },
};
