import { describe, it, expect } from "vitest";
import { ROLE_PERMISSIONS, HOSPITAL_DEPARTMENTS } from "../authorization";
import { RoleId } from "@/types/common";

describe("Role-Based Access Control (RBAC) & Hospital Permissions", () => {
  it("authorizes medical directors and physicians to discharge patients", () => {
    expect(ROLE_PERMISSIONS.medical_director).toContain("patients:discharge");
    expect(ROLE_PERMISSIONS.physician).toContain("patients:discharge");
  });

  it("restricts nurse staff and triage officers from discharging patients", () => {
    expect(ROLE_PERMISSIONS.nurse_staff).not.toContain("patients:discharge");
    expect(ROLE_PERMISSIONS.triage_officer).not.toContain("patients:discharge");
  });

  it("authorizes pharmacists to dispense medication orders but restricts patient registration", () => {
    expect(ROLE_PERMISSIONS.pharmacist).toContain("orders:dispense");
    expect(ROLE_PERMISSIONS.pharmacist).not.toContain("patients:create");
  });

  it("verifies all 15 clinical departments have operational capacity definitions", () => {
    expect(HOSPITAL_DEPARTMENTS).toHaveLength(15);
    HOSPITAL_DEPARTMENTS.forEach((dept) => {
      expect(dept.totalBeds).toBeGreaterThanOrEqual(0);
      expect(dept.operationalBeds).toBeGreaterThanOrEqual(0);
      expect(dept.occupiedBeds).toBeGreaterThanOrEqual(0);
      if (dept.totalBeds > 0) {
        expect(dept.operationalBeds + dept.outOfServiceBeds).toBe(dept.totalBeds);
        expect(dept.occupiedBeds + dept.availableBeds).toBe(dept.operationalBeds);
      }
    });
  });
});
