"use client";

import React from "react";
import { useAuth } from "@/auth/auth-context";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { RoleId } from "@/types/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, UserCog, ChevronDown, Check } from "lucide-react";

export function DepartmentRoleSelector() {
  const { activeDepartment, activeRole, setActiveDepartment, setActiveRole } = useAuth();
  const { locale, t } = useI18n();

  const isAr = locale === "ar";
  const deptName = isAr ? activeDepartment.nameAr : activeDepartment.nameEn;
  const roleName = t.roles[activeRole] || activeRole;

  const rolesList: { id: RoleId; label: string }[] = [
    { id: "physician", label: t.roles.physician },
    { id: "medical_director", label: t.roles.medical_director },
    { id: "nurse_lead", label: t.roles.nurse_lead },
    { id: "nurse_staff", label: t.roles.nurse_staff },
    { id: "triage_officer", label: t.roles.triage_officer },
    { id: "pharmacist", label: t.roles.pharmacist },
    { id: "admissions_clerk", label: t.roles.admissions_clerk },
    { id: "billing_specialist", label: t.roles.billing_specialist },
  ];

  return (
    <div className="flex items-center gap-1.5">
      {/* Department Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
          style={{ backgroundColor: "var(--shell-bg-header)", borderColor: "var(--shell-border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-header)")}
        >
          <Building2 className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-medium max-w-[150px] truncate">{deptName}</span>
          <span className="text-[10px] text-cyan-300 font-mono">[{activeDepartment.code}]</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Select Active Department</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {HOSPITAL_DEPARTMENTS.map((dept) => {
            const isSelected = dept.id === activeDepartment.id;
            return (
              <DropdownMenuItem
                key={dept.id}
                onClick={() => setActiveDepartment(dept)}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">
                    {isAr ? dept.nameAr : dept.nameEn}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Floor: {dept.floor} • Beds: {dept.occupiedBeds}/{dept.totalBeds}
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-cyan-700 shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Picker */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
          style={{ backgroundColor: "var(--shell-bg-header)", borderColor: "var(--shell-border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--shell-bg-header)")}
        >
          <UserCog className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium max-w-[130px] truncate">{roleName}</span>
          <ChevronDown className="h-3 w-3 text-slate-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Clinical Role Context</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {rolesList.map((r) => {
            const isSelected = r.id === activeRole;
            return (
              <DropdownMenuItem
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className="flex items-center justify-between"
              >
                <span>{r.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-cyan-700 shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
