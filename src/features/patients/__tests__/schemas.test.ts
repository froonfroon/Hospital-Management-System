import { describe, it, expect } from "vitest";
import { patientAdmissionSchema } from "../schemas";

describe("Patient Admission Schema Validation", () => {
  const validData = {
    fullNameEn: "Salem Mohammed Al-Ghamdi",
    fullNameAr: "سالم محمد الغامدي",
    nationalId: "1098765432",
    dateOfBirth: "1980-04-12",
    gender: "male" as const,
    bloodType: "O+" as const,
    phoneNumber: "+966 50 111 2233",
    emergencyContactName: "Mona Al-Ghamdi",
    emergencyContactPhone: "+966 50 999 8877",
    emergencyContactRelation: "Spouse",
    departmentId: "dep-cardio",
    bedNumber: "BED-304-A",
    roomNumber: "304",
    triageLevel: "2_emergent" as const,
    primaryDiagnosisEn: "Acute Myocardial Infarction",
    primaryDiagnosisAr: "احتشاء عضلة القلب الحاد",
    allergiesText: "Penicillin",
  };

  it("passes validation with complete and compliant clinical input", () => {
    const result = patientAdmissionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid National ID with less than 10 digits", () => {
    const result = patientAdmissionSchema.safeParse({
      ...validData,
      nationalId: "12345",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("nationalId");
    }
  });

  it("rejects non-numeric National ID", () => {
    const result = patientAdmissionSchema.safeParse({
      ...validData,
      nationalId: "10987654AB",
    });
    expect(result.success).toBe(false);
  });

  it("requires English and Arabic names", () => {
    const result = patientAdmissionSchema.safeParse({
      ...validData,
      fullNameEn: "",
      fullNameAr: "",
    });
    expect(result.success).toBe(false);
  });
});
