import {
  VitalSign,
  TriageLevel,
  AdmissionStatus,
  BedLocation,
  MedicationOrder,
  ClinicalNote,
  EncounterRecord,
  LabReport,
  RadiologyStudy,
  DischargeSummary,
  PastMedicalHistory,
} from "./clinical";
import { AuditRecord } from "./common";

export type Gender = "male" | "female" | "other";

export interface Allergy {
  substance: string;
  reaction: string;
  severity: "mild" | "moderate" | "severe" | "anaphylactic";
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number, e.g., MRN-2026-8941
  nationalId: string;
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender: Gender;
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  phoneNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    coveragePercent: number;
    validUntil: string;
  };
  status: AdmissionStatus;
  triageLevel: TriageLevel;
  attendingPhysician: string;
  departmentId: string;
  departmentNameEn: string;
  departmentNameAr: string;
  admissionDate: string;
  bed: BedLocation;
  primaryDiagnosisEn: string;
  primaryDiagnosisAr: string;
  allergies: Allergy[];
  chronicConditions: string[];
  latestVitals?: VitalSign;
  vitalsHistory?: VitalSign[];
  medications?: MedicationOrder[];
  clinicalNotes?: ClinicalNote[];
  encounters?: EncounterRecord[];
  labReports?: LabReport[];
  radiologyStudies?: RadiologyStudy[];
  dischargeSummary?: DischargeSummary;
  pastMedicalHistory?: PastMedicalHistory;
  auditHistory?: AuditRecord[];
}
