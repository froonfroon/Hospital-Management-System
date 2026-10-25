"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { hospitalDataAdapter, PatientFilters } from "@/api/adapter";
import { Patient } from "@/types/patient";
import { PaginationMeta } from "@/types/common";
import { useI18n } from "@/i18n/i18n-context";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { PageHeader } from "@/components/ui/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { StatCard } from "@/components/ui/stat-card";
import { FilterBar } from "@/components/ui/filter-bar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PatientRegistryTable } from "@/features/patients/components/patient-registry-table";
import { PatientRegistrationDialog } from "@/features/patients/components/patient-registration-dialog";
import { PatientClinicalDrawer } from "@/features/patients/components/patient-clinical-drawer";
import { PatientAdmissionFormValues } from "@/features/patients/schemas";
import { LoadingStateView } from "@/components/common/state-views";
import { useToast } from "@/components/ui/toast";
import { Users, AlertTriangle, Bed, UserPlus, Search, Download } from "lucide-react";

function PatientsContent() {
  const { locale, t } = useI18n();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const selectedMrnParam = searchParams.get("selectedMrn");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [triageFilter, setTriageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog & Drawer state
  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const fetchPatients = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const filters: PatientFilters = {
          searchQuery,
          departmentId: departmentFilter,
          triageLevel: triageFilter,
          status: statusFilter,
        };

        const res = await hospitalDataAdapter.getPatients(
          { page, pageSize: pagination.pageSize },
          filters
        );

        setPatients(res.data);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }

        // If URL param specifies selectedMrn, open that patient
        if (selectedMrnParam) {
          const match = res.data.find((p) => p.mrn === selectedMrnParam);
          if (match) setSelectedPatient(match);
        }
      } catch (err) {
        console.error("Failed to load patients", err);
      } finally {
        setLoading(false);
      }
    },
    [searchQuery, departmentFilter, triageFilter, statusFilter, pagination.pageSize, selectedMrnParam]
  );

  useEffect(() => {
    fetchPatients(1);
  }, [fetchPatients]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("all");
    setTriageFilter("all");
    setStatusFilter("all");
  };

  const handleAdmitSubmit = async (values: PatientAdmissionFormValues) => {
    const dept = HOSPITAL_DEPARTMENTS.find((d) => d.id === values.departmentId);

    await hospitalDataAdapter.createPatient({
      nationalId: values.nationalId,
      fullNameEn: values.fullNameEn,
      fullNameAr: values.fullNameAr,
      dateOfBirth: values.dateOfBirth,
      age: 2026 - new Date(values.dateOfBirth).getFullYear(),
      gender: values.gender,
      bloodType: values.bloodType,
      phoneNumber: values.phoneNumber,
      emergencyContact: {
        name: values.emergencyContactName,
        relationship: values.emergencyContactRelation,
        phoneNumber: values.emergencyContactPhone,
      },
      insurance: {
        provider: "Cooperative Healthcare",
        policyNumber: "POL-DEV-NEW",
        coveragePercent: 90,
        validUntil: "2027-12-31",
      },
      status: "admitted",
      triageLevel: values.triageLevel,
      attendingPhysician: "Dr. Sarah Chen, MD",
      departmentId: values.departmentId,
      departmentNameEn: dept ? dept.nameEn : "General Medicine",
      departmentNameAr: dept ? dept.nameAr : "الطب العام",
      admissionDate: new Date().toISOString(),
      bed: {
        bedNumber: values.bedNumber,
        roomNumber: values.roomNumber,
        departmentCode: dept ? dept.code : "GEN",
        departmentNameEn: dept ? dept.nameEn : "General Medicine",
        departmentNameAr: dept ? dept.nameAr : "الطب العام",
        status: "occupied",
      },
      primaryDiagnosisEn: values.primaryDiagnosisEn,
      primaryDiagnosisAr: values.primaryDiagnosisAr,
      allergies: values.allergiesText && values.allergiesText !== "NKDA"
        ? [{ substance: values.allergiesText, reaction: "Adverse Reaction", severity: "moderate" }]
        : [],
      chronicConditions: [],
      vitalsHistory: [],
      medications: [],
      clinicalNotes: [],
    });

    fetchPatients(1);
    toast({
      title: locale === "ar" ? "تم تسجيل تنويم المريض بنجاح" : "Inpatient Admitted Successfully",
      description: `${values.fullNameEn} (${values.bedNumber})`,
      variant: "success",
    });
  };

  const handleStatusChange = async (id: string, newStatus: Patient["status"]) => {
    await hospitalDataAdapter.updatePatientStatus(id, newStatus);
    setSelectedPatient((prev) => (prev ? { ...prev, status: newStatus } : null));
    fetchPatients(pagination.currentPage);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: t.nav.clinicalWorkspace, href: "/" },
              { label: t.nav.patientRegistry, current: true },
            ]}
          />
        }
        title={t.patient.registryTitle}
        subtitle={t.patient.registrySubtitle}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Download className="h-3.5 w-3.5" />
              <span>{t.common.print}</span>
            </Button>
            <Button size="sm" onClick={() => setIsAdmitOpen(true)} className="gap-1.5">
              <UserPlus className="h-3.5 w-3.5" />
              <span>{t.patient.admitPatient}</span>
            </Button>
          </>
        }
      />

      {/* MyChart Portal View Banner */}
      {searchParams.get("view") === "mychart" && (
        <div className="rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white p-5 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded bg-rose-600 text-white px-2 py-0.5 text-xs font-bold shadow-xs">
                MyChart
              </span>
              <h2 className="text-base font-extrabold text-white">
                {locale === "ar" ? "بوابة المريض الرقمية والرعاية الذاتية (MyChart Portal)" : "MyChart Patient Engagement & Telemetry Portal"}
              </h2>
            </div>
            <p className="text-xs text-rose-200">
              {locale === "ar"
                ? "متابعة تفعيل حسابات المرضى الرقمية، الرسائل السريرية المباشرة مع الأطباء، ومشاركة النتائج المخبرية والشعاعية."
                : "Active patient self-service telemetry, direct clinical messaging, lab/radiology release, and digital appointment booking."}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs shrink-0">
            <span className="rounded-lg bg-rose-900/60 border border-rose-700/80 px-3 py-1.5 font-bold text-rose-300">
              {locale === "ar" ? "7 حسابات نشطة" : "7 Active Portals"}
            </span>
            <Link
              href="/patients"
              className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 font-semibold text-white transition-colors"
            >
              {locale === "ar" ? "عرض كافة المرضى" : "All Patients"}
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title={t.stats.totalAdmitted}
          value={pagination.totalItems}
          subtitle={locale === "ar" ? "إجمالي المنومين بالوقت الفعلي" : "Real-time inpatient count"}
          icon={<Users className="h-4 w-4 text-cyan-700" />}
        />
        <StatCard
          title={t.stats.triageCritical}
          value="1 STAT"
          subtitle={locale === "ar" ? "حالات فرز سريري عالية الخطورة (1 و 2)" : "Level 1 & 2 acuity cases"}
          trend={{ value: locale === "ar" ? "تدخل فوري عند السرير" : "Immediate Bedside", isPositive: false }}
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
        />
        <StatCard
          title={t.stats.occupancyRate}
          value="87.4%"
          subtitle={locale === "ar" ? "167 من إجمالي 191 سرير" : "167 / 191 total beds"}
          icon={<Bed className="h-4 w-4 text-purple-700" />}
        />
        <StatCard
          title={t.stats.erWaitTime}
          value={locale === "ar" ? "14 دقيقة" : "14 min"}
          subtitle={locale === "ar" ? "متوسط من الوصول حتى استلام الطبيب" : "Door-to-provider metric"}
          trend={{ value: locale === "ar" ? "-4 د اليوم" : "-4 min today", isPositive: true }}
          icon={<Users className="h-4 w-4 text-emerald-600" />}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar onReset={handleResetFilters} resetLabel={t.common.clearFilters}>
        <div className="relative w-full sm:w-64">
          <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.patient.searchPlaceholder}
            className="ps-8 h-8"
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">{locale === "ar" ? "كافة الأقسام الطبية" : "All Departments"}</option>
            {HOSPITAL_DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {locale === "ar" ? dept.nameAr : dept.nameEn}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-36">
          <Select
            value={triageFilter}
            onChange={(e) => setTriageFilter(e.target.value)}
          >
            <option value="all">{locale === "ar" ? "كافة درجات الفرز" : "All Triage"}</option>
            <option value="1_resuscitation">{locale === "ar" ? "المستوى 1: إنعاش" : "L1: Resuscitation"}</option>
            <option value="2_emergent">{locale === "ar" ? "المستوى 2: طارئ" : "L2: Emergent"}</option>
            <option value="3_urgent">{locale === "ar" ? "المستوى 3: عاجل" : "L3: Urgent"}</option>
            <option value="4_less_urgent">{locale === "ar" ? "المستوى 4: أقل إلحاحاً" : "L4: Less Urgent"}</option>
          </Select>
        </div>

        <div className="w-full sm:w-36">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{locale === "ar" ? "كافة الحالات" : "All Statuses"}</option>
            <option value="admitted">{locale === "ar" ? "منوم حالياً" : "Admitted"}</option>
            <option value="observation">{locale === "ar" ? "تحت الملاحظة" : "Observation"}</option>
            <option value="discharge_ready">{locale === "ar" ? "جاهز للخروج" : "Discharge Ready"}</option>
            <option value="discharged">{locale === "ar" ? "تم الخروج" : "Discharged"}</option>
          </Select>
        </div>
      </FilterBar>

      {/* Patients Data Table */}
      <PatientRegistryTable
        patients={patients}
        isLoading={loading}
        onSelectPatient={(p) => setSelectedPatient(p)}
      />

      {/* Table Pagination */}
      <Pagination
        meta={pagination}
        onPageChange={(page) => fetchPatients(page)}
      />

      {/* Admit Patient Modal */}
      <PatientRegistrationDialog
        isOpen={isAdmitOpen}
        onClose={() => setIsAdmitOpen(false)}
        onSubmitPatient={handleAdmitSubmit}
      />

      {/* Patient Clinical Inspection Drawer */}
      <PatientClinicalDrawer
        patient={selectedPatient}
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<LoadingStateView />}>
      <PatientsContent />
    </Suspense>
  );
}
