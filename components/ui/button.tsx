import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'focus-visible:border-ring focus-visible:ring-ring/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 outline-none select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80',
        outline:
          'border-border bg-background hover:bg-muted hover:text-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-muted hover:text-foreground',
      },
      size: {
        default: 'h-8 gap-1.5 px-2.5',
        sm: 'h-7 gap-1 px-2.5 text-[0.8rem]',
        lg: 'h-9 gap-1.5 px-3',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
