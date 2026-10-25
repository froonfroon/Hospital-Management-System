"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n-context";
import { useAuth } from "@/auth/auth-context";
import { hospitalDataAdapter } from "@/api/adapter";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { Patient } from "@/types/patient";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { PatientClinicalDrawer } from "@/features/patients/components/patient-clinical-drawer";
import {
  Activity,
  Bed,
  Users,
  AlertTriangle,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  ShieldAlert,
  Building2,
  Clock,
  Eye,
  CheckCircle2,
  UserPlus,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function DashboardOverview() {
  const { locale, t } = useI18n();
  const { activeDepartment } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [deptCategory, setDeptCategory] = useState<"all" | "inpatient" | "critical" | "diagnostics">("all");
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    hospitalDataAdapter.getPatients({ page: 1, pageSize: 6 }).then((res) => {
      setPatients(res.data);
      setLoading(false);
    });

    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString(locale === "ar" ? "ar-EG" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [locale]);

  const isAr = locale === "ar";

  // Calculations across all 15 hospital departments
  const totalBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.totalBeds, 0);
  const occupiedBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const overallOccupancy = Math.round((occupiedBeds / totalBeds) * 100);
  const totalCriticalCases = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.criticalCases, 0);
  const totalDoctors = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.onDutyPhysicians, 0);
  const totalNurses = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.onDutyNurses, 0);

  // Filter departments by category tab
  const filteredDepartments = HOSPITAL_DEPARTMENTS.filter((d) => {
    if (deptCategory === "inpatient") return d.totalBeds > 0 && d.code !== "ICU" && d.code !== "ED";
    if (deptCategory === "critical") return d.code === "ICU" || d.code === "ED" || d.code === "OR";
    if (deptCategory === "diagnostics") return d.totalBeds === 0 || d.code === "RAD" || d.code === "LAB" || d.code === "PHARM";
    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. CLEAN & PROFESSIONAL HOSPITAL OPERATIONS HEADER */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "مركز القيادة السريرية: تشغيل طبي نشط" : "CLINICAL COMMAND: ACTIVE"}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50">
                <Clock className="h-3 w-3 text-cyan-600" />
                <span>{currentTime || "12:00:00"}</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {isAr ? "كود المنشأة:" : "Facility Code:"}{" "}
                <strong className="text-slate-800 font-mono font-bold">SOLVE-GEN-01</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {isAr ? "لوحة العمليات السريرية المركزية" : "Hospital Operations & Clinical Command Overview"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
              {isAr
                ? "مراقبة حية للطاقة الاستيعابية للأسرة عبر 15 قسماً، وفرز حالات الطوارئ، وتدفق الرعاية السريرية للمرضى."
                : "Real-time surveillance of inpatient capacity across 15 hospital units, emergency acuity distribution, and clinical throughput."}
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href="/patients">
              <Button size="sm" className="gap-2 font-semibold text-xs shadow-xs">
                <UserPlus className="h-4 w-4" />
                <span>{isAr ? "تسجيل مريض جديد" : "Admit New Patient"}</span>
              </Button>
            </Link>
            <Link href="/departments">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                <Bed className="h-4 w-4 text-cyan-600" />
                <span>{isAr ? "إحصاء كافة الأسرة" : "Inspect Bed Board"}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Hospital Telemetry Status Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">{isAr ? "مستوى الجاهزية:" : "Surge Status:"}</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isAr ? "طبيعي (المستوى 1)" : "Code Green (Normal Operations)"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">{isAr ? "فريق التدخل السريع:" : "Rapid Response Team:"}</span>
              <span className="font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100 font-mono text-[11px]">RRT-1 & RRT-2 Standby</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider">{isAr ? "متوسط انتظار الطوارئ:" : "Avg ER Door-to-Doctor:"}</span>
              <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">14 mins</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>{isAr ? "القسم المعروض:" : "Active Context:"}</span>
            <span className="font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-100">
              {isAr ? activeDepartment.nameAr : activeDepartment.nameEn}
            </span>
          </div>
        </div>
      </div>

      {/* 2. RESTRAINED CLINICAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Hospital Inpatients */}
        <StatCard
          title={isAr ? "إجمالي المنومين بالمستشفى" : "Total Hospital Inpatients"}
          value={occupiedBeds}
          subtitle={isAr ? `نسبة إشغال ${overallOccupancy}% من إجمالي ${totalBeds} سرير` : `${overallOccupancy}% bed census (${totalBeds} total beds)`}
          icon={<Users className="h-4 w-4 text-cyan-700" />}
          progress={{
            current: occupiedBeds,
            total: totalBeds,
            percent: overallOccupancy,
            colorClass: overallOccupancy >= 85 ? "bg-amber-600" : "bg-cyan-700",
          }}
        />

        {/* Card 2: High Acuity & STAT Cases */}
        <StatCard
          title={isAr ? "الحالات عالية الخطورة (STAT)" : "Critical Acuity Cases"}
          value={totalCriticalCases}
          subtitle={isAr ? "رعاية مستمرة 1:1 في العناية المركزة والطوارئ" : "ICU & ED Bedside continuous 1:1 care"}
          icon={<ShieldAlert className="h-4 w-4 text-red-600" />}
          badge={
            <StatusBadge variant="critical" size="sm" showIcon>
              {isAr ? "أولوية 1 و 2" : "Priority 1 & 2"}
            </StatusBadge>
          }
          trend={{ value: isAr ? "طاقم مخصص 1:1" : "Staffed 1:1", isPositive: true }}
        />

        {/* Card 3: Immediately Available Clean Beds */}
        <StatCard
          title={isAr ? "الأسرة المتاحة فوراً" : "Immediately Available Beds"}
          value={availableBeds}
          subtitle={isAr ? "أسرة شاغرة ومعقمة جاهزة للتنويم" : "Cleaned & prepped for intake"}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          trend={{ value: isAr ? "3 أسرة عناية فائقة" : "3 ICU beds free", isPositive: true }}
          badge={
            <StatusBadge variant="stable" size="sm" showIcon>
              {isAr ? "جاهز" : "Ready"}
            </StatusBadge>
          }
        />

        {/* Card 4: Clinical Personnel on Duty */}
        <StatCard
          title={isAr ? "الكادر الطبي على رأس العمل" : "Active Clinical Staff"}
          value={totalDoctors + totalNurses}
          subtitle={isAr ? `${totalDoctors} طبيب • ${totalNurses} كادر تمريض` : `${totalDoctors} Physicians • ${totalNurses} RNs`}
          icon={<Stethoscope className="h-4 w-4 text-blue-600" />}
          badge={
            <StatusBadge variant="routine" size="sm" showIcon>
              {isAr ? "اكتمال المناوبة" : "Full Roster"}
            </StatusBadge>
          }
        />
      </div>

      {/* 3. EMERGENCY ACUITY SPECTRUM BAR (شريط توزيع درجات فرز الحالات) */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-700 shrink-0" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "توزيع درجات فرز الحالات السريرية (Emergency Acuity Triage)" : "Emergency Triage Acuity Spectrum"}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            CTAS / ESI 5-Level International Triage Scale
          </span>
        </div>

        {/* Multi-segment Acuity Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-start">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-900 uppercase">
                {isAr ? "المستوى 1 (إنعاش)" : "Level 1 (Resus)"}
              </span>
              <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-red-950 mt-1">2</div>
            <div className="text-[10px] text-red-700 font-semibold mt-0.5">
              {isAr ? "تدخل فوري عند السرير" : "Immediate Bedside"}
            </div>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50/70 p-3 text-start">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-orange-900 uppercase">
                {isAr ? "المستوى 2 (طارئ جداً)" : "Level 2 (Emergent)"}
              </span>
              <span className="h-2 w-2 rounded-full bg-orange-500" />
            </div>
            <div className="text-xl font-bold text-orange-950 mt-1">6</div>
            <div className="text-[10px] text-orange-700 font-semibold mt-0.5">
              {isAr ? "أقل من 15 دقيقة" : "< 15 mins target"}
            </div>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-start">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-900 uppercase">
                {isAr ? "المستوى 3 (عاجل)" : "Level 3 (Urgent)"}
              </span>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-950 mt-1">18</div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
              {isAr ? "أقل من 30 دقيقة" : "< 30 mins target"}
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-3 text-start">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase">
                {isAr ? "المستوى 4 (أقل إلحاحاً)" : "Level 4 (Less Urgent)"}
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-950 mt-1">24</div>
            <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
              {isAr ? "أقل من 60 دقيقة" : "< 60 mins target"}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-start col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-900 uppercase">
                {isAr ? "المستوى 5 (غير عاجل)" : "Level 5 (Non-Urgent)"}
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-950 mt-1">12</div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              {isAr ? "عيادات روتينية" : "Routine Clinic Intake"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN SPLIT: ALL-DEPARTMENT MATRIX & LIVE CLINICAL INPATIENT MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: ALL 15 Hospital Departments Capacity Matrix */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-cyan-700" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {isAr ? "مصفوفة الطاقة الاستيعابية لأقسام المستشفى (15 قسماً)" : "Hospital Departments Capacity Matrix (15 Units)"}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isAr ? "إحصاء حقيقي لنسبة الإشغال، والأسرة الشاغرة، وتوزيع الكادر الطبي" : "Real-time census, open bed availability, and staffing allocations"}
                </p>
              </div>

              {/* Department Filter Tabs */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setDeptCategory("all")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    deptCategory === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isAr ? "الكل (15)" : "All (15)"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeptCategory("inpatient")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    deptCategory === "inpatient" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isAr ? "أجنحة التنويم" : "Inpatient"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeptCategory("critical")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    deptCategory === "critical" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isAr ? "الحرجة والطوارئ" : "Critical/OR"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeptCategory("diagnostics")}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    deptCategory === "diagnostics" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {isAr ? "التشخيص والصيدلية" : "Diagnostics"}
                </button>
              </div>
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDepartments.map((dept) => {
                const percent = dept.totalBeds > 0 ? Math.round((dept.occupiedBeds / dept.totalBeds) * 100) : 0;
                const isHigh = percent >= 85;

                return (
                  <div
                    key={dept.id}
                    className="rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900">
                            {isAr ? dept.nameAr : dept.nameEn}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-900 bg-cyan-100/70 px-1 rounded font-semibold">
                            {dept.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {dept.floor} • {dept.wing}
                        </span>
                      </div>

                      {dept.totalBeds > 0 ? (
                        <StatusBadge variant={isHigh ? "warning" : "stable"} size="sm">
                          {percent}%
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="routine" size="sm">
                          {isAr ? "خدمة نشطة" : "Active Service"}
                        </StatusBadge>
                      )}
                    </div>

                    {dept.totalBeds > 0 && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600">
                          <span>{isAr ? "الاستيعاب:" : "Capacity:"}</span>
                          <span className="font-semibold text-slate-800">
                            {isAr
                              ? `${dept.occupiedBeds} مشغول / ${dept.availableBeds} شاغر (${dept.totalBeds} إجمالي)`
                              : `${dept.occupiedBeds} occupied / ${dept.availableBeds} free (${dept.totalBeds} total)`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isHigh ? "bg-amber-600" : "bg-cyan-700"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>{isAr ? "أطباء:" : "Doctors:"} <strong className="text-slate-800">{dept.onDutyPhysicians}</strong></span>
                        <span>•</span>
                        <span>{isAr ? "تمريض:" : "Nurses:"} <strong className="text-slate-800">{dept.onDutyNurses}</strong></span>
                      </div>
                      <Link
                        href={`/departments?dept=${dept.id}`}
                        className="font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-0.5"
                      >
                        <span>{isAr ? "عرض التفاصيل" : "Census"}</span>
                        <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Inpatient Acuity & Triage Live List */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? "الحالات السريرية النشطة بالوقت الفعلي" : "Real-time Clinical Encounters & Triage Monitor"}
                </h3>
              </div>
              <Link
                href="/patients"
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
              >
                <span>{isAr ? "عرض كافة المرضى" : "Full Registry"}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {patients.map((p) => {
                const name = isAr ? p.fullNameAr : p.fullNameEn;
                const diag = isAr ? p.primaryDiagnosisAr : p.primaryDiagnosisEn;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors gap-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                        {p.gender === "female" ? "♀" : "♂"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{name}</span>
                          <span className="font-mono text-[10px] text-cyan-900 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded font-semibold">
                            {p.mrn}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {p.age} {isAr ? "سنة" : "y"} ({p.gender})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                          {diag}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ms-10 sm:ms-0">
                      <div className="flex items-center gap-1 text-xs text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Bed className="h-3 w-3 text-slate-500" />
                        <span>{p.bed.bedNumber}</span>
                      </div>
                      <StatusBadge
                        variant={
                          p.triageLevel === "1_resuscitation"
                            ? "critical"
                            : p.triageLevel === "2_emergent"
                            ? "urgent"
                            : p.triageLevel === "3_urgent"
                            ? "warning"
                            : "stable"
                        }
                        size="sm"
                        showIcon
                      >
                        {p.triageLevel.replace("_", " ").toUpperCase()}
                      </StatusBadge>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(p);
                        }}
                        title={isAr ? "عرض الملف الطبي" : "View Clinical Chart"}
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500 hover:text-cyan-700" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Hemodynamics, Flow Feed & Shift Handover */}
        <div className="space-y-5">
          {/* Bedside Live Telemetry Monitor */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? "مراقبة المؤشرات الحيوية بالوقت الفعلي" : "Live Bedside Telemetry Stream"}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-900 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded font-semibold">ICU POD A</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {isAr ? "زيد الغامدي (سرير ICU-04)" : "Zaid Al-Ghamdi (Bed ICU-04)"}
                </span>
                <span className="text-[10px] text-red-700 font-bold uppercase bg-red-50 border border-red-200 px-1.5 py-0.2 rounded">
                  {isAr ? "حالة حرجة" : "Critical"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="rounded bg-white p-1.5 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">{isAr ? "نبض القلب" : "Heart Rate"}</div>
                  <div className="text-base font-bold text-red-700">110 <span className="text-[10px] font-normal text-slate-400">bpm</span></div>
                </div>
                <div className="rounded bg-white p-1.5 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">{isAr ? "ضغط الدم" : "Blood Press"}</div>
                  <div className="text-base font-bold text-slate-900">92/55</div>
                </div>
                <div className="rounded bg-white p-1.5 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">{isAr ? "الأكسجين" : "SpO2"}</div>
                  <div className="text-base font-bold text-amber-700">91%</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {isAr ? "طارق الحربي (سرير 304-A)" : "Tariq Al-Harbi (Bed 304-A)"}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                  {isAr ? "مستقر بعد القسطرة" : "Stable Post-Cath"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                <div className="rounded bg-white p-1.5 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">{isAr ? "نبض القلب" : "Heart Rate"}</div>
                  <div className="text-base font-bold text-emerald-700">88 <span className="text-[10px] font-normal text-slate-400">bpm</span></div>
                </div>
                <div className="rounded bg-white p-1.5 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">{isAr ? "ضغط الدم" : "Blood Press"}</div>
                  <div className="text-base font-bold text-slate-900">138/86</div>
                </div>
                <div className="rounded bg-white p-1.5 border border-slate-200">
                  <div className="text-[9px] text-slate-500 uppercase font-sans">{isAr ? "الأكسجين" : "SpO2"}</div>
                  <div className="text-base font-bold text-emerald-700">97%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Shift Handover & Timeline */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? "سجل العمليات والتحويلات السريرية" : "Clinical Handover Log"}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">2h window</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="border-s-2 border-red-500 ps-3 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {isAr ? "تنويم طارئ - جلطة قلبية STAT" : "STAT NSTEMI Admission"}
                  </span>
                  <span className="text-[10px] text-slate-400">{isAr ? "منذ 10 د" : "10m ago"}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isAr ? "تم تخصيص السرير 304-A في قسم أمراض القلب للمريض طارق الحربي" : "Tariq Al-Harbi (MRN-2026-4412) allocated Bed 304-A Cardiology."}
                </p>
                <span className="text-[10px] font-semibold text-cyan-800">
                  {isAr ? "د. سارة تميمي، استشاري" : "Dr. Sarah Chen, MD"}
                </span>
              </div>

              <div className="border-s-2 border-emerald-500 ps-3 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {isAr ? "إفاقة ما بعد الجراحة" : "Post-Op OR Recovery"}
                  </span>
                  <span className="text-[10px] text-slate-400">{isAr ? "منذ 32 د" : "32m ago"}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isAr ? "تم نقل نورة العتيبي لجناح الجراحة العامة بحالة مستقرة" : "Noura Al-Otaibi transferred to Surgery Bed 412-B in stable condition."}
                </p>
                <span className="text-[10px] font-semibold text-cyan-800">
                  {isAr ? "د. طارق فانس، استشاري جراحة" : "Dr. Marcus Vance, FACS"}
                </span>
              </div>

              <div className="border-s-2 border-blue-500 ps-3 py-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {isAr ? "اعتماد خروج مريض" : "Discharge Authorized"}
                  </span>
                  <span className="text-[10px] text-slate-400">{isAr ? "منذ ساعة" : "1h ago"}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isAr ? "اكتملت وصفات الخروج الدوائية والملخص الطبي للمريض فهد الدوسري" : "Fahad Al-Dosari discharge papers & pharmacy prescriptions finalized."}
                </p>
                <span className="text-[10px] font-semibold text-cyan-800">
                  {isAr ? "ممرض معتمد: أحمد سالم" : "Staff Nurse Ahmed Salem"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Clinical Inspection Drawer */}
      <PatientClinicalDrawer
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}
