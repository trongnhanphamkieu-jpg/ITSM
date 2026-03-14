import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { UserAvatar } from "@/components/shared/user-avatar";

describe("UserAvatar", () => {
  it("renders initials from full name", () => {
    render(<UserAvatar name="Nguyễn Văn An" />);
    expect(screen.getByText("NV")).toBeInTheDocument();
  });

  it("renders single initial for single name", () => {
    render(<UserAvatar name="Admin" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("applies sm size class", () => {
    render(<UserAvatar name="Test User" size="sm" />);
    const avatar = screen.getByText("TU").closest("div");
    expect(avatar).toHaveClass("h-6", "w-6");
  });

  it("applies md size class by default", () => {
    render(<UserAvatar name="Test User" />);
    const avatar = screen.getByText("TU").closest("div");
    expect(avatar).toHaveClass("h-8", "w-8");
  });

  it("applies lg size class", () => {
    render(<UserAvatar name="Test User" size="lg" />);
    const avatar = screen.getByText("TU").closest("div");
    expect(avatar).toHaveClass("h-10", "w-10");
  });

  it("produces consistent color for same name", () => {
    const { container: c1 } = render(<UserAvatar name="John" />);
    const { container: c2 } = render(<UserAvatar name="John" />);
    const bg1 = c1.firstElementChild?.className;
    const bg2 = c2.firstElementChild?.className;
    expect(bg1).toBe(bg2);
  });

  it("sets title attribute with full name", () => {
    render(<UserAvatar name="Trần Minh" />);
    const avatar = screen.getByTitle("Trần Minh");
    expect(avatar).toBeInTheDocument();
  });
});
