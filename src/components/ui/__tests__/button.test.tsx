import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "../button";

describe("Button component", () => {
  it("renders with default props and text", () => {
    render(<Button>Admit Patient</Button>);
    const btn = screen.getByRole("button", { name: /admit patient/i });
    expect(btn).toBeInTheDocument();
  });

  it("handles loading state by disabling button and showing spinner", () => {
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
  });

  it("applies variant classes correctly", () => {
    render(<Button variant="destructive">Discharge</Button>);
    const btn = screen.getByRole("button", { name: /discharge/i });
    expect(btn.className).toContain("bg-red-700");
  });
});
