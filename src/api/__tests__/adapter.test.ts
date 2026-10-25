import { describe, it, expect } from "vitest";
import { hospitalDataAdapter } from "../adapter";

describe("hospitalDataAdapter", () => {
  it("retrieves paginated patients list", async () => {
    const res = await hospitalDataAdapter.getPatients({ page: 1, pageSize: 2 });
    expect(res.data).toHaveLength(2);
    expect(res.meta?.pagination?.totalItems).toBeGreaterThan(0);
  });

  it("filters patients by search query matching MRN or Name", async () => {
    const res = await hospitalDataAdapter.getPatients(
      { page: 1, pageSize: 10 },
      { searchQuery: "Tariq" }
    );
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].fullNameEn).toContain("Tariq");
  });

  it("throws 404 ApiError when patient does not exist", async () => {
    await expect(hospitalDataAdapter.getPatientById("invalid-id")).rejects.toThrow();
  });
});
