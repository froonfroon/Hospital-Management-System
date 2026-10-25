import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  progress?: {
    current: number;
    total: number;
    percent: number;
    colorClass?: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  badge,
  progress,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-colors",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="rounded p-1 text-slate-500 bg-slate-50 border border-slate-200">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
          {value}
        </div>
        {badge}
      </div>

      {progress && (
        <div className="mt-2.5 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-600">
            <span>{progress.current} / {progress.total}</span>
            <span className="font-semibold">{progress.percent}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={cn("h-full rounded-full bg-cyan-700 transition-all duration-300", progress.colorClass)}
              style={{ width: `${Math.min(progress.percent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && !progress && (
        <div className="mt-2.5 flex items-center justify-between gap-1.5 text-[11px] text-slate-500">
          {subtitle && <span className="leading-tight">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                "font-semibold shrink-0 ms-1.5",
                trend.isPositive ? "text-emerald-700" : "text-red-700"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
