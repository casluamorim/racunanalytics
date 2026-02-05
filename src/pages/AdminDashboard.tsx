 import { useState } from 'react';
 import { motion } from 'framer-motion';
 import { Sidebar } from '@/components/Sidebar';
 import { KPICard } from '@/components/KPICard';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import {
   Users,
   DollarSign,
   AlertTriangle,
   CheckCircle,
   Plus,
   Search,
   MoreHorizontal,
   Eye,
   Pencil,
   MessageSquare,
   Trash2,
   RefreshCw,
 } from 'lucide-react';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
 import { useClients } from '@/hooks/useClients';
 import { ClientFormDialog, type ClientFormData } from '@/components/admin/ClientFormDialog';
 import { DeleteClientDialog } from '@/components/admin/DeleteClientDialog';

 export default function AdminDashboard() {
   const [searchQuery, setSearchQuery] = useState('');
   const [formOpen, setFormOpen] = useState(false);
   const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
   const [editingClient, setEditingClient] = useState<{
     id: string;
     userId: string;
     email: string;
     fullName: string | null;
     companyName: string;
     whatsapp: string | null;
     adminWhatsapp: string | null;
     monthlyGoal: number | null;
     notes: string | null;
     weeklyReportEnabled: boolean;
   } | null>(null);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [deletingClient, setDeletingClient] = useState<{
     id: string;
     userId: string;
     companyName: string;
   } | null>(null);
 
   const { clients, loading, refetch, createClient, updateClient, deleteClient } = useClients();
 
   const filteredClients = clients.filter(
     (client) =>
       client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
       client.email.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const totalClients = clients.length;
   const totalSpend = clients.reduce((acc, c) => acc + c.totalSpend, 0);
   const connectionIssues = clients.filter(
     (c) =>
       c.connections.meta !== 'connected' ||
       c.connections.google !== 'connected' ||
       c.connections.tiktok !== 'connected'
   ).length;
 
   const handleCreateClient = () => {
     setEditingClient(null);
     setFormMode('create');
     setFormOpen(true);
   };
 
   const handleEditClient = (client: typeof clients[0]) => {
     setEditingClient({
       id: client.id,
       userId: client.userId,
       email: client.email,
       fullName: client.fullName,
       companyName: client.companyName,
       whatsapp: client.whatsapp,
       adminWhatsapp: client.adminWhatsapp,
       monthlyGoal: client.monthlyGoal,
       notes: client.notes,
       weeklyReportEnabled: client.weeklyReportEnabled,
     });
     setFormMode('edit');
     setFormOpen(true);
   };
 
   const handleDeleteClient = (client: typeof clients[0]) => {
     setDeletingClient({
       id: client.id,
       userId: client.userId,
       companyName: client.companyName,
     });
     setDeleteDialogOpen(true);
   };
 
   const handleFormSubmit = async (data: ClientFormData) => {
     if (formMode === 'create') {
       await createClient(data);
     } else if (editingClient) {
       await updateClient(editingClient.id, editingClient.userId, data);
     }
   };
 
   const handleDeleteConfirm = async () => {
     if (deletingClient) {
       await deleteClient(deletingClient.id, deletingClient.userId);
     }
   };

 const getConnectionDot = (status: string) => {
    const colors = {
      connected: 'bg-chart-positive',
      expired: 'bg-chart-warning',
      error: 'bg-chart-negative',
      disconnected: 'bg-muted-foreground',
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status as keyof typeof colors]}`} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[260px] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie clientes, integrações e relatórios
            </p>
          </div>
 <div className="flex gap-2">
             <Button variant="outline" size="icon" onClick={refetch} disabled={loading}>
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </Button>
             <Button onClick={handleCreateClient}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
 </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Clientes Ativos"
 value={totalClients}
            format="number"
            icon={<Users className="w-5 h-5" />}
            delay={0}
          />
          <KPICard
            title="Investimento Total"
            value={totalSpend}
            format="currency"
            change={12.5}
            icon={<DollarSign className="w-5 h-5" />}
            delay={0.05}
          />
          <KPICard
            title="Conexões com Problemas"
            value={connectionIssues}
            format="number"
            icon={<AlertTriangle className="w-5 h-5" />}
            delay={0.1}
          />
          <KPICard
            title="Relatórios Enviados"
            value={24}
            format="number"
            change={8.3}
            changeLabel="esta semana"
            icon={<CheckCircle className="w-5 h-5" />}
            delay={0.15}
          />
        </div>

        {/* Clients Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card border border-border rounded-xl"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Clientes</h3>
                <p className="text-sm text-muted-foreground">
 {clients.length} clientes cadastrados
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-4">Empresa</th>
                  <th className="text-left py-4 px-4">Conexões</th>
                  <th className="text-right py-4 px-4">Investimento</th>
                  <th className="text-center py-4 px-4">Relatório</th>
                  <th className="text-right py-4 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
 {loading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                     <tr key={i}>
                       <td><Skeleton className="h-10 w-40" /></td>
                       <td><Skeleton className="h-6 w-32" /></td>
                       <td><Skeleton className="h-6 w-24" /></td>
                       <td><Skeleton className="h-6 w-16" /></td>
                       <td><Skeleton className="h-8 w-8" /></td>
                     </tr>
                   ))
                 ) : filteredClients.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="text-center py-12 text-muted-foreground">
                       {searchQuery ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
                     </td>
                   </tr>
                 ) : (
                   filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td>
                      <div>
 <p className="font-medium">{client.companyName}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5" title="Meta Ads">
                          {getConnectionDot(client.connections.meta)}
                          <span className="text-xs text-muted-foreground">Meta</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Google Ads">
                          {getConnectionDot(client.connections.google)}
                          <span className="text-xs text-muted-foreground">Google</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="TikTok Ads">
                          {getConnectionDot(client.connections.tiktok)}
                          <span className="text-xs text-muted-foreground">TikTok</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
 }).format(client.totalSpend)}
                    </td>
                    <td className="text-center">
 {client.weeklyReportEnabled ? (
                        <Badge className="bg-chart-positive/10 text-chart-positive border-chart-positive/20">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Dashboard
                          </DropdownMenuItem>
 <DropdownMenuItem onClick={() => handleEditClient(client)}>
                             <Pencil className="w-4 h-4 mr-2" />
                             Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Enviar Relatório
                          </DropdownMenuItem>
 <DropdownMenuItem
                             className="text-destructive"
                             onClick={() => handleDeleteClient(client)}
                           >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
 ))
                 )}
              </tbody>
            </table>
          </div>
        </motion.div>
         
         {/* Form Dialog */}
         <ClientFormDialog
           open={formOpen}
           onOpenChange={setFormOpen}
           onSubmit={handleFormSubmit}
           mode={formMode}
           initialData={
             editingClient
               ? {
                   id: editingClient.id,
                   email: editingClient.email,
                   fullName: editingClient.fullName || '',
                   companyName: editingClient.companyName,
                   whatsapp: editingClient.whatsapp || '',
                   adminWhatsapp: editingClient.adminWhatsapp || '',
                   monthlyGoal: editingClient.monthlyGoal ?? undefined,
                   notes: editingClient.notes || '',
                   weeklyReportEnabled: editingClient.weeklyReportEnabled,
                 }
               : undefined
           }
         />
 
         {/* Delete Confirmation */}
         <DeleteClientDialog
           open={deleteDialogOpen}
           onOpenChange={setDeleteDialogOpen}
           onConfirm={handleDeleteConfirm}
           clientName={deletingClient?.companyName || ''}
         />
      </main>
    </div>
  );
}
