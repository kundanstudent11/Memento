import { FileText } from 'lucide-react';
import { DropZone, DocumentCard, useDocuments, useUploadDocument, useDeleteDocument } from '@/features/documents';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DocumentsPage() {
  const { data: documents, isLoading, isError, error } = useDocuments();
  const { mutate: upload, isPending: isUploading } = useUploadDocument();
  const { mutate: remove, isPending: isDeleting, variables: deletingId } = useDeleteDocument();

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Documents</h1>
        <p className="text-slate-500 text-sm">
          Upload bills, prescriptions, insurance letters, or any document you want Memento to remember.
        </p>
      </div>

      <DropZone onFileDrop={(file) => upload({ file })} isUploading={isUploading} />

      <div className="mt-8">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <ErrorMessage
            error={error as Error}
            title="Failed to load documents"
          />
        )}

        {!isLoading && !isError && documents?.length === 0 && (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload your first document above and Memento will extract the key info automatically."
          />
        )}

        {documents && documents.length > 0 && (
          <ul className="space-y-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <DocumentCard
                  document={doc}
                  onDelete={(id) => remove(id)}
                  isDeleting={isDeleting && deletingId === doc.id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
