import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AskChatTurn } from '@shared/types';
import { chatService } from '../services/chat.service';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    "Hi! I'm Memento. Ask me anything about your synced data — subscriptions, bills, spending, renewals, whatever you need.",
};

const MAX_HISTORY_TURNS = 10;

function toHistory(messages: ChatMessage[]): AskChatTurn[] {
  return messages
    .filter((m) => m.id !== 'init')
    .slice(-MAX_HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content }));
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const { mutate: sendQuery, isPending } = useMutation({
    mutationFn: (vars: { question: string; history: AskChatTurn[] }) =>
      chatService.ask({ question: vars.question, history: vars.history }),
    onSuccess: (result) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.answer,
        },
      ]);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Query failed');
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please try again.',
        },
      ]);
    },
  });

  const send = (question: string) => {
    if (!question.trim() || isPending) return;

    const history = toHistory(messages);
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: question },
    ]);

    sendQuery({ question, history });
  };

  return { messages, send, isLoading: isPending };
}
