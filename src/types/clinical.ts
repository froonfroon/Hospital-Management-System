export type TriageLevel = "1_resuscitation" | "2_emergent" | "3_urgent" | "4_less_urgent" | "5_non_urgent";

export type AdmissionStatus = 
  | "admitted" 
  | "observation" 
  | "in_procedure" 
  | "transferred" 
  | "discharge_ready" 
  | "discharged";

export interface VitalSign {
  id: string;
  recordedAt: string;
  heartRate: number; // bpm
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  respiratoryRate: number; // breaths/min
  temperature: number; // Celsius
  oxygenSaturation: number; // %
  painScore: number; // 0-10
  consciousnessLevel: "Alert" | "Verbal" | "Pain" | "Unresponsive";
  recordedBy: string;
}

export interface BedLocation {
  bedNumber: string;
  roomNumber: string;
  departmentCode: string;
  departmentNameEn: string;
  departmentNameAr: string;
  status: "occupied" | "available" | "cleaning" | "maintenance";
}

export interface MedicationOrder {
  id: string;
  drugName: string;
  dosage: string;
  route: "Oral" | "IV" | "IM" | "Subcutaneous" | "Inhalation" | "Topical";
  frequency: "Stat" | "Q4H" | "Q6H" | "Q8H" | "Q12H" | "QD" | "PRN";
  prescribedBy: string;
  prescribedAt: string;
  status: "active" | "administered" | "discontinued" | "held";
}

export interface ClinicalNote {
  id: string;
  authorName: string;
  authorRole: string;
  department: string;
  timestamp: string;
  title: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export interface EncounterRecord {
  id: string;
  encounterNumber: string;
  type: "inpatient" | "emergency" | "outpatient" | "surgical";
  startDate: string;
  endDate?: string;
  departmentNameEn: string;
  departmentNameAr: string;
  attendingPhysician: string;
  chiefComplaint: string;
  disposition?: string;
}

export interface LabReport {
  id: string;
  orderNumber: string;
  testName: string;
  category: "Hematology" | "Biochemistry" | "Microbiology" | "Blood Gas" | "Coagulation";
  specimenType: string;
  collectedAt: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  status: "normal" | "abnormal" | "critical";
  flagReason?: string;
  verifiedBy: string;
}

export interface RadiologyStudy {
  id: string;
  accessionNumber: string;
  modality: "X-RAY" | "CT" | "MRI" | "ULTRASOUND" | "ECHO";
  procedureName: string;
  requestedAt: string;
  completedAt: string;
  indication: string;
  findings: string;
  impression: string;
  status: "completed" | "preliminary" | "critical_finding";
  radiologist: string;
}

export interface DischargeSummary {
  dischargeDate: string;
  disposition: "home_routine" | "transfer_facility" | "home_health" | "ama";
  finalDiagnosisEn: string;
  finalDiagnosisAr: string;
  conditionAtDischarge: string;
  followUpPlan: string;
  prescriptionsOnDischarge: string[];
  dischargedBy: string;
}

export interface PastMedicalHistory {
  conditions: string[];
  pastSurgeries: string[];
  familyHistory: string[];
  immunizations: string[];
}

export type ClinicalWorkflowState = 
  | "draft"
  | "submitted"
  | "pending_review"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ClinicalOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  orderType: "medication" | "laboratory" | "radiology" | "referral" | "nursing" | "transfer";
  priority: "stat" | "urgent" | "routine";
  status: ClinicalWorkflowState;
  title: string;
  details: string;
  departmentId: string;
  orderedBy: {
    id: string;
    name: string;
    role: string;
  };
  orderedAt: string;
  reviewedBy?: {
    id: string;
    name: string;
    role: string;
  };
  reviewedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface AppointmentRecord {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  departmentId: string;
  departmentNameEn: string;
  departmentNameAr: string;
  clinicianName: string;
  appointmentDate: string;
  timeSlot: string;
  type: "new_consultation" | "follow_up" | "post_discharge" | "procedure";
  status: "scheduled" | "checked_in" | "in_consultation" | "completed" | "no_show" | "cancelled";
  reasonForVisit: string;
  notes?: string;
}

export interface MedicationAdministrationRecord {
  id: string;
  medicationOrderId: string;
  drugName: string;
  dosage: string;
  route: string;
  scheduledTime: string;
  administeredTime?: string;
  status: "scheduled" | "administered" | "held" | "refused" | "omitted";
  administeredBy?: string;
  witnessedBy?: string;
  clinicalReason?: string;
}

export interface NursingAssessment {
  id: string;
  patientId: string;
  shift: "day" | "night";
  assessedAt: string;
  assessedBy: string;
  mewsScore: number; // Modified Early Warning Score
  fallRiskScore: number; // Morse Fall Scale
  pressureInjuryRisk: "low" | "moderate" | "high" | "very_high"; // Braden Scale
  neuroCheck: "normal" | "altered" | "sedated";
  painLocation?: string;
  ivSiteCheck: "clean_intact" | "erythema" | "infiltrated" | "phlebitis";
  dietaryIntake: string;
  nursingInterventions: string[];
}

export type AssignmentType = "initial_receiving" | "treating" | "consulting" | "interdepartmental_transfer";
export type AssignmentStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";

export interface DepartmentAssignment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  encounterId: string;
  sourceDepartmentId: string;
  sourceDepartmentNameEn: string;
  sourceDepartmentNameAr: string;
  destinationDepartmentId: string;
  destinationDepartmentNameEn: string;
  destinationDepartmentNameAr: string;
  assignmentType: AssignmentType;
  reason: string;
  clinicalSummary: string;
  requestedBy: {
    id: string;
    name: string;
    role: string;
  };
  assignedPractitioner?: {
    id: string;
    name: string;
    role: string;
  };
  requestTimestamp: string;
  acceptanceTimestamp?: string;
  completedTimestamp?: string;
  status: AssignmentStatus;
  rejectionReason?: string;
  isCurrentTreating: boolean;
}

