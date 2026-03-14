import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserFormDialog } from "@/app/(dashboard)/settings/users/user-form-dialog";

describe("UserFormDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when open is false", () => {
    const { container } = render(
      <UserFormDialog
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={null}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders add mode with correct title", () => {
    render(
      <UserFormDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={null}
      />
    );
    expect(screen.getByText("Thêm người dùng mới")).toBeInTheDocument();
    expect(screen.getByText("Tạo mới")).toBeInTheDocument();
  });

  it("renders edit mode with correct title", () => {
    const user = {
      id: "1",
      fullName: "Test User",
      email: "test@test.com",
      role: "staff",
      status: "active",
    };
    render(
      <UserFormDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={user}
      />
    );
    expect(screen.getByText("Chỉnh sửa người dùng")).toBeInTheDocument();
    expect(screen.getByText("Cập nhật")).toBeInTheDocument();
  });

  it("shows password field only in add mode", () => {
    const { rerender } = render(
      <UserFormDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={null}
      />
    );
    expect(screen.getByText("Mật khẩu")).toBeInTheDocument();

    rerender(
      <UserFormDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={{
          id: "1",
          fullName: "User",
          email: "u@t.com",
          role: "staff",
          status: "active",
        }}
      />
    );
    expect(screen.queryByText("Mật khẩu")).not.toBeInTheDocument();
  });

  it("calls onClose when Hủy button clicked", () => {
    render(
      <UserFormDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={null}
      />
    );
    fireEvent.click(screen.getByText("Hủy"));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it("pre-fills form in edit mode", () => {
    render(
      <UserFormDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={{
          id: "1",
          fullName: "Nguyễn Test",
          email: "test@haivan.com",
          role: "manager",
          status: "active",
          department: "Phòng CNTT",
          phone: "0901234567",
        }}
      />
    );
    expect(screen.getByDisplayValue("Nguyễn Test")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@haivan.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Phòng CNTT")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0901234567")).toBeInTheDocument();
  });
});
