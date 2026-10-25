"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { LoadingStateView } from "@/components/common/state-views";
import { DepartmentWorkflowConsole } from "@/features/departments/components/department-workflow-console";
import {
  Building2,
  Bed,
  Users,
  AlertTriangle,
  CheckCircle2,
  Filter,
  UserPlus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

function DepartmentsContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const deptParam = searchParams.get("dept");

  const [selectedDeptId, setSelectedDeptId] = useState<string>("all");

  useEffect(() => {
    if (deptParam) {
      setSelectedDeptId(deptParam);
    }
  }, [deptParam]);

  const isAr = locale === "ar";

  const totalBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.totalBeds, 0);
  const occupiedBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.occupiedBeds, 0);
  const availableBeds = totalBeds - occupiedBeds;
  const criticalCases = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.criticalCases, 0);

  const filteredDepts =
    selectedDeptId === "all"
      ? HOSPITAL_DEPARTMENTS
      : HOSPITAL_DEPARTMENTS.filter((d) => d.id === selectedDeptId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: t.nav.clinicalWorkspace, href: "/" },
              { label: t.nav.inpatientCensus, current: true },
            ]}
          />
        }
        title={isAr ? "لوحة إحصاء أسرة التنويم والأقسام الطبية" : "Hospital Departments & Inpatient Bed Census"}
        subtitle={
          isAr
            ? "مراقبة حية لكافة الأقسام الـ 15، ونسب إشغال الأسرة، وجاهزية الغرف وكوادر التمريض"
            : "Real-time bed board census across all 15 clinical departments, room sanitization status, and nursing ratios"
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/patients">
              <Button size="sm" className="gap-1.5 font-semibold">
                <UserPlus className="h-3.5 w-3.5" />
                <span>{isAr ? "تسجيل مريض جديد" : "Admit Patient"}</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Aggregate Bed Board Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isAr ? "إجمالي أسرة المستشفى" : "Total Hospital Beds"}
          value={totalBeds}
          subtitle="Commissioned inpatient beds"
          icon={<Bed className="h-4 w-4" />}
        />
        <StatCard
          title={isAr ? "الأسرة المشغولة" : "Occupied Beds"}
          value={occupiedBeds}
          subtitle={`${Math.round((occupiedBeds / totalBeds) * 100)}% hospital-wide census`}
          icon={<Users className="h-4 w-4 text-cyan-600" />}
        />
        <StatCard
          title={isAr ? "الأسرة المتاحة فوراً" : "Immediately Available"}
          value={availableBeds}
          subtitle="Cleaned & prepped beds"
          trend={{ value: "Ready for intake", isPositive: true }}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title={isAr ? "الحالات الحرجة" : "High Acuity Cases"}
          value={criticalCases}
          subtitle="ICU & Telemetry monitored"
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
        />
      </div>

      {/* Department Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {isAr ? "تصفية الأقسام الطبية:" : "Filter Department:"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDeptId("all")}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
              selectedDeptId === "all"
                ? "bg-cyan-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {isAr ? "كافة الأقسام (15)" : "All Departments (15)"}
          </button>
          {HOSPITAL_DEPARTMENTS.slice(0, 6).map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDeptId(dept.id)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedDeptId === dept.id
                  ? "bg-cyan-700 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {dept.code}
            </button>
          ))}
          {selectedDeptId !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedDeptId("all")}
              className="text-xs text-cyan-700 underline ms-2 font-medium"
            >
              {isAr ? "عرض الكل" : "Reset Filter"}
            </button>
          )}
        </div>
      </div>

      {/* Active Department Clinical Workflow Console */}
      {selectedDeptId !== "all" && (() => {
        const selectedDept = HOSPITAL_DEPARTMENTS.find((d) => d.id === selectedDeptId);
        if (!selectedDept) return null;
        return (
          <DepartmentWorkflowConsole
            department={selectedDept}
            onReset={() => setSelectedDeptId("all")}
          />
        );
      })()}

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredDepts.map((dept) => {
          const occupancy = dept.totalBeds > 0 ? Math.round((dept.occupiedBeds / dept.totalBeds) * 100) : 0;
          const isHigh = occupancy >= 85;

          return (
            <div
              key={dept.id}
              className={`rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all space-y-3.5 ${
                dept.id === selectedDeptId ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {isAr ? dept.nameAr : dept.nameEn}
                    </h3>
                    <span className="font-mono text-xs text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-100 font-semibold">
                      {dept.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Floor: <strong>{dept.floor}</strong> • {dept.wing}
                  </div>
                </div>

                {dept.totalBeds > 0 ? (
                  <StatusBadge variant={isHigh ? "warning" : "stable"} size="sm">
                    {occupancy}% Occupancy
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="routine" size="sm">
                    Clinical Service
                  </StatusBadge>
                )}
              </div>

              {/* Progress bar */}
              {dept.totalBeds > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span>Bed Allocation:</span>
                    <span className="font-semibold text-slate-800">
                      {dept.occupiedBeds} occupied / {dept.availableBeds} free ({dept.totalBeds} total)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHigh ? "bg-amber-600" : "bg-cyan-600"
                      }`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Sample Bed Visualizer Blocks for Inpatient Units */}
              {dept.totalBeds > 0 && (
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                    <span>Unit Bed Matrix Preview</span>
                    <span className="text-[9px] font-normal text-slate-400">Green: Free • Blue: Occupied</span>
                  </div>
                  <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
                    {Array.from({ length: Math.min(dept.totalBeds, 24) }).map((_, i) => {
                      const isOccupied = i < dept.occupiedBeds;
                      return (
                        <div
                          key={i}
                          className={`h-4 rounded text-[9px] font-mono flex items-center justify-center font-bold transition-transform hover:scale-110 cursor-pointer ${
                            isOccupied
                              ? "bg-cyan-700 text-white"
                              : "bg-emerald-500 text-white"
                          }`}
                          title={`Bed ${i + 1}: ${isOccupied ? "Occupied" : "Available"}`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Staffing & Clinical Metrics */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Critical Cases
                  </div>
                  <div className="font-extrabold text-red-700 text-sm mt-0.5">
                    {dept.criticalCases}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    On-Duty Doctors
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {dept.onDutyPhysicians}
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    On-Duty Nurses
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {dept.onDutyNurses}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href={`/patients?departmentId=${dept.id}`}
                  className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
                >
                  <span>{isAr ? `عرض المرضى المنومين في قسم ${dept.code}` : `Inspect Inpatients in ${dept.code}`}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <Suspense fallback={<LoadingStateView />}>
      <DepartmentsContent />
    </Suspense>
  );
}
