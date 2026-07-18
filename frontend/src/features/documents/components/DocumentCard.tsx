import { FileText, Trash2 } from 'lucide-react';
import type { Document, DocumentStatus } from '@shared/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatFileSize, capitalize } from '@/lib/utils/format';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const statusVariant: Record<DocumentStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  pending: 'warning',
  processing: 'info',
  done: 'success',
  error: 'error',
};

export function DocumentCard({ document: doc, onDelete, isDeleting }: DocumentCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-brand-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{doc.originalName}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={statusVariant[doc.status]}>{capitalize(doc.status)}</Badge>
          <Badge>{capitalize(doc.category)}</Badge>
          <span className="text-xs text-slate-400">{formatFileSize(doc.sizeBytes)}</span>
          <span className="text-xs text-slate-400">{formatDate(doc.uploadedAt)}</span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        isLoading={isDeleting}
        onClick={() => onDelete(doc.id)}
        className="text-slate-400 hover:text-red-500 shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
