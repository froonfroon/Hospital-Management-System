import { test, expect } from "@playwright/test";

test.describe("HospitalOS Core Foundation", () => {
  test("loads operations overview and navigates to patient registry", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HospitalOS by Solve Codex/i);

    // Verify presence of core shell elements
    await expect(page.locator("text=HospitalOS")).toBeVisible();
    await expect(page.locator("text=Operations Overview")).toBeVisible();

    // Navigate to Patient Master Index
    await page.click("text=Patient Master Index");
    await expect(page).toHaveURL(/.*\/patients/);

    // Verify patient registry table loaded
    await expect(page.locator("text=Hospital Master Patient Registry")).toBeVisible();
    await expect(page.locator("text=MRN-2026-4412")).toBeVisible();
  });
});
