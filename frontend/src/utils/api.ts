// 

import axios, { AxiosError } from "axios";

// When developing locally we proxy `/api` to the Django backend via Vite (see vite.config.ts).
// Set `VITE_API_URL` in production to your backend origin (including scheme).
export const API_BASE = import.meta.env.VITE_API_URL || "/api";

const BASE_URL = API_BASE.endsWith("/")
  ? API_BASE
  : API_BASE + "/";

// helper
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(^|; )" + name + "=([^;]*)")
  );

  return match ? decodeURIComponent(match[2]) : null;
};

export const getRequest = async (
  url: string,
  token: string | null = null
): Promise<{ data: any; status: number }> => {
  try {
    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await axios.get(BASE_URL + url, {
      headers,
      withCredentials: true,
    });

    return { data: response.data, status: response.status };

  } catch (error) {
    const err = error as AxiosError;

    if (err.response) {
      return {
        data: err.response.data,
        status: err.response.status,
      };
    }

    return { data: null, status: 0 };
  }
};

export const postRequest = async (
  url: string,
  body: any = {},
  token: string | null = null
): Promise<{ data: any; status: number }> => {
  try {
    const csrfToken = getCookie("csrftoken");

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    };

    const response = await axios.post(BASE_URL + url, body, {
      headers,
      withCredentials: true,
    });

    return { data: response.data, status: response.status };

  } catch (error) {
    const err = error as AxiosError;

    if (err.response) {
      return {
        data: err.response.data,
        status: err.response.status,
      };
    }

    return { data: null, status: 0 };
  }
};
