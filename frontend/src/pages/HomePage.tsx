import { Link } from 'react-router-dom';
import { Upload, MessageSquare, Bell, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Upload,
    title: 'Upload Any Document',
    description: 'Photograph or upload bills, prescriptions, insurance letters, warranty cards.',
  },
  {
    icon: Zap,
    title: 'AI Extraction',
    description: 'AI reads and structures the key info: amount, due date, provider, key terms.',
  },
  {
    icon: Bell,
    title: 'Auto Reminders',
    description: 'Never miss a payment or renewal. Reminders are created automatically.',
  },
  {
    icon: MessageSquare,
    title: 'Ask in Plain Language',
    description: '"What do I owe this month?" or "When does my car insurance expire?" — just ask.',
  },
];

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-700 bg-brand-50 rounded-full mb-4">
          AI-powered document memory
        </span>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">
          Never lose track of a document again
        </h1>
        <p className="text-lg text-slate-500 max-w-xl mx-auto">
          Upload your bills, prescriptions, and letters. Memento extracts the important info,
          creates reminders, and lets you ask questions across all of it.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/documents">
            <Button>
              <Upload className="w-4 h-4" />
              Upload a document
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="secondary">
              <MessageSquare className="w-4 h-4" />
              Ask a question
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title}>
            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
