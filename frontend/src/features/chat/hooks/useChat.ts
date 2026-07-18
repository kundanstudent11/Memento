import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { documentsService } from '@/features/documents/services/documents.service';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content:
    "Hi! I'm Memento. Ask me anything about your documents — bills, renewals, due dates, whatever you need.",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const { mutate: sendQuery, isPending } = useMutation({
    mutationFn: (question: string) => documentsService.query({ question }),
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

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: question },
    ]);

    sendQuery(question);
  };

  return { messages, send, isLoading: isPending };
}
