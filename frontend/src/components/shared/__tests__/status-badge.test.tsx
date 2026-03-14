import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders children text", () => {
    render(<StatusBadge>Active</StatusBadge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with success variant styling", () => {
    render(<StatusBadge variant="success">OK</StatusBadge>);
    const badge = screen.getByText("OK").closest("span");
    expect(badge).toHaveClass("text-success");
  });

  it("renders dot indicator by default", () => {
    const { container } = render(<StatusBadge variant="danger">Error</StatusBadge>);
    const dot = container.querySelector(".bg-danger");
    expect(dot).toBeInTheDocument();
  });

  it("hides dot when dot=false", () => {
    const { container } = render(
      <StatusBadge variant="danger" dot={false}>Error</StatusBadge>
    );
    const dot = container.querySelector(".bg-danger");
    expect(dot).not.toBeInTheDocument();
  });

  it("uses neutral variant by default", () => {
    render(<StatusBadge>Default</StatusBadge>);
    const badge = screen.getByText("Default").closest("span");
    expect(badge).toHaveClass("text-muted-foreground");
  });

  it("accepts custom className", () => {
    render(<StatusBadge className="custom-class">Test</StatusBadge>);
    const badge = screen.getByText("Test").closest("span");
    expect(badge).toHaveClass("custom-class");
  });
});
