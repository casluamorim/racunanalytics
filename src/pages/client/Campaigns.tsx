import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { CampaignsTable } from '@/components/CampaignsTable';

export default function Campaigns() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Campanhas</h1>
          <p className="text-muted-foreground mb-8">Visualize e gerencie suas campanhas ativas</p>
          <CampaignsTable />
        </motion.div>
      </main>
    </div>
  );
}
