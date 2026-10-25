import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  badge,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("border border-slate-200 rounded-md bg-white p-4 shadow-2xs space-y-3", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
            {title}
          </h3>
          {description && (
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {badge}
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
}
