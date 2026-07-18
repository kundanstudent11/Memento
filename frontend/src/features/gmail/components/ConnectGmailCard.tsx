import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { gmailService } from '../services/gmail.service';

export function ConnectGmailCard() {
  const handleConnect = (): void => {
    window.location.href = gmailService.getConnectUrl();
  };

  return (
    <Card className="max-w-xl mx-auto text-center" padding="lg">
      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto mb-4">
        <Mail className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Connect Gmail</h2>
      <p className="text-sm text-slate-500 mb-6">
        Link your Gmail so Memento can find bills, subscriptions, renewals, and
        due dates — then surface them on your dashboard.
      </p>
      <Button onClick={handleConnect}>Continue with Google</Button>
    </Card>
  );
}
