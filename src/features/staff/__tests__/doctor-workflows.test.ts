import { describe, it, expect } from "vitest";
import { doctorRegistrationSchema } from "../components/doctor-registration-schema";
import { hospitalDataAdapter } from "@/api/adapter";

describe("Doctor Registration & Verification Workflows", () => {
  it("validates compliant doctor registration submission", () => {
    const validData = {
      legalNameEn: "Dr. Ziyad Al-Harbi, MD",
      legalNameAr: "د. زياد الحربي",
      title: "Consultant" as const,
      licenseNumber: "SCFHS-MD-99120",
      licenseAuthority: "Saudi Commission for Health Specialties",
      licenseExpiryDate: "2029-12-31",
      primarySpecialty: "Cardiology",
      subspecialty: "Electrophysiology",
      primaryDepartmentId: "dep-cardio",
      authorizedSecondaryDepartmentIds: ["dep-icu"],
      employmentStatus: "full_time" as const,
      professionalEmail: "ziyad.harbi@hospitalos.demo",
      officePhone: "+966 11 400 9901",
      roomNumber: "C-301",
      languages: "Arabic, English",
      bioEn: "Specialist in cardiac ablation and arrhythmias.",
      initialStatus: "pending_verification" as const,
    };

    const parsed = doctorRegistrationSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("rejects doctor registration if medical license expiration date is in the past", () => {
    const pastLicenseData = {
      legalNameEn: "Dr. Expired License",
      legalNameAr: "د. رخصة منتهية",
      title: "Specialist" as const,
      licenseNumber: "OLD-12345",
      licenseAuthority: "SCFHS",
      licenseExpiryDate: "2020-01-01", // Past date
      primarySpecialty: "Internal Medicine",
      primaryDepartmentId: "dep-med",
      authorizedSecondaryDepartmentIds: [],
      employmentStatus: "locum" as const,
      professionalEmail: "expired@hospitalos.demo",
      officePhone: "+966 11 000 0000",
      languages: "Arabic",
      initialStatus: "pending_verification" as const,
    };

    const parsed = doctorRegistrationSchema.safeParse(pastLicenseData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issues = parsed.error.issues;
      expect(issues.some((i) => i.path.includes("licenseExpiryDate"))).toBe(true);
    }
  });

  it("ensures newly created doctors enter pending_verification status and can be approved by Medical Director", async () => {
    const newDoc = await hospitalDataAdapter.createDoctor({
      legalNameEn: "Dr. Kareem Nader, MD",
      legalNameAr: "د. كريم نادر",
      title: "Specialist",
      licenseNumber: "SCFHS-MD-55881",
      licenseAuthority: "SCFHS",
      licenseExpiryDate: "2028-10-10",
      primarySpecialty: "Neurology",
      primaryDepartmentId: "dep-neuro",
      primaryDepartmentNameEn: "Neurology",
      primaryDepartmentNameAr: "أمراض الأعصاب",
      authorizedSecondaryDepartmentIds: [],
      employmentStatus: "full_time",
      verificationStatus: "pending_verification",
      professionalEmail: "kareem.nader@hospitalos.demo",
      officePhone: "+966 11 400 7711",
      onCallStatus: "off_duty",
      credentials: [],
      languages: ["Arabic", "English"],
    });

    expect(newDoc.data.verificationStatus).toBe("pending_verification");
    expect(newDoc.data.employeeId).toMatch(/^DOC-/);

    // Verify status transition to verified with auditor signature
    const approved = await hospitalDataAdapter.updateDoctorVerification(
      newDoc.data.id,
      "verified",
      undefined,
      { userId: "cmo-01", name: "Dr. Khalid Mansoor (CMO)" }
    );

    expect(approved.data.verificationStatus).toBe("verified");
    expect(approved.data.verifiedBy?.name).toContain("Dr. Khalid Mansoor");

    // Suspend credentials
    const suspended = await hospitalDataAdapter.updateDoctorVerification(
      newDoc.data.id,
      "suspended",
      "Annual malpractice audit pending."
    );

    expect(suspended.data.verificationStatus).toBe("suspended");
    expect(suspended.data.suspendedReason).toBe("Annual malpractice audit pending.");
  });
});
