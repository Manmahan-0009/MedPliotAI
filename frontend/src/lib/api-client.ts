import { getAccessToken, notifyUnauthorized } from "./token-manager";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
export const API_URL = API_BASE_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  const hasBody = options?.body !== undefined && options?.body !== null;
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  if (hasBody && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (!options?.skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    notifyUnauthorized();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d: { msg?: string }) => d.msg).join(", ")
          : "API error";
    throw new ApiError(res.status, message || "API error");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res as unknown as T;
}

export async function apiFetchBlob(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<Blob> {
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  const hasBody = options?.body !== undefined && options?.body !== null;
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  if (hasBody && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (!options?.skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    notifyUnauthorized();
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  if (!res.ok) {
    throw new ApiError(res.status, "Download failed");
  }

  return res.blob();
}
