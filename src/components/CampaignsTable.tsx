import { motion } from 'framer-motion';
import { PlatformBadge } from './PlatformBadge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  platform: 'meta' | 'google' | 'tiktok';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions?: number;
  roas?: number;
  change?: number;
}

interface CampaignsTableProps {
  campaigns: Campaign[];
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('pt-BR').format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold">Campanhas</h3>
        <p className="text-sm text-muted-foreground">
          Performance detalhada de cada campanha
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left py-4 px-4">Campanha</th>
              <th className="text-left py-4 px-4">Plataforma</th>
              <th className="text-right py-4 px-4">Investimento</th>
              <th className="text-right py-4 px-4">Impressões</th>
              <th className="text-right py-4 px-4">Cliques</th>
              <th className="text-right py-4 px-4">CTR</th>
              <th className="text-right py-4 px-4">CPC</th>
              <th className="text-right py-4 px-4">Conversões</th>
              <th className="text-right py-4 px-4">ROAS</th>
              <th className="text-right py-4 px-4">Variação</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, index) => (
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="font-medium">{campaign.name}</td>
                <td>
                  <PlatformBadge platform={campaign.platform} showLabel={false} />
                </td>
                <td className="text-right font-medium">
                  {formatCurrency(campaign.spend)}
                </td>
                <td className="text-right text-muted-foreground">
                  {formatNumber(campaign.impressions)}
                </td>
                <td className="text-right text-muted-foreground">
                  {formatNumber(campaign.clicks)}
                </td>
                <td className="text-right text-muted-foreground">
                  {campaign.ctr.toFixed(2)}%
                </td>
                <td className="text-right text-muted-foreground">
                  {formatCurrency(campaign.cpc)}
                </td>
                <td className="text-right">
                  {campaign.conversions !== undefined ? (
                    formatNumber(campaign.conversions)
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="text-right">
                  {campaign.roas !== undefined ? (
                    <span className="text-chart-positive font-medium">
                      {campaign.roas.toFixed(2)}x
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>
                <td className="text-right">
                  {campaign.change !== undefined && (
                    <div
                      className={cn(
                        'inline-flex items-center gap-1',
                        campaign.change > 0 ? 'text-chart-positive' : 'text-chart-negative'
                      )}
                    >
                      {campaign.change > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {campaign.change > 0 ? '+' : ''}
                        {campaign.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
