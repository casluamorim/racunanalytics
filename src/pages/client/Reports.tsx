import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Relatórios</h1>
          <p className="text-muted-foreground mb-8">Acesse seus relatórios semanais e mensais</p>
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum relatório disponível</h3>
            <p className="text-muted-foreground mb-4">
              Os relatórios serão gerados automaticamente quando houver dados suficientes.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
