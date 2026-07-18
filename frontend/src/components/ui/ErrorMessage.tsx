import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  error: Error | null;
  title?: string;
}

export function ErrorMessage({ error, title = 'Something went wrong' }: ErrorMessageProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-700">{title}</p>
        {error?.message && (
          <p className="text-xs text-red-500 mt-0.5">{error.message}</p>
        )}
      </div>
    </div>
  );
}
