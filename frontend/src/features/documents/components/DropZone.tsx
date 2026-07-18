import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';

interface DropZoneProps {
  onFileDrop: (file: File) => void;
  isUploading: boolean;
}

export function DropZone({ onFileDrop, isUploading }: DropZoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFileDrop(accepted[0]);
    },
    [onFileDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-brand-400 bg-brand-50'
          : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50',
        isUploading && 'pointer-events-none opacity-70'
      )}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <div className="flex flex-col items-center gap-2 text-brand-600">
          <Spinner size="lg" />
          <p className="text-sm font-medium">Uploading…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Upload className="w-8 h-8 text-slate-400" />
          <p className="font-medium text-slate-700">
            {isDragActive ? 'Drop it here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-xs">PDF, JPG, PNG, WEBP — up to 20 MB</p>
        </div>
      )}
    </div>
  );
}
