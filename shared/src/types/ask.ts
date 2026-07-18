/**
 * Ask Memento — natural-language Q&A contract over the user's synced data.
 * Type-only (string unions, no enums/const/Zod) so backend and frontend
 * can deploy independently without runtime shared deps.
 */

export type AskChatRole = 'user' | 'assistant';

export type AskChatTurn = {
  role: AskChatRole;
  content: string;
};

/** POST /ask */
export type AskRequest = {
  question: string;
  /** Prior turns for multi-turn context (most recent last). Optional. */
  history?: AskChatTurn[];
};

/** POST /ask — response data */
export type AskResponse = {
  question: string;
  answer: string;
  /** How many insights were provided to the model as grounding context. */
  usedInsightCount: number;
};
