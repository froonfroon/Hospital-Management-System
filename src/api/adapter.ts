import { apiClient, ApiError } from "./client";
import {
  MOCK_PATIENTS,
  MOCK_DOCTORS,
  MOCK_DOCTOR_SCHEDULES,
  MOCK_CLINICAL_ALERTS,
  MOCK_DEPARTMENT_ASSIGNMENTS,
  MOCK_STAFF_SHIFTS,
} from "./fixtures";
import { MOCK_APPOINTMENTS } from "@/data/mock-appointments";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";
import { Patient } from "@/types/patient";
import {
  ClinicalOrder,
  VitalSign,
  ClinicalAlert,
  DepartmentAssignment,
  PatientTimelineEvent,
  AlertWorkflowStatus,
  AssignmentStatus,
  AppointmentRecord,
} from "@/types/clinical";
import { Doctor, DoctorSchedule, DoctorVerificationStatus, StaffShift } from "@/types/staff";
import { DepartmentInfo, PaginationParams, PaginationMeta } from "@/types/common";
import { ApiResponse } from "@/types/api";

const isDevFixtures = process.env.NEXT_PUBLIC_USE_DEV_FIXTURES !== "false";

// Helper utilities for browser localStorage persistence
function loadCache<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`hospitalos:${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[HospitalOS] Failed to read ${key} from storage:`, e);
    return fallback;
  }
}

function saveCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`hospitalos:${key}`, JSON.stringify(data));
  } catch (e) {
    console.warn(`[HospitalOS] Failed to save ${key} to storage:`, e);
  }
}

const INITIAL_ORDERS: ClinicalOrder[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-2026-8801",
    patientId: "pat-1001",
    patientName: "Tariq Mansoor Al-Harbi",
    patientMrn: "MRN-2026-4412",
    orderType: "medication",
    priority: "stat",
    status: "in_progress",
    title: "Enoxaparin (Lovenox) 60mg SC",
    details: "60 mg Subcutaneous Q12H for Acute NSTEMI Anticoagulation",
    departmentId: "dep-cardio",
    orderedBy: {
      id: "usr-1",
      name: "Dr. Sarah Chen, MD",
      role: "physician",
    },
    orderedAt: "2026-10-23T20:00:00Z",
  },
  {
    id: "ord-102",
    orderNumber: "ORD-2026-8802",
    patientId: "pat-1001",
    patientName: "Tariq Mansoor Al-Harbi",
    patientMrn: "MRN-2026-4412",
    orderType: "laboratory",
    priority: "urgent",
    status: "completed",
    title: "High-Sensitivity Cardiac Troponin T",
    details: "Serial draw at 6h interval post PCI",
    departmentId: "dep-lab",
    orderedBy: {
      id: "usr-1",
      name: "Dr. Sarah Chen, MD",
      role: "physician",
    },
    orderedAt: "2026-10-23T16:00:00Z",
  },
  {
    id: "ord-103",
    orderNumber: "ORD-2026-8803",
    patientId: "pat-1002",
    patientName: "Maryam Salem Al-Dawsari",
    patientMrn: "MRN-2026-8819",
    orderType: "medication",
    priority: "urgent",
    status: "in_progress",
    title: "Ceftriaxone 1g IV Infusion",
    details: "1g IV once daily diluted in 100mL Normal Saline over 30 mins",
    departmentId: "dep-ortho",
    orderedBy: {
      id: "usr-2",
      name: "Dr. Yasser Al-Husseini, MD",
      role: "physician",
    },
    orderedAt: "2026-10-24T10:15:00Z",
  },
  {
    id: "ord-104",
    orderNumber: "ORD-2026-8804",
    patientId: "pat-1003",
    patientName: "Zaid Omar Al-Otaibi",
    patientMrn: "MRN-2026-1029",
    orderType: "laboratory",
    priority: "routine",
    status: "in_progress",
    title: "Complete Blood Count (CBC) with Differential",
    details: "Venous blood draw in EDTA tube for pediatric review",
    departmentId: "dep-lab",
    orderedBy: {
      id: "usr-3",
      name: "Dr. Amina Al-Mansoor, MD",
      role: "physician",
    },
    orderedAt: "2026-10-24T11:30:00Z",
  },
  {
    id: "ord-105",
    orderNumber: "ORD-2026-8805",
    patientId: "pat-1001",
    patientName: "Tariq Mansoor Al-Harbi",
    patientMrn: "MRN-2026-4412",
    orderType: "medication",
    priority: "routine",
    status: "in_progress",
    title: "Atorvastatin (Lipitor) 80mg Oral",
    details: "80 mg PO at bedtime for Acute Coronary Syndrome stabilization",
    departmentId: "dep-cardio",
    orderedBy: {
      id: "usr-1",
      name: "Dr. Sarah Chen, MD",
      role: "physician",
    },
    orderedAt: "2026-10-24T14:00:00Z",
  },
];

// Local repository initialized from localStorage or synthetic fixtures
let devPatientsCache: Patient[] = loadCache("patients", [...MOCK_PATIENTS]);
let devDoctorsCache: Doctor[] = loadCache("doctors", [...MOCK_DOCTORS]);
let devAlertsCache: ClinicalAlert[] = loadCache("alerts", [...MOCK_CLINICAL_ALERTS]);
let devAssignmentsCache: DepartmentAssignment[] = loadCache("assignments", [...MOCK_DEPARTMENT_ASSIGNMENTS]);
let devStaffShiftsCache: StaffShift[] = loadCache("staff_shifts", [...MOCK_STAFF_SHIFTS]);
let devOrdersCache: ClinicalOrder[] = loadCache("orders", [...INITIAL_ORDERS]);
let devAppointmentsCache: AppointmentRecord[] = loadCache("appointments", [...MOCK_APPOINTMENTS]);

