"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useShell } from "./shell-context";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import {
  Activity,
  Users,
  Bed,
  Stethoscope,
  Scissors,
  Pill,
  FlaskConical,
  Scan,
  CreditCard,
  CalendarDays,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Building2,
  Search,
  HeartPulse,
  Syringe,
  Baby,
  Brain,
  Bone,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
  Droplets,
  Radio,
  Shield,
  Siren,
  Flame,
  FileSpreadsheet,
  Lock,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isSidebarCollapsed, toggleSidebar } = useShell();
  const { locale, direction } = useI18n();

  const isAr = locale === "ar";
  const [deptSearch, setDeptSearch] = useState("");

  const currentDept = searchParams?.get("dept");
  const currentTab = searchParams?.get("tab");
  const currentView = searchParams?.get("view");
  const currentFilter = searchParams?.get("filter");

  // Collapsible nav groups state - all main categories expanded for complete view
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    clinical: true,
    allDepartments: true,
    ancillary: true,
    admin: true,
    emergencyCodes: false,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const getDeptIcon = (code: string) => {
    switch (code) {
      case "ED":
        return Stethoscope;
      case "ICU":
        return HeartPulse;
      case "CARD":
        return Activity;
      case "SURG":
        return Scissors;
      case "PEDS":
        return Baby;
      case "ONC":
        return Syringe;
      case "ORTHO":
        return Bone;
      case "NEURO":
        return Brain;
      case "OR":
        return Scissors;
      case "PHARM":
        return Pill;
      case "LAB":
        return FlaskConical;
      case "RAD":
        return Scan;
      default:
        return Building2;
    }
  };

  // Filter departments by search
  const filteredDepartments = HOSPITAL_DEPARTMENTS.filter((d) => {
    if (!deptSearch.trim()) return true;
    const q = deptSearch.toLowerCase().trim();
    return (
      d.nameEn.toLowerCase().includes(q) ||
      d.nameAr.includes(q) ||
      d.code.toLowerCase().includes(q)
    );
  });

  const tooltipSide = direction === "rtl" ? "left" : "right";

  return (
    <aside
      className={cn(
        "no-print relative flex flex-col border-e text-slate-300 transition-all duration-300 select-none z-30 h-screen shrink-0 bg-[#071325] border-[#0e233d]",
        isSidebarCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* ── HOSPITAL IDENTITY BRAND HEADER ── */}
      <div className="flex h-15 items-center justify-between px-3.5 border-b border-[#0e233d] bg-[#040d1a] shrink-0">
        {!isSidebarCollapsed ? (
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 text-white font-black text-base shadow-md ring-1 ring-cyan-400/40 group-hover:from-cyan-400 group-hover:to-cyan-600 transition-all">
              H
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-wide block leading-none">
                  HospitalOS
                </span>
                <span className="rounded bg-cyan-950 text-cyan-300 border border-cyan-800 px-1 py-0.2 text-[9px] font-mono font-bold">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold block mt-1 leading-none truncate">
                Solve Codex Healthcare • مركز القيادة
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-700 text-white font-black text-base shadow-md ring-1 ring-cyan-400/40"
            title="HospitalOS Solve Codex"
          >
            H
          </Link>
        )}

        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer transition-colors"
          title={isSidebarCollapsed ? (isAr ? "توسيع القائمة" : "Expand sidebar") : (isAr ? "طي القائمة" : "Collapse sidebar")}
          aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          ) : (
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          )}
        </button>
      </div>

      {/* ── SCROLLABLE NAVIGATION BODY ── */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 dark-scrollbar">
        {/* SECTION 1: CORE CLINICAL OPERATIONS (12 MODULES) */}
        <div className="space-y-1">
          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={() => toggleGroup("clinical")}
              className="flex w-full items-center justify-between px-2.5 py-1.5 text-[12px] font-bold text-slate-300 hover:text-cyan-300 cursor-pointer transition-colors"
            >
              <span>{isAr ? "العمليات السريرية" : "Clinical Operations"}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200",
                  !openGroups.clinical && "-rotate-90 rtl:rotate-90"
                )}
              />
            </button>
          )}

          {(openGroups.clinical || isSidebarCollapsed) && (
            <div className="space-y-1">
              {/* 1. Operations Overview */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/" && !currentFilter
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Activity className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "لوحة العمليات الرئيسية" : "Operations Overview"}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/" && !currentFilter
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Activity className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "لوحة العمليات الرئيسية" : "Operations Overview"}</span>
                  </div>
                </Link>
              )}

              {/* 2. Patient Master Index */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/patients"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/patients" && currentView !== "mychart"
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Users className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "فهرس المرضى والتنويم" : "Patient Master Index"} (5)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/patients"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/patients" && currentView !== "mychart"
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Users className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "فهرس المرضى والتنويم" : "Patient Master Index"}</span>
                  </div>
                  <span className="rounded bg-[#0c314a] text-[#22d3ee] border border-cyan-800/80 px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                    5
                  </span>
                </Link>
              )}

              {/* 3. Inpatient Bed Census */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/departments"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/departments" && !currentDept
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Bed className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "لوحة إحصاء الأسرة" : "Inpatient Bed Census"} (Units 15)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/departments"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/departments" && !currentDept
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Bed className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "لوحة إحصاء الأسرة" : "Inpatient Bed Census"}</span>
                  </div>
                  <span className="rounded bg-[#1a2942] text-[#94a3b8] border border-slate-700/80 px-2 py-0.5 text-[10px] font-semibold">
                    Units 15
                  </span>
                </Link>
              )}

              {/* 4. eMAR - Medication Administration */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/departments?dept=dep-pharm"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/departments" && currentDept === "dep-pharm"
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Pill className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "إعطاء الأدوية (eMAR)" : "eMAR Administration"} (98.6%)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/departments?dept=dep-pharm"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/departments" && currentDept === "dep-pharm"
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Pill className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "إعطاء الأدوية (eMAR)" : "eMAR Administration"}</span>
                  </div>
                  <span className="rounded bg-[#064e3b] text-[#34d399] border border-emerald-800/80 px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                    98.6%
                  </span>
                </Link>
              )}

              {/* 5. Clinical Safety & Critical Alerts */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/clinical-alerts"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/clinical-alerts" && currentFilter !== "code-orange"
                          ? "bg-red-500/25 text-red-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <ShieldAlert className="h-4 w-4 text-[#f43f5e] animate-pulse" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "التنبيهات السريرية الحرجة" : "Critical Clinical Alerts"} (STAT 4)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/clinical-alerts"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/clinical-alerts" && currentFilter !== "code-orange"
                      ? "bg-gradient-to-r from-rose-500/25 via-rose-500/10 to-transparent text-rose-200 font-bold border-s-3 border-rose-500 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-[#f43f5e] animate-pulse" />
                    <span className="truncate">{isAr ? "التنبيهات السريرية الحرجة" : "Critical Clinical Alerts"}</span>
                  </div>
                  <span className="rounded bg-[#e11d48] text-white px-2 py-0.5 text-[10px] font-black shadow-xs animate-pulse">
                    STAT 4
                  </span>
                </Link>
              )}

              {/* 6. Medical Staff & Doctors */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/doctors"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname.startsWith("/doctors")
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Stethoscope className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "الأطباء والاعتمادات" : "Physicians Directory"} (MDs 6)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/doctors"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname.startsWith("/doctors")
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Stethoscope className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "الأطباء والاعتمادات" : "Physicians Directory"}</span>
                  </div>
                  <span className="rounded bg-[#1a2942] text-[#94a3b8] border border-slate-700/80 px-2 py-0.5 text-[10px] font-semibold">
                    MDs 6
                  </span>
                </Link>
              )}

              {/* 7. Staff Roster & Shifts */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/staff"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/staff"
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Clock className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "مناوبات الكوادر والتمريض" : "Nursing Shifts & Roster"}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/staff"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/staff"
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Clock className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "مناوبات الكوادر والتمريض" : "Nursing Staff Shifts"}</span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </Link>
              )}

              {/* 8. Patient Portal (MyChart) */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/patients?view=mychart"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        currentView === "mychart"
                          ? "bg-pink-500/20 text-pink-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <HeartPulse className="h-4 w-4 text-[#fb7185]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "بوابة المريض (MyChart)" : "Patient Portal (MyChart)"}
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/patients?view=mychart"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    currentView === "mychart"
                      ? "bg-gradient-to-r from-pink-500/25 via-pink-500/10 to-transparent text-pink-200 font-bold border-s-3 border-pink-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <HeartPulse className="h-4 w-4 shrink-0 text-[#fb7185]" />
                    <span className="truncate">{isAr ? "بوابة المريض (MyChart)" : "Patient Portal (MyChart)"}</span>
                  </div>
                  <span className="rounded bg-[#4c0519] text-[#f43f5e] border border-rose-900/80 px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                    MyChart
                  </span>
                </Link>
              )}

              {/* 9. Surgical Suites (OR) */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/departments?dept=dep-ot"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/departments" && currentDept === "dep-ot"
                          ? "bg-cyan-500/20 text-cyan-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Scissors className="h-4 w-4 text-[#22d3ee]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "مجمع العمليات الجراحية" : "Operating Suites (OR)"} (WHO)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/departments?dept=dep-ot"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/departments" && currentDept === "dep-ot"
                      ? "bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent text-cyan-200 font-bold border-s-3 border-cyan-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Scissors className="h-4 w-4 shrink-0 text-[#22d3ee]" />
                    <span className="truncate">{isAr ? "مجمع العمليات الجراحية" : "Operating Suites (OR)"}</span>
                  </div>
                  <span className="rounded bg-[#0c314a] text-[#22d3ee] border border-cyan-800/80 px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                    WHO
                  </span>
                </Link>
              )}

              {/* 10. Blood Bank & Transfusion Safety */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/departments?dept=dep-lab"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/departments" && currentDept === "dep-lab"
                          ? "bg-red-500/20 text-red-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Droplets className="h-4 w-4 text-[#f43f5e]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "بنك الدم وسلامة النقل" : "Blood Bank & Safety"} (ISBT 128)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/departments?dept=dep-lab"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/departments" && currentDept === "dep-lab"
                      ? "bg-gradient-to-r from-red-500/25 via-red-500/10 to-transparent text-red-200 font-bold border-s-3 border-red-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Droplets className="h-4 w-4 shrink-0 text-[#f43f5e]" />
                    <span className="truncate">{isAr ? "بنك الدم وسلامة النقل" : "Blood Bank & Safety"}</span>
                  </div>
                  <span className="rounded bg-[#450a0a] text-[#f87171] border border-red-900/80 px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                    ISBT 128
                  </span>
                </Link>
              )}

              {/* 11. Infection Control & Isolation */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/departments?dept=dep-icu"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        pathname === "/departments" && currentDept === "dep-icu"
                          ? "bg-amber-500/20 text-amber-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Shield className="h-4 w-4 text-[#fbbf24]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "مكافحة العدوى والعزل" : "Infection Control"} (HAI Map)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/departments?dept=dep-icu"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    pathname === "/departments" && currentDept === "dep-icu"
                      ? "bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent text-amber-200 font-bold border-s-3 border-amber-400 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Shield className="h-4 w-4 shrink-0 text-[#fbbf24]" />
                    <span className="truncate">{isAr ? "مكافحة العدوى والعزل" : "Infection Control"}</span>
                  </div>
                  <span className="rounded bg-[#451a03] text-[#fbbf24] border border-amber-900/80 px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                    HAI Map
                  </span>
                </Link>
              )}

              {/* 12. Disaster & Incident Command */}
              {isSidebarCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/clinical-alerts?filter=code-orange"
                      className={cn(
                        "flex h-9.5 w-full items-center justify-center rounded-xl transition-all",
                        currentFilter === "code-orange"
                          ? "bg-rose-500/25 text-rose-300 font-bold shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      )}
                    >
                      <Radio className="h-4 w-4 text-[#fb7185] animate-pulse" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side={tooltipSide}>
                    {isAr ? "قيادة الكوارث والحوادث" : "Disaster & Emergency Command"} (Code Orange)
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/clinical-alerts?filter=code-orange"
                  className={cn(
                    "group flex h-9.5 items-center justify-between rounded-xl px-2.5 text-xs transition-all",
                    currentFilter === "code-orange"
                      ? "bg-gradient-to-r from-rose-500/25 via-rose-500/10 to-transparent text-rose-200 font-bold border-s-3 border-rose-500 ps-2"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Radio className="h-4 w-4 shrink-0 text-[#fb7185] animate-pulse" />
                    <span className="truncate">{isAr ? "قيادة الكوارث والحوادث" : "Disaster Command"}</span>
                  </div>
                  <span className="rounded bg-[#e11d48] text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                    Code Orange
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: HOSPITAL DEPARTMENTS (15 MEDICAL UNITS) */}
        <div className="space-y-1 pt-2 border-t border-[#0e233d]">
          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <button
                type="button"
                onClick={() => toggleGroup("allDepartments")}
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-300 hover:text-cyan-300 cursor-pointer transition-colors"
              >
                <Building2 className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? "الأقسام الطبية والأسرة" : "Hospital Wards & Units"}</span>
                <span className="rounded px-1.5 py-0.2 text-[9px] text-cyan-200 font-mono font-bold bg-[#0d2240] border border-cyan-800/60">
                  15
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleGroup("allDepartments")}
                className="text-slate-400 hover:text-white cursor-pointer p-0.5"
                aria-label="Toggle departments group"
              >
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    !openGroups.allDepartments && "-rotate-90 rtl:rotate-90"
                  )}
                />
              </button>
            </div>
          )}

          {!isSidebarCollapsed && openGroups.allDepartments && (
            <div className="px-1 py-1">
              <div className="relative flex items-center">
                <Search className="absolute start-2.5 h-3 w-3 text-slate-400" />
                <input
                  type="text"
                  value={deptSearch}
                  onChange={(e) => setDeptSearch(e.target.value)}
                  placeholder={isAr ? "تصفية الأقسام الـ 15..." : "Filter 15 departments..."}
                  className="w-full rounded-lg py-1 pe-2 ps-7 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 border border-[#0e233d] bg-[#040d1a]"
                />
              </div>
            </div>
          )}

          {(openGroups.allDepartments || isSidebarCollapsed) && (
            <div className="space-y-0.5">
              {filteredDepartments.map((dept) => {
                const Icon = getDeptIcon(dept.code);
                const name = isAr ? dept.nameAr : dept.nameEn;
                const isDeptActive = pathname === "/departments" && currentDept === dept.id;

                if (isSidebarCollapsed) {
                  return (
                    <Tooltip key={dept.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/departments?dept=${dept.id}`}
                          className={cn(
                            "flex h-8.5 w-full items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors",
                            isDeptActive && "bg-cyan-500/20 text-cyan-300 font-bold"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 text-cyan-400" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side={tooltipSide}>
                        {name} ({dept.code}) - {dept.occupiedBeds}/{dept.totalBeds} {isAr ? "سرير" : "beds"}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={dept.id}
                    href={`/departments?dept=${dept.id}`}
                    className={cn(
                      "group flex h-8 items-center justify-between rounded-lg px-2 text-xs transition-colors",
                      isDeptActive
                        ? "bg-cyan-500/20 text-cyan-200 font-bold border-s-2 border-cyan-400 ps-2"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-cyan-400 group-hover:text-cyan-300" />
                      <span className="truncate leading-tight text-[11px]">{name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ms-1">
                      {dept.totalBeds > 0 ? (
                        <span className="font-mono text-[10px] text-slate-300 px-1.5 py-0.2 rounded border border-[#0e233d] bg-[#040d1a]">
                          {dept.occupiedBeds}/{dept.totalBeds}
                        </span>
                      ) : (
                        <span className="text-[9px] text-cyan-300 font-mono font-bold">
                          {dept.code}
                        </span>
                      )}
                      {dept.criticalCases > 0 && (
                        <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 3: ADMINISTRATION & HOSPITAL OPERATIONS */}
        <div className="space-y-1 pt-2 border-t border-[#0e233d]">
          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={() => toggleGroup("admin")}
              className="flex w-full items-center justify-between px-2.5 py-1.5 text-[12px] font-bold text-slate-300 hover:text-cyan-300 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? "الإدارة والمالية" : "Admin & Finance"}</span>
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200",
                  !openGroups.admin && "-rotate-90 rtl:rotate-90"
                )}
              />
            </button>
          )}

          {(openGroups.admin || isSidebarCollapsed) && (
            <div className="space-y-0.5">
              <Link
                href="/operations?tab=opd"
                className={cn(
                  "flex h-8.5 items-center gap-2.5 rounded-xl px-2.5 text-xs transition-all",
                  pathname === "/operations" && currentTab === "opd"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border-s-3 border-cyan-400 ps-2"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <CalendarDays className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{isAr ? "العيادات وحجز المواعيد (OPD)" : "Outpatient Clinics (OPD)"}</span>
                )}
              </Link>

              <Link
                href="/operations?tab=pharmacy"
                className={cn(
                  "flex h-8.5 items-center gap-2.5 rounded-xl px-2.5 text-xs transition-all",
                  pathname === "/operations" && currentTab === "pharmacy"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border-s-3 border-cyan-400 ps-2"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <Pill className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{isAr ? "صيدلية المستشفى وصرف الأدوية" : "Pharmacy Dispensing"}</span>
                )}
              </Link>

              <Link
                href="/operations?tab=lab"
                className={cn(
                  "flex h-8.5 items-center gap-2.5 rounded-xl px-2.5 text-xs transition-all",
                  pathname === "/operations" && currentTab === "lab"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border-s-3 border-cyan-400 ps-2"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <FlaskConical className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{isAr ? "المختبر وإدخال نتائج التحاليل" : "Laboratory Diagnostics"}</span>
                )}
              </Link>

              <Link
                href="/operations?tab=billing"
                className={cn(
                  "flex h-8.5 items-center gap-2.5 rounded-xl px-2.5 text-xs transition-all",
                  pathname === "/operations" && currentTab === "billing"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border-s-3 border-cyan-400 ps-2"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <CreditCard className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{isAr ? "الفوترة والتأمين الطبي" : "Revenue Cycle & Billing"}</span>
                )}
              </Link>

              <Link
                href="/operations"
                className={cn(
                  "flex h-8.5 items-center gap-2.5 rounded-xl px-2.5 text-xs transition-all",
                  pathname === "/operations" && !currentTab
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border-s-3 border-cyan-400 ps-2"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                )}
              >
                <Activity className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="truncate">{isAr ? "مركز إدارة المرافق والعمليات" : "Hospital Operations Center"}</span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── FOOTER HOSPITAL TELEMETRY & LIVE STATUS WIDGET ── */}
      <div className="border-t border-[#0e233d] p-3 text-[11px] shrink-0 bg-[#040d1a]">
        {!isSidebarCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <div>
                  <span className="text-white font-bold block leading-none">
                    {isAr ? "مركز قيادة المستشفى" : "Command Center"}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium leading-none block mt-1">
                    {isAr ? "النظام متصل • جهوزية 100%" : "Clinical Gateway Active"}
                  </span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-cyan-300 px-1.5 py-0.5 rounded border border-[#0e233d] bg-[#071326] font-bold">
                v2.4
              </span>
            </div>

            {/* Real-time Hospital Bed Capacity Gauge */}
            <div className="pt-1.5 border-t border-[#0e233d]/60 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{isAr ? "إشغال الأسرة العام" : "Hospital Bed Occupancy"}</span>
                <span className="font-mono font-bold text-cyan-300">88.7% (142/160)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full" style={{ width: "88.7%" }} />
              </div>
            </div>

            {/* Quick Access to Login Portal / Lock Terminal */}
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-[#0e233d] text-[11px] text-slate-400 hover:text-cyan-300 transition-colors mt-2"
            >
              <Lock className="h-3 w-3 text-cyan-400" />
              <span>{isAr ? "بوابة الدخول / قفل الشاشة" : "Login Portal / Lock Screen"}</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Clinical Gateway Online • 100% Active" />
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
              title={isAr ? "بوابة تسجيل الدخول" : "Login Portal"}
            >
              <Lock className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <TooltipProvider delayDuration={100}>
      <Suspense
        fallback={
          <aside className="no-print relative flex flex-col border-e border-[#0e233d] bg-[#071325] text-slate-300 w-72 h-screen shrink-0">
            <div className="flex h-15 items-center px-4 border-b border-[#0e233d]">
              <div className="h-8 w-8 rounded-xl bg-cyan-600 animate-pulse" />
            </div>
          </aside>
        }
      >
        <SidebarInner />
      </Suspense>
    </TooltipProvider>
  );
}
