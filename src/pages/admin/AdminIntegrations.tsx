import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Link2, ExternalLink } from 'lucide-react';

export default function AdminIntegrations() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Integrações</h1>
          <p className="text-muted-foreground mb-8">Gerencie as conexões com plataformas de anúncio</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Meta Ads', 'Google Ads', 'TikTok Ads'].map((platform) => (
              <div key={platform} className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{platform}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure a integração com {platform} para importar métricas automaticamente.
                </p>
                <button className="text-sm text-primary flex items-center gap-1 hover:underline">
                  Configurar <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
