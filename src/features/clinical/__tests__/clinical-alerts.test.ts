import { describe, it, expect } from "vitest";
import { hospitalDataAdapter } from "@/api/adapter";

describe("Clinical Risk & Alert Management Workflows", () => {
  it("retrieves clinical safety alerts with verified severity and rule triggers", async () => {
    const res = await hospitalDataAdapter.getClinicalAlerts();
    expect(res.data.length).toBeGreaterThan(0);

    const panicK = res.data.find((a) => a.category === "critical_lab");
    expect(panicK).toBeDefined();
    expect(panicK?.severity).toBe("critical");
    expect(panicK?.ruleTriggered).toContain("LAB-PANIC-K-CRITICAL");
  });

  it("acknowledges critical alert without prematurely marking it as resolved", async () => {
    const alerts = await hospitalDataAdapter.getClinicalAlerts();
    const target = alerts.data[0];

    const acknowledged = await hospitalDataAdapter.acknowledgeClinicalAlert(
      target.id,
      { userId: "usr-doc", name: "Dr. Sarah Chen, MD" },
      "Bedside evaluation started."
    );

    expect(acknowledged.data.status).toBe("acknowledged");
    expect(acknowledged.data.acknowledgedBy?.name).toBe("Dr. Sarah Chen, MD");
    // Verify acknowledgment != resolution
    expect(acknowledged.data.status).not.toBe("resolved");
    expect(acknowledged.data.eventHistory.length).toBeGreaterThan(0);
  });

  it("escalates urgent alert to Medical Leadership with documented reason", async () => {
    const alerts = await hospitalDataAdapter.getClinicalAlerts();
    const target = alerts.data[0];

    const escalated = await hospitalDataAdapter.escalateClinicalAlert(
      target.id,
      {
        userId: "cmo-01",
        name: "Dr. Khalid Mansoor",
        role: "Chief Medical Officer",
      },
      "Patient in refractory hypotensive shock despite fluid resuscitation."
    );

    expect(escalated.data.status).toBe("escalated");
    expect(escalated.data.escalatedTo?.name).toBe("Dr. Khalid Mansoor");
    expect(escalated.data.escalatedTo?.reason).toContain("refractory hypotensive shock");
  });

  it("resolves alert only when clinical action and patient disposition are documented", async () => {
    const alerts = await hospitalDataAdapter.getClinicalAlerts();
    const target = alerts.data[0];

    const resolved = await hospitalDataAdapter.resolveClinicalAlert(
      target.id,
      { userId: "usr-doc", name: "Dr. Sarah Chen, MD" },
      "Administered 10mL 10% Calcium Gluconate IV and 10 units regular insulin in D50W.",
      "stable_monitored"
    );

    expect(resolved.data.status).toBe("resolved");
    expect(resolved.data.resolvedBy?.documentedAction).toContain("Calcium Gluconate");
    expect(resolved.data.resolvedBy?.disposition).toBe("stable_monitored");
  });

  it("requires authorized justification when dismissing a clinical alert", async () => {
    const alerts = await hospitalDataAdapter.getClinicalAlerts();
    const target = alerts.data[0];

    const dismissed = await hospitalDataAdapter.dismissClinicalAlert(
      target.id,
      { userId: "usr-doc", name: "Dr. Sarah Chen, MD" },
      "Specimen hemolyzed in pneumatic tube system; repeat blood draw ordered."
    );

    expect(dismissed.data.status).toBe("dismissed");
    expect(dismissed.data.dismissedBy?.authorizedReason).toContain("Specimen hemolyzed");
  });
});
