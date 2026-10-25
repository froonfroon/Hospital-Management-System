import { describe, it, expect } from "vitest";
import { HOSPITAL_DEPARTMENTS } from "@/auth/authorization";

describe("Hospital Operational Metrics & Data Integrity", () => {
  it("calculates overall hospital physical vs operational occupancy accurately", () => {
    const totalPhysicalBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.totalBeds, 0);
    const totalOperationalBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.operationalBeds, 0);
    const totalOccupiedBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.occupiedBeds, 0);
    const totalOutOfServiceBeds = HOSPITAL_DEPARTMENTS.reduce((acc, d) => acc + d.outOfServiceBeds, 0);

    // Inpatient total licensed beds
    expect(totalPhysicalBeds).toBe(409);
    expect(totalOperationalBeds).toBe(385);
    expect(totalOutOfServiceBeds).toBe(24);
    expect(totalPhysicalBeds).toBe(totalOperationalBeds + totalOutOfServiceBeds);

    // True operational occupancy calculation
    const operationalOccupancy = Math.round((totalOccupiedBeds / totalOperationalBeds) * 100);
    expect(operationalOccupancy).toBe(87); // 335 / 385 = 87%

    // Physical occupancy rate calculation
    const physicalOccupancy = Math.round((totalOccupiedBeds / totalPhysicalBeds) * 100);
    expect(physicalOccupancy).toBe(82); // 335 / 409 = 82%
  });

  it("ensures diagnostic units have zero inpatient beds and zero occupancy", () => {
    const diagnosticCodes = ["PHARM", "LAB", "RAD"];
    const diagnosticDepts = HOSPITAL_DEPARTMENTS.filter((d) => diagnosticCodes.includes(d.code));

    expect(diagnosticDepts).toHaveLength(3);
    diagnosticDepts.forEach((d) => {
      expect(d.totalBeds).toBe(0);
      expect(d.operationalBeds).toBe(0);
      expect(d.occupiedBeds).toBe(0);
      expect(d.availableBeds).toBe(0);
    });
  });
});
