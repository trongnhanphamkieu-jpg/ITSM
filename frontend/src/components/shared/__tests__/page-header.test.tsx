import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PageHeader } from "@/components/shared/page-header";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <PageHeader title="Dashboard" description="Tổng quan hệ thống" />
    );
    expect(screen.getByText("Tổng quan hệ thống")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<PageHeader title="Dashboard" />);
    const paras = container.querySelectorAll("p");
    expect(paras.length).toBe(0);
  });

  it("renders action buttons", () => {
    render(
      <PageHeader
        title="Budget"
        actions={<button>Add New</button>}
      />
    );
    expect(screen.getByText("Add New")).toBeInTheDocument();
  });

  it("title is h1 heading", () => {
    render(<PageHeader title="Test Title" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Test Title");
  });
});
