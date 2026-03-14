import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EmptyState } from "@/components/shared/empty-state";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="Không có dữ liệu" />);
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="Empty"
        description="Thêm mới để bắt đầu"
      />
    );
    expect(screen.getByText("Thêm mới để bắt đầu")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add</button>}
      />
    );
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("uses custom icon class", () => {
    const { container } = render(
      <EmptyState title="Test" icon="bi-people" />
    );
    const icon = container.querySelector(".bi-people");
    expect(icon).toBeInTheDocument();
  });

  it("uses default icon when not specified", () => {
    const { container } = render(<EmptyState title="Test" />);
    const icon = container.querySelector(".bi-inbox");
    expect(icon).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <EmptyState title="Test" className="custom-empty" />
    );
    expect(container.firstElementChild).toHaveClass("custom-empty");
  });
});
