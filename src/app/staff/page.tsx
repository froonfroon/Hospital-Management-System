"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n-context";
import { hospitalDataAdapter } from "@/api/adapter";
import { StaffShift } from "@/types/staff";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import {
  Users,
  Clock,
  Calendar,
  Building2,
  CheckCircle2,
  Filter,
  Search,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Bed,
  Stethoscope,
  UserCheck,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StaffPage() {
  const { locale } = useI18n();
  const isAr = locale === "ar";

  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-10-24");
  const [selectedShiftType, setSelectedShiftType] = useState<"all" | "morning" | "evening" | "night">("all");
  const [isLoading, startTransition] = useTransition();

  const loadShifts = () => {
    startTransition(async () => {
      try {
        const res = await hospitalDataAdapter.getStaffShifts(
          selectedDept !== "all" ? selectedDept : undefined,
          selectedDate || undefined
        );
        let list = res.data;
        if (selectedShiftType !== "all") {
          list = list.filter((s) => s.shiftType === selectedShiftType);
        }
        setShifts(list);
      } catch (err) {
        console.error("Failed to load staff shifts", err);
      }
    });
  };

  useEffect(() => {
    loadShifts();
  }, [selectedDept, selectedDate, selectedShiftType]);

  const activeStaffCount = shifts.filter((s) => s.status === "checked_in").length;

  const translateRole = (role: string) => {
    if (!isAr) return role.replace(/_/g, " ");
    const map: Record<string, string> = {
      charge_nurse: "مشرف تمريض أول",
      staff_nurse: "ممرض / ممرضة جناح",
      icu_nurse: "تمريض عناية مركزة",
      triage_nurse: "تمريض فرز طوارئ",
      pharmacist: "صيدلي إكلينيكي",
      lab_tech: "أخصائي مختبرات",
      radiology_tech: "أخصائي أشعة وتصوير",
      physician: "طبيب معالج",
    };
    return map[role] || role.replace(/_/g, " ");
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. Page Header & Primary Actions */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200 px-2.5 py-0.5 text-[11px] font-bold">
                <Users className="h-3.5 w-3.5 text-cyan-700" />
                <span>{isAr ? "إدارة الكوادر والمناوبات الميدانية" : "Staff Roster & Shift Management"}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "الجدول التشغيلي نشط" : "Operational Schedule Active"}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {isAr ? "مناوبات التمريض والكوادر المساندة" : "Clinical Nursing & Ancillary Staff Shifts"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl">
              {isAr
                ? "متابعة جداول الحضور والانصراف اللحظية، وتوزيع الممرضين على أسرّة المرضى، وجاهزية الصيدلية والمختبر والأشعة."
                : "Real-time shift attendance, nurse-to-bed allocation ratios, and ancillary diagnostic coverage."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Stethoscope className="h-3.5 w-3.5 text-cyan-700" />
              <span>{isAr ? "دليل الأطباء" : "Physicians Directory"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. HIGH-CONTRAST KPI STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: Currently Checked In */}
        <div className="rounded-xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "الكادر المناوب حالياً" : "Currently Checked In"}</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 leading-none">{activeStaffCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-emerald-700">
            {isAr ? "متواجدون على رأس العمل بالأجنحة" : "Active on hospital floor"}
          </span>
        </div>

        {/* Card 2: Scheduled Shifts Today */}
        <div className="rounded-xl border-t-4 border-t-cyan-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "إجمالي المناوبات المسجلة اليوم" : "Scheduled Shifts Today"}</span>
            <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-cyan-800 leading-none">{shifts.length}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-cyan-700">
            {isAr ? "توزيع الورديات الثلاث (صباحية، مسائية، ليلية)" : "Morning, Evening & Night shifts"}
          </span>
        </div>

        {/* Card 3: Nursing Bed Ratio */}
        <div className="rounded-xl border-t-4 border-t-purple-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "نسبة التغطية التمريضية للأسرة" : "Nursing Bed Ratio"}</span>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <Bed className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-purple-600 leading-none">1 : 4</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-purple-700">
            {isAr ? "مطابقة للمعايير السريرية المعتمدة (CBAHI)" : "Within clinical accreditation standard"}
          </span>
        </div>
      </div>

      {/* 3. ROBUST FILTER TOOLBAR */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
          <Filter className="h-4 w-4 text-cyan-700" />
          <span>{isAr ? "تصفية وفرز جدول المناوبات" : "Filter Staff Roster"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dept filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "القسم الطبي" : "Department"}
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع الأقسام الطبية (الكل)" : "All Departments"}</option>
              {HOSPITAL_DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {isAr ? d.nameAr : d.nameEn} [{d.code}]
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "تاريخ المناوبة" : "Roster Date"}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            />
          </div>

          {/* Shift Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "فترة المناوبة / الوردية" : "Shift Window"}
            </label>
            <select
              value={selectedShiftType}
              onChange={(e) => setSelectedShiftType(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع الورديات" : "All Shifts"}</option>
              <option value="morning">{isAr ? "الصباحية (07:00 - 15:00)" : "Morning (07:00 - 15:00)"}</option>
              <option value="evening">{isAr ? "المسائية (15:00 - 23:00)" : "Evening (15:00 - 23:00)"}</option>
              <option value="night">{isAr ? "الليلية (23:00 - 07:00)" : "Night (23:00 - 07:00)"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. SHIFT ROSTER TABLE */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent" />
        </div>
      ) : shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs">
          <div className="rounded-full bg-cyan-100 p-3 text-cyan-700">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            {isAr ? "لا توجد مناوبات مسجلة لهذا التاريخ" : "No staff shifts scheduled for this date"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {isAr ? "حاول تغيير التاريخ أو القسم المختار لمعاينة الجداول." : "Try adjusting the date or department filter."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3.5 text-start">{isAr ? "الموظف" : "Staff Member"}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? "الدور السريري" : "Role"}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? "القسم" : "Department"}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? "الوردية والتوقيت" : "Shift & Hours"}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? "توزيع الأسرة" : "Bed Allocation"}</th>
                  <th className="px-4 py-3.5 text-start">{isAr ? "حالة الحضور" : "Attendance"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((s) => {
                  const isCheckedIn = s.status === "checked_in";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-100 text-cyan-800 font-bold text-xs shrink-0">
                            {s.staffName.charAt(0)}
                          </div>
                          <span>{s.staffName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {translateRole(s.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{isAr ? s.departmentNameAr : s.departmentNameEn}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <span className="font-bold text-slate-900 capitalize">
                          {s.shiftType === "morning"
                            ? (isAr ? "صباحية" : "Morning")
                            : s.shiftType === "evening"
                            ? (isAr ? "مسائية" : "Evening")
                            : (isAr ? "ليلية" : "Night")}
                        </span>{" "}
                        <span className="text-slate-500 font-mono text-[11px]">
                          ({s.startTime} - {s.endTime})
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.assignedBedsCount ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                            <Bed className="h-3.5 w-3.5 text-purple-600" />
                            <span>{s.assignedBedsCount} {isAr ? "أسرة مخصصة" : "beds"}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs",
                            isCheckedIn
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          )}
                        >
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              isCheckedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            )}
                          />
                          <span>
                            {isCheckedIn
                              ? (isAr ? "على رأس العمل" : "Checked In")
                              : (isAr ? "مجدول" : "Scheduled")}
                          </span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
