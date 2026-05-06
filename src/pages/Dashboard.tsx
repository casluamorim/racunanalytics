import { useState } from 'react';
import { motion } from 'framer-motion';
import { subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Sidebar } from '@/components/Sidebar';
import { KPICard } from '@/components/KPICard';
import { DateRangePicker } from '@/components/DateRangePicker';
import { PlatformFilter } from '@/components/PlatformFilter';
import { SpendChart } from '@/components/SpendChart';
import { CampaignsTable } from '@/components/CampaignsTable';
import { MonthlyGoal } from '@/components/MonthlyGoal';
import { InsightCard } from '@/components/InsightCard';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  MousePointer,
  Eye,
  Target,
  RefreshCw,
  Download,
  Clock,
  CheckSquare,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentApprovalUrl } from '@/hooks/useContentApprovalUrl';

// Mock data for demo
const mockChartData = Array.from({ length: 30 }, (_, i) => {
  const date = subDays(new Date(), 29 - i);
  return {
    date: date.toISOString(),
    meta: Math.random() * 5000 + 2000,
    google: Math.random() * 4000 + 1500,
    tiktok: Math.random() * 3000 + 1000,
    total: 0,
  };
}).map((d) => ({ ...d, total: d.meta + d.google + d.tiktok }));

const mockCampaigns = [
  {
    id: '1',
    name: 'Campanha Awareness - Inverno 2024',
    platform: 'meta' as const,
    spend: 15420.5,
    impressions: 892340,
    clicks: 23456,
    ctr: 2.63,
    cpc: 0.66,
    conversions: 342,
    roas: 4.2,
    change: 12.5,
  },
  {
    id: '2',
    name: 'Search - Produtos Premium',
    platform: 'google' as const,
    spend: 8750.0,
    impressions: 156780,
    clicks: 8934,
    ctr: 5.7,
    cpc: 0.98,
    conversions: 156,
    roas: 5.8,
    change: 8.3,
  },
  {
    id: '3',
    name: 'TikTok - Geração Z',
    platform: 'tiktok' as const,
    spend: 5230.75,
    impressions: 1234567,
    clicks: 45678,
    ctr: 3.7,
    cpc: 0.11,
    conversions: 89,
    roas: 2.1,
    change: -5.2,
  },
  {
    id: '4',
    name: 'Remarketing - Carrinho Abandonado',
    platform: 'meta' as const,
    spend: 3200.0,
    impressions: 234567,
    clicks: 12345,
    ctr: 5.26,
    cpc: 0.26,
    conversions: 234,
    roas: 8.5,
    change: 22.1,
  },
  {
    id: '5',
    name: 'Display - Branding',
    platform: 'google' as const,
    spend: 2100.0,
    impressions: 567890,
    clicks: 3456,
    ctr: 0.61,
    cpc: 0.61,
    change: -2.8,
  },
];

const mockInsights = [
  {
    type: 'success' as const,
    title: 'ROAS excelente no Remarketing',
    description: 'A campanha de carrinho abandonado está com ROAS de 8.5x, muito acima da média.',
    suggestion: 'Considere aumentar o orçamento desta campanha.',
  },
  {
    type: 'warning' as const,
    title: 'CTR baixo no Display',
    description: 'A campanha de Display está com CTR de apenas 0.61%, abaixo do esperado.',
    suggestion: 'Revise os criativos e segmentação do público.',
  },
  {
    type: 'danger' as const,
    title: 'Queda de performance no TikTok',
    description: 'A campanha TikTok Geração Z teve queda de 5.2% no período.',
    suggestion: 'Teste novos formatos de vídeo e tendências.',
  },
  {
    type: 'info' as const,
    title: 'Oportunidade de escala',
    description: 'Suas campanhas Meta Ads estão performando bem. Há espaço para escalar.',
  },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [platform, setPlatform] = useState<'all' | 'meta' | 'google' | 'tiktok'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentApprovalUrl = useContentApprovalUrl();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-[260px] p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral das suas campanhas de tráfego pago
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Atualizado há 15 min</span>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
              Atualizar
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-8">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <PlatformFilter value={platform} onChange={setPlatform} />
        </div>

        {contentApprovalUrl && (
          <motion.a
            href={contentApprovalUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4 mb-8 p-5 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Aprovação de Conteúdo</h3>
                <p className="text-sm text-muted-foreground">
                  Acesse seu painel exclusivo para revisar e aprovar conteúdos
                </p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.a>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Investimento Total"
            value={34701.25}
            format="currency"
            change={8.2}
            icon={<DollarSign className="w-5 h-5" />}
            delay={0}
          />
          <KPICard
            title="Cliques"
            value={93869}
            format="number"
            change={12.4}
            icon={<MousePointer className="w-5 h-5" />}
            delay={0.05}
          />
          <KPICard
            title="Impressões"
            value={3086144}
            format="number"
            change={5.7}
            icon={<Eye className="w-5 h-5" />}
            delay={0.1}
          />
          <KPICard
            title="Conversões"
            value={821}
            format="number"
            change={15.3}
            icon={<Target className="w-5 h-5" />}
            delay={0.15}
          />
        </div>

        {/* Charts and Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SpendChart data={mockChartData} />
          </div>
          <div className="space-y-6">
            <MonthlyGoal goal={150000} current={98450} />
            
            {/* Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Insights & Alertas</h3>
              <div className="space-y-3">
                {mockInsights.slice(0, 3).map((insight, index) => (
                  <InsightCard
                    key={index}
                    {...insight}
                    delay={0.3 + index * 0.05}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Campaigns Table */}
        <CampaignsTable campaigns={mockCampaigns} />
      </main>
    </div>
  );
}
