export type DoctorVerificationStatus = 
  | "draft"
  | "pending_verification"
  | "verified"
  | "rejected"
  | "suspended";

export type EmploymentStatus = 
  | "full_time"
  | "part_time"
  | "locum"
  | "visiting_consultant"
  | "resident";

export type OnCallStatus = 
  | "on_duty"
  | "on_call"
  | "off_duty"
  | "in_surgery"
  | "rounds";

export interface CredentialDocument {
  id: string;
  title: string;
  documentType: "medical_license" | "board_certification" | "malpractice_insurance" | "dea_registration" | "cv";
  issuingAuthority: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  fileUrl: string;
  status: "verified" | "pending_review" | "expired" | "rejected";
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface Doctor {
  id: string;
  employeeId: string; // e.g. DOC-1042
  legalNameEn: string;
  legalNameAr: string;
  title: "Dr." | "Prof. Dr." | "Consultant" | "Specialist";
  licenseNumber: string;
  licenseAuthority: string; // e.g. Saudi Commission for Health Specialties (SCFHS), General Medical Council
  licenseExpiryDate: string; // ISO date YYYY-MM-DD
  primarySpecialty: string;
  subspecialty?: string;
  primaryDepartmentId: string;
  primaryDepartmentNameEn: string;
  primaryDepartmentNameAr: string;
  authorizedSecondaryDepartmentIds: string[];
  employmentStatus: EmploymentStatus;
  verificationStatus: DoctorVerificationStatus;
  professionalEmail: string;
  officePhone: string;
  mobilePhone?: string;
  roomNumber?: string;
  onCallStatus: OnCallStatus;
  assignedPatientCount: number;
  activeEncounterCount: number;
  credentials: CredentialDocument[];
  verifiedBy?: {
    userId: string;
    name: string;
    timestamp: string;
  };
  suspendedReason?: string;
  bioEn?: string;
  bioAr?: string;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ShiftSlot {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  departmentId: string;
  departmentNameEn: string;
  departmentNameAr: string;
  roomNumber: string;
  activityType: "outpatient_clinic" | "ward_rounds" | "on_call_shift" | "or_surgery" | "academic_conference";
  maxPatients: number;
  isRecurring: boolean;
}

export interface DoctorSchedule {
  doctorId: string;
  doctorName: string;
  weeklySlots: ShiftSlot[];
  onCallDates: {
    date: string;
    shift: "morning" | "evening" | "night" | "24hr";
    coverageDepartmentId: string;
    coverageDepartmentName: string;
    status: "confirmed" | "pending" | "swapped";
  }[];
}

export interface StaffShift {
  id: string;
  staffId: string;
  staffName: string;
  role: "nurse" | "triage_nurse" | "technician" | "pharmacist" | "admin";
  departmentId: string;
  departmentNameEn: string;
  departmentNameAr: string;
  date: string; // YYYY-MM-DD
  shiftType: "morning" | "evening" | "night"; // 07:00-15:00, 15:00-23:00, 23:00-07:00
  startTime: string;
  endTime: string;
  status: "scheduled" | "checked_in" | "completed" | "absent";
  assignedBedsCount?: number;
}
