import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import BudgetPlansPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: "test-id" }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockGet = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("BudgetPlansPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({
      success: true,
      data: [
        {
          id: "1",
          code: "NS2026-Q1-001",
          name: "Ngân sách CNTT Q1/2026",
          year: 2026,
          quarter: 1,
          totalAmount: "125000000",
          status: "draft",
          createdAt: "2026-03-14T00:00:00Z",
          createdBy: { id: "u1", fullName: "Admin" },
          categories: [{ id: "c1", _count: { items: 5 } }],
        },
        {
          id: "2",
          code: "NS2026-Q2-001",
          name: "Ngân sách CNTT Q2/2026",
          year: 2026,
          quarter: 2,
          totalAmount: "250000000",
          status: "approved",
          createdAt: "2026-03-14T00:00:00Z",
          createdBy: { id: "u1", fullName: "Admin" },
          categories: [{ id: "c2", _count: { items: 8 } }],
        },
      ],
      meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
    });
  });

  it("renders page header and breadcrumb", async () => {
    render(<BudgetPlansPage />);
    const headings = screen.getAllByText("Kế hoạch ngân sách");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders search and filter controls", async () => {
    render(<BudgetPlansPage />);
    expect(
      screen.getByPlaceholderText("Tìm theo tên hoặc mã...")
    ).toBeInTheDocument();
    expect(screen.getByText("Tất cả năm")).toBeInTheDocument();
    expect(screen.getByText("Tất cả trạng thái")).toBeInTheDocument();
  });

  it("shows loading spinner initially", () => {
    render(<BudgetPlansPage />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders budget plan codes after data loads", async () => {
    render(<BudgetPlansPage />);
    await waitFor(
      () => {
        // Plan code appears in both desktop table and mobile cards
        const codes = screen.getAllByText("NS2026-Q1-001");
        expect(codes.length).toBeGreaterThanOrEqual(1);
      },
      { timeout: 3000 }
    );
    const names = screen.getAllByText("Ngân sách CNTT Q1/2026");
    expect(names.length).toBeGreaterThanOrEqual(1);
    const codes2 = screen.getAllByText("NS2026-Q2-001");
    expect(codes2.length).toBeGreaterThanOrEqual(1);
  });

  it("renders status badges for each plan", async () => {
    render(<BudgetPlansPage />);
    await waitFor(
      () => {
        // "Nháp" appears in both filter select and badge, so use getAllByText
        const nhapElements = screen.getAllByText("Nháp");
        expect(nhapElements.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 3000 }
    );
    // "Đã duyệt" also appears in filter and badge
    const approvedElements = screen.getAllByText("Đã duyệt");
    expect(approvedElements.length).toBeGreaterThanOrEqual(2);
  });

  it("renders create plan CTA", () => {
    render(<BudgetPlansPage />);
    const links = screen.getAllByText("Tạo kế hoạch");
    expect(links.length).toBeGreaterThan(0);
  });

  it("calls API with correct endpoint", async () => {
    render(<BudgetPlansPage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        "/budget-plans",
        expect.any(Object)
      );
    });
  });
});
