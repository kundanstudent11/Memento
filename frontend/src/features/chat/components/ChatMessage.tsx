import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage as ChatMessageType } from '../hooks/useChat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex items-start gap-3', !isAssistant && 'flex-row-reverse')}>
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
          isAssistant ? 'bg-brand-100' : 'bg-slate-200'
        )}
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-brand-600" />
        ) : (
          <User className="w-4 h-4 text-slate-600" />
        )}
      </div>
      <div
        className={cn(
          'max-w-sm px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isAssistant
            ? 'bg-white border border-slate-200 text-slate-800'
            : 'bg-brand-600 text-white'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
