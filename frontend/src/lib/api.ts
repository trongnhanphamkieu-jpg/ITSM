const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

type RequestOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
  skipContentType?: boolean;
};

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.data?.accessToken) {
        localStorage.setItem("access_token", data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipContentType, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipContentType) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (response.status === 401) {
    // Skip token refresh for auth endpoints (login, register)
    const isAuthEndpoint = path.startsWith("/auth/");

    if (!isAuthEndpoint) {
      // Try refresh token before logging out
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        const retryHeaders: Record<string, string> = {
          ...getAuthHeaders(),
          ...(fetchOptions.headers as Record<string, string>),
        };
        if (!skipContentType) {
          retryHeaders["Content-Type"] = "application/json";
        }
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
        });

        if (retryResponse.ok) {
          return retryResponse.json();
        }
      }

      // Refresh failed — force logout
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message || data.message || "An error occurred",
      response.status,
      data.error
    );
  }

  return data;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public error?: { code: string; details?: unknown[] }
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]) =>
    request<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, {
      method: "POST",
      body: formData,
      skipContentType: true,
    }),
};
