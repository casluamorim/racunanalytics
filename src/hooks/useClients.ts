 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import type { ClientFormData } from '@/components/admin/ClientFormDialog';
 
 interface Client {
   id: string;
   userId: string;
   companyName: string;
   email: string;
   fullName: string | null;
   whatsapp: string | null;
   adminWhatsapp: string | null;
   monthlyGoal: number | null;
   notes: string | null;
  weeklyReportEnabled: boolean;
  onboardingCompleted: boolean;
  contentApprovalUrl: string | null;
   createdAt: string;
   connections: {
     meta: 'connected' | 'expired' | 'error' | 'disconnected';
     google: 'connected' | 'expired' | 'error' | 'disconnected';
     tiktok: 'connected' | 'expired' | 'error' | 'disconnected';
   };
   totalSpend: number;
 }
 
 export function useClients() {
   const [clients, setClients] = useState<Client[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);
 
   const fetchClients = useCallback(async () => {
     try {
       setLoading(true);
       
       // Fetch clients with their profiles
       const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          user_id,
          company_name,
          admin_whatsapp,
          monthly_goal,
          notes,
          weekly_report_enabled,
          onboarding_completed,
          content_approval_url,
          created_at
        `)
         .order('created_at', { ascending: false });
 
       if (clientsError) throw clientsError;
 
       if (!clientsData || clientsData.length === 0) {
         setClients([]);
         return;
       }
 
       // Fetch profiles for all clients
       const userIds = clientsData.map(c => c.user_id);
       const { data: profilesData, error: profilesError } = await supabase
         .from('profiles')
         .select('id, email, full_name, whatsapp')
         .in('id', userIds);
 
       if (profilesError) throw profilesError;
 
       // Fetch connections for all clients
       const clientIds = clientsData.map(c => c.id);
       const { data: connectionsData, error: connectionsError } = await supabase
         .from('platform_connections')
         .select('client_id, platform, status')
         .in('client_id', clientIds);
 
       if (connectionsError) throw connectionsError;
 
       // Fetch total spend per client
       const { data: metricsData, error: metricsError } = await supabase
         .from('metrics_cache')
         .select('client_id, spend')
         .in('client_id', clientIds);
 
       if (metricsError) throw metricsError;
 
       // Build the clients array
       const formattedClients: Client[] = clientsData.map(client => {
         const profile = profilesData?.find(p => p.id === client.user_id);
         const clientConnections = connectionsData?.filter(c => c.client_id === client.id) || [];
         const clientMetrics = metricsData?.filter(m => m.client_id === client.id) || [];
         
         const getConnectionStatus = (platform: string) => {
           const conn = clientConnections.find(c => c.platform === platform);
           return (conn?.status as Client['connections']['meta']) || 'disconnected';
         };
 
         const totalSpend = clientMetrics.reduce((acc, m) => acc + (Number(m.spend) || 0), 0);
 
         return {
           id: client.id,
           userId: client.user_id,
           companyName: client.company_name,
           email: profile?.email || '',
           fullName: profile?.full_name || null,
           whatsapp: profile?.whatsapp || null,
           adminWhatsapp: client.admin_whatsapp,
           monthlyGoal: client.monthly_goal ? Number(client.monthly_goal) : null,
           notes: client.notes,
          weeklyReportEnabled: client.weekly_report_enabled ?? true,
          contentApprovalUrl: (client as any).content_approval_url ?? null,
           onboardingCompleted: client.onboarding_completed ?? false,
           createdAt: client.created_at,
           connections: {
             meta: getConnectionStatus('meta'),
             google: getConnectionStatus('google'),
             tiktok: getConnectionStatus('tiktok'),
           },
           totalSpend,
         };
       });
 
       setClients(formattedClients);
     } catch (err) {
       console.error('Error fetching clients:', err);
       setError(err as Error);
       toast.error('Erro ao carregar clientes');
     } finally {
       setLoading(false);
     }
   }, []);
 
   useEffect(() => {
     fetchClients();
   }, [fetchClients]);
 
    const createClient = async (data: ClientFormData) => {
      try {
        const { data: result, error } = await supabase.functions.invoke('manage-client', {
          body: { action: 'create', ...data },
        });

        if (error) throw error;
        if (result?.error) throw new Error(result.error);

        toast.success('Cliente criado com sucesso!');
        await fetchClients();
      } catch (err) {
        console.error('Error creating client:', err);
        const message = err instanceof Error ? err.message : 'Erro ao criar cliente';
        toast.error(message);
        throw err;
      }
    };

    const updateClient = async (clientId: string, userId: string, data: ClientFormData) => {
      try {
        const { data: result, error } = await supabase.functions.invoke('manage-client', {
          body: { action: 'update', clientId, userId, ...data },
        });

        if (error) throw error;
        if (result?.error) throw new Error(result.error);

        toast.success('Cliente atualizado com sucesso!');
        await fetchClients();
      } catch (err) {
        console.error('Error updating client:', err);
        const message = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
        toast.error(message);
        throw err;
      }
    };

    const deleteClient = async (clientId: string, userId: string) => {
      try {
        const { data: result, error } = await supabase.functions.invoke('manage-client', {
          body: { action: 'delete', clientId, userId },
        });

        if (error) throw error;
        if (result?.error) throw new Error(result.error);

        toast.success('Cliente excluído com sucesso!');
        await fetchClients();
      } catch (err) {
        console.error('Error deleting client:', err);
        const message = err instanceof Error ? err.message : 'Erro ao excluir cliente';
        toast.error(message);
        throw err;
      }
    };

    return {
     clients,
     loading,
     error,
     refetch: fetchClients,
     createClient,
     updateClient,
     deleteClient,
   };
 }