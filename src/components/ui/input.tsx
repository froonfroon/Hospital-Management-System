import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  sizeVariant?: "default" | "sm" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, sizeVariant = "default", ...props }, ref) => {
    const heightClass = {
      sm: "h-8 px-2.5 text-[11px]",
      default: "h-9 px-3 text-xs",
      lg: "h-10 px-3.5 text-sm",
    }[sizeVariant];

    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-slate-300 bg-white py-1 text-slate-900 shadow-2xs transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:border-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
          heightClass,
          error && "border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600 bg-red-50/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