export type AlertCategory = 
  | "critical_lab" 
  | "concerning_vitals" 
  | "allergy_conflict" 
  | "urgent_clinical_review" 
  | "unacknowledged_alert" 
  | "delayed_clinical_task";

export type AlertSeverity = "low" | "moderate" | "urgent" | "critical";

export type AlertWorkflowStatus = 
  | "new" 
  | "acknowledged" 
  | "under_review" 
  | "escalated" 
  | "resolved" 
  | "dismissed";

export interface ClinicalAlert {
  id: string;
  alertNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  encounterId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  ruleTriggered: string; // Clinician-approved rule or dev protocol
  sourceDataValue: string; // e.g. "K+ 6.8 mmol/L" or "HR 142 bpm + SBP 82 mmHg"
  sourceTimestamp: string;
  detectedAt: string;
  responsibleDepartmentId: string;
  responsibleDepartmentNameEn: string;
  responsibleDepartmentNameAr: string;
  assignedRecipient?: {
    id: string;
    name: string;
    role: string;
  };
  status: AlertWorkflowStatus;
  isStaleDataWarning?: boolean;
  acknowledgedBy?: {
    userId: string;
    name: string;
    timestamp: string;
    clinicalNote?: string;
  };
  escalatedTo?: {
    userId: string;
    name: string;
    role: string;
    timestamp: string;
    reason: string;
  };
  resolvedBy?: {
    userId: string;
    name: string;
    timestamp: string;
    documentedAction: string;
    disposition: string;
  };
  dismissedBy?: {
    userId: string;
    name: string;
    timestamp: string;
    authorizedReason: string;
  };
  eventHistory: {
    timestamp: string;
    action: string;
    performedBy: string;
    notes?: string;
  }[];
}

export type TimelineEventType =
  | "registration"
  | "triage"
  | "assessment"
  | "department_assignment"
  | "admission"
  | "transfer"
  | "vital_sign"
  | "lab_order"
  | "lab_result"
  | "radiology_order"
  | "radiology_report"
  | "medication_admin"
  | "clinical_note"
  | "consultation"
  | "discharge";

export interface PatientTimelineEvent {
  id: string;
  encounterId: string;
  encounterNumber: string;
  timestamp: string;
  eventType: TimelineEventType;
  titleEn: string;
  titleAr: string;
  departmentNameEn: string;
  departmentNameAr: string;
  performedBy?: {
    name: string;
    role: string;
  };
  summaryEn: string;
  summaryAr: string;
  status?: string;
  severity?: "normal" | "warning" | "critical";
  isDemoSynthetic: boolean;
  relatedRecordId?: string;
}

