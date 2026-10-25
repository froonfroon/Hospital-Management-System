import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-md border p-3 text-xs [&>svg]:absolute [&>svg]:start-3 [&>svg]:top-3 [&>svg]:text-current [&>svg+div]:translate-y-[-1px] [&:has(svg)]:ps-9",
  {
    variants: {
      variant: {
        default: "bg-slate-50 border-slate-200 text-slate-800",
        info: "bg-blue-50 border-blue-200 text-blue-900 [&>svg]:text-blue-700",
        success: "bg-emerald-50 border-emerald-200 text-emerald-900 [&>svg]:text-emerald-700",
        warning: "bg-amber-50 border-amber-200 text-amber-900 [&>svg]:text-amber-700",
        destructive: "bg-red-50 border-red-200 text-red-900 [&>svg]:text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, icon, ...props }, ref) => {
    const defaultIcon = {
      default: <Info className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />,
      success: <CheckCircle className="h-4 w-4" />,
      warning: <AlertTriangle className="h-4 w-4" />,
      destructive: <XCircle className="h-4 w-4" />,
    }[variant || "default"];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {icon ?? defaultIcon}
        <div>{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-[11px] leading-relaxed opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
