import * as React from "react";
import { formatDateTime } from "@/lib/utils";
import { useI18n } from "@/i18n/i18n-context";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditStampProps {
  timestamp: string;
  actorName: string;
  actorRole: string;
  badgeNumber?: string;
  actionText?: string;
  className?: string;
}

export function AuditStamp({
  timestamp,
  actorName,
  actorRole,
  badgeNumber,
  actionText = "Electronically signed & verified",
  className,
}: AuditStampProps) {
  const { locale } = useI18n();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-[11px] text-slate-500",
        className
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
      <div className="flex flex-wrap items-center gap-x-2">
        <span className="font-medium text-slate-700">{actionText}</span>
        <span>•</span>
        <span>
          {actorName} ({actorRole}) {badgeNumber ? `[${badgeNumber}]` : ""}
        </span>
        <span>•</span>
        <span>{formatDateTime(timestamp, locale)}</span>
      </div>
    </div>
  );
}
