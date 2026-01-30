import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Logo icon - abstract data visualization */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-purple-400 opacity-20 blur-sm" />
        <div className="relative w-full h-full rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-1/2 h-1/2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" className="text-white" />
            <path d="M7 16l4-8 4 4 5-9" className="text-white" />
          </svg>
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-display font-bold tracking-tight', textSizeClasses[size])}>
            Racun
            <span className="gradient-text"> Analytics</span>
          </span>
        </div>
      )}
    </div>
  );
}
