"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useI18n } from "@/i18n/i18n-context";
import { hospitalDataAdapter } from "@/api/adapter";
import { PatientTimelineEvent, TimelineEventType } from "@/types/clinical";
import {
  Calendar,
  Clock,
  Activity,
  FileText,
  FlaskConical,
  Scan,
  Pill,
  Building2,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ChevronDown,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientClinicalTimelineProps {
  patientId: string;
}

export function PatientClinicalTimeline({ patientId }: PatientClinicalTimelineProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [events, setEvents] = useState<PatientTimelineEvent[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await hospitalDataAdapter.getPatientTimeline(patientId);
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to load timeline", err);
      }
    });
  }, [patientId]);

  const filteredEvents = events.filter((e) => {
    if (selectedType === "all") return true;
    if (selectedType === "vitals") return e.eventType === "vital_sign";
    if (selectedType === "labs") return e.eventType === "lab_result" || e.eventType === "lab_order";
    if (selectedType === "notes") return e.eventType === "clinical_note";
    if (selectedType === "movements")
      return e.eventType === "admission" || e.eventType === "transfer" || e.eventType === "department_assignment";
    return true;
  });

  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case "vital_sign":
        return Activity;
      case "lab_result":
      case "lab_order":
        return FlaskConical;
      case "radiology_report":
      case "radiology_order":
        return Scan;
      case "medication_admin":
        return Pill;
      case "clinical_note":
        return FileText;
      case "department_assignment":
      case "transfer":
      case "admission":
        return Building2;
      default:
        return Stethoscope;
    }
  };

  const getSeverityStyle = (severity?: "normal" | "warning" | "critical") => {
    switch (severity) {
      case "critical":
        return "border-rose-500 bg-rose-500/10 text-rose-500";
      case "warning":
        return "border-amber-500 bg-amber-500/10 text-amber-500";
      default:
        return "border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {isAr ? "الجدول الزمني السريري الموحد للأحداث" : "Unified Longitudinal Clinical Timeline"}
          </h3>
          <span className="rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
            DEMO
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
              selectedType === "all"
                ? "bg-cyan-700 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            {isAr ? "الكل" : "All Events"} ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("vitals")}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
              selectedType === "vitals"
                ? "bg-cyan-700 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            {isAr ? "العلامات الحيوية" : "Vitals"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("labs")}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
              selectedType === "labs"
                ? "bg-cyan-700 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            {isAr ? "المختبر" : "Labs"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("movements")}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
              selectedType === "movements"
                ? "bg-cyan-700 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            {isAr ? "حركة المريض والأقسام" : "Admissions & Transfers"}
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("notes")}
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium transition-colors cursor-pointer",
              selectedType === "notes"
                ? "bg-cyan-700 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
            )}
          >
            {isAr ? "الملاحظات" : "Clinical Notes"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center text-xs text-slate-500">
          {isAr ? "لا توجد أحداث مسجلة لهذا التصنيف" : "No clinical events match this filter"}
        </div>
      ) : (
        <div className="relative ps-6 space-y-4 before:absolute before:start-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredEvents.map((evt) => {
            const Icon = getEventIcon(evt.eventType);

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={cn(
                    "absolute -start-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border bg-white dark:bg-[var(--surface-panel)] shadow-xs",
                    getSeverityStyle(evt.severity)
                  )}
                >
                  <Icon className="h-2.5 w-2.5" />
                </div>

                {/* Event Card */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface-panel)] p-3 shadow-2xs hover:border-cyan-500/30 transition-colors space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {isAr ? evt.titleAr : evt.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(evt.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAr ? evt.summaryAr : evt.summaryEn}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-1.5 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {isAr ? evt.departmentNameAr : evt.departmentNameEn}
                    </span>
                    {evt.performedBy && (
                      <span>
                        By: <strong className="text-slate-600 dark:text-slate-300">{evt.performedBy.name}</strong> ({evt.performedBy.role})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
