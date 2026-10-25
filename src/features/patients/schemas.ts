import { z } from "zod";

export const patientAdmissionSchema = z.object({
  fullNameEn: z.string().min(3, "English full name must be at least 3 characters"),
  fullNameAr: z.string().min(3, "Arabic full name must be at least 3 characters"),
  nationalId: z.string().regex(/^\d{10}$/, "National ID must be exactly 10 digits"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid date of birth required",
  }),
  gender: z.enum(["male", "female", "other"]),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  phoneNumber: z.string().min(8, "Valid phone number required"),
  emergencyContactName: z.string().min(3, "Emergency contact name required"),
  emergencyContactPhone: z.string().min(8, "Emergency contact phone required"),
  emergencyContactRelation: z.string().min(2, "Relationship required"),
  departmentId: z.string().min(1, "Department must be assigned"),
  bedNumber: z.string().min(1, "Bed assignment is mandatory for admission"),
  roomNumber: z.string().min(1, "Room number required"),
  triageLevel: z.enum([
    "1_resuscitation",
    "2_emergent",
    "3_urgent",
    "4_less_urgent",
    "5_non_urgent",
  ]),
  primaryDiagnosisEn: z.string().min(3, "Primary diagnosis in English is required"),
  primaryDiagnosisAr: z.string().min(3, "Primary diagnosis in Arabic is required"),
  allergiesText: z.string().optional(),
});

export type PatientAdmissionFormValues = z.infer<typeof patientAdmissionSchema>;

export const vitalSignEntrySchema = z.object({
  heartRate: z.number().min(30).max(250, "Heart rate out of physiological range"),
  systolicBP: z.number().min(50).max(260, "Systolic blood pressure out of range"),
  diastolicBP: z.number().min(30).max(160, "Diastolic blood pressure out of range"),
  respiratoryRate: z.number().min(6).max(60, "Respiratory rate out of range"),
  temperature: z.number().min(32).max(43, "Temperature out of physiological range"),
  oxygenSaturation: z.number().min(50).max(100, "SpO2 percentage must be 50-100%"),
  painScore: z.number().min(0).max(10),
  consciousnessLevel: z.enum(["Alert", "Verbal", "Pain", "Unresponsive"]),
});

export type VitalSignEntryValues = z.infer<typeof vitalSignEntrySchema>;
