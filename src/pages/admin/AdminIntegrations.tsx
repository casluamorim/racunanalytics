import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Link2, ExternalLink, CheckCircle, XCircle, AlertCircle, Clock, Loader2, Unplug } from 'lucide-react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

type Platform = 'meta' | 'google' | 'tiktok';
type ConnectionStatusType = 'connected' | 'expired' | 'error' | 'disconnected';

interface PlatformConnection {
  id: string;
  client_id: string;
  platform: Platform;
  account_id: string;
  account_name: string | null;
  status: ConnectionStatusType;
  last_sync_at: string | null;
  token_expires_at: string | null;
}

const platformConfig: Record<Platform, { label: string; icon: string; configured: boolean; secretKey: string }> = {
  meta: { label: 'Meta Ads', icon: '📘', configured: true, secretKey: 'META_APP_ID' },
  google: { label: 'Google Ads', icon: '🔍', configured: false, secretKey: 'GOOGLE_ADS_CLIENT_ID' },
  tiktok: { label: 'TikTok Ads', icon: '🎵', configured: false, secretKey: 'TIKTOK_APP_ID' },
};

export default function AdminIntegrations() {
  const { clients, loading: clientsLoading } = useClients();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [disconnectDialog, setDisconnectDialog] = useState<{ open: boolean; connection?: PlatformConnection }>({ open: false });
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections((data as PlatformConnection[]) || []);
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const getClientConnections = (platform: Platform): PlatformConnection | undefined => {
    return connections.find(c => c.client_id === selectedClientId && c.platform === platform);
  };

  const handleConnect = async (platform: Platform) => {
    if (!selectedClientId) {
      toast.error('Selecione um cliente primeiro');
      return;
    }

    if (!platformConfig[platform].configured && platform !== 'meta') {
      toast.error(`Credenciais do ${platformConfig[platform].label} ainda não configuradas. Adicione as chaves no painel.`);
      return;
    }

    setConnectingPlatform(platform);
    try {
      const redirectUri = `${window.location.origin}/oauth/callback`;

      const { data, error } = await supabase.functions.invoke('oauth-initiate', {
        body: { platform, client_id: selectedClientId, redirect_uri: redirectUri },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('OAuth initiate error:', err);
      toast.error(err.message || 'Erro ao iniciar conexão');
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectDialog.connection) return;
    setDisconnecting(true);

    try {
      const { error } = await supabase
        .from('platform_connections')
        .delete()
        .eq('id', disconnectDialog.connection.id);

      if (error) throw error;

      toast.success('Conexão removida com sucesso');
      setDisconnectDialog({ open: false });
      await fetchConnections();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao desconectar');
    } finally {
      setDisconnecting(false);
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Integrações</h1>
          <p className="text-muted-foreground mb-8">Gerencie as conexões OAuth com plataformas de anúncio</p>

          {/* Client selector */}
          <div className="mb-8 max-w-sm">
            <label className="text-sm font-medium mb-2 block">Selecione o cliente</label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientsLoading || loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !selectedClientId ? (
            <p className="text-muted-foreground text-center py-20">Selecione um cliente para gerenciar integrações</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['meta', 'google', 'tiktok'] as Platform[]).map((platform) => {
                const config = platformConfig[platform];
                const connection = getClientConnections(platform);
                const isConnected = connection?.status === 'connected';
                const isExpired = connection?.status === 'expired';

                return (
                  <div key={platform} className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{config.label}</h3>
                          {connection?.account_name && (
                            <p className="text-xs text-muted-foreground">{connection.account_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Connection status */}
                    {connection ? (
                      <ConnectionStatus
                        status={connection.status as ConnectionStatusType}
                        platform={platform}
                        lastSync={connection.last_sync_at ? new Date(connection.last_sync_at) : undefined}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Não conectado</span>
                      </div>
                    )}

                    {/* Token expiry warning */}
                    {connection?.token_expires_at && isConnected && (
                      <div className="text-xs text-muted-foreground">
                        Token expira em: {new Date(connection.token_expires_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isConnected || isExpired ? (
                        <Button
                          className="flex-1"
                          onClick={() => handleConnect(platform)}
                          disabled={connectingPlatform === platform}
                        >
                          {connectingPlatform === platform ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <Link2 className="w-4 h-4 mr-2" />
                          )}
                          {isExpired ? 'Reconectar' : 'Conectar'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setDisconnectDialog({ open: true, connection })}
                        >
                          <Unplug className="w-4 h-4 mr-2" />
                          Desconectar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>

      {/* Disconnect confirmation dialog */}
      <Dialog open={disconnectDialog.open} onOpenChange={(open) => setDisconnectDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desconectar plataforma</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desconectar {disconnectDialog.connection?.account_name || 'esta plataforma'}?
              Os dados de métricas já importados serão mantidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisconnectDialog({ open: false })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting}>
              {disconnecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Desconectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
