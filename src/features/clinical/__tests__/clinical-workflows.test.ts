import { describe, it, expect } from "vitest";
import { hospitalDataAdapter } from "@/api/adapter";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";

describe("Clinical Workflows & Order Management", () => {
  it("dispatches and records a CPOE clinical medication order with status submitted", async () => {
    const res = await hospitalDataAdapter.createClinicalOrder({
      patientId: "pat-1001",
      patientName: "Tariq Mansoor Al-Harbi",
      patientMrn: "MRN-2026-4412",
      orderType: "medication",
      priority: "stat",
      status: "submitted",
      title: "Atorvastatin 80mg Oral Tablet",
      details: "80 mg PO at bedtime for Lipid Lowering in Acute NSTEMI",
      departmentId: "dep-cardio",
      orderedBy: {
        id: "usr-active",
        name: "Dr. Sarah Chen, MD",
        role: "physician",
      },
    });

    expect(res.data.id).toBeDefined();
    expect(res.data.orderNumber).toMatch(/^ORD-2026-\d{4}$/);
    expect(res.data.status).toBe("submitted");
    expect(res.data.priority).toBe("stat");
  });

  it("records bedside vital signs and updates the patient latest vitals", async () => {
    const vitalsRes = await hospitalDataAdapter.recordVitalSign("pat-1001", {
      heartRate: 78,
      systolicBP: 122,
      diastolicBP: 78,
      respiratoryRate: 16,
      temperature: 36.8,
      oxygenSaturation: 99,
      painScore: 1,
      consciousnessLevel: "Alert",
      recordedBy: "Staff Nurse Elena Rostova",
    });

    expect(vitalsRes.data.heartRate).toBe(78);
    expect(vitalsRes.data.oxygenSaturation).toBe(99);

    // Verify patient repository in memory reflects new vitals
    const patientRes = await hospitalDataAdapter.getPatientById("pat-1001");
    expect(patientRes.data.latestVitals?.heartRate).toBe(78);
    expect(patientRes.data.latestVitals?.systolicBP).toBe(122);
  });

  it("verifies all 15 clinical departments have unique route identifiers", () => {
    const ids = HOSPITAL_DEPARTMENTS.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(15);
    expect(ids).toContain("dep-er");
    expect(ids).toContain("dep-icu");
    expect(ids).toContain("dep-ot");
    expect(ids).toContain("dep-pharm");
    expect(ids).toContain("dep-lab");
    expect(ids).toContain("dep-rad");
  });
});
