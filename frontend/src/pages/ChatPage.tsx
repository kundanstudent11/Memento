import { useState, useRef, useEffect, FormEvent } from 'react';
import { Send } from 'lucide-react';
import { useChat, ChatMessage } from '@/features/chat';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const SUGGESTIONS = [
  'How much am I spending on subscriptions each month?',
  "What's my biggest recurring charge?",
  'Any renewals or bills coming up soon?',
  'Break down my spending by category',
];

export default function ChatPage() {
  const { messages, send, isLoading } = useChat();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
    setInput('');
  };

  const handleSuggestion = (text: string) => {
    send(text);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4">
      <div className="py-6 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">Ask Memento</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Ask anything about your synced data in plain language
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
              <Spinner size="sm" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <Spinner size="sm" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="pb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-brand-400 hover:text-brand-700 transition-colors disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="pb-6 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your synced data…"
          disabled={isLoading}
        />
        <Button type="submit" disabled={!input.trim() || isLoading} className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
