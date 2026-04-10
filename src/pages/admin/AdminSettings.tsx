import { Sidebar } from '@/components/Sidebar';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[260px] p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Configurações</h1>
          <p className="text-muted-foreground mb-8">Gerencie as configurações da plataforma</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: User, title: 'Perfil', desc: 'Atualize suas informações pessoais' },
              { icon: Bell, title: 'Notificações', desc: 'Configure alertas e notificações' },
              { icon: Shield, title: 'Segurança', desc: 'Altere sua senha e configurações de acesso' },
              { icon: Settings, title: 'Geral', desc: 'Configurações gerais da plataforma' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
