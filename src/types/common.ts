export type Locale = "en" | "ar";
export type Direction = "ltr" | "rtl";

export type RoleId = 
  | "physician"
  | "nurse_lead"
  | "nurse_staff"
  | "medical_director"
  | "triage_officer"
  | "pharmacist"
  | "radiologist"
  | "billing_specialist"
  | "admissions_clerk"
  | "system_admin";

export interface DepartmentInfo {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  floor: string;
  wing: string;
  totalBeds: number; // Licensed physical bed capacity
  operationalBeds: number; // Staffed operational beds (true capacity denominator)
  outOfServiceBeds: number; // Maintenance / terminal decontamination beds
  occupiedBeds: number; // Currently admitted inpatients
  availableBeds: number; // operationalBeds - occupiedBeds
  criticalCases: number;
  onDutyPhysicians: number;
  onDutyNurses: number;
}

export interface AuditRecord {
  timestamp: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  action: string;
  reason?: string;
  ipAddress?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
