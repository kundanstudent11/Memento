import { RefreshCw, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSyncGmail } from '../hooks/useSyncGmail';
import { useDisconnectGmail } from '../hooks/useDisconnectGmail';
import type { GmailConnection } from '@shared/types';

type SyncControlsProps = {
  connection: GmailConnection;
};

export function SyncControls({ connection }: SyncControlsProps) {
  const sync = useSyncGmail();
  const disconnect = useDisconnectGmail();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-900 truncate">
          Connected as {connection.googleEmail}
        </p>
        <p className="text-xs text-slate-500">
          {connection.lastSyncedAt
            ? `Last synced ${new Date(connection.lastSyncedAt).toLocaleString()}`
            : 'Not synced yet'}
        </p>
      </div>
      <Button
        onClick={() => sync.mutate({})}
        isLoading={sync.isPending}
        disabled={disconnect.isPending}
      >
        <RefreshCw className="w-4 h-4" />
        Sync Gmail
      </Button>
      <Button
        variant="ghost"
        onClick={() => disconnect.mutate()}
        isLoading={disconnect.isPending}
        disabled={sync.isPending}
      >
        <Unplug className="w-4 h-4" />
        Disconnect
      </Button>
    </div>
  );
}
