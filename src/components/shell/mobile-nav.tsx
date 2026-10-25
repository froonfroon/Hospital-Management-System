"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useShell } from "./shell-context";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import {
  Activity,
  Users,
  Bed,
  Building2,
  Stethoscope,
  Scissors,
  Pill,
  FlaskConical,
  Scan,
  CreditCard,
  CalendarDays,
  ShieldAlert,
  Clock,
  Droplets,
  Radio,
  Shield,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

function MobileNavInner() {
  const { isMobileNavOpen, setIsMobileNavOpen } = useShell();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, direction } = useI18n();

  const isAr = locale === "ar";
  const [activeTab, setActiveTab] = useState<"nav" | "depts">("nav");

  const currentDept = searchParams?.get("dept");
  const currentTab = searchParams?.get("tab");
  const currentView = searchParams?.get("view");
  const currentFilter = searchParams?.get("filter");

  return (
    <Drawer open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
      <DrawerContent
        side={direction === "rtl" ? "right" : "left"}
        className="text-white p-0 bg-[#071325] border-[#0e233d]"
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-[#0e233d] bg-[#040d1a] shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 font-bold text-xs text-white">
              H
            </div>
            <div>
              <span className="font-bold text-sm block leading-none">HospitalOS</span>
              <span className="text-[10px] text-cyan-400 leading-none">Solve Codex Healthcare</span>
            </div>
          </div>
          <span className="rounded bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 text-[9px] font-mono font-bold">
            PRO
          </span>
        </div>

        {/* Tab switcher: Clinical vs All Departments */}
        <div className="flex border-b border-[#0e233d] text-xs font-semibold bg-[#040d1a]">
          <button
            type="button"
            onClick={() => setActiveTab("nav")}
            className={cn(
              "flex-1 py-2.5 text-center transition-colors border-b-2",
              activeTab === "nav"
                ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            {isAr ? "العمليات السريرية" : "Clinical Operations"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("depts")}
            className={cn(
              "flex-1 py-2.5 text-center transition-colors border-b-2",
              activeTab === "depts"
                ? "border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            )}
          >
            {isAr ? "كافة الأقسام (15)" : "Departments (15)"}
          </button>
        </div>

        <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)] dark-scrollbar">
          {activeTab === "nav" ? (
            <div className="space-y-1">
              {/* 1 */}
              <Link
                href="/"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/" && !currentFilter ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <Activity className="h-4 w-4 text-[#22d3ee]" />
                <span>{isAr ? "لوحة العمليات الرئيسية" : "Operations Overview"}</span>
              </Link>

              {/* 2 */}
              <Link
                href="/patients"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/patients" && currentView !== "mychart" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[#22d3ee]" />
                  <span>{isAr ? "فهرس المرضى والتنويم" : "Patient Master Index"}</span>
                </div>
                <span className="rounded bg-[#0c314a] text-[#22d3ee] border border-cyan-800/80 px-2 py-0.5 text-[10px] font-bold">5</span>
              </Link>

              {/* 3 */}
              <Link
                href="/departments"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/departments" && !currentDept ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Bed className="h-4 w-4 text-[#22d3ee]" />
                  <span>{isAr ? "لوحة إحصاء الأسرة" : "Inpatient Bed Census"}</span>
                </div>
                <span className="rounded bg-[#1a2942] text-[#94a3b8] border border-slate-700/80 px-2 py-0.5 text-[10px] font-semibold">Units 15</span>
              </Link>

              {/* 4 */}
              <Link
                href="/departments?dept=dep-pharm"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/departments" && currentDept === "dep-pharm" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Pill className="h-4 w-4 text-[#22d3ee]" />
                  <span>{isAr ? "إعطاء الأدوية (eMAR)" : "eMAR Administration"}</span>
                </div>
                <span className="rounded bg-[#064e3b] text-[#34d399] border border-emerald-800/80 px-2 py-0.5 text-[10px] font-bold">98.6%</span>
              </Link>

              {/* 5 */}
              <Link
                href="/clinical-alerts"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/clinical-alerts" && currentFilter !== "code-orange" ? "bg-red-500/25 text-red-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4 text-[#f43f5e]" />
                  <span>{isAr ? "التنبيهات السريرية الحرجة" : "Clinical Risk & Alerts"}</span>
                </div>
                <span className="rounded bg-[#e11d48] text-white px-2 py-0.5 text-[10px] font-extrabold animate-pulse">STAT 4</span>
              </Link>

              {/* 6 */}
              <Link
                href="/doctors"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname.startsWith("/doctors") ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-4 w-4 text-[#22d3ee]" />
                  <span>{isAr ? "الأطباء والاعتمادات" : "Physicians Directory"}</span>
                </div>
                <span className="rounded bg-[#1a2942] text-[#94a3b8] border border-slate-700/80 px-2 py-0.5 text-[10px] font-semibold">MDs 6</span>
              </Link>

              {/* 7 */}
              <Link
                href="/staff"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/staff" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#22d3ee]" />
                  <span>{isAr ? "مناوبات الكوادر والتمريض" : "Nursing Staff Shifts"}</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              </Link>

              {/* 8 */}
              <Link
                href="/patients?view=mychart"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  currentView === "mychart" ? "bg-pink-500/20 text-pink-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <HeartPulse className="h-4 w-4 text-[#fb7185]" />
                  <span>{isAr ? "بوابة المريض (MyChart)" : "Patient Portal (MyChart)"}</span>
                </div>
                <span className="rounded bg-[#4c0519] text-[#f43f5e] border border-rose-900/80 px-2 py-0.5 text-[10px] font-bold">MyChart</span>
              </Link>

              {/* 9 */}
              <Link
                href="/departments?dept=dep-ot"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/departments" && currentDept === "dep-ot" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Scissors className="h-4 w-4 text-[#22d3ee]" />
                  <span>{isAr ? "مجمع العمليات الجراحية" : "Operating Suites (OR)"}</span>
                </div>
                <span className="rounded bg-[#0c314a] text-[#22d3ee] border border-cyan-800/80 px-2 py-0.5 text-[10px] font-bold">WHO</span>
              </Link>

              {/* 10 */}
              <Link
                href="/departments?dept=dep-lab"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/departments" && currentDept === "dep-lab" ? "bg-red-500/20 text-red-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Droplets className="h-4 w-4 text-[#f43f5e]" />
                  <span>{isAr ? "بنك الدم وسلامة النقل" : "Blood Bank & Safety"}</span>
                </div>
                <span className="rounded bg-[#450a0a] text-[#f87171] border border-red-900/80 px-2 py-0.5 text-[10px] font-bold">ISBT 128</span>
              </Link>

              {/* 11 */}
              <Link
                href="/departments?dept=dep-icu"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  pathname === "/departments" && currentDept === "dep-icu" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-[#fbbf24]" />
                  <span>{isAr ? "مكافحة العدوى والعزل" : "Infection Control"}</span>
                </div>
                <span className="rounded bg-[#451a03] text-[#fbbf24] border border-amber-900/80 px-2 py-0.5 text-[10px] font-bold">HAI Map</span>
              </Link>

              {/* 12 */}
              <Link
                href="/clinical-alerts?filter=code-orange"
                onClick={() => setIsMobileNavOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                  currentFilter === "code-orange" ? "bg-rose-500/20 text-rose-300 font-bold" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Radio className="h-4 w-4 text-[#fb7185]" />
                  <span>{isAr ? "قيادة الكوارث والحوادث" : "Disaster Command"}</span>
                </div>
                <span className="rounded bg-[#e11d48] text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">Code Orange</span>
              </Link>

              {/* Admin Links */}
              <div className="pt-2 border-t border-[#0e233d] mt-2 space-y-1">
                <Link
                  href="/operations?tab=billing"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span>{isAr ? "الفوترة والتأمين الطبي" : "Billing & Revenue"}</span>
                </Link>
                <Link
                  href="/operations"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  <CalendarDays className="h-4 w-4 text-cyan-400" />
                  <span>{isAr ? "مركز إدارة المرافق والعمليات" : "Operations Center"}</span>
                </Link>
              </div>
            </div>
          ) : (
            HOSPITAL_DEPARTMENTS.map((dept) => {
              const name = isAr ? dept.nameAr : dept.nameEn;
              return (
                <Link
                  key={dept.id}
                  href={`/departments?dept=${dept.id}`}
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-400" />
                    <span>{name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-300 px-1.5 py-0.5 rounded border border-[#0e233d] bg-[#040d1a]">
                    {dept.code}
                  </span>
                </Link>
              );
            })
          )}
        </nav>

        {/* Mobile Telemetry Footer */}
        <div className="border-t border-[#0e233d] p-3 text-[11px] shrink-0 bg-[#040d1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-white font-bold text-xs">
                {isAr ? "مركز قيادة المستشفى" : "Command Center"}
              </span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">
              88.7% {isAr ? "إشغال" : "Occupancy"}
            </span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavInner />
    </Suspense>
  );
}
