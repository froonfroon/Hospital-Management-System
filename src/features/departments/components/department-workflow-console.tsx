"use client";

import React from "react";
import Link from "next/link";
import { DepartmentInfo } from "@/types/common";
import { useI18n } from "@/i18n/i18n-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  HeartPulse,
  Activity,
  Bed,
  Users,
  CheckCircle2,
  Clock,
  UserPlus,
  ShieldAlert,
  Flame,
  Scissors,
  Pill,
  FlaskConical,
  Scan,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

interface DepartmentWorkflowConsoleProps {
  department: DepartmentInfo;
  onReset?: () => void;
}

export function DepartmentWorkflowConsole({
  department,
  onReset,
}: DepartmentWorkflowConsoleProps) {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const renderEmergencyConsole = () => (
    <div className="space-y-4">
      {/* Triage Acuity Distribution */}
      <div className="rounded-lg border border-red-200 bg-red-50/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-600" />
            <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
              {isAr ? "توزيع فرز حالات الطوارئ (CTAS / ESI Triage)" : "Emergency Triage Acuity Distribution"}
            </h4>
          </div>
          <span className="text-[11px] text-red-800 font-mono">
            {isAr ? "متوسط زمن الدخول للطبيب: 14 دقيقة" : "Avg Door-to-Doctor: 14 mins"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="rounded bg-red-600 text-white p-2">
            <div className="text-[10px] font-bold">ESI 1 - Resus</div>
            <div className="text-lg font-black mt-0.5">3</div>
            <div className="text-[9px] opacity-90">Trauma Bays</div>
          </div>
          <div className="rounded bg-orange-600 text-white p-2">
            <div className="text-[10px] font-bold">ESI 2 - Emergent</div>
            <div className="text-lg font-black mt-0.5">9</div>
            <div className="text-[9px] opacity-90">&lt; 15 min wait</div>
          </div>
          <div className="rounded bg-amber-500 text-white p-2">
            <div className="text-[10px] font-bold">ESI 3 - Urgent</div>
            <div className="text-lg font-black mt-0.5">18</div>
            <div className="text-[9px] opacity-90">Stepdown Cubicles</div>
          </div>
          <div className="rounded bg-emerald-600 text-white p-2">
            <div className="text-[10px] font-bold">ESI 4 - Less Urgent</div>
            <div className="text-lg font-black mt-0.5">7</div>
            <div className="text-[9px] opacity-90">Fast Track Track B</div>
          </div>
          <div className="rounded bg-slate-600 text-white p-2">
            <div className="text-[10px] font-bold">ESI 5 - Non-Urgent</div>
            <div className="text-lg font-black mt-0.5">2</div>
            <div className="text-[9px] opacity-90">Ambulatory Walk-in</div>
          </div>
        </div>
      </div>

      {/* Trauma Bay Allocation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs">Trauma Bay 1 (Resus)</span>
            <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
          </div>
          <div className="text-[11px] text-slate-600">Polytrauma MVA • Intubated</div>
          <div className="text-[10px] text-slate-400">Attending: Dr. Zaid Al-Omari</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs">Trauma Bay 2 (Cardiac)</span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-[11px] text-slate-600">Acute STEMI Protocol Activated</div>
          <div className="text-[10px] text-slate-400">Transfer to Cath Lab queued</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-xs">Trauma Bay 3 (Pediatric)</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold">Ready for Intake • Prepped</div>
          <div className="text-[10px] text-slate-400">Nurse Lead: Sara Al-Dosari</div>
        </div>
      </div>
    </div>
  );

  const renderICUConsole = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-cyan-200 bg-cyan-50/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-4 w-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-cyan-950 uppercase tracking-wider">
              {isAr ? "محطة مراقبة أجهزة التنفس والعناية المركزة" : "Critical Care Bedside Monitoring & Ventilator Status"}
            </h4>
          </div>
          <span className="text-[11px] text-cyan-900 font-semibold">
            {isAr ? "نسبة التمريض: 1 إلى 1 للحالات الحرجة" : "Nurse-to-Patient Ratio: 1:1 for Resuscitation"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded bg-white p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Mechanical Ventilation:</span>
            <span className="text-base font-bold text-slate-900">18 / 25 Cases</span>
            <span className="text-[10px] text-slate-500 block">72% Invasive</span>
          </div>
          <div className="rounded bg-white p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Vasopressor Infusions:</span>
            <span className="text-base font-bold text-slate-900">14 Active</span>
            <span className="text-[10px] text-amber-700 block">Norepi / Vasopressin</span>
          </div>
          <div className="rounded bg-white p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Continuous RRT (Dialysis):</span>
            <span className="text-base font-bold text-slate-900">4 Patients</span>
            <span className="text-[10px] text-slate-500 block">CVVHDF In-Line</span>
          </div>
          <div className="rounded bg-white p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Available Isolation Negative-Pressure:</span>
            <span className="text-base font-bold text-emerald-700">1 Bed</span>
            <span className="text-[10px] text-slate-500 block">Room 208-NEG</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSurgicalConsole = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "جدول تشغيل أجنحة العمليات الكبرى (OR Suites)" : "Operating Theatres Live Roster"}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            {isAr ? "8 أجنحة عمليات مجهزة" : "8 Active Suites • 2 Turnover"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded border border-slate-200 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">OR-1: Cardiothoracic</span>
              <StatusBadge variant="critical" size="sm">Case in Progress</StatusBadge>
            </div>
            <div className="text-[11px] text-slate-600">CABG x 3 • Elapsed: 02h 45m</div>
            <div className="text-[10px] text-slate-400">Lead Surgeon: Dr. Tariq Al-Ghamdi</div>
          </div>
          <div className="rounded border border-slate-200 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">OR-2: Neurosurgery</span>
              <StatusBadge variant="critical" size="sm">Intubation</StatusBadge>
            </div>
            <div className="text-[11px] text-slate-600">Craniotomy for SDH Evacuation</div>
            <div className="text-[10px] text-slate-400">Lead Surgeon: Dr. Reem Al-Khatib</div>
          </div>
          <div className="rounded border border-slate-200 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">OR-3: General Laparoscopy</span>
              <StatusBadge variant="stable" size="sm">Turnover / Sanitizing</StatusBadge>
            </div>
            <div className="text-[11px] text-slate-600">Post Laparoscopic Cholecystectomy</div>
            <div className="text-[10px] text-slate-400">Next Case: 15 mins</div>
          </div>
          <div className="rounded border border-slate-200 p-2.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">OR-4: Emergency Reserve</span>
              <StatusBadge variant="routine" size="sm">Standby</StatusBadge>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold">Reserved for Emergency Trauma Intake</div>
            <div className="text-[10px] text-slate-400">Scrub Team: Standby Team B</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPharmacyConsole = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "طابور صرف الأدوية والمحاليل الوريدية" : "Inpatient Medication Dispensing & Sterile Compounding"}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            {isAr ? "خزينة المواد الخاضعة للرقابة: معتمدة" : "Schedule II Controlled Vault: Reconciled"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">STAT Orders in Queue:</span>
            <span className="text-lg font-bold text-red-600">3 Orders</span>
            <span className="text-[10px] text-red-700 block">&lt; 10 min Target</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Unit-Dose Cart Fills:</span>
            <span className="text-lg font-bold text-slate-900">142 Doses</span>
            <span className="text-[10px] text-slate-500 block">Day Shift Batches</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">TPN / IV Admixtures:</span>
            <span className="text-lg font-bold text-slate-900">18 Bags</span>
            <span className="text-[10px] text-slate-500 block">ISO Class 5 Cleanroom</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Drug Interaction Flags:</span>
            <span className="text-lg font-bold text-amber-600">2 Pending</span>
            <span className="text-[10px] text-amber-700 block">Clinical Pharmacist Review</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLaboratoryConsole = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "متابعة عينات المختبر والتحاليل الحرجة" : "Clinical Pathology Specimen Tracker & Panic Values"}
            </h4>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {isAr ? "معايرة الأجهزة: مكتملة بنجاح" : "Analyzers Calibrated • QC Passed"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Pending Specimens:</span>
            <span className="text-lg font-bold text-slate-900">48 Tubes</span>
            <span className="text-[10px] text-slate-500 block">Barcode Scanned</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">STAT Blood Gases:</span>
            <span className="text-lg font-bold text-cyan-700">6 Minutes TAT</span>
            <span className="text-[10px] text-slate-500 block">ED & ICU Direct Feed</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Critical Panic Alerts:</span>
            <span className="text-lg font-bold text-red-600">1 Notified</span>
            <span className="text-[10px] text-red-700 block">K+ 6.4 (Notified Attending)</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Blood Bank Cross-Matches:</span>
            <span className="text-lg font-bold text-slate-900">12 Units</span>
            <span className="text-[10px] text-slate-500 block">O-Neg Reserve: 8 Units</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRadiologyConsole = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "طابور التصوير الإشعاعي (PACS Worklist)" : "PACS Imaging Modality Worklist & Reading Queue"}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            {isAr ? "متوسط إعداد التقرير الإشعاعي: 28 دقيقة" : "Avg Report Turnaround: 28 mins"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">CT Scanners (128-Slice):</span>
            <span className="text-lg font-bold text-slate-900">4 In Queue</span>
            <span className="text-[10px] text-amber-700 block">1 Stroke STAT Code</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">MRI 3.0 Tesla:</span>
            <span className="text-lg font-bold text-slate-900">2 Studies</span>
            <span className="text-[10px] text-slate-500 block">Spine & Neuro</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Portable Bedside X-Ray:</span>
            <span className="text-lg font-bold text-slate-900">6 Orders</span>
            <span className="text-[10px] text-slate-500 block">ICU / Trauma Bays</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Ultrasound & Doppler:</span>
            <span className="text-lg font-bold text-slate-900">5 Studies</span>
            <span className="text-[10px] text-slate-500 block">Vascular & OBGYN</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInpatientWardConsole = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-cyan-700" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "لوحة جناح التنويم السريري وجولات الأطباء" : "Inpatient Ward Clinical Board & Consultant Rounds"}
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            Floor: {department.floor} • {department.wing}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Total Operational Beds:</span>
            <span className="text-lg font-bold text-slate-900">{department.operationalBeds}</span>
            <span className="text-[10px] text-slate-500 block">Staffed Beds</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Admitted Inpatients:</span>
            <span className="text-lg font-bold text-cyan-700">{department.occupiedBeds}</span>
            <span className="text-[10px] text-slate-500 block">
              {Math.round((department.occupiedBeds / department.operationalBeds) * 100)}% Census
            </span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Immediately Available:</span>
            <span className="text-lg font-bold text-emerald-700">{department.availableBeds}</span>
            <span className="text-[10px] text-slate-500 block">Sanitized & Prepped</span>
          </div>
          <div className="rounded bg-slate-50 p-2.5 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Out of Service Beds:</span>
            <span className="text-lg font-bold text-amber-700">{department.outOfServiceBeds}</span>
            <span className="text-[10px] text-slate-500 block">Terminal Cleaning / Maint.</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-cyan-500/40 bg-slate-50/70 p-4 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-cyan-700 px-2 py-0.5 text-xs font-bold text-white font-mono">
              {department.code}
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {isAr ? department.nameAr : department.nameEn}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? "وحدة سريرية متخصصة • الكادر الطبي النشط: " : "Dedicated Department Console • On Duty Staff: "}
            <strong>{department.onDutyPhysicians} Physicians</strong> • <strong>{department.onDutyNurses} Nurses</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/patients?dept=${department.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>{isAr ? "مرضى القسم" : "View Ward Patients"}</span>
            </Button>
          </Link>
          {onReset && (
            <Button size="sm" variant="ghost" onClick={onReset} className="text-xs text-slate-600">
              {isAr ? "إغلاق لوحة التحكم" : "Close Console"}
            </Button>
          )}
        </div>
      </div>

      {/* Render Department-Specific Operational Console */}
      {department.code === "ED" && renderEmergencyConsole()}
      {department.code === "ICU" && renderICUConsole()}
      {department.code === "OR" && renderSurgicalConsole()}
      {department.code === "PHARM" && renderPharmacyConsole()}
      {department.code === "LAB" && renderLaboratoryConsole()}
      {department.code === "RAD" && renderRadiologyConsole()}
      {department.totalBeds > 0 &&
        department.code !== "ED" &&
        department.code !== "ICU" &&
        department.code !== "OR" &&
        renderInpatientWardConsole()}
    </div>
  );
}
