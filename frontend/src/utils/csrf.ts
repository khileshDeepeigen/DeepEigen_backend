/**
 * CSRF Token Utility
 * Retrieves CSRF token from document.cookie
 * Django sets csrftoken cookie when CsrfViewMiddleware is enabled
 */
export function getCSRFToken(): string | null {
  const name = "csrftoken=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name)) {
      return cookie.substring(name.length);
    }
  }
  return null;
}

/**
 * Ensure CSRF token is present by fetching it from Django backend
 * Call this once on app initialization (e.g., in App.tsx useEffect)
 * This triggers Django's ensure_csrf_cookie decorator which sets the token
 */
export async function ensureCSRFToken(): Promise<void> {
  try {
    await fetch("http://localhost:8000/accounts/csrf/", {
      credentials: "include", // CRITICAL: allows receiving and storing the cookie
      method: "GET",
    });
  } catch (error) {
    console.warn("Failed to fetch CSRF token:", error);
    // Non-fatal: middleware will still validate using cookie if available
  }
}
