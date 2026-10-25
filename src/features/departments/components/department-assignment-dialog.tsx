"use client";

import React, { useState, useTransition } from "react";
import { useI18n } from "@/i18n/i18n-context";
import { Patient } from "@/types/patient";
import { AssignmentType } from "@/types/clinical";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { hospitalDataAdapter } from "@/api/adapter";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DepartmentAssignmentDialogProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DepartmentAssignmentDialog({
  patient,
  isOpen,
  onClose,
  onSuccess,
}: DepartmentAssignmentDialogProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [assignmentType, setAssignmentType] = useState<AssignmentType>("consulting");
  const [destinationDeptId, setDestinationDeptId] = useState("");
  const [reason, setReason] = useState("");
  const [clinicalSummary, setClinicalSummary] = useState("");
  const [priority, setPriority] = useState<"routine" | "urgent" | "stat">("urgent");
  const [isSubmitting, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentDeptObj = HOSPITAL_DEPARTMENTS.find((d) => d.id === patient.departmentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destinationDeptId) {
      setErrorMsg(isAr ? "يرجى تحديد القسم المحال إليه" : "Please select destination department");
      return;
    }
    if (destinationDeptId === patient.departmentId && assignmentType !== "consulting") {
      setErrorMsg(isAr ? "لا يمكن التحويل إلى نفس القسم الحالي" : "Destination cannot be same as current treating department");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg(isAr ? "يرجى كتابة سبب الإحالة / التحويل" : "Please provide a clinical rationale");
      return;
    }

    startTransition(async () => {
      try {
        const destDeptObj = HOSPITAL_DEPARTMENTS.find((d) => d.id === destinationDeptId);
        await hospitalDataAdapter.createDepartmentAssignment({
          patientId: patient.id,
          patientName: isAr ? patient.fullNameAr : patient.fullNameEn,
          patientMrn: patient.mrn,
          encounterId: "enc-current",
          sourceDepartmentId: patient.departmentId,
          sourceDepartmentNameEn: currentDeptObj ? currentDeptObj.nameEn : patient.departmentNameEn,
          sourceDepartmentNameAr: currentDeptObj ? currentDeptObj.nameAr : patient.departmentNameAr,
          destinationDepartmentId: destinationDeptId,
          destinationDepartmentNameEn: destDeptObj ? destDeptObj.nameEn : "Specialty Unit",
          destinationDepartmentNameAr: destDeptObj ? destDeptObj.nameAr : "وحدة التخصص",
          assignmentType,
          reason,
          clinicalSummary: clinicalSummary || `Patient ${patient.mrn} referred for specialist care.`,
          requestedBy: {
            id: "usr-active",
            name: "Dr. Sarah Chen, MD",
            role: "Attending Physician",
          },
        });

        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        setErrorMsg(err?.message || "Failed to submit assignment");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[var(--surface-panel)] p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? "إحالة سريرية / تحويل بين الأقسام" : "Department Referral & Transfer Order"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {isAr ? patient.fullNameAr : patient.fullNameEn} ({patient.mrn})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current State Info */}
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 p-2.5 text-xs border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block">{isAr ? "القسم المعالج الحالي" : "Current Treating Ward"}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {isAr ? patient.departmentNameAr : patient.departmentNameEn}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{isAr ? "السرير المسكّن عليه" : "Bed Assignment"}</span>
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">{patient.bed.bedNumber}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-rose-500/10 p-2 text-xs text-rose-600 dark:text-rose-400 border border-rose-500/20">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Assignment Type Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isAr ? "نوع الإجراء السريري" : "Assignment Type"} *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <label
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-2 text-xs cursor-pointer transition-colors",
                  assignmentType === "consulting"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <input
                  type="radio"
                  name="asgType"
                  value="consulting"
                  checked={assignmentType === "consulting"}
                  onChange={() => setAssignmentType("consulting")}
                  className="sr-only"
                />
                <span>{isAr ? "طلب استشارة سريرية" : "Specialist Consult"}</span>
              </label>

              <label
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-2 text-xs cursor-pointer transition-colors",
                  assignmentType === "interdepartmental_transfer"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <input
                  type="radio"
                  name="asgType"
                  value="interdepartmental_transfer"
                  checked={assignmentType === "interdepartmental_transfer"}
                  onChange={() => setAssignmentType("interdepartmental_transfer")}
                  className="sr-only"
                />
                <span>{isAr ? "تحويل سريري للقسم" : "Ward Transfer"}</span>
              </label>

              <label
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-2 text-xs cursor-pointer transition-colors",
                  assignmentType === "treating"
                    ? "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                <input
                  type="radio"
                  name="asgType"
                  value="treating"
                  checked={assignmentType === "treating"}
                  onChange={() => setAssignmentType("treating")}
                  className="sr-only"
                />
                <span>{isAr ? "تغيير الفريق المعالج" : "Primary Treating"}</span>
              </label>
            </div>
          </div>

          {/* Destination Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? "القسم المحال إليه / الوجهة" : "Destination Department"} *
              </label>
              <select
                value={destinationDeptId}
                onChange={(e) => setDestinationDeptId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="">{isAr ? "-- اختر القسم المطلوب --" : "-- Select Destination Department --"}</option>
                {HOSPITAL_DEPARTMENTS.filter((d) => d.id !== patient.departmentId).map((d) => (
                  <option key={d.id} value={d.id}>
                    {isAr ? d.nameAr : d.nameEn} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isAr ? "مستوى الأولوية السريرية" : "Priority"} *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="routine">{isAr ? "عادية (Routine)" : "Routine"}</option>
                <option value="urgent">{isAr ? "عاجلة (Urgent - خلال 2 ساعة)" : "Urgent (< 2 hours)"}</option>
                <option value="stat">{isAr ? "طارئة فورية (STAT - فوراً)" : "STAT (Immediate Bedside)"}</option>
              </select>
            </div>
          </div>

          {/* Clinical Reason */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isAr ? "سبب الإحالة أو التحويل" : "Clinical Indication / Reason"} *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Rapidly rising troponin post-PCI requiring Intensive Care supervision..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Clinical Summary */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isAr ? "الملخص السريري للحالة" : "Clinical Handover Summary"}
            </label>
            <textarea
              rows={3}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              placeholder="Key clinical observations, latest lab values, and questions for consulting team..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>{isAr ? "جاري الإرسال..." : "Dispatching Order..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isAr ? "إرسال أمر الإحالة" : "Submit Assignment Order"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
