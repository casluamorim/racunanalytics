import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MonthlyGoalProps {
  goal: number;
  current: number;
  label?: string;
}

export function MonthlyGoal({ goal, current, label = 'Meta Mensal' }: MonthlyGoalProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isAchieved = current >= goal;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{label}</h3>
          <p className="text-sm text-muted-foreground">Progresso de conversões</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-bold font-display">
            {formatCurrency(current)}
          </span>
          <span className="text-muted-foreground">
            de {formatCurrency(goal)}
          </span>
        </div>

        <div className="space-y-2">
          <Progress
            value={percentage}
            className="h-3"
          />
          <div className="flex items-center justify-between text-sm">
            <span className={isAchieved ? 'text-chart-positive font-medium' : 'text-muted-foreground'}>
              {percentage.toFixed(1)}% atingido
            </span>
            {isAchieved && (
              <span className="text-chart-positive font-medium">
                🎉 Meta atingida!
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
