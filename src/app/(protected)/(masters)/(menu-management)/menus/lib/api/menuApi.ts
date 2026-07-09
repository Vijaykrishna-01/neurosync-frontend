import { AUTH_TOKEN_KEY } from "@/constants";
import { Menu, MenuPayload, MenusApiResponse } from "../../types/menu";

interface RoleOption {
  id: number;
  name: string;
  code?: string;
  description?: string | null;
  isActive?: boolean;
}

interface RolesApiResponse {
  success: boolean;
  data: RoleOption[];
  message?: string;
}

// e.g. import { AUTH_TOKEN_KEY } from "@/lib/constants";


const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body as { message?: string })?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body as T;
}

export const menuApi = {
  list: () => request<MenusApiResponse>("/menus", { method: "GET" }),

  listRoles: () => request<RolesApiResponse>("/roles", { method: "GET" }),

  create: (payload: MenuPayload) =>
    request<{ success: boolean; data: Menu; message?: string }>("/menus", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  update: (id: number, payload: MenuPayload) =>
    request<{ success: boolean; data: Menu; message?: string }>(
      `/menus/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  remove: (id: number) =>
    request<{ success: boolean; message?: string }>(`/menus/${id}`, {
      method: "DELETE",
    }),
};

export { ApiError };