export interface PatientFilters {
  searchQuery?: string;
  departmentId?: string;
  status?: string;
  triageLevel?: string;
}

export interface DoctorFilters {
  searchQuery?: string;
  departmentId?: string;
  specialty?: string;
  verificationStatus?: DoctorVerificationStatus | "all";
  employmentStatus?: string;
}

export interface ClinicalAlertFilters {
  category?: string;
  severity?: string;
  status?: AlertWorkflowStatus | "all";
  departmentId?: string;
  patientId?: string;
}


export const hospitalDataAdapter = {
  isUsingFixtures: isDevFixtures,

  async getPatients(
    params: PaginationParams = { page: 1, pageSize: 10 },
    filters?: PatientFilters,
    signal?: AbortSignal
  ): Promise<ApiResponse<Patient[]>> {
    if (!isDevFixtures) {
      // Real backend API endpoint
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(params.page));
      queryParams.set("pageSize", String(params.pageSize));
      if (filters?.searchQuery) queryParams.set("q", filters.searchQuery);
      if (filters?.departmentId) queryParams.set("departmentId", filters.departmentId);
      if (filters?.status) queryParams.set("status", filters.status);
      if (filters?.triageLevel) queryParams.set("triageLevel", filters.triageLevel);

      return apiClient.get<Patient[]>(`/patients?${queryParams.toString()}`, { signal });
    }

    // Dedicated synthetic development fixture adapter with artificial network latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    let filtered = [...devPatientsCache];

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.fullNameEn.toLowerCase().includes(q) ||
          p.fullNameAr.includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.nationalId.includes(q) ||
          p.bed.bedNumber.toLowerCase().includes(q)
      );
    }

    if (filters?.departmentId && filters.departmentId !== "all") {
      filtered = filtered.filter((p) => p.departmentId === filters.departmentId);
    }

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters?.triageLevel && filters.triageLevel !== "all") {
      filtered = filtered.filter((p) => p.triageLevel === filters.triageLevel);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / params.pageSize) || 1;
    const startIndex = (params.page - 1) * params.pageSize;
    const pageData = filtered.slice(startIndex, startIndex + params.pageSize);

    const pagination: PaginationMeta = {
      currentPage: params.page,
      pageSize: params.pageSize,
      totalItems,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };

    return {
      data: pageData,
      meta: {
        correlationId: `mock-dev-${Date.now()}`,
        timestamp: new Date().toISOString(),
        pagination,
      },
    };
  },

  async getPatientById(id: string, signal?: AbortSignal): Promise<ApiResponse<Patient>> {
    if (!isDevFixtures) {
      return apiClient.get<Patient>(`/patients/${id}`, { signal });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    const patient = devPatientsCache.find((p) => p.id === id || p.mrn === id);
    if (!patient) {
      throw new ApiError(
        404,
        "PATIENT_NOT_FOUND",
        `Patient with ID ${id} was not found in the hospital registry.`,
        `لم يتم العثور على المريض بالمعرف ${id} في السجل الطبي للمستشفى.`,
        `mock-404-${Date.now()}`
      );
    }

    return {
      data: patient,
      meta: {
        correlationId: `mock-get-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async createPatient(patientData: Omit<Patient, "id" | "mrn">): Promise<ApiResponse<Patient>> {
    if (!isDevFixtures) {
      return apiClient.post<Patient>("/patients", patientData);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const newId = `pat-${Date.now()}`;
    const nextNum = 5000 + devPatientsCache.length;
    const newMrn = `MRN-2026-${nextNum}`;

    const newPatient: Patient = {
      ...patientData,
      id: newId,
      mrn: newMrn,
      auditHistory: [
        {
          timestamp: new Date().toISOString(),
          performedBy: {
            id: "usr-active",
            name: "Dr. Sarah Chen, MD",
            role: "Attending Physician",
          },
          action: "Patient Admitted & Registered in HospitalOS",
        },
      ],
    };

    devPatientsCache = [newPatient, ...devPatientsCache];
    saveCache("patients", devPatientsCache);

    return {
      data: newPatient,
      meta: {
        correlationId: `mock-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async updatePatientStatus(
    id: string,
    status: Patient["status"]
  ): Promise<ApiResponse<Patient>> {
    if (!isDevFixtures) {
      return apiClient.put<Patient>(`/patients/${id}/status`, { status });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = devPatientsCache.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new ApiError(
        404,
        "PATIENT_NOT_FOUND",
        `Patient ${id} not found`,
        `المريض ${id} غير موجود`,
        `mock-404-${Date.now()}`
      );
    }

    const updated = {
      ...devPatientsCache[index],
      status,
    };
    devPatientsCache[index] = updated;
    saveCache("patients", devPatientsCache);

    return {
      data: updated,
      meta: {
        correlationId: `mock-update-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async getDepartments(signal?: AbortSignal): Promise<ApiResponse<DepartmentInfo[]>> {
    if (!isDevFixtures) {
      return apiClient.get<DepartmentInfo[]>("/departments", { signal });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    return {
      data: HOSPITAL_DEPARTMENTS,
      meta: {
        correlationId: `mock-dep-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async getClinicalOrders(patientId?: string): Promise<ApiResponse<ClinicalOrder[]>> {
    if (!isDevFixtures) {
      const url = patientId ? `/orders?patientId=${patientId}` : "/orders";
      return apiClient.get<ClinicalOrder[]>(url);
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
    const data = patientId ? devOrdersCache.filter((o) => o.patientId === patientId) : devOrdersCache;
    return {
      data,
      meta: {
        correlationId: `mock-orders-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async createClinicalOrder(
    order: Omit<ClinicalOrder, "id" | "orderNumber" | "orderedAt">
  ): Promise<ApiResponse<ClinicalOrder>> {
    if (!isDevFixtures) {
      return apiClient.post<ClinicalOrder>("/orders", order);
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newOrder: ClinicalOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderedAt: new Date().toISOString(),
    };
    devOrdersCache = [newOrder, ...devOrdersCache];
    saveCache("orders", devOrdersCache);
    return {
      data: newOrder,
      meta: {
        correlationId: `mock-ord-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async recordVitalSign(
    patientId: string,
    vitals: Omit<VitalSign, "id" | "recordedAt">
  ): Promise<ApiResponse<VitalSign>> {
    if (!isDevFixtures) {
      return apiClient.post<VitalSign>(`/patients/${patientId}/vitals`, vitals);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newVitals: VitalSign = {
      ...vitals,
      id: `vit-${Date.now()}`,
      recordedAt: new Date().toISOString(),
    };
    const patientIndex = devPatientsCache.findIndex((p) => p.id === patientId);
    if (patientIndex !== -1) {
      const p = devPatientsCache[patientIndex];
      devPatientsCache[patientIndex] = {
        ...p,
        latestVitals: newVitals,
        vitalsHistory: [newVitals, ...(p.vitalsHistory || [])],
      };
      saveCache("patients", devPatientsCache);
    }
    return {
      data: newVitals,
      meta: {
        correlationId: `mock-vitals-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // -------------------------------------------------------------
  // DOCTOR & STAFF MANAGEMENT METHODS
  // -------------------------------------------------------------
  async getDoctors(
    params: PaginationParams = { page: 1, pageSize: 12 },
    filters?: DoctorFilters,
    signal?: AbortSignal
  ): Promise<ApiResponse<Doctor[]>> {
    if (!isDevFixtures) {
      const queryParams = new URLSearchParams();
      queryParams.set("page", String(params.page));
      queryParams.set("pageSize", String(params.pageSize));
      if (filters?.searchQuery) queryParams.set("q", filters.searchQuery);
      if (filters?.departmentId) queryParams.set("departmentId", filters.departmentId);
      if (filters?.specialty) queryParams.set("specialty", filters.specialty);
      if (filters?.verificationStatus) queryParams.set("verificationStatus", filters.verificationStatus);
      return apiClient.get<Doctor[]>(`/doctors?${queryParams.toString()}`, { signal });
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    let filtered = [...devDoctorsCache];

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (d) =>
          d.legalNameEn.toLowerCase().includes(q) ||
          d.legalNameAr.includes(q) ||
          d.employeeId.toLowerCase().includes(q) ||
          d.licenseNumber.toLowerCase().includes(q) ||
          d.primarySpecialty.toLowerCase().includes(q)
      );
    }

    if (filters?.departmentId && filters.departmentId !== "all") {
      filtered = filtered.filter(
        (d) =>
          d.primaryDepartmentId === filters.departmentId ||
          d.authorizedSecondaryDepartmentIds.includes(filters.departmentId!)
      );
    }

    if (filters?.verificationStatus && filters.verificationStatus !== "all") {
      filtered = filtered.filter((d) => d.verificationStatus === filters.verificationStatus);
    }

    if (filters?.employmentStatus && filters.employmentStatus !== "all") {
      filtered = filtered.filter((d) => d.employmentStatus === filters.employmentStatus);
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / params.pageSize) || 1;
    const startIndex = (params.page - 1) * params.pageSize;
    const pageData = filtered.slice(startIndex, startIndex + params.pageSize);

    return {
      data: pageData,
      meta: {
        correlationId: `mock-doc-${Date.now()}`,
        timestamp: new Date().toISOString(),
        pagination: {
          currentPage: params.page,
          pageSize: params.pageSize,
          totalItems,
          totalPages,
          hasNextPage: params.page < totalPages,
          hasPreviousPage: params.page > 1,
        },
      },
    };
  },

  async getDoctorById(id: string, signal?: AbortSignal): Promise<ApiResponse<Doctor>> {
    if (!isDevFixtures) {
      return apiClient.get<Doctor>(`/doctors/${id}`, { signal });
    }

    await new Promise((resolve) => setTimeout(resolve, 80));
    const doctor = devDoctorsCache.find((d) => d.id === id || d.employeeId === id);
    if (!doctor) {
      throw new ApiError(
        404,
        "DOCTOR_NOT_FOUND",
        `Doctor with ID ${id} was not found.`,
        `لم يتم العثور على الطبيب بالمعرف ${id}`,
        `mock-404-${Date.now()}`
      );
    }

    return {
      data: doctor,
      meta: {
        correlationId: `mock-doc-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async createDoctor(
    doctorData: Omit<Doctor, "id" | "employeeId" | "assignedPatientCount" | "activeEncounterCount" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<Doctor>> {
    if (!isDevFixtures) {
      return apiClient.post<Doctor>("/doctors", doctorData);
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const nextNum = 3000 + devDoctorsCache.length;
    const newDoctor: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
      employeeId: `DOC-${nextNum}`,
      assignedPatientCount: 0,
      activeEncounterCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    devDoctorsCache = [newDoctor, ...devDoctorsCache];
    saveCache("doctors", devDoctorsCache);
    return {
      data: newDoctor,
      meta: {
        correlationId: `mock-doc-reg-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async updateDoctorVerification(
    doctorId: string,
    verificationStatus: DoctorVerificationStatus,
    reason?: string,
    verifiedBy?: { userId: string; name: string }
  ): Promise<ApiResponse<Doctor>> {
    if (!isDevFixtures) {
      return apiClient.put<Doctor>(`/doctors/${doctorId}/verification`, {
        verificationStatus,
        reason,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = devDoctorsCache.findIndex((d) => d.id === doctorId);
    if (index === -1) {
      throw new ApiError(
        404,
        "DOCTOR_NOT_FOUND",
        `Doctor ${doctorId} not found`,
        `لم يتم العثور على الطبيب ${doctorId}`,
        `mock-404-${Date.now()}`
      );
    }

    const updated: Doctor = {
      ...devDoctorsCache[index],
      verificationStatus,
      suspendedReason: verificationStatus === "suspended" ? reason : undefined,
      verifiedBy:
        verificationStatus === "verified" && verifiedBy
          ? {
              userId: verifiedBy.userId,
              name: verifiedBy.name,
              timestamp: new Date().toISOString(),
            }
          : devDoctorsCache[index].verifiedBy,
      updatedAt: new Date().toISOString(),
    };

    devDoctorsCache[index] = updated;
    saveCache("doctors", devDoctorsCache);
    return {
      data: updated,
      meta: {
        correlationId: `mock-doc-ver-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async getDoctorSchedule(doctorId: string): Promise<ApiResponse<DoctorSchedule | null>> {
    if (!isDevFixtures) {
      return apiClient.get<DoctorSchedule>(`/doctors/${doctorId}/schedule`);
    }

    await new Promise((resolve) => setTimeout(resolve, 80));
    const schedule = MOCK_DOCTOR_SCHEDULES.find((s) => s.doctorId === doctorId);
    return {
      data: schedule || null,
      meta: {
        correlationId: `mock-doc-sch-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // -------------------------------------------------------------
  // CLINICAL ALERTS & RISK MANAGEMENT METHODS
  // -------------------------------------------------------------
  async getClinicalAlerts(filters?: ClinicalAlertFilters): Promise<ApiResponse<ClinicalAlert[]>> {
    if (!isDevFixtures) {
      const query = new URLSearchParams();
      if (filters?.category) query.set("category", filters.category);
      if (filters?.severity) query.set("severity", filters.severity);
      if (filters?.status) query.set("status", filters.status);
      if (filters?.departmentId) query.set("departmentId", filters.departmentId);
      if (filters?.patientId) query.set("patientId", filters.patientId);
      return apiClient.get<ClinicalAlert[]>(`/clinical-alerts?${query.toString()}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
    let filtered = [...devAlertsCache];

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((a) => a.status === filters.status);
    }
    if (filters?.severity && filters.severity !== "all") {
      filtered = filtered.filter((a) => a.severity === filters.severity);
    }
    if (filters?.category && filters.category !== "all") {
      filtered = filtered.filter((a) => a.category === filters.category);
    }
    if (filters?.departmentId && filters.departmentId !== "all") {
      filtered = filtered.filter((a) => a.responsibleDepartmentId === filters.departmentId);
    }
    if (filters?.patientId) {
      filtered = filtered.filter((a) => a.patientId === filters.patientId);
    }

    return {
      data: filtered,
      meta: {
        correlationId: `mock-alerts-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async acknowledgeClinicalAlert(
    alertId: string,
    acknowledgedBy: { userId: string; name: string },
    clinicalNote?: string
  ): Promise<ApiResponse<ClinicalAlert>> {
    if (!isDevFixtures) {
      return apiClient.post<ClinicalAlert>(`/clinical-alerts/${alertId}/acknowledge`, { clinicalNote });
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    const index = devAlertsCache.findIndex((a) => a.id === alertId);
    if (index === -1) {
      throw new ApiError(
        404,
        "ALERT_NOT_FOUND",
        `Alert ${alertId} not found`,
        `لم يتم العثور على التنبيه ${alertId}`,
        `mock-404-${Date.now()}`
      );
    }

    const current = devAlertsCache[index];
    const updated: ClinicalAlert = {
      ...current,
      status: "acknowledged",
      acknowledgedBy: {
        userId: acknowledgedBy.userId,
        name: acknowledgedBy.name,
        timestamp: new Date().toISOString(),
        clinicalNote,
      },
      eventHistory: [
        {
          timestamp: new Date().toISOString(),
          action: "Alert Acknowledged by Clinician",
          performedBy: acknowledgedBy.name,
          notes: clinicalNote || "Acknowledged via Clinical Safety Console.",
        },
        ...current.eventHistory,
      ],
    };

    devAlertsCache[index] = updated;
    return {
      data: updated,
      meta: {
        correlationId: `mock-ack-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async escalateClinicalAlert(
    alertId: string,
    escalatedTo: { userId: string; name: string; role: string },
    reason: string
  ): Promise<ApiResponse<ClinicalAlert>> {
    if (!isDevFixtures) {
      return apiClient.post<ClinicalAlert>(`/clinical-alerts/${alertId}/escalate`, {
        escalatedTo,
        reason,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    const index = devAlertsCache.findIndex((a) => a.id === alertId);
    if (index === -1) {
      throw new ApiError(
        404,
        "ALERT_NOT_FOUND",
        `Alert ${alertId} not found`,
        `لم يتم العثور على التنبيه ${alertId}`,
        `mock-404-${Date.now()}`
      );
    }

    const current = devAlertsCache[index];
    const updated: ClinicalAlert = {
      ...current,
      status: "escalated",
      escalatedTo: {
        userId: escalatedTo.userId,
        name: escalatedTo.name,
        role: escalatedTo.role,
        timestamp: new Date().toISOString(),
        reason,
      },
      eventHistory: [
        {
          timestamp: new Date().toISOString(),
          action: `Escalated to ${escalatedTo.name} (${escalatedTo.role})`,
          performedBy: "Clinical Escalation Protocol",
          notes: reason,
        },
        ...current.eventHistory,
      ],
    };

    devAlertsCache[index] = updated;
    return {
      data: updated,
      meta: {
        correlationId: `mock-esc-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async resolveClinicalAlert(
    alertId: string,
    resolvedBy: { userId: string; name: string },
    documentedAction: string,
    disposition: string
  ): Promise<ApiResponse<ClinicalAlert>> {
    if (!isDevFixtures) {
      return apiClient.post<ClinicalAlert>(`/clinical-alerts/${alertId}/resolve`, {
        documentedAction,
        disposition,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = devAlertsCache.findIndex((a) => a.id === alertId);
    if (index === -1) {
      throw new ApiError(
        404,
        "ALERT_NOT_FOUND",
        `Alert ${alertId} not found`,
        `لم يتم العثور على التنبيه ${alertId}`,
        `mock-404-${Date.now()}`
      );
    }

    const current = devAlertsCache[index];
    const updated: ClinicalAlert = {
      ...current,
      status: "resolved",
      resolvedBy: {
        userId: resolvedBy.userId,
        name: resolvedBy.name,
        timestamp: new Date().toISOString(),
        documentedAction,
        disposition,
      },
      eventHistory: [
        {
          timestamp: new Date().toISOString(),
          action: "Alert Resolved with Documented Action",
          performedBy: resolvedBy.name,
          notes: `Action: ${documentedAction} | Disposition: ${disposition}`,
        },
        ...current.eventHistory,
      ],
    };

    devAlertsCache[index] = updated;
    return {
      data: updated,
      meta: {
        correlationId: `mock-res-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async dismissClinicalAlert(
    alertId: string,
    dismissedBy: { userId: string; name: string },
    authorizedReason: string
  ): Promise<ApiResponse<ClinicalAlert>> {
    if (!isDevFixtures) {
      return apiClient.post<ClinicalAlert>(`/clinical-alerts/${alertId}/dismiss`, {
        authorizedReason,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = devAlertsCache.findIndex((a) => a.id === alertId);
    if (index === -1) {
      throw new ApiError(
        404,
        "ALERT_NOT_FOUND",
        `Alert ${alertId} not found`,
        `لم يتم العثور على التنبيه ${alertId}`,
        `mock-404-${Date.now()}`
      );
    }

    const current = devAlertsCache[index];
    const updated: ClinicalAlert = {
      ...current,
      status: "dismissed",
      dismissedBy: {
        userId: dismissedBy.userId,
        name: dismissedBy.name,
        timestamp: new Date().toISOString(),
        authorizedReason,
      },
      eventHistory: [
        {
          timestamp: new Date().toISOString(),
          action: "Alert Dismissed with Authorized Justification",
          performedBy: dismissedBy.name,
          notes: authorizedReason,
        },
        ...current.eventHistory,
      ],
    };

    devAlertsCache[index] = updated;
    return {
      data: updated,
      meta: {
        correlationId: `mock-dis-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // -------------------------------------------------------------
  // DEPARTMENT ASSIGNMENT & REFERRAL WORKFLOW METHODS
  // -------------------------------------------------------------
  async getDepartmentAssignments(patientId?: string): Promise<ApiResponse<DepartmentAssignment[]>> {
    if (!isDevFixtures) {
      const url = patientId ? `/assignments?patientId=${patientId}` : "/assignments";
      return apiClient.get<DepartmentAssignment[]>(url);
    }

    await new Promise((resolve) => setTimeout(resolve, 90));
    const data = patientId
      ? devAssignmentsCache.filter((a) => a.patientId === patientId)
      : devAssignmentsCache;

    return {
      data,
      meta: {
        correlationId: `mock-asg-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async createDepartmentAssignment(
    assignment: Omit<DepartmentAssignment, "id" | "requestTimestamp" | "status" | "isCurrentTreating">
  ): Promise<ApiResponse<DepartmentAssignment>> {
    if (!isDevFixtures) {
      return apiClient.post<DepartmentAssignment>("/assignments", assignment);
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const newAssignment: DepartmentAssignment = {
      ...assignment,
      id: `asg-${Date.now()}`,
      requestTimestamp: new Date().toISOString(),
      status: "pending",
      isCurrentTreating: false,
    };

    devAssignmentsCache = [newAssignment, ...devAssignmentsCache];
    saveCache("assignments", devAssignmentsCache);
    return {
      data: newAssignment,
      meta: {
        correlationId: `mock-asg-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async updateAssignmentStatus(
    id: string,
    status: AssignmentStatus,
    rejectionReason?: string
  ): Promise<ApiResponse<DepartmentAssignment>> {
    if (!isDevFixtures) {
      return apiClient.put<DepartmentAssignment>(`/assignments/${id}/status`, {
        status,
        rejectionReason,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = devAssignmentsCache.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new ApiError(
        404,
        "ASSIGNMENT_NOT_FOUND",
        `Assignment ${id} not found`,
        `لم يتم العثور على الإحالة ${id}`,
        `mock-404-${Date.now()}`
      );
    }

    const current = devAssignmentsCache[index];
    const isCompleted = status === "completed";
    const isAccepted = status === "accepted";

    const updated: DepartmentAssignment = {
      ...current,
      status,
      acceptanceTimestamp: isAccepted ? new Date().toISOString() : current.acceptanceTimestamp,
      completedTimestamp: isCompleted ? new Date().toISOString() : current.completedTimestamp,
      rejectionReason: status === "rejected" ? rejectionReason : undefined,
      isCurrentTreating: isAccepted && current.assignmentType === "treating" ? true : current.isCurrentTreating,
    };

    devAssignmentsCache[index] = updated;
    saveCache("assignments", devAssignmentsCache);
    return {
      data: updated,
      meta: {
        correlationId: `mock-asg-upd-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // -------------------------------------------------------------
  // STAFF SHIFTS METHODS
  // -------------------------------------------------------------
  async getStaffShifts(departmentId?: string, date?: string): Promise<ApiResponse<StaffShift[]>> {
    if (!isDevFixtures) {
      const q = new URLSearchParams();
      if (departmentId) q.set("departmentId", departmentId);
      if (date) q.set("date", date);
      return apiClient.get<StaffShift[]>(`/staff/shifts?${q.toString()}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 80));
    let data = [...devStaffShiftsCache];
    if (departmentId && departmentId !== "all") {
      data = data.filter((s) => s.departmentId === departmentId);
    }
    if (date) {
      data = data.filter((s) => s.date === date);
    }

    return {
      data,
      meta: {
        correlationId: `mock-shifts-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  // -------------------------------------------------------------
  // PATIENT CLINICAL TIMELINE AGGREGATOR
  // -------------------------------------------------------------
  async getPatientTimeline(patientId: string): Promise<ApiResponse<PatientTimelineEvent[]>> {
    if (!isDevFixtures) {
      return apiClient.get<PatientTimelineEvent[]>(`/patients/${patientId}/timeline`);
    }

    await new Promise((resolve) => setTimeout(resolve, 120));
    const patient = devPatientsCache.find((p) => p.id === patientId || p.mrn === patientId);
    if (!patient) {
      throw new ApiError(
        404,
        "PATIENT_NOT_FOUND",
        `Patient ${patientId} not found`,
        `لم يتم العثور على المريض ${patientId}`,
        `mock-404-${Date.now()}`
      );
    }

    const events: PatientTimelineEvent[] = [];

    // 1. Admission Event
    events.push({
      id: `evt-adm-${patient.id}`,
      encounterId: "enc-current",
      encounterNumber: "ENC-2026-901",
      timestamp: patient.admissionDate,
      eventType: "admission",
      titleEn: `Inpatient Admission to ${patient.departmentNameEn}`,
      titleAr: `تنويم في ${patient.departmentNameAr}`,
      departmentNameEn: patient.departmentNameEn,
      departmentNameAr: patient.departmentNameAr,
      performedBy: {
        name: patient.attendingPhysician,
        role: "Attending Physician",
      },
      summaryEn: `Admitted with Primary Diagnosis: ${patient.primaryDiagnosisEn}. Assigned to ${patient.bed.bedNumber}.`,
      summaryAr: `تم التنويم بالتشخيص الأساسي: ${patient.primaryDiagnosisAr}. تم التسكين في السرير ${patient.bed.bedNumber}.`,
      isDemoSynthetic: true,
      severity: "normal",
    });

    // 2. Vitals Events
    if (patient.vitalsHistory) {
      patient.vitalsHistory.forEach((v) => {
        const isConcerning = v.heartRate > 120 || v.systolicBP < 90 || v.oxygenSaturation < 92;
        events.push({
          id: `evt-vit-${v.id}`,
          encounterId: "enc-current",
          encounterNumber: "ENC-2026-901",
          timestamp: v.recordedAt,
          eventType: "vital_sign",
          titleEn: `Vital Signs Observation (HR: ${v.heartRate}, BP: ${v.systolicBP}/${v.diastolicBP})`,
          titleAr: `تسجيل العلامات الحيوية (نبض: ${v.heartRate}، ضغط: ${v.systolicBP}/${v.diastolicBP})`,
          departmentNameEn: patient.departmentNameEn,
          departmentNameAr: patient.departmentNameAr,
          performedBy: {
            name: v.recordedBy,
            role: "Nurse",
          },
          summaryEn: `HR: ${v.heartRate} bpm, BP: ${v.systolicBP}/${v.diastolicBP} mmHg, SpO2: ${v.oxygenSaturation}%, Temp: ${v.temperature}°C, Resp: ${v.respiratoryRate}/min.`,
          summaryAr: `معدل النبض: ${v.heartRate}، ضغط الدم: ${v.systolicBP}/${v.diastolicBP}، تشبع الأكسجين: ${v.oxygenSaturation}%، الحرارة: ${v.temperature}°C.`,
          isDemoSynthetic: true,
          severity: isConcerning ? "warning" : "normal",
        });
      });
    }

    // 3. Lab Reports
    if (patient.labReports) {
      patient.labReports.forEach((lab) => {
        events.push({
          id: `evt-lab-${lab.id}`,
          encounterId: "enc-current",
          encounterNumber: "ENC-2026-901",
          timestamp: lab.collectedAt,
          eventType: "lab_result",
          titleEn: `Laboratory Result: ${lab.testName} (${lab.resultValue} ${lab.unit})`,
          titleAr: `نتيجة التحليل المخبري: ${lab.testName} (${lab.resultValue} ${lab.unit})`,
          departmentNameEn: "Central Laboratory",
          departmentNameAr: "المختبر المركزي",
          performedBy: {
            name: lab.verifiedBy,
            role: "Clinical Pathologist",
          },
          summaryEn: `Value: ${lab.resultValue} ${lab.unit} | Reference Range: ${lab.referenceRange} | Status: ${lab.status.toUpperCase()}`,
          summaryAr: `القيمة: ${lab.resultValue} ${lab.unit} | المعدل الطبيعي: ${lab.referenceRange} | الحالة: ${lab.status}`,
          isDemoSynthetic: true,
          severity: lab.status === "critical" ? "critical" : lab.status === "abnormal" ? "warning" : "normal",
          relatedRecordId: lab.id,
        });
      });
    }

    // 4. Clinical Notes
    if (patient.clinicalNotes) {
      patient.clinicalNotes.forEach((n) => {
        events.push({
          id: `evt-not-${n.id}`,
          encounterId: "enc-current",
          encounterNumber: "ENC-2026-901",
          timestamp: n.timestamp,
          eventType: "clinical_note",
          titleEn: `Clinical Note: ${n.title}`,
          titleAr: `ملاحظة سريرية: ${n.title}`,
          departmentNameEn: n.department,
          departmentNameAr: n.department,
          performedBy: {
            name: n.authorName,
            role: n.authorRole,
          },
          summaryEn: `Assessment: ${n.soap.assessment} | Plan: ${n.soap.plan}`,
          summaryAr: `التقييم: ${n.soap.assessment} | الخطة: ${n.soap.plan}`,
          isDemoSynthetic: true,
          severity: "normal",
          relatedRecordId: n.id,
        });
      });
    }

    // 5. Department Assignments for this patient
    const assignments = devAssignmentsCache.filter((a) => a.patientId === patient.id);
    assignments.forEach((asg) => {
      events.push({
        id: `evt-asg-${asg.id}`,
        encounterId: asg.encounterId,
        encounterNumber: "ENC-2026-901",
        timestamp: asg.requestTimestamp,
        eventType: "department_assignment",
        titleEn: `Department ${asg.assignmentType.toUpperCase()}: ${asg.sourceDepartmentNameEn} → ${asg.destinationDepartmentNameEn}`,
        titleAr: `إحالة قسم (${asg.assignmentType}): ${asg.sourceDepartmentNameAr} → ${asg.destinationDepartmentNameAr}`,
        departmentNameEn: asg.destinationDepartmentNameEn,
        departmentNameAr: asg.destinationDepartmentNameAr,
        performedBy: asg.requestedBy,
        summaryEn: `Reason: ${asg.reason}. Status: ${asg.status.toUpperCase()}`,
        summaryAr: `السبب: ${asg.reason}. الحالة: ${asg.status}`,
        isDemoSynthetic: true,
        severity: "normal",
        relatedRecordId: asg.id,
      });
    });

    // Sort chronologically descending (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      data: events,
      meta: {
        correlationId: `mock-timeline-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async getAppointments(filters?: {
    date?: string;
    departmentId?: string;
    clinicianName?: string;
    status?: string;
  }): Promise<ApiResponse<AppointmentRecord[]>> {
    await new Promise((resolve) => setTimeout(resolve, 80));
    let list = [...devAppointmentsCache];
    if (filters?.departmentId && filters.departmentId !== "all") {
      list = list.filter((a) => a.departmentId === filters.departmentId);
    }
    if (filters?.status && filters.status !== "all") {
      list = list.filter((a) => a.status === filters.status);
    }
    if (filters?.date) {
      list = list.filter((a) => a.appointmentDate === filters.date);
    }
    if (filters?.clinicianName) {
      const q = filters.clinicianName.toLowerCase();
      list = list.filter((a) => a.clinicianName.toLowerCase().includes(q));
    }
    return {
      data: list,
      meta: {
        correlationId: `mock-apt-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async createAppointment(
    data: Omit<AppointmentRecord, "id" | "appointmentNumber">
  ): Promise<ApiResponse<AppointmentRecord>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newApt: AppointmentRecord = {
      ...data,
      id: `apt-${Date.now()}`,
      appointmentNumber: `OPD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    devAppointmentsCache = [newApt, ...devAppointmentsCache];
    saveCache("appointments", devAppointmentsCache);
    return {
      data: newApt,
      meta: {
        correlationId: `mock-apt-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async updateAppointmentStatus(
    id: string,
    status: AppointmentRecord["status"]
  ): Promise<ApiResponse<AppointmentRecord>> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const idx = devAppointmentsCache.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new ApiError(
        404,
        "APPOINTMENT_NOT_FOUND",
        `Appointment ${id} not found`,
        `الموعد ${id} غير موجود`,
        `mock-404-${Date.now()}`
      );
    }
    devAppointmentsCache[idx] = { ...devAppointmentsCache[idx], status };
    saveCache("appointments", devAppointmentsCache);
    return {
      data: devAppointmentsCache[idx],
      meta: {
        correlationId: `mock-apt-status-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async dispenseMedication(orderId: string, notes?: string): Promise<ApiResponse<ClinicalOrder>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = devOrdersCache.findIndex((o) => o.id === orderId);
    if (idx === -1) {
      throw new ApiError(
        404,
        "ORDER_NOT_FOUND",
        `Order ${orderId} not found`,
        `الأمر ${orderId} غير موجود`,
        `mock-404-${Date.now()}`
      );
    }
    const order = devOrdersCache[idx];
    const updated: ClinicalOrder = {
      ...order,
      status: "completed",
      completedAt: new Date().toISOString(),
      notes: notes || "Dispensed by Central Pharmacy with electronic barcode verification",
    };
    devOrdersCache[idx] = updated;
    saveCache("orders", devOrdersCache);

    // Also update patient record
    const patIdx = devPatientsCache.findIndex((p) => p.id === order.patientId);
    if (patIdx !== -1) {
      const pat = devPatientsCache[patIdx];
      const newMed = {
        id: `med-${Date.now()}`,
        drugName: order.title,
        dosage: order.details.split(" ")[0] || "Standard",
        route: "Oral" as const,
        frequency: "QD" as const,
        prescribedBy: order.orderedBy.name,
        prescribedAt: order.orderedAt,
        status: "administered" as const,
      };
      devPatientsCache[patIdx] = {
        ...pat,
        medications: [newMed, ...(pat.medications || [])],
      };
      saveCache("patients", devPatientsCache);
    }

    return {
      data: updated,
      meta: {
        correlationId: `mock-dispense-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  async recordLabResult(
    orderId: string,
    testName: string,
    observedValue: string,
    unit: string,
    referenceRange: string,
    isCritical: boolean = false
  ): Promise<ApiResponse<ClinicalOrder>> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const idx = devOrdersCache.findIndex((o) => o.id === orderId);
    const order = idx !== -1 ? devOrdersCache[idx] : null;

    if (order) {
      order.status = "completed";
      order.completedAt = new Date().toISOString();
      saveCache("orders", devOrdersCache);

      // Add to patient's labReports
      const patIdx = devPatientsCache.findIndex((p) => p.id === order.patientId);
      if (patIdx !== -1) {
        const pat = devPatientsCache[patIdx];
        const newLabReport = {
          id: `lab-${Date.now()}`,
          orderNumber: order.orderNumber,
          testName,
          category: "Biochemistry" as const,
          specimenType: "Venous Blood (Serum)",
          collectedAt: new Date().toISOString(),
          resultValue: observedValue,
          unit,
          referenceRange,
          status: isCritical ? ("critical" as const) : ("normal" as const),
          verifiedBy: "Dr. Sami Youssef, Clinical Pathologist",
        };
        devPatientsCache[patIdx] = {
          ...pat,
          labReports: [newLabReport, ...(pat.labReports || [])],
        };
        saveCache("patients", devPatientsCache);

        // If critical, automatically raise a STAT clinical alert!
        if (isCritical) {
          const newAlert: ClinicalAlert = {
            id: `alt-stat-${Date.now()}`,
            alertNumber: `ALT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            patientId: pat.id,
            patientName: pat.fullNameEn,
            patientMrn: pat.mrn,
            encounterId: "enc-current",
            category: "critical_lab",
            severity: "critical",
            title: `CRITICAL LAB VALUE: ${testName} (${observedValue} ${unit})`,
            ruleTriggered: "Clinical Auto-Analyzer STAT Panic Boundary",
            sourceDataValue: `${testName}: ${observedValue} ${unit} (Ref: ${referenceRange})`,
            sourceTimestamp: new Date().toISOString(),
            detectedAt: new Date().toISOString(),
            responsibleDepartmentId: pat.departmentId,
            responsibleDepartmentNameEn: pat.departmentNameEn,
            responsibleDepartmentNameAr: pat.departmentNameAr,
            status: "new",
            eventHistory: [
              {
                timestamp: new Date().toISOString(),
                action: "STAT Alert Generated from Diagnostic Laboratory Auto-Analyzer",
                performedBy: "Automated LIS Interface",
              },
            ],
          };
          devAlertsCache = [newAlert, ...devAlertsCache];
          saveCache("alerts", devAlertsCache);
        }
      }
    }

    return {
      data: order || devOrdersCache[0],
      meta: {
        correlationId: `mock-lab-res-${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
  },

  resetDemoData(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("hospitalos:patients");
        localStorage.removeItem("hospitalos:doctors");
        localStorage.removeItem("hospitalos:alerts");
        localStorage.removeItem("hospitalos:assignments");
        localStorage.removeItem("hospitalos:staff_shifts");
        localStorage.removeItem("hospitalos:orders");
        localStorage.removeItem("hospitalos:appointments");
      } catch (e) {
        console.warn("[HospitalOS] Failed to clear localStorage:", e);
      }
    }
    devPatientsCache = [...MOCK_PATIENTS];
    devDoctorsCache = [...MOCK_DOCTORS];
    devAlertsCache = [...MOCK_CLINICAL_ALERTS];
    devAssignmentsCache = [...MOCK_DEPARTMENT_ASSIGNMENTS];
    devStaffShiftsCache = [...MOCK_STAFF_SHIFTS];
    devOrdersCache = [...INITIAL_ORDERS];
    devAppointmentsCache = [...MOCK_APPOINTMENTS];

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hospitalos:demo-reset"));
    }
  },
};
