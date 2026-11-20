const TOKEN_KEY = "fixora-api-token";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || ""
).replace(/\/$/, "");

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getToken();

  headers.set("Accept", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();

  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const validationErrors = data?.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    throw new Error(
      validationErrors ||
        data?.message ||
        `Request failed with status ${response.status}.`,
    );
  }

  return data as T;
}
