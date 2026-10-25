import * as React from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  onReset?: () => void;
  resetLabel?: string;
}

export function FilterBar({
  className,
  children,
  onReset,
  resetLabel = "Reset Filters",
  ...props
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2.5 rounded-md border border-slate-200 bg-white p-2.5 shadow-2xs",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2.5">{children}</div>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-cyan-700 underline underline-offset-2 px-1 focus:outline-none"
        >
          {resetLabel}
        </button>
      )}
    </div>
  );
}
