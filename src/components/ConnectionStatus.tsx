import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

type Status = 'connected' | 'expired' | 'error' | 'disconnected';

interface ConnectionStatusProps {
  status: Status;
  platform: 'meta' | 'google' | 'tiktok';
  lastSync?: Date;
  className?: string;
}

const statusConfig = {
  connected: {
    icon: CheckCircle,
    label: 'Conectado',
    color: 'text-chart-positive',
    bgColor: 'bg-chart-positive/10',
  },
  expired: {
    icon: Clock,
    label: 'Expirado',
    color: 'text-chart-warning',
    bgColor: 'bg-chart-warning/10',
  },
  error: {
    icon: XCircle,
    label: 'Erro',
    color: 'text-chart-negative',
    bgColor: 'bg-chart-negative/10',
  },
  disconnected: {
    icon: AlertCircle,
    label: 'Desconectado',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
};

const platformLabels = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  tiktok: 'TikTok Ads',
};

export function ConnectionStatus({
  status,
  platform,
  lastSync,
  className,
}: ConnectionStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center justify-between p-4 rounded-lg bg-muted/30', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-5 h-5', config.color)} />
        </div>
        <div>
          <p className="font-medium">{platformLabels[platform]}</p>
          {lastSync && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {lastSync.toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>
      <span
        className={cn(
          'text-sm font-medium px-3 py-1 rounded-full',
          config.bgColor,
          config.color
        )}
      >
        {config.label}
      </span>
    </div>
  );
}
