"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n-context";
import { hospitalDataAdapter } from "@/api/adapter";
import { Doctor, DoctorSchedule, DoctorVerificationStatus } from "@/types/staff";
import { Patient } from "@/types/patient";
import { DepartmentAssignment } from "@/types/clinical";
import { PatientClinicalDrawer } from "@/features/patients/components/patient-clinical-drawer";
import {
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Users,
  Award,
  FileText,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Ban,
  Activity,
  Bed,
  Printer,
  HeartPulse,
  Syringe,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DoctorWorkspaceClientProps {
  doctorId: string;
}

export function DoctorWorkspaceClient({ doctorId }: DoctorWorkspaceClientProps) {
  const { locale, direction } = useI18n();
  const isAr = locale === "ar";

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DoctorSchedule | null>(null);
  const [assignedPatients, setAssignedPatients] = useState<Patient[]>([]);
  const [consultations, setConsultations] = useState<DepartmentAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<"patients" | "encounters" | "schedule" | "credentials">("patients");
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<Patient | null>(null);
  const [isActionPending, startTransition] = useTransition();

  // Audit modal state
  const [auditModalAction, setAuditModalAction] = useState<"verify" | "suspend" | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const loadData = () => {
    startTransition(async () => {
      try {
        const docRes = await hospitalDataAdapter.getDoctorById(doctorId);
        setDoctor(docRes.data);

        const schRes = await hospitalDataAdapter.getDoctorSchedule(doctorId);
        setSchedule(schRes.data);

        // Fetch patients assigned to this doctor or primary department
        const patRes = await hospitalDataAdapter.getPatients({ page: 1, pageSize: 50 });
        const filtered = patRes.data.filter(
          (p) =>
            p.attendingPhysician.toLowerCase().includes(docRes.data.legalNameEn.toLowerCase()) ||
            p.attendingPhysician.toLowerCase().includes(docRes.data.legalNameAr.toLowerCase()) ||
            docRes.data.legalNameEn.toLowerCase().includes(p.attendingPhysician.toLowerCase()) ||
            p.departmentId === docRes.data.primaryDepartmentId
        );
        setAssignedPatients(filtered);

        // Fetch consults / assignments where doctor is requester, destination, or assigned
        const asgRes = await hospitalDataAdapter.getDepartmentAssignments();
        const myConsults = asgRes.data.filter(
          (a) =>
            a.destinationDepartmentId === docRes.data.primaryDepartmentId ||
            a.sourceDepartmentId === docRes.data.primaryDepartmentId ||
            a.assignedPractitioner?.id === docRes.data.id ||
            a.requestedBy?.id === docRes.data.id
        );
        setConsultations(myConsults);
      } catch (err) {
        console.error("Error loading doctor workspace", err);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, [doctorId]);

  const handleUpdateStatus = (newStatus: DoctorVerificationStatus, reason?: string) => {
    startTransition(async () => {
      try {
        const res = await hospitalDataAdapter.updateDoctorVerification(
          doctorId,
          newStatus,
          reason,
          {
            userId: "usr-admin-director",
            name: "Dr. Khalid Mansoor (Medical Director)",
          }
        );
        setDoctor(res.data);
        setAuditModalAction(null);
        setSuspendReason("");
      } catch (err) {
        console.error("Failed to update status", err);
      }
    });
  };

  if (!doctor) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">
            {isAr ? "جاري تحميل ملف مساحة عمل الطبيب..." : "Loading physician workspace..."}
          </p>
        </div>
      </div>
    );
  }

  const daysOfWeekEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daysOfWeekAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const criticalCasesCount = assignedPatients.filter(
    (p) => p.triageLevel === "1_resuscitation" || p.triageLevel === "2_emergent"
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── BREADCRUMB & BACK HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/doctors"
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition-colors"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span>{isAr ? "العودة لسجل الأطباء" : "Physicians Directory"}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-900">
            {isAr ? doctor.legalNameAr : doctor.legalNameEn}
          </span>
          <span className="rounded bg-cyan-100 text-cyan-800 border border-cyan-300 px-2 py-0.5 text-[10px] font-bold">
            {doctor.employeeId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? "على رأس العمل - طوارئ" : "On Duty - Active"}</span>
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>{isAr ? "طباعة السجل والاعتماد" : "Print Credential"}</span>
          </button>
        </div>
      </div>

      {/* ── EXECUTIVE DOCTOR HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#071936] text-white p-6 md:p-7 shadow-xl border border-slate-800">
        {/* Ambient background glow */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Doctor Primary Identification */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 text-white font-black text-2xl shadow-lg border-2 border-cyan-400/30">
              {doctor.legalNameEn
                .split(" ")
                .slice(-2)
                .map((n) => n[0])
                .join("")}
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900" title="Active On Duty" />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {doctor.title} {isAr ? doctor.legalNameAr : doctor.legalNameEn}
                </h1>

                {/* Verification Badge */}
                {doctor.verificationStatus === "verified" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 text-xs font-bold shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>{isAr ? "ترخيص معتمد - هيئة التخصصات (SCFHS)" : "Verified Medical Board License"}</span>
                  </span>
                )}
                {doctor.verificationStatus === "pending_verification" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 text-xs font-bold">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span>{isAr ? "قيد التدقيق السريري" : "Pending Audit"}</span>
                  </span>
                )}
                {doctor.verificationStatus === "suspended" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 text-xs font-bold">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>{isAr ? "موقوف مؤقتاً" : "Suspended"}</span>
                  </span>
                )}
              </div>

              {/* Specialty & Board Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 text-xs font-bold">
                  {doctor.primarySpecialty}
                </span>
                {doctor.subspecialty && (
                  <span className="rounded-md bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 text-xs font-medium">
                    {doctor.subspecialty}
                  </span>
                )}
                <span className="rounded-md bg-slate-800 text-slate-300 border border-slate-700 px-2 py-1 text-xs font-mono font-semibold">
                  {isAr ? "الترخيص:" : "License:"} {doctor.licenseNumber}
                </span>
              </div>

              {/* Contact & Location Strip */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300 pt-2">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <strong className="text-white">{isAr ? doctor.primaryDepartmentNameAr : doctor.primaryDepartmentNameEn}</strong>
                </span>
                {doctor.roomNumber && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                    <span>{isAr ? "المكتب / العيادة:" : "Room:"} <strong>{doctor.roomNumber}</strong></span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-cyan-400" />
                  <span>{doctor.officePhone}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>{doctor.professionalEmail}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Medical Governance Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
            {doctor.verificationStatus === "pending_verification" && (
              <button
                type="button"
                onClick={() => setAuditModalAction("verify")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                <span>{isAr ? "اعتماد الترخيص السريري" : "Approve Credentials"}</span>
              </button>
            )}

            {doctor.verificationStatus === "verified" && (
              <button
                type="button"
                onClick={() => setAuditModalAction("suspend")}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                <Ban className="h-4 w-4 text-rose-400" />
                <span>{isAr ? "إيقاف الصلاحيات مؤقتاً" : "Suspend Privileges"}</span>
              </button>
            )}

            {doctor.verificationStatus === "suspended" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("verified")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                <span>{isAr ? "إعادة تفعيل الصلاحيات" : "Reinstate Privileges"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Audit & Compliance Verification Ribbon */}
        {doctor.verifiedBy && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 items-center justify-center shrink-0">
                ✓
              </span>
              <span>
                {isAr ? "تم التدقيق والاعتماد السريري بواسطة:" : "Audited & Verified by:"}{" "}
                <strong className="text-white font-bold">{doctor.verifiedBy.name}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>{isAr ? "تاريخ الاعتماد:" : "Verified Date:"} {new Date(doctor.verifiedBy.timestamp).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono font-bold">CBAHI & SCFHS COMPLIANT</span>
            </div>
          </div>
        )}

        {doctor.suspendedReason && (
          <div className="mt-4 rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>
              <strong>{isAr ? "سبب الإيقاف المؤقت:" : "Suspension Reason:"}</strong> {doctor.suspendedReason}
            </span>
          </div>
        )}
      </div>

      {/* ── CLINICAL OPERATIONAL KPIS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Active Inpatients */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow border-t-4 border-t-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "المرضى المتابعون" : "Assigned Inpatients"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{assignedPatients.length}</span>
            <span className="text-xs font-semibold text-slate-500">{isAr ? "مرضى منومين" : "inpatients"}</span>
          </div>
          <p className="mt-1 text-[11px] text-cyan-700 font-medium">
            {isAr ? "تحت الرعاية السريرية المباشرة" : "Under direct clinical care"}
          </p>
        </div>

        {/* KPI 2: Critical Resuscitation Cases */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow border-t-4 border-t-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "حالات الإنعاش والحرجة" : "Critical Resuscitation"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{criticalCasesCount}</span>
            <span className="text-xs font-semibold text-slate-500">{isAr ? "حالات STAT" : "STAT cases"}</span>
          </div>
          <p className="mt-1 text-[11px] text-rose-700 font-medium">
            {isAr ? "تصنيف فرز 1 و 2 (إنعاش وطوارئ)" : "Triage Level 1 & 2 Resus"}
          </p>
        </div>

        {/* KPI 3: Consultations & Transfers */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow border-t-4 border-t-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "الاستشارات المشتركة" : "Active Consults"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{consultations.length}</span>
            <span className="text-xs font-semibold text-slate-500">{isAr ? "طلبات إحالة" : "referral orders"}</span>
          </div>
          <p className="mt-1 text-[11px] text-purple-700 font-medium">
            {isAr ? "بين الأقسام التخصصية والحرجة" : "Cross-departmental care"}
          </p>
        </div>

        {/* KPI 4: License & Credential Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isAr ? "الترخيص المهني" : "Medical License"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-emerald-700">
              {isAr ? "ساري الصلاحية" : "Valid & Active"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {isAr ? `ينتهي في ${doctor.licenseExpiryDate}` : `Expires ${doctor.licenseExpiryDate}`}
          </p>
        </div>
      </div>

      {/* ── WORKSPACE TABS NAVIGATION ── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("patients")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs",
            activeTab === "patients"
              ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-500/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Users className="h-4 w-4" />
          <span>{isAr ? "المرضى المتابعون" : "Assigned Inpatients"}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              activeTab === "patients" ? "bg-white/20 text-white" : "bg-cyan-100 text-cyan-800"
            )}
          >
            {assignedPatients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("encounters")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs",
            activeTab === "encounters"
              ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-500/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Activity className="h-4 w-4" />
          <span>{isAr ? "الاستشارات والإحالات" : "Consults & Transfers"}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              activeTab === "encounters" ? "bg-white/20 text-white" : "bg-purple-100 text-purple-800"
            )}
          >
            {consultations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schedule")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs",
            activeTab === "schedule"
              ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-500/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Calendar className="h-4 w-4" />
          <span>{isAr ? "الجدول والمناوبات الأسبوعية" : "Schedule & On-Call"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs",
            activeTab === "credentials"
              ? "bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-500/20"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <FileText className="h-4 w-4" />
          <span>{isAr ? "مستندات التراخيص والاعتماد" : "Credentials & Docs"}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold",
              activeTab === "credentials" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            )}
          >
            {doctor.credentials.length}
          </span>
        </button>
      </div>

      {/* ── TAB 1: ASSIGNED PATIENTS ── */}
      {activeTab === "patients" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? "قائمة المرضى تحت الرعاية السريرية المباشرة" : "Patients Under Direct Clinical Care"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "مرضى الجناح ومنطقة الإنعاش المخصصين للطبيب في الوقت الفعلي"
                  : "Active census of inpatients currently admitted or observed"}
              </p>
            </div>
            <span className="rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-1 text-xs font-bold">
              {assignedPatients.length} {isAr ? "مرضى نشطين" : "active patients"}
            </span>
          </div>

          {assignedPatients.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Users className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {isAr ? "لا يوجد مرضى مخصصون حالياً لهذا الطبيب" : "No active patients currently assigned"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isAr
                  ? "يمكنك تخصيص مرضى للطبيب عبر فهرس المرضى أو تحويل حالات الإنعاش من قسم الطوارئ."
                  : "You can assign patients to this physician from the Patient Master Index or transfer cases from ED triage."}
              </p>
              <Link
                href="/patients"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold shadow-2xs transition-colors"
              >
                <span>{isAr ? "الانتقال لفهرس المرضى والتنويم" : "Browse Patient Registry"}</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedPatients.map((pat) => {
                const isResus = pat.triageLevel === "1_resuscitation";
                const isEmergent = pat.triageLevel === "2_emergent";

                return (
                  <div
                    key={pat.id}
                    className={cn(
                      "rounded-2xl border bg-white p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4",
                      isResus
                        ? "border-rose-300 ring-1 ring-rose-500/20"
                        : isEmergent
                        ? "border-amber-300 ring-1 ring-amber-500/20"
                        : "border-slate-200"
                    )}
                  >
                    <div className="space-y-3">
                      {/* Patient Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 hover:text-cyan-700 transition-colors">
                              {isAr ? pat.fullNameAr : pat.fullNameEn}
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono font-bold text-slate-700">{pat.mrn}</span> • {pat.age}y • {pat.gender.toUpperCase()} • {pat.bloodType}
                          </p>
                        </div>

                        {/* Bed Location Tag */}
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-1 text-xs font-bold shrink-0">
                          <Bed className="h-3.5 w-3.5 text-cyan-600" />
                          <span>{pat.bed.bedNumber}</span>
                        </span>
                      </div>

                      {/* Triage Level Ribbon */}
                      <div className="flex items-center gap-2">
                        {isResus && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold shadow-2xs animate-pulse">
                            <HeartPulse className="h-3 w-3" />
                            <span>{isAr ? "إنعاش فوري STAT (مستوى 1)" : "Level 1 Resuscitation"}</span>
                          </span>
                        )}
                        {isEmergent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-extrabold shadow-2xs">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{isAr ? "طوارئ حادة (مستوى 2)" : "Level 2 Emergent"}</span>
                          </span>
                        )}
                        {!isResus && !isEmergent && (
                          <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold">
                            {pat.triageLevel.replace(/_/g, " ")}
                          </span>
                        )}
                        <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-semibold">
                          {pat.departmentNameEn}
                        </span>
                      </div>

                      {/* Diagnosis */}
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs">
                        <p className="font-bold text-slate-800 line-clamp-2">
                          {isAr ? pat.primaryDiagnosisAr : pat.primaryDiagnosisEn}
                        </p>
                      </div>

                      {/* Real-Time Vitals Strip */}
                      {pat.latestVitals && (
                        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-1.5">
                            <span className="text-slate-400 block text-[9px]">HR</span>
                            <span className="font-bold text-slate-800">{pat.latestVitals.heartRate} bpm</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-1.5">
                            <span className="text-slate-400 block text-[9px]">BP</span>
                            <span className="font-bold text-slate-800">
                              {pat.latestVitals.systolicBP}/{pat.latestVitals.diastolicBP}
                            </span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-1.5">
                            <span className="text-slate-400 block text-[9px]">SpO2</span>
                            <span className="font-bold text-slate-800">{pat.latestVitals.oxygenSaturation}%</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 border border-slate-200 p-1.5">
                            <span className="text-slate-400 block text-[9px]">Temp</span>
                            <span className="font-bold text-slate-800">{pat.latestVitals.temperature}°C</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Patient Card Action */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="text-[11px] text-slate-400">
                        {isAr ? "تاريخ التنويم:" : "Admitted:"} {new Date(pat.admissionDate).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedPatientForDrawer(pat)}
                        className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>{isAr ? "فتح الملف السريري" : "Open Chart"}</span>
                        {isAr ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: CONSULTS & TRANSFERS ── */}
      {activeTab === "encounters" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? "الاستشارات المشتركة وطلبات الإحالة بين الأقسام" : "Interdepartmental Consultations & Transfers"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "متابعة الحالات المشتركة بين الطوارئ، العناية المركزة، والعمليات"
                  : "Collaborative care requests, specialist evaluations, and emergency transfers"}
              </p>
            </div>
            <span className="rounded-lg bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 text-xs font-bold">
              {consultations.length} {isAr ? "استشارات" : "consults"}
            </span>
          </div>

          {consultations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <Activity className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                {isAr ? "لا توجد طلبات استشارة معلقة" : "No pending consultations"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isAr
                  ? "لا توجد طلبات استشارة واردة أو صادرة في الوقت الحالي."
                  : "All cross-departmental consultations and transfer requests are currently up to date."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-purple-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {c.patientName}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">({c.patientMrn})</span>
                      <span className="rounded-md bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {c.assignmentType.replace(/_/g, " ")}
                      </span>
                      {c.status === "accepted" && (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                          {isAr ? "مقبول" : "Accepted"}
                        </span>
                      )}
                      {c.status === "pending" && (
                        <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold animate-pulse">
                          {isAr ? "قيد الانتظار" : "Pending Review"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="rounded bg-slate-100 px-2 py-0.5">{c.sourceDepartmentNameEn}</span>
                      <span>→</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-cyan-800 font-bold">{c.destinationDepartmentNameEn}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-normal">{c.reason}</span>
                    </div>

                    {c.clinicalSummary && (
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                        {c.clinicalSummary}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-400">
                      {isAr ? "مقدم الطلب:" : "Requested by:"} <strong>{c.requestedBy.name}</strong> ({c.requestedBy.role}) • {new Date(c.requestTimestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {isAr ? "عرض التفاصيل السريرية" : "View Clinical Details"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: SCHEDULE & ON-CALL ── */}
      {activeTab === "schedule" && (
        <div className="space-y-6">
          {/* Weekly Clinical Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-cyan-600" />
                <span>{isAr ? "الجدول الأسبوعي للعيادات والجولات السريرية" : "Weekly Clinical & Surgical Schedule"}</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {isAr ? "توزيع أوقات العيادات وغرف العمليات" : "Clinical timing & operating suites"}
              </span>
            </div>

            {schedule?.weeklySlots && schedule.weeklySlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schedule.weeklySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3 hover:border-cyan-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-cyan-100 text-cyan-800 border border-cyan-300 px-2.5 py-1 text-xs font-extrabold uppercase">
                        {isAr ? daysOfWeekAr[slot.dayOfWeek] : daysOfWeekEn[slot.dayOfWeek]}
                      </span>
                      <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-mono font-bold">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900">
                      {isAr ? slot.departmentNameAr : slot.departmentNameEn}
                    </h4>

                    <div className="text-xs text-slate-600 space-y-1.5 pt-1 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? "الموقع / الغرفة:" : "Room / Suite:"}</span>
                        <strong className="text-slate-800">{slot.roomNumber}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? "نوع النشاط:" : "Activity Type:"}</span>
                        <span className="capitalize font-semibold text-cyan-700">{slot.activityType.replace(/_/g, " ")}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">{isAr ? "السعة القصوى:" : "Max Capacity:"}</span>
                        <span className="font-bold text-slate-800">{slot.maxPatients} {isAr ? "مرضى" : "patients"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                {isAr ? "لا توجد فترات مجدولة حالياً" : "No recurring weekly slots configured"}
              </div>
            )}
          </div>

          {/* On-Call Emergency Coverage */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                <span>{isAr ? "مناوبات الطوارئ وتغطية الأقسام (On-Call Roster)" : "On-Call Emergency Coverage Roster"}</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {isAr ? "جدول التغطية السريرية الإلزامية" : "Mandatory clinical coverage shifts"}
              </span>
            </div>

            {schedule?.onCallDates && schedule.onCallDates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedule.onCallDates.map((oc, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex items-center justify-between hover:border-emerald-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-900">
                        {new Date(oc.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {oc.coverageDepartmentName} • <strong className="text-slate-700 uppercase">{oc.shift} Shift</strong>
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold uppercase shadow-2xs">
                      {oc.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                {isAr ? "لا توجد مناوبات قادمة" : "No upcoming on-call shifts"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: CREDENTIALS & DOCUMENTS ── */}
      {activeTab === "credentials" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? "المستندات والشهادات المعتمدة من لجنة الاعتماد المهني" : "Audited Credential Documents & Certifications"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr
                  ? "سجلات الاعتماد المؤسسي، مطابقة الهيئة السعودية للتخصصات الصحية ومعايير سباهي"
                  : "Verified hospital credentialing committee records and SCFHS accreditation"}
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-xs font-bold">
              {doctor.credentials.length} {isAr ? "مستندات موثقة" : "verified documents"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctor.credentials.map((crd) => (
              <div
                key={crd.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3 hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{crd.title}</h4>
                      <p className="text-[11px] text-slate-500 capitalize">{crd.documentType.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-0.5 text-xs font-bold uppercase shadow-2xs">
                    {crd.status}
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isAr ? "الجهة المصدرة:" : "Issuing Authority:"}</span>
                    <strong className="text-slate-800">{crd.issuingAuthority}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isAr ? "رقم الوثيقة:" : "Document Number:"}</span>
                    <strong className="font-mono text-slate-800">{crd.documentNumber}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isAr ? "فترة الصلاحية:" : "Validity Period:"}</span>
                    <span className="font-bold text-emerald-700">{crd.issueDate} → {crd.expiryDate}</span>
                  </div>
                  {crd.verifiedBy && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                      <span className="text-slate-400">{isAr ? "تم التحقق بواسطة:" : "Verified by:"}</span>
                      <span className="text-slate-700 font-medium">{crd.verifiedBy}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => alert(`Document: ${crd.title}\nRef: ${crd.documentNumber}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900 cursor-pointer"
                  >
                    <span>{isAr ? "معاينة الوثيقة المعتمدة" : "Preview Document"}</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AUDIT MODAL (VERIFY OR SUSPEND) ── */}
      {auditModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                {auditModalAction === "verify" ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span>{isAr ? "اعتماد وترخيص الطبيب سريرياً" : "Authorize & Verify Credentials"}</span>
                  </>
                ) : (
                  <>
                    <Ban className="h-5 w-5 text-rose-600" />
                    <span>{isAr ? "إيقاف الصلاحيات السريرية" : "Suspend Clinical Privileges"}</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setAuditModalAction(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {auditModalAction === "verify"
                ? isAr
                  ? `هل تؤكد مطابقة تراخيص ومؤهلات د. ${doctor.legalNameAr} مع هيئة التخصصات ومنحه صلاحيات علاج المرضى وإصدار الأوامر الطبية؟`
                  : `Confirm medical board license verification for ${doctor.legalNameEn}? This enables clinical encounter admission and prescribing.`
                : isAr
                ? `سيتم إيقاف صلاحيات د. ${doctor.legalNameAr} وحظر فتح أو تعديل سجلات المرضى حتى إعادة التدقيق من قبل المدير الطبي.`
                : `Suspend clinical privileges for ${doctor.legalNameEn}? Please provide the compliance or administrative rationale.`}
            </p>

            {auditModalAction === "suspend" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {isAr ? "سبب الإيقاف السريري / الإداري" : "Suspension Reason / Audit Note"} *
                </label>
                <textarea
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder={isAr ? "مثال: تدقيق تجديد الترخيص المهني أو انتظار مستندات الاعتماد..." : "e.g. Credential renewal audit or documentation pending..."}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAuditModalAction(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              {auditModalAction === "verify" ? (
                <button
                  type="button"
                  disabled={isActionPending}
                  onClick={() => handleUpdateStatus("verified")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isActionPending ? (isAr ? "جاري الاعتماد..." : "Authorizing...") : isAr ? "تأكيد الاعتماد" : "Confirm Verification"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isActionPending || !suspendReason.trim()}
                  onClick={() => handleUpdateStatus("suspended", suspendReason)}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isActionPending ? (isAr ? "جاري الإيقاف..." : "Suspending...") : isAr ? "تأكيد الإيقاف" : "Confirm Suspension"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PATIENT CLINICAL DRAWER INTEGRATION ── */}
      {selectedPatientForDrawer && (
        <PatientClinicalDrawer
          patient={selectedPatientForDrawer}
          isOpen={!!selectedPatientForDrawer}
          onClose={() => setSelectedPatientForDrawer(null)}
        />
      )}
    </div>
  );
}
