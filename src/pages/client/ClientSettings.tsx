import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { User, Bell, Key } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function ClientSettings() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground mb-8">Gerencie suas preferências</p>
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Informações da Conta</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">E-mail</label>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Notificações</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure como deseja receber alertas e relatórios.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
