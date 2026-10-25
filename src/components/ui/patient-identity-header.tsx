import * as React from "react";
import { Patient } from "@/types/patient";
import { StatusBadge } from "./status-badge";
import { useI18n } from "@/i18n/i18n-context";
import { formatDate } from "@/lib/utils";
import { Bed, ShieldAlert, CheckCircle2, User, HeartPulse, Stethoscope } from "lucide-react";

interface PatientIdentityHeaderProps {
  patient: Patient;
  actions?: React.ReactNode;
  className?: string;
}

export function PatientIdentityHeader({
  patient,
  actions,
  className,
}: PatientIdentityHeaderProps) {
  const { locale, t } = useI18n();

  const isArabic = locale === "ar";
  const displayName = isArabic ? patient.fullNameAr : patient.fullNameEn;
  const secondaryName = isArabic ? patient.fullNameEn : patient.fullNameAr;

  const hasSevereAllergy = patient.allergies.some(
    (a) => a.severity === "severe" || a.severity === "anaphylactic"
  );

  return (
    <div className="w-full rounded-md border border-slate-200 bg-white p-3.5 shadow-2xs">
      {/* Top Banner: Core Patient Identity */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left: Patient Name, MRN, National ID, Age, Gender, Blood Type */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 border border-slate-300 font-bold text-sm">
            {patient.gender === "female" ? "♀" : "♂"}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {displayName}
              </h2>
              <span className="text-xs text-slate-500 font-normal">({secondaryName})</span>
              <StatusBadge
                variant={
                  patient.status === "admitted"
                    ? "routine"
                    : patient.status === "observation"
                    ? "warning"
                    : patient.status === "discharge_ready"
                    ? "stable"
                    : "neutral"
                }
                size="sm"
                showIcon
              >
                {t.status[patient.status] || patient.status}
              </StatusBadge>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1 font-mono font-bold text-cyan-950 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                <span className="text-[10px] text-cyan-700">MRN:</span>
                <span>{patient.mrn}</span>
              </div>
              <span>
                <strong className="text-slate-700">Nat. ID:</strong>{" "}
                <span className="font-mono">{patient.nationalId}</span>
              </span>
              <span>
                <strong className="text-slate-700">{t.common.age}:</strong> {patient.age}y ({patient.gender})
              </span>
              <span>
                <strong className="text-slate-700">DOB:</strong> {formatDate(patient.dateOfBirth, locale)}
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500">ABO:</span>
                <span className="text-red-700 font-bold">{patient.bloodType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bed Location, Physician, Actions */}
        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
          {/* Bed assignment */}
          <div className="flex items-center gap-1.5 rounded bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
            <Bed className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">{patient.bed.bedNumber}</span>
              <span className="text-[11px] text-slate-500 ms-1">
                (Rm {patient.bed.roomNumber} • {isArabic ? patient.departmentNameAr : patient.departmentNameEn})
              </span>
            </div>
          </div>

          {/* Attending Physician */}
          <div className="hidden sm:flex items-center gap-1.5 rounded bg-slate-50 border border-slate-200 px-2.5 py-1 text-xs text-slate-700">
            <Stethoscope className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>{patient.attendingPhysician}</span>
          </div>

          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      </div>

      {/* Clinical Safety Alert Bar: Allergies & High-Priority Warnings */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Clinical Safety:
          </span>

          {patient.allergies.length > 0 ? (
            <div
              className={`inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-xs font-bold border ${
                hasSevereAllergy
                  ? "bg-red-50 text-red-900 border-red-300 ring-2 ring-red-100"
                  : "bg-amber-50 text-amber-900 border-amber-300"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>
                {hasSevereAllergy ? "ANAPHYLAXIS / SEVERE ALLERGY: " : "ALLERGIES: "}
                {patient.allergies.map((a) => `${a.substance} (${a.reaction})`).join(", ")}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 font-semibold">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>NKDA (No Known Drug Allergies)</span>
            </div>
          )}

          {patient.chronicConditions && patient.chronicConditions.length > 0 && (
            <div className="text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Conditions:</span>{" "}
              {patient.chronicConditions.join(", ")}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Admitted: {formatDate(patient.admissionDate, locale)}</span>
        </div>
      </div>
    </div>
  );
}
