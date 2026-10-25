"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Patient } from "@/types/patient";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/i18n-context";
import { formatDate } from "@/lib/utils";
import { Eye, ShieldAlert, Bed } from "lucide-react";

interface PatientRegistryTableProps {
  patients: Patient[];
  isLoading: boolean;
  onSelectPatient: (patient: Patient) => void;
}

export function PatientRegistryTable({
  patients,
  isLoading,
  onSelectPatient,
}: PatientRegistryTableProps) {
  const { locale, t } = useI18n();

  const columns = useMemo<ColumnDef<Patient, any>[]>(() => {
    const isAr = locale === "ar";

    return [
      {
        accessorKey: "mrn",
        header: t.common.mrn,
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-cyan-900 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-100 text-[11px]">
            {row.original.mrn}
          </span>
        ),
      },
      {
        accessorKey: "fullNameEn",
        header: t.patient.fullName,
        cell: ({ row }) => {
          const patient = row.original;
          const name = isAr ? patient.fullNameAr : patient.fullNameEn;
          const altName = isAr ? patient.fullNameEn : patient.fullNameAr;

          return (
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-[10px] text-slate-400">{altName}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "age",
        header: `${t.common.age} / ${t.common.gender}`,
        cell: ({ row }) => (
          <span className="text-slate-700">
            {row.original.age}y • {row.original.gender.charAt(0).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: "bed.bedNumber",
        header: `${t.common.department} & ${t.common.bed}`,
        cell: ({ row }) => {
          const p = row.original;
          const dept = isAr ? p.departmentNameAr : p.departmentNameEn;

          return (
            <div>
              <div className="flex items-center gap-1 font-medium text-slate-900">
                <Bed className="h-3.5 w-3.5 text-slate-500" />
                <span>{p.bed.bedNumber}</span>
                <span className="text-slate-400 text-[10px]">({p.bed.roomNumber})</span>
              </div>
              <div className="text-[10px] text-slate-500 max-w-[140px] truncate">
                {dept}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "triageLevel",
        header: "Triage Acuity",
        cell: ({ row }) => {
          const triage = row.original.triageLevel;
          const variant =
            triage === "1_resuscitation"
              ? "critical"
              : triage === "2_emergent"
              ? "urgent"
              : triage === "3_urgent"
              ? "warning"
              : "routine";

          const triageLabels: Record<string, string> = {
            "1_resuscitation": "L1 Resuscitation",
            "2_emergent": "L2 Emergent",
            "3_urgent": "L3 Urgent",
            "4_less_urgent": "L4 Less Urgent",
            "5_non_urgent": "L5 Non-Urgent",
          };

          return (
            <StatusBadge variant={variant} size="sm">
              {triageLabels[triage] || triage}
            </StatusBadge>
          );
        },
      },
      {
        accessorKey: "status",
        header: t.common.status,
        cell: ({ row }) => {
          const status = row.original.status;
          const variant =
            status === "admitted"
              ? "routine"
              : status === "observation"
              ? "warning"
              : status === "discharge_ready"
              ? "stable"
              : "neutral";

          const statusText = (t.status as Record<string, string>)[status] || status;

          return (
            <StatusBadge variant={variant} size="sm">
              {statusText}
            </StatusBadge>
          );
        },
      },
      {
        accessorKey: "admissionDate",
        header: t.common.date,
        cell: ({ row }) => (
          <span className="text-slate-600 text-[11px]">
            {formatDate(row.original.admissionDate, locale)}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.common.actions,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPatient(row.original);
            }}
            className="text-cyan-800 hover:text-cyan-950 hover:bg-cyan-50 gap-1 text-[11px]"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{t.common.view}</span>
          </Button>
        ),
      },
    ];
  }, [locale, t, onSelectPatient]);

  return (
    <DataTable
      columns={columns}
      data={patients}
      isLoading={isLoading}
      onRowClick={onSelectPatient}
      emptyMessage={t.common.noResults}
    />
  );
}
