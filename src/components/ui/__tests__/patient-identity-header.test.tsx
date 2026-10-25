import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PatientIdentityHeader } from "../patient-identity-header";
import { MOCK_PATIENTS } from "@/api/fixtures";
import { I18nProvider } from "@/i18n/i18n-context";

describe("PatientIdentityHeader component", () => {
  it("renders patient name, MRN, national ID, and bed location", () => {
    const patient = MOCK_PATIENTS[0];

    render(
      <I18nProvider>
        <PatientIdentityHeader patient={patient} />
      </I18nProvider>
    );

    expect(screen.getByText(patient.fullNameEn)).toBeInTheDocument();
    expect(screen.getByText(patient.mrn)).toBeInTheDocument();
    expect(screen.getByText(patient.bed.bedNumber)).toBeInTheDocument();
    expect(screen.getByText(patient.bloodType)).toBeInTheDocument();
  });
});
