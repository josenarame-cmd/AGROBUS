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

export function StatCard({ title, value, subtitle, icon: Icon, trend, iconColor = 'text-green-600', iconBg = 'bg-green-100', className }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
      className
    )}>
      {/* subtle background shape */}
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-slate-50 opacity-60" />

      <div className="relative flex items-start justify-between gap-3">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trend > 0  ? 'bg-green-50 text-green-600' :
            trend < 0  ? 'bg-red-50 text-red-500'     :
            'bg-slate-100 text-slate-500'
          )}>
            {trend > 0  ? <TrendingUp className="h-3 w-3" />  :
             trend < 0  ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-500">{title}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}
