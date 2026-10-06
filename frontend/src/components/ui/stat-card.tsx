import { cn } from '../../lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;          // percentage, positive = up, negative = down
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, iconColor = 'text-primary', iconBg = 'bg-primary/10', className }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
      className
    )}>
      <div className="relative flex items-start justify-between gap-3">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trend > 0  ? 'bg-emerald-50 text-emerald-600' :
            trend < 0  ? 'bg-red-50 text-red-500'     :
            'bg-muted text-muted-foreground'
          )}>
            {trend > 0  ? <TrendingUp className="h-3 w-3" />  :
             trend < 0  ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>}
      </div>
    </div>
  );
}
