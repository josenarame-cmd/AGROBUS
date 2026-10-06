import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline:  'border text-foreground bg-transparent',
        green:    'bg-green-100 text-green-700 hover:bg-green-100/80',
        amber:    'bg-amber-100 text-amber-700 hover:bg-amber-100/80',
        red:      'bg-red-100 text-red-700 hover:bg-red-100/80',
        blue:     'bg-blue-100 text-blue-700 hover:bg-blue-100/80',
        purple:   'bg-purple-100 text-purple-700 hover:bg-purple-100/80',
        orange:   'bg-orange-100 text-orange-700 hover:bg-orange-100/80',
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
