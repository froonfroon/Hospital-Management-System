"use client";

import React from "react";
import { useAuth } from "@/auth/auth-context";
import { useI18n } from "@/i18n/i18n-context";
import { useShell } from "./shell-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { RoleId } from "@/types/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  User,
  LogOut,
  ShieldCheck,
  Building2,
  UserCog,
  HelpCircle,
  Clock,
  Lock,
  ChevronDown,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { DemoLoginModal } from "./demo-login-modal";

export function UserProfileMenu() {
  const router = useRouter();
  const { user, activeDepartment, activeRole, setActiveRole, login, logout } = useAuth();
  const { locale, t } = useI18n();
  const { setIsHelpOpen } = useShell();
  const [isDemoModalOpen, setIsDemoModalOpen] = React.useState(false);
  const isAr = locale === "ar";

  if (!user) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push("/login")}
        className="gap-1.5 text-xs text-cyan-300 hover:text-white"
        style={{ backgroundColor: "var(--shell-bg-header)", borderColor: "var(--shell-border)" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-header)")}
      >
        <Lock className="h-3.5 w-3.5" />
        <span>{isAr ? "تسجيل الدخول" : "Sign In"}</span>
      </Button>
    );
  }

  const name = isAr ? user.fullNameAr : user.fullNameEn;
  const roleLabel = t.roles[activeRole] || activeRole;
  const deptName = isAr ? activeDepartment.nameAr : activeDepartment.nameEn;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-lg border py-1 px-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors cursor-pointer"
        style={{ backgroundColor: "var(--shell-bg-header)", borderColor: "var(--shell-border)" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-header)")}
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-700 text-[11px] font-bold text-white shrink-0">
          {name.charAt(0)}
        </div>
        <div className="text-start hidden sm:block max-w-[130px]">
          <span className="font-semibold block truncate text-[11px] leading-tight text-white">
            {name}
          </span>
          <span className="text-[10px] text-cyan-300 block truncate leading-tight">
            {roleLabel.split("/")[0].trim()}
          </span>
        </div>
        <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="font-bold text-slate-900 text-sm">{name}</div>
          <div className="text-[11px] text-slate-500 font-normal">{user.email}</div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
            <span>{t.common.badgeNumber}:</span>
            <span className="font-bold text-cyan-800">{user.badgeNumber}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Current Active Context */}
        <div className="px-2 py-1.5 text-[11px] space-y-1 bg-slate-50 rounded-md mx-1 border border-slate-200/60">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Building2 className="h-3.5 w-3.5 text-cyan-700 shrink-0" />
              <span>{isAr ? "القسم:" : "Dept:"}</span>
            </span>
            <span className="font-bold text-slate-900 truncate max-w-[140px]">{deptName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-slate-500">
              <UserCog className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span>{isAr ? "الدور:" : "Role:"}</span>
            </span>
            <span className="font-semibold text-emerald-800 truncate max-w-[140px]">{roleLabel}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Switch Demo Persona */}
        <DropdownMenuItem
          onClick={() => setIsDemoModalOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400 cursor-pointer"
        >
          <UserCog className="h-3.5 w-3.5" />
          <span>{isAr ? "تجربة دور وظيفي آخر (Switch Persona)" : "Switch Staff Persona"}</span>
        </DropdownMenuItem>

        {/* Clinical Protocols & Help Trigger */}
        <DropdownMenuItem
          onClick={() => setIsHelpOpen(true)}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5 text-cyan-700" />
          <span>{isAr ? "دليل النظام والبروتوكولات الطبية (?)" : "Clinical Help & Protocols (?)"}</span>
        </DropdownMenuItem>

        <div className="px-2 py-1 text-[10px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          <span>{isAr ? "ترخيص طبي رقمي معتمد" : "Verified Medical License"}</span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="text-red-700 focus:bg-red-50 focus:text-red-800 flex items-center gap-2 text-xs cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isAr ? "تسجيل الخروج / قفل الشاشة" : "Sign Out / Lock Terminal"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <DemoLoginModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </DropdownMenu>
  );
}
