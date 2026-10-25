import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  sizeVariant?: "default" | "sm" | "lg";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, sizeVariant = "default", children, ...props }, ref) => {
    const heightClass = {
      sm: "h-8 px-2.5 pe-8 text-[11px]",
      default: "h-9 px-3 pe-8 text-xs",
      lg: "h-10 px-3.5 pe-9 text-sm",
    }[sizeVariant];

    return (
      <div className="relative inline-block w-full">
        <select
          className={cn(
            "flex w-full appearance-none rounded-md border border-slate-300 bg-white py-1 text-slate-900 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:border-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            heightClass,
            error && "border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600 bg-red-50/20",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-2.5 text-slate-500">
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
