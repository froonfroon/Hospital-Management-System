"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/i18n-context";
import { hospitalDataAdapter, DoctorFilters } from "@/api/adapter";
import { Doctor, DoctorVerificationStatus } from "@/types/staff";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import {
  Stethoscope,
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Building2,
  Calendar,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  FileCheck,
  IdCard,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorsPage() {
  const { locale, direction } = useI18n();
  const isAr = locale === "ar";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, startTransition] = useTransition();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<DoctorVerificationStatus | "all">("all");
  const [selectedEmployment, setSelectedEmployment] = useState("all");

  const loadDoctors = (currentPage = 1) => {
    startTransition(async () => {
      try {
        const filters: DoctorFilters = {
          searchQuery: searchQuery || undefined,
          departmentId: selectedDept !== "all" ? selectedDept : undefined,
          verificationStatus: selectedStatus !== "all" ? selectedStatus : undefined,
          employmentStatus: selectedEmployment !== "all" ? selectedEmployment : undefined,
        };
        const res = await hospitalDataAdapter.getDoctors({ page: currentPage, pageSize: 9 }, filters);
        setDoctors(res.data);
        if (res.meta?.pagination) {
          setTotalCount(res.meta.pagination.totalItems);
          setTotalPages(res.meta.pagination.totalPages);
          setPage(res.meta.pagination.currentPage);
        }
      } catch (err) {
        console.error("Failed to load doctors", err);
      }
    });
  };

  useEffect(() => {
    loadDoctors(1);
  }, [searchQuery, selectedDept, selectedStatus, selectedEmployment]);

  const verifiedCount = doctors.filter((d) => d.verificationStatus === "verified").length;
  const pendingCount = doctors.filter((d) => d.verificationStatus === "pending_verification").length;
  const onDutyCount = doctors.filter((d) => d.onCallStatus === "on_duty" || d.onCallStatus === "in_surgery").length;

  const getStatusBadge = (status: DoctorVerificationStatus) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isAr ? "معتمد وموثق" : "Verified"}</span>
          </span>
        );
      case "pending_verification":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>{isAr ? "قيد التدقيق" : "Pending Review"}</span>
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>{isAr ? "موقوف مؤقتاً" : "Suspended"}</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            <XCircle className="h-3.5 w-3.5 text-slate-500" />
            <span>{isAr ? "مرفوض" : "Rejected"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-bold shadow-2xs">
            <span>{isAr ? "مسودة" : "Draft"}</span>
          </span>
        );
    }
  };

  const getDutyBadge = (duty: Doctor["onCallStatus"]) => {
    switch (duty) {
      case "on_duty":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? "على رأس العمل الآن" : "Active On Duty"}</span>
          </span>
        );
      case "in_surgery":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300 px-2.5 py-0.5 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-cyan-600 animate-pulse" />
            <span>{isAr ? "في غرفة العمليات" : "In Surgery (OR)"}</span>
          </span>
        );
      case "on_call":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 text-xs font-bold">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>{isAr ? "مناوب تحت الطلب" : "On Call"}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span>{isAr ? "خارج الدوام" : "Off Duty"}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. Page Header & Primary Actions */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-200 px-2.5 py-0.5 text-[11px] font-bold">
                <Stethoscope className="h-3.5 w-3.5 text-cyan-700" />
                <span>{isAr ? "إدارة الكادر الطبي والاعتمادات السريرية" : "Medical Staff & Credentialing"}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{isAr ? "سجل الكادر معتمد ونشط" : "Board Certified Registry"}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {isAr ? "سجل الأطباء والكوادر السريرية" : "Physicians & Medical Staff Directory"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-3xl">
              {isAr
                ? "متابعة التراخيص المهنية لهيئة التخصصات الصحية، توزيع الأقسام الطبية، جداول المناوبات السريرية، وسجلات المرضى المعالجين."
                : "Professional licensure compliance, department assignments, clinical duty schedules, and attending patient rosters."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/doctors/new"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-cyan-800 transition-colors cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isAr ? "تسجيل طبيب جديد" : "Register Doctor"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. HIGH-CONTRAST KPI STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Physicians */}
        <div className="rounded-xl border-t-4 border-t-cyan-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "إجمالي الأطباء" : "Total Physicians"}</span>
            <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-cyan-800 leading-none">{totalCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-cyan-700">
            {isAr ? "مسجلين وموزعين على 15 قسماً" : "Registered in HospitalOS"}
          </span>
        </div>

        {/* Card 2: Verified Credentials */}
        <div className="rounded-xl border-t-4 border-t-emerald-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "تراخيص معتمدة" : "Verified Credentials"}</span>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600 leading-none">{verifiedCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-emerald-700">
            {isAr ? "مطابقة مع هيئة التخصصات" : "Active Board Licenses"}
          </span>
        </div>

        {/* Card 3: Pending Audit */}
        <div className="rounded-xl border-t-4 border-t-amber-500 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "قيد التدقيق والاعتماد" : "Pending Audit"}</span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 leading-none">{pendingCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-amber-700">
            {isAr ? "تتطلب مراجعة الإدارة الطبية" : "Awaiting Credential Review"}
          </span>
        </div>

        {/* Card 4: Active On-Duty */}
        <div className="rounded-xl border-t-4 border-t-blue-600 border-x border-b border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">{isAr ? "على رأس العمل الآن" : "Active On-Duty"}</span>
            <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-extrabold text-blue-600 leading-none">{onDutyCount}</p>
          <span className="mt-1.5 inline-block text-[11px] font-semibold text-blue-700">
            {isAr ? "في الأجنحة، الطوارئ، والعمليات" : "Covering Wards & OR"}
          </span>
        </div>
      </div>

      {/* 3. ROBUST FILTER TOOLBAR */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
          <Filter className="h-4 w-4 text-cyan-700" />
          <span>{isAr ? "تصفية وفرز سجل الكوادر الطبية" : "Filter Physicians & Staff"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quick Search */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "البحث السريع" : "Quick Search"}
            </label>
            <div className="relative">
              <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-cyan-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "بحث بالاسم، الرقم الوظيفي، أو التخصص..." : "Search name, ID, license, specialty..."}
                className="w-full rounded-lg border border-slate-300 bg-white ps-9 pe-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
              >
              </input>
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "القسم الطبي الأساسي" : "Primary Department"}
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

          {/* Verification Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "حالة الاعتماد المهني" : "Credential Status"}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع حالات الاعتماد" : "All Credential Statuses"}</option>
              <option value="verified">{isAr ? "معتمد وموثق" : "Verified"}</option>
              <option value="pending_verification">{isAr ? "قيد التدقيق" : "Pending Verification"}</option>
              <option value="suspended">{isAr ? "موقوف مؤقتاً" : "Suspended"}</option>
              <option value="rejected">{isAr ? "مرفوض" : "Rejected"}</option>
              <option value="draft">{isAr ? "مسودة" : "Draft"}</option>
            </select>
          </div>

          {/* Employment Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              {isAr ? "نوع التعاقد والوظيفة" : "Employment Type"}
            </label>
            <select
              value={selectedEmployment}
              onChange={(e) => setSelectedEmployment(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-2xs"
            >
              <option value="all">{isAr ? "جميع أنماط التوظيف" : "All Employment Types"}</option>
              <option value="full_time">{isAr ? "دوام كامل (Full-Time)" : "Full Time"}</option>
              <option value="part_time">{isAr ? "دوام جزئي (Part-Time)" : "Part Time"}</option>
              <option value="visiting_consultant">{isAr ? "استشاري زائر (Visiting)" : "Visiting Consultant"}</option>
              <option value="locum">{isAr ? "طبيب متعاقد مؤقت (Locum)" : "Locum"}</option>
              <option value="resident">{isAr ? "طبيب مقيم (Resident)" : "Resident"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. DOCTOR CARDS GRID */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs">
          <div className="rounded-full bg-cyan-100 p-3 text-cyan-700">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900">
            {isAr ? "لم يتم العثور على أطباء مطابقين" : "No physicians match your filter"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {isAr ? "حاول تعديل شروط البحث أو الفلاتر المختارة." : "Try adjusting your search query or reset status filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map((doctor) => {
            const initials = doctor.legalNameEn
              .split(" ")
              .slice(-2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            const isVerified = doctor.verificationStatus === "verified";
            const isPending = doctor.verificationStatus === "pending_verification";

            return (
              <div
                key={doctor.id}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all",
                  isVerified
                    ? "border-slate-200 hover:border-emerald-500 hover:shadow-md"
                    : isPending
                    ? "border-slate-200 hover:border-amber-500 hover:shadow-md"
                    : "border-slate-200 hover:border-cyan-500 hover:shadow-md"
                )}
              >
                <div>
                  {/* Card Top: Avatar, Title, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-extrabold text-base shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug">
                          {isAr ? doctor.legalNameAr : doctor.legalNameEn}
                        </h3>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold border border-slate-200">
                            {doctor.employeeId}
                          </span>
                          <span>•</span>
                          <span className="text-slate-600 font-sans">
                            {doctor.licenseNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(doctor.verificationStatus)}
                  </div>

                  {/* Specialty & Department */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800 bg-cyan-50/80 px-2.5 py-1.5 rounded-lg border border-cyan-100">
                      <Award className="h-4 w-4 text-cyan-700 shrink-0" />
                      <span>{doctor.primarySpecialty}</span>
                      {doctor.subspecialty && (
                        <span className="text-[11px] text-cyan-600 font-normal">
                          ({doctor.subspecialty})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-700 ps-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold truncate">
                        {isAr ? doctor.primaryDepartmentNameAr : doctor.primaryDepartmentNameEn}
                      </span>
                    </div>

                    {doctor.authorizedSecondaryDepartmentIds.length > 0 && (
                      <p className="text-[11px] text-slate-500 ps-6">
                        +{doctor.authorizedSecondaryDepartmentIds.length} {isAr ? "أقسام ثانوية مصرح بها" : "authorized secondary depts"}
                      </p>
                    )}
                  </div>

                  {/* Operational Metrics Bar */}
                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2.5 text-center border border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">
                        {isAr ? "المرضى" : "Patients"}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {doctor.assignedPatientCount}
                      </span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">
                        {isAr ? "حالات نشطة" : "Active Enc"}
                      </span>
                      <span className="text-sm font-extrabold text-cyan-700">
                        {doctor.activeEncounterCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">
                        {isAr ? "المستندات" : "Docs"}
                      </span>
                      <span className="text-sm font-extrabold text-slate-800">
                        {doctor.credentials.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Duty Status & Action */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  {getDutyBadge(doctor.onCallStatus)}

                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 border border-slate-200 hover:border-cyan-200 px-2.5 py-1 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <span>{isAr ? "عرض الملف السريري" : "Open Workspace"}</span>
                    <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs font-medium text-slate-600">
            {isAr
              ? `صفحة ${page} من ${totalPages} (إجمالي ${totalCount} طبيب)`
              : `Page ${page} of ${totalPages} (${totalCount} total doctors)`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => loadDoctors(page - 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isAr ? "السابق" : "Previous"}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => loadDoctors(page + 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isAr ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
