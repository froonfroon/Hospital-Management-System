import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../status-badge";

describe("StatusBadge component", () => {
  it("renders label and semantic variant correctly", () => {
    render(<StatusBadge variant="critical">Code Blue</StatusBadge>);
    expect(screen.getByText("Code Blue")).toBeInTheDocument();
  });

  it("renders indicator dot by default", () => {
    const { container } = render(<StatusBadge variant="stable">Stable</StatusBadge>);
    const dot = container.querySelector(".rounded-full");
    expect(dot).toBeInTheDocument();
  });
});
