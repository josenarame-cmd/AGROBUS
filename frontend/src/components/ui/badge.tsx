import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-slate-100 text-slate-700',
        green:    'bg-green-100 text-green-700',
        amber:    'bg-amber-100 text-amber-700',
        red:      'bg-red-100 text-red-700',
        blue:     'bg-blue-100 text-blue-700',
        purple:   'bg-purple-100 text-purple-700',
        orange:   'bg-orange-100 text-orange-700',
        outline:  'border border-slate-200 text-slate-600 bg-transparent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
