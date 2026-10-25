import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-700 text-white shadow-xs hover:bg-cyan-800 active:bg-cyan-900 border border-cyan-800",
        destructive:
          "bg-red-700 text-white shadow-xs hover:bg-red-800 active:bg-red-900 border border-red-800",
        outline:
          "border border-slate-300 bg-white text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100",
        secondary:
          "bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 active:bg-slate-300",
        ghost:
          "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 border border-transparent",
        link: "text-cyan-700 underline-offset-4 hover:underline p-0 h-auto",
        navy: "bg-[var(--shell-bg-deep)] text-white hover:bg-[var(--shell-bg-hover)] active:bg-[var(--shell-bg-active)] shadow-xs border border-[var(--shell-border)]",
        success: "bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 active:bg-emerald-900 border border-emerald-800",
      },
      size: {
        default: "h-9 px-3.5 py-1.5",
        sm: "h-8 px-2.5 py-1 text-[11px]",
        lg: "h-10 px-4 py-2 text-sm",
        icon: "h-9 w-9",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-3.5 w-3.5 animate-spin text-current rtl:ml-2 rtl:mr-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
