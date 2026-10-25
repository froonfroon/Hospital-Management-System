import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, Info, ShieldAlert } from "lucide-react";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold border leading-none transition-colors select-none",
  {
    variants: {
      variant: {
        stable:
          "bg-emerald-50 text-emerald-800 border-emerald-200 [&>svg]:text-emerald-700",
        warning:
          "bg-amber-50 text-amber-900 border-amber-300 [&>svg]:text-amber-700",
        urgent:
          "bg-orange-50 text-orange-900 border-orange-300 [&>svg]:text-orange-700",
        critical:
          "bg-red-50 text-red-900 border-red-300 [&>svg]:text-red-700 animate-pulse font-bold",
        routine:
          "bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-700",
        neutral:
          "bg-slate-100 text-slate-800 border-slate-200 [&>svg]:text-slate-600",
        navy:
          "bg-[var(--shell-bg-deep)] text-[var(--accent-300)] border-[var(--shell-border)] [&>svg]:text-[var(--accent-400)]",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        default: "text-[11px] px-2 py-0.5",
        lg: "text-xs px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  showIcon?: boolean;
}

export function StatusBadge({
  className,
  variant = "neutral",
  size,
  dot = true,
  showIcon = false,
  children,
  ...props
}: StatusBadgeProps) {
  const dotColor = {
    stable: "bg-emerald-600",
    warning: "bg-amber-600",
    critical: "bg-red-600",
    urgent: "bg-orange-600",
    routine: "bg-blue-600",
    neutral: "bg-slate-500",
    navy: "bg-cyan-400",
  }[variant || "neutral"];

  const defaultIcon = {
    stable: <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />,
    warning: <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />,
    critical: <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />,
    urgent: <ShieldAlert className="h-3 w-3 shrink-0" aria-hidden="true" />,
    routine: <Info className="h-3 w-3 shrink-0" aria-hidden="true" />,
    neutral: <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />,
    navy: <Info className="h-3 w-3 shrink-0" aria-hidden="true" />,
  }[variant || "neutral"];

  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {showIcon ? (
        defaultIcon
      ) : dot ? (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColor)}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
