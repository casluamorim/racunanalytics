import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { CampaignsTable } from '@/components/CampaignsTable';

const mockCampaigns = [
  { id: '1', name: 'Campanha Verão 2026', platform: 'meta' as const, spend: 5200, impressions: 320000, clicks: 4800, ctr: 1.5, cpc: 1.08, conversions: 120, roas: 4.2, change: 12 },
  { id: '2', name: 'Search - Marca', platform: 'google' as const, spend: 3100, impressions: 180000, clicks: 7200, ctr: 4.0, cpc: 0.43, conversions: 95, roas: 5.1, change: -3 },
  { id: '3', name: 'Awareness TikTok', platform: 'tiktok' as const, spend: 2800, impressions: 520000, clicks: 3100, ctr: 0.6, cpc: 0.90, conversions: 45, roas: 2.8, change: 8 },
];

export default function Campaigns() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Campanhas</h1>
          <p className="text-muted-foreground mb-8">Visualize e gerencie suas campanhas ativas</p>
          <CampaignsTable campaigns={mockCampaigns} />
        </motion.div>
      </main>
    </div>
  );
}
