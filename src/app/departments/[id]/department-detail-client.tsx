"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DepartmentInfo } from "@/types/common";
import { hospitalDataAdapter } from "@/api/adapter";
import { Patient } from "@/types/patient";
import { useI18n } from "@/i18n/i18n-context";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { DepartmentWorkflowConsole } from "@/features/departments/components/department-workflow-console";
import { PatientClinicalDrawer } from "@/features/patients/components/patient-clinical-drawer";
import { PatientRegistrationDialog } from "@/features/patients/components/patient-registration-dialog";
import { PatientAdmissionFormValues } from "@/features/patients/schemas";
import { useToast } from "@/components/ui/toast";
import {
  Bed,
  Users,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  ArrowLeft,
  ArrowRight,
  Activity,
} from "lucide-react";

interface DepartmentDetailClientProps {
  department: DepartmentInfo;
}

export function DepartmentDetailClient({ department }: DepartmentDetailClientProps) {
  const { locale, t } = useI18n();
  const { toast } = useToast();
  const isAr = locale === "ar";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);

  useEffect(() => {
    hospitalDataAdapter
      .getPatients({ page: 1, pageSize: 20 }, { departmentId: department.id })
      .then((res) => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [department.id]);

  const handleAdmissionSubmit = async (values: PatientAdmissionFormValues) => {
    const res = await hospitalDataAdapter.createPatient({
      nationalId: values.nationalId,
      fullNameEn: values.fullNameEn,
      fullNameAr: values.fullNameAr,
      dateOfBirth: values.dateOfBirth,
      age: 2026 - parseInt(values.dateOfBirth.split("-")[0]),
      gender: values.gender,
      bloodType: values.bloodType,
      phoneNumber: values.phoneNumber,
      emergencyContact: {
        name: values.emergencyContactName,
        relationship: values.emergencyContactRelation,
        phoneNumber: values.emergencyContactPhone,
      },
      insurance: {
        provider: "Direct Hospital Admission",
        policyNumber: "POL-DIRECT",
        coveragePercent: 100,
        validUntil: "2027-12-31",
      },
      status: "admitted",
      triageLevel: values.triageLevel,
      attendingPhysician: "Staff Consultant, MD",
      departmentId: department.id,
      departmentNameEn: department.nameEn,
      departmentNameAr: department.nameAr,
      admissionDate: new Date().toISOString(),
      bed: {
        bedNumber: values.bedNumber,
        roomNumber: values.roomNumber,
        departmentCode: department.code,
        departmentNameEn: department.nameEn,
        departmentNameAr: department.nameAr,
        status: "occupied",
      },
      primaryDiagnosisEn: values.primaryDiagnosisEn,
      primaryDiagnosisAr: values.primaryDiagnosisAr,
      allergies: values.allergiesText && values.allergiesText !== "NKDA"
        ? [{ substance: values.allergiesText, reaction: "Adverse Reaction", severity: "moderate" }]
        : [],
      chronicConditions: [],
    });

    setPatients((prev) => [res.data, ...prev]);
    toast({
      title: isAr ? "تم تسجيل تنويم المريض بالقسم بنجاح" : "Patient Admitted to Ward",
      description: `${values.fullNameEn} (${values.bedNumber})`,
      variant: "success",
    });
  };

  const occupancy =
    department.operationalBeds > 0
      ? Math.round((department.occupiedBeds / department.operationalBeds) * 100)
      : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: t.nav.clinicalWorkspace, href: "/" },
              { label: isAr ? "الأقسام الطبية" : "Hospital Departments", href: "/departments" },
              { label: isAr ? department.nameAr : department.nameEn, current: true },
            ]}
          />
        }
        title={isAr ? department.nameAr : department.nameEn}
        subtitle={`${department.code} • Floor: ${department.floor} • ${department.wing} • On Duty: ${department.onDutyPhysicians} Physicians, ${department.onDutyNurses} Nurses`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/departments">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                {isAr ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                <span>{isAr ? "كافة الأقسام" : "All Departments"}</span>
              </Button>
            </Link>
            <Button size="sm" onClick={() => setIsAdmitOpen(true)} className="gap-1.5 font-semibold text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isAr ? "تنويم مريض بالقسم" : "Admit to Ward"}</span>
            </Button>
          </div>
        }
      />

      {/* Department KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={isAr ? "الأسرة التشغيلية المفعلة" : "Operational Staffed Beds"}
          value={department.operationalBeds}
          subtitle={`Physical licensed: ${department.totalBeds}`}
          icon={<Bed className="h-4 w-4 text-cyan-600" />}
        />
        <StatCard
          title={isAr ? "المرضى المنومون حالياً" : "Current Ward Census"}
          value={department.occupiedBeds}
          subtitle={`${occupancy}% Operational Occupancy`}
          trend={occupancy >= 85 ? { value: "Near Capacity", isPositive: false } : undefined}
          icon={<Users className="h-4 w-4 text-cyan-600" />}
        />
        <StatCard
          title={isAr ? "الأسرة الجاهزة فوراً" : "Immediately Available"}
          value={department.availableBeds}
          subtitle="Sanitized & Prepped"
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        />
        <StatCard
          title={isAr ? "الحالات الحرجة / الإنعاش" : "Critical Care Cases"}
          value={department.criticalCases}
          subtitle="Requiring 1:1 Nursing"
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
        />
      </div>

      {/* Specialized Clinical Department Workflow Console */}
      <DepartmentWorkflowConsole department={department} />

      {/* Inpatient Census & Active Patients in Department */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isAr ? "سجل مرضى القسم والحالات السريرية المقيمة" : "Active Inpatient Census & Clinical Cases"}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {patients.length} {patients.length === 1 ? "Patient" : "Patients"} on Ward
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Loading departmental patient census...
          </div>
        ) : patients.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-2">
            <Bed className="h-6 w-6 text-slate-400 mx-auto" />
            <p>No active inpatients currently registered in this unit.</p>
            <Button size="sm" variant="outline" onClick={() => setIsAdmitOpen(true)}>
              Admit First Patient to {department.code}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-cyan-100 text-cyan-900 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {patient.bed.bedNumber.replace("BED-", "")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {isAr ? patient.fullNameAr : patient.fullNameEn}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {patient.mrn}
                      </span>
                      <StatusBadge
                        variant={
                          patient.triageLevel === "1_resuscitation"
                            ? "critical"
                            : patient.triageLevel === "2_emergent"
                            ? "urgent"
                            : "routine"
                        }
                        size="sm"
                      >
                        {patient.triageLevel.replace("_", " ").toUpperCase()}
                      </StatusBadge>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      {isAr ? patient.primaryDiagnosisAr : patient.primaryDiagnosisEn}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-3">
                      <span>Room {patient.bed.roomNumber}</span>
                      <span>•</span>
                      <span>Attending: {patient.attendingPhysician}</span>
                      <span>•</span>
                      <span>Admitted: {new Date(patient.admissionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {patient.latestVitals && (
                    <div className="text-end text-[11px] text-slate-600 hidden md:block">
                      <div>
                        HR: <strong>{patient.latestVitals.heartRate}</strong> bpm • SpO2: <strong>{patient.latestVitals.oxygenSaturation}%</strong>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        BP: {patient.latestVitals.systolicBP}/{patient.latestVitals.diastolicBP} mmHg
                      </div>
                    </div>
                  )}
                  <Button size="sm" variant="outline" className="text-xs">
                    {isAr ? "فتح الملف" : "Open Chart"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-Over Clinical Chart Drawer */}
      <PatientClinicalDrawer
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onStatusChange={(id, newStatus) => {
          setSelectedPatient((prev) => (prev ? { ...prev, status: newStatus } : null));
          setPatients((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
          );
        }}
      />

      {/* Patient Admission Dialog */}
      <PatientRegistrationDialog
        isOpen={isAdmitOpen}
        onClose={() => setIsAdmitOpen(false)}
        onSubmitPatient={handleAdmissionSubmit}
      />
    </div>
  );
}
