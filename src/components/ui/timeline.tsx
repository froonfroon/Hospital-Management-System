import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  isUrgent?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn("relative ps-4 border-s-2 border-slate-200 space-y-4 my-2", className)}>
      {events.map((event) => (
        <div key={event.id} className="relative group">
          {/* Timeline node */}
          <div
            className={cn(
              "absolute -start-[21px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-400 group-hover:scale-110 transition-transform",
              event.isUrgent && "bg-red-600 ring-4 ring-red-100"
            )}
            aria-hidden="true"
          />

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <span className="text-xs font-semibold text-slate-800">
              {event.title}
            </span>
            <span className="text-[10px] text-slate-400 shrink-0">
              {event.timestamp}
            </span>
          </div>

          {event.description && (
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-2">
            {event.actor && (
              <span className="text-[10px] text-slate-500 font-medium">
                By: {event.actor}
              </span>
            )}
            {event.badge}
          </div>
        </div>
      ))}
    </div>
  );
}
