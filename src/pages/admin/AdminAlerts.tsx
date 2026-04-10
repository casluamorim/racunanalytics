import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';

export default function AdminAlerts() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Alertas</h1>
          <p className="text-muted-foreground mb-8">Monitore alertas e notificações do sistema</p>
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-chart-positive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tudo certo!</h3>
            <p className="text-muted-foreground">Nenhum alerta pendente no momento.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
