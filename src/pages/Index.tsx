import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import {
  BarChart3,
  Target,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Métricas Unificadas',
    description:
      'Visualize dados de Meta, Google e TikTok Ads em um único dashboard.',
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: 'Metas e Progresso',
    description:
      'Acompanhe suas metas mensais e veja o progresso em tempo real.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Insights Automáticos',
    description:
      'Receba alertas e sugestões baseadas na performance das campanhas.',
  },
];

const benefits = [
  'Relatórios semanais automáticos via WhatsApp',
  'Exportação de dados em CSV e PDF',
  'Comparativo de períodos para análise de tendências',
  'Dados atualizados a cada 15 minutos',
];

export default function Index() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [user, loading, isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <Button onClick={() => navigate('/login')}>
            Entrar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        
        {/* Gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute top-20 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 blur-[100px]"
        />

        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              Seus dados de
              <br />
              <span className="gradient-text">tráfego pago</span>
              <br />
              em um só lugar
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Portal exclusivo para clientes da Agência Racun. Acompanhe a
              performance das suas campanhas em Meta, Google e TikTok Ads com
              métricas em tempo real.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 text-lg">
                Acessar Portal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="glass-card p-2 rounded-2xl glow">
              <div className="bg-card rounded-xl p-6 space-y-6">
                {/* Mock KPI cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Investimento', value: 'R$ 34.701,25', change: '+8.2%' },
                    { label: 'Cliques', value: '93.869', change: '+12.4%' },
                    { label: 'Impressões', value: '3.086.144', change: '+5.7%' },
                    { label: 'Conversões', value: '821', change: '+15.3%' },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">{kpi.label}</p>
                      <p className="text-2xl font-bold font-display mt-1">{kpi.value}</p>
                      <p className="text-sm text-chart-positive mt-1">{kpi.change}</p>
                    </div>
                  ))}
                </div>

                {/* Mock chart */}
                <div className="bg-muted/30 rounded-lg p-6 h-48 flex items-end justify-center gap-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-4 bg-primary/40 rounded-t"
                      style={{ height: `${Math.random() * 100 + 20}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Tudo que você precisa para
              <br />
              <span className="gradient-text">tomar decisões</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Relatórios que
                <br />
                <span className="gradient-text">fazem a diferença</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Receba informações acionáveis sobre suas campanhas direto no seu
                WhatsApp. Sem complicação, sem planilhas intermináveis.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-chart-positive shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  📊 Relatório Semanal - Fashion Store
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Período:</strong> 22 a 28 de Janeiro
                  </p>
                  <p>
                    <strong>Investimento:</strong> R$ 12.450,00
                  </p>
                  <p>
                    <strong>ROAS:</strong> 4.2x ↑
                  </p>
                  <p className="text-chart-positive">
                    ✅ Performance acima da média!
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Exemplo de relatório enviado via WhatsApp
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Pronto para ter mais
              <br />
              <span className="gradient-text">controle dos seus dados?</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Acesse o portal com as credenciais fornecidas pela Agência Racun.
            </p>
            <Button size="lg" onClick={() => navigate('/login')} className="h-14 px-8 text-lg">
              Acessar Portal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2024 Agência Racun. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
