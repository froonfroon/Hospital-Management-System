import { describe, it, expect } from "vitest";
import { hospitalDataAdapter } from "@/api/adapter";

describe("Department Assignment & Clinical Referral Workflows", () => {
  it("creates a specialist consulting referral and tracks pending state", async () => {
    const res = await hospitalDataAdapter.createDepartmentAssignment({
      patientId: "pat-1001",
      patientName: "Tariq Mansoor Al-Harbi",
      patientMrn: "MRN-2026-4412",
      encounterId: "enc-101",
      sourceDepartmentId: "dep-cardio",
      sourceDepartmentNameEn: "Cardiovascular Diseases",
      sourceDepartmentNameAr: "أمراض القلب",
      destinationDepartmentId: "dep-nephro",
      destinationDepartmentNameEn: "Nephrology & Renal Dialysis",
      destinationDepartmentNameAr: "أمراض الكلى والغسيل الكلوي",
      assignmentType: "consulting",
      reason: "Acute kidney injury with rising creatinine post PCI contrast.",
      clinicalSummary: "Creatinine rose from 1.1 to 2.4 mg/dL over 48h.",
      requestedBy: {
        id: "usr-active",
        name: "Dr. Sarah Chen, MD",
        role: "Attending Cardiologist",
      },
    });

    expect(res.data.id).toMatch(/^asg-/);
    expect(res.data.status).toBe("pending");
    expect(res.data.assignmentType).toBe("consulting");
    expect(res.data.isCurrentTreating).toBe(false);
  });

  it("accepts a treating ward transfer and updates treating status", async () => {
    const created = await hospitalDataAdapter.createDepartmentAssignment({
      patientId: "pat-1002",
      patientName: "Mona Al-Shehri",
      patientMrn: "MRN-2026-5120",
      encounterId: "enc-102",
      sourceDepartmentId: "dep-er",
      sourceDepartmentNameEn: "Emergency Department",
      sourceDepartmentNameAr: "قسم الطوارئ",
      destinationDepartmentId: "dep-icu",
      destinationDepartmentNameEn: "Intensive Care Unit",
      destinationDepartmentNameAr: "العناية المركزة",
      assignmentType: "treating",
      reason: "Post-arrest hemodynamic stabilization.",
      clinicalSummary: "Intubated, on norepinephrine infusion.",
      requestedBy: {
        id: "doc-er",
        name: "Dr. Ahmed Al-Mansoor",
        role: "ER Attending",
      },
    });

    expect(created.data.status).toBe("pending");

    // Destination department accepts assignment
    const accepted = await hospitalDataAdapter.updateAssignmentStatus(
      created.data.id,
      "accepted"
    );

    expect(accepted.data.status).toBe("accepted");
    expect(accepted.data.acceptanceTimestamp).toBeDefined();
    expect(accepted.data.isCurrentTreating).toBe(true);
  });

  it("handles referral rejection with mandatory documentation", async () => {
    const created = await hospitalDataAdapter.createDepartmentAssignment({
      patientId: "pat-1003",
      patientName: "Youssef Al-Dosari",
      patientMrn: "MRN-2026-6631",
      encounterId: "enc-103",
      sourceDepartmentId: "dep-icu",
      sourceDepartmentNameEn: "Intensive Care Unit",
      sourceDepartmentNameAr: "العناية المركزة",
      destinationDepartmentId: "dep-rehab",
      destinationDepartmentNameEn: "Physical Medicine & Rehabilitation",
      destinationDepartmentNameAr: "الطب الطبيعي والتأهيل",
      assignmentType: "interdepartmental_transfer",
      reason: "Post-extubation rehabilitation transfer.",
      clinicalSummary: "Patient clinically frail.",
      requestedBy: {
        id: "doc-icu",
        name: "Dr. Elena Rostova",
        role: "ICU Attending",
      },
    });

    const rejected = await hospitalDataAdapter.updateAssignmentStatus(
      created.data.id,
      "rejected",
      "Patient currently hemodynamically unstable for floor rehab; requires step-down HDU first."
    );

    expect(rejected.data.status).toBe("rejected");
    expect(rejected.data.rejectionReason).toContain("hemodynamically unstable");
  });
});
