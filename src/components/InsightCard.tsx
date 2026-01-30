import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type InsightType = 'warning' | 'success' | 'danger' | 'info';

interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  suggestion?: string;
  delay?: number;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-chart-warning/10',
    borderColor: 'border-chart-warning/20',
    iconColor: 'text-chart-warning',
  },
  success: {
    icon: TrendingUp,
    bgColor: 'bg-chart-positive/10',
    borderColor: 'border-chart-positive/20',
    iconColor: 'text-chart-positive',
  },
  danger: {
    icon: TrendingDown,
    bgColor: 'bg-chart-negative/10',
    borderColor: 'border-chart-negative/20',
    iconColor: 'text-chart-negative',
  },
  info: {
    icon: Lightbulb,
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20',
    iconColor: 'text-primary',
  },
};

export function InsightCard({ type, title, description, suggestion, delay = 0 }: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'p-4 rounded-xl border',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex gap-3">
        <div className={cn('shrink-0 mt-0.5', config.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {suggestion && (
            <p className="text-sm text-primary font-medium mt-2">
              💡 {suggestion}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
