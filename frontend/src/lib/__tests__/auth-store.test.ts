import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/",
}));

describe("auth-store", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("initial state is not authenticated", async () => {
    const { useAuthStore } = await import("@/lib/auth-store");
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("logout clears tokens and user", async () => {
    const { useAuthStore } = await import("@/lib/auth-store");
    localStorage.setItem("access_token", "test-token");
    localStorage.setItem("refresh_token", "test-refresh");

    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });

    useAuthStore.getState().logout();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();

    // Restore
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("setUser updates state", async () => {
    const { useAuthStore } = await import("@/lib/auth-store");
    const testUser = {
      id: "1",
      fullName: "Test",
      email: "test@test.com",
      role: "admin",
    };

    useAuthStore.getState().setUser(testUser);
    const state = useAuthStore.getState();

    expect(state.user).toEqual(testUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it("refreshAuth sets isLoading false when no token", async () => {
    const { useAuthStore } = await import("@/lib/auth-store");
    await useAuthStore.getState().refreshAuth();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });
});
