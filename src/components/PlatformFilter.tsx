import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Platform = 'all' | 'meta' | 'google' | 'tiktok';

interface PlatformFilterProps {
  value: Platform;
  onChange: (platform: Platform) => void;
  className?: string;
}

const platforms: { value: Platform; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
  { value: 'tiktok', label: 'TikTok' },
];

export function PlatformFilter({ value, onChange, className }: PlatformFilterProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-muted rounded-lg', className)}>
      {platforms.map((platform) => (
        <Button
          key={platform.value}
          variant="ghost"
          size="sm"
          className={cn(
            'px-4 py-2 text-sm font-medium transition-all',
            value === platform.value
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => onChange(platform.value)}
        >
          {platform.label}
        </Button>
      ))}
    </div>
  );
}
