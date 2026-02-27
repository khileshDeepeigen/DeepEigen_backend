import { getCSRFToken } from "./csrf";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * CSRF-aware fetch wrapper for all state-changing API requests (POST, PUT, PATCH, DELETE)
 *
 * This wrapper automatically:
 * - Includes credentials (session cookies)
 * - Attaches X-CSRFToken header from csrftoken cookie
 * - Handles FormData correctly (no manual Content-Type for multipart)
 * - Preserves other custom headers
 *
 * Usage:
 *   const response = await csrfFetch('/accounts/login/', {
 *     method: 'POST',
 *     body: JSON.stringify({ email, password })
 *   });
 *
 * For file uploads (FormData):
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   const response = await csrfFetch('/accounts/upload_profile_picture/', {
 *     method: 'POST',
 *     body: formData
 *   });
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = getCSRFToken();

  // Detect if body is FormData (for file uploads, etc.)
  const isFormData = options.body instanceof FormData;

  // Build headers: preserve custom headers, add CSRF and Content-Type
  const headers: HeadersInit = {
    // For FormData, let browser set Content-Type with multipart boundary
    // For JSON, explicitly set Content-Type
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    // Always attach CSRF token (Django checks X-CSRFToken header for POST/PUT/PATCH/DELETE)
    "X-CSRFToken": csrfToken || "",
    // Merge any custom headers passed in options
    ...(options.headers || {}),
  };

  const response = await fetch((url), {
    ...options,
    credentials: "include", //  CRITICAL: Include session cookies in request
    headers,
  });

  // Global session timeout handling
  if (response.status === 401) {
    // Prevent infinite redirect loop: do not redirect if already on /login
    const currentPath = window.location.pathname;
    if (currentPath !== "/login") {
      // Use replace to avoid history stack growth
      window.location.replace("/login");
    }
    // Optionally: return a rejected promise to stop further execution
    // Prevent unhandled promise errors by returning a dummy Response
    return new Response(
      JSON.stringify({
        detail: "Authentication required",
        code: "AUTH_REQUIRED"
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
  return response;
}

/**
 * Build full API URL (prepend BASE_URL if path is relative)
 */
export function buildApiUrl(path: string): string {
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}
