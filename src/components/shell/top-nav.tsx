"use client";

import React, { useState } from "react";
import { useShell } from "./shell-context";
import { useI18n } from "@/i18n/i18n-context";
import { useAuth } from "@/auth/auth-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { UserProfileMenu } from "./user-profile-menu";
import { DemoLoginModal } from "./demo-login-modal";
import { hospitalDataAdapter } from "@/api/adapter";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/toast";
import {
  Search,
  Bell,
  Languages,
  Menu,
  Building2,
  ChevronDown,
  Check,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopNav() {
  const {
    setIsSearchOpen,
    setIsNotificationOpen,
    setIsMobileNavOpen,
  } = useShell();

  const { locale, toggleLocale } = useI18n();
  const { activeDepartment, setActiveDepartment } = useAuth();
  const { toast } = useToast();
  const [isDemoLoginOpen, setIsDemoLoginOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const isAr = locale === "ar";
  const deptName = isAr ? activeDepartment.nameAr : activeDepartment.nameEn;

  const handleConfirmReset = () => {
    hospitalDataAdapter.resetDemoData();
    setIsResetConfirmOpen(false);
    toast({
      title: isAr ? "تمت إعادة ضبط بيانات النظام بنجاح" : "Demo Data Reset Successfully",
      description: isAr
        ? "تمت استعادة كافة السجلات السريرية والأطباء والمواعيد إلى الحالة الافتراضية النظيفة."
        : "All synthetic clinical records, appointments, and telemetry have been restored to clean baseline.",
      variant: "warning",
    });
    // Trigger refresh
    window.location.reload();
  };

  return (
    <header
      className="no-print sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b px-3 sm:px-5 text-white select-none shrink-0"
      style={{ borderColor: "var(--shell-border)", backgroundColor: "var(--shell-bg-deep)" }}
    >
      {/* Start: Mobile Menu, Brand Indicator & Patient Search */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 md:hidden transition-colors cursor-pointer"
          style={{ color: "var(--shell-text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--shell-text-muted)"; }}
          aria-label="Open mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* System Online Telemetry Badge (Desktop) */}
        <div className="hidden xl:flex items-center gap-2 border-e pe-3 me-0.5" style={{ borderColor: "var(--shell-border)" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-bold text-xs text-slate-200 tracking-wide">HospitalOS</span>
          <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-900 bg-cyan-950/40">
            SOLVE-GEN-01
          </span>
        </div>

        {/* Global Patient Search Trigger */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors w-44 sm:w-60 md:w-72 lg:w-84 text-start cursor-pointer group"
          style={{ borderColor: "var(--shell-border)", backgroundColor: "var(--shell-bg-header)", color: "var(--shell-text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-400)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--shell-border)"; e.currentTarget.style.color = "var(--shell-text-muted)"; }}
        >
          <Search className="h-3.5 w-3.5 text-cyan-400 shrink-0 group-hover:text-cyan-300 transition-colors" aria-hidden="true" />
          <span className="flex-1 truncate">
            {isAr ? "بحث سريع عن مريض، ملف طبي..." : "Search patient by name, MRN, bed..."}
          </span>
          <kbd
            className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 border"
            style={{ backgroundColor: "var(--shell-bg-active)", borderColor: "var(--shell-border)" }}
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* End: Compact Department Context, Alerts, Language, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Compact Single Department Context Pill */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="hidden md:flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer"
            style={{ backgroundColor: "var(--shell-bg-header)", borderColor: "var(--shell-border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-header)")}
            title={isAr ? "القسم السريري النشط" : "Active Clinical Department"}
          >
            <Building2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
            <span className="font-medium max-w-[140px] truncate">{deptName}</span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">[{activeDepartment.code}]</span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
            <DropdownMenuLabel>
              {isAr ? "تغيير القسم الطبي النشط" : "Switch Active Department"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {HOSPITAL_DEPARTMENTS.map((dept) => {
              const isSelected = dept.id === activeDepartment.id;
              return (
                <DropdownMenuItem
                  key={dept.id}
                  onClick={() => setActiveDepartment(dept)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">
                      {isAr ? dept.nameAr : dept.nameEn}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {dept.floor} • {dept.occupiedBeds}/{dept.totalBeds} {isAr ? "سرير" : "beds"}
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-cyan-700 shrink-0" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Demo Persona Switcher */}
        <button
          type="button"
          onClick={() => setIsDemoLoginOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold text-cyan-300 hover:text-white transition-colors cursor-pointer bg-cyan-950/60 border-cyan-800/80 hover:bg-cyan-900/60 shadow-xs"
          title={isAr ? "تبديل وتجربة الأدوار السريرية والتشغيلية" : "Switch Hospital Staff Persona"}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{isAr ? "تجربة الأدوار" : "Demo Roles"}</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="rounded-lg border p-1.5 text-slate-400 hover:text-amber-400 hover:border-amber-700/60 transition-colors focus:outline-none cursor-pointer"
          style={{ borderColor: "var(--shell-border)", backgroundColor: "var(--shell-bg-header)" }}
          title={isAr ? "إعادة ضبط بيانات النظام التجريبي (Reset Demo)" : "Reset Demo Data to Baseline"}
          aria-label="Reset demo data"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>

        {/* Clinical STAT Alerts Notification Bell */}
        <button
          type="button"
          onClick={() => setIsNotificationOpen(true)}
          className="relative rounded-lg border p-1.5 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
          style={{ borderColor: "var(--shell-border)", backgroundColor: "var(--shell-bg-header)", color: "var(--shell-text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--shell-bg-header)"; e.currentTarget.style.color = "var(--shell-text-muted)"; }}
          title={isAr ? "تنبيهات الحالات السريرية الحرجة (2)" : "Clinical STAT Alerts (2)"}
          aria-label="Clinical STAT notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-[var(--shell-bg-deep)]">
            2
          </span>
        </button>

        {/* Language Switcher (English LTR / Arabic RTL) */}
        <button
          type="button"
          onClick={toggleLocale}
          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs text-white hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
          style={{ borderColor: "var(--shell-border)", backgroundColor: "var(--shell-bg-header)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-header)")}
          title={locale === "en" ? "التبديل إلى العربية" : "Switch to English"}
          aria-label={`Switch language to ${locale === "en" ? "Arabic" : "English"}`}
        >
          <Languages className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-bold">{locale === "en" ? "العربية" : "English"}</span>
        </button>

        <div className="h-4 w-px bg-slate-700/80 mx-0.5" />

        {/* User Profile Menu with Credentials & Context */}
        <UserProfileMenu />
      </div>

      {/* Demo Persona Switcher Modal */}
      <DemoLoginModal
        isOpen={isDemoLoginOpen}
        onClose={() => setIsDemoLoginOpen(false)}
      />

      {/* Reset Demo Data Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title={isAr ? "إعادة ضبط بيانات النظام التجريبي" : "Reset Demo Data"}
        description={
          isAr
            ? "هل ترغب في إعادة ضبط كافة المرضى والأطباء والمواعيد والتنبيهات إلى حالتها الافتراضية النظيفة؟ سيتم مسح التغييرات المحلية المسجلة وإعادة تحميل النظام."
            : "Are you sure you want to reset all synthetic patients, doctors, appointments, and telemetry to clean initial baseline? Local storage entries will be restored."
        }
        confirmLabel={isAr ? "تأكيد إعادة الضبط" : "Reset All Data"}
        cancelLabel={isAr ? "إلغاء" : "Cancel"}
        variant="warning"
      />
    </header>
  );
}
