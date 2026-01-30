import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/Sidebar';
import { KPICard } from '@/components/KPICard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Settings,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockClients = [
  {
    id: '1',
    company: 'E-commerce Fashion',
    email: 'cliente1@email.com',
    status: 'active',
    spend: 45230.5,
    connections: { meta: 'connected', google: 'connected', tiktok: 'disconnected' },
    weeklyReport: true,
    lastActivity: new Date('2024-01-28'),
  },
  {
    id: '2',
    company: 'Tech Startup SaaS',
    email: 'cliente2@email.com',
    status: 'active',
    spend: 28750.0,
    connections: { meta: 'connected', google: 'expired', tiktok: 'connected' },
    weeklyReport: true,
    lastActivity: new Date('2024-01-27'),
  },
  {
    id: '3',
    company: 'Restaurante Gourmet',
    email: 'cliente3@email.com',
    status: 'pending',
    spend: 12340.25,
    connections: { meta: 'connected', google: 'disconnected', tiktok: 'disconnected' },
    weeklyReport: false,
    lastActivity: new Date('2024-01-25'),
  },
  {
    id: '4',
    company: 'Academia Premium',
    email: 'cliente4@email.com',
    status: 'active',
    spend: 8920.0,
    connections: { meta: 'error', google: 'connected', tiktok: 'disconnected' },
    weeklyReport: true,
    lastActivity: new Date('2024-01-28'),
  },
];

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = mockClients.filter(
    (client) =>
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeClients = mockClients.filter((c) => c.status === 'active').length;
  const totalSpend = mockClients.reduce((acc, c) => acc + c.spend, 0);
  const connectionIssues = mockClients.filter(
    (c) =>
      c.connections.meta !== 'connected' ||
      c.connections.google !== 'connected' ||
      c.connections.tiktok !== 'connected'
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-chart-positive/10 text-chart-positive border-chart-positive/20">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-chart-warning/10 text-chart-warning border-chart-warning/20">Pendente</Badge>;
      default:
        return <Badge variant="secondary">Inativo</Badge>;
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
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Clientes Ativos"
            value={activeClients}
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
                  {mockClients.length} clientes cadastrados
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
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-left py-4 px-4">Conexões</th>
                  <th className="text-right py-4 px-4">Investimento</th>
                  <th className="text-center py-4 px-4">Relatório</th>
                  <th className="text-right py-4 px-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td>
                      <div>
                        <p className="font-medium">{client.company}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </td>
                    <td>{getStatusBadge(client.status)}</td>
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
                      }).format(client.spend)}
                    </td>
                    <td className="text-center">
                      {client.weeklyReport ? (
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
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Configurações
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Enviar Relatório
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
