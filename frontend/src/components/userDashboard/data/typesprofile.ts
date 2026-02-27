// services/api.ts

import { csrfFetch } from "../../../utils/csrfFetch";

/* =======================
   TYPES
======================= */

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending" | "failed";
  downloadUrl: string;
  // Phase 2 Enhancement Fields
  currency?: string;           // "₹" or "$"
  currency_code?: string;      // "INR" or "USD"
  payment_method?: string;     // "razorpay", etc.
  installment_number?: number; // 1, 2, or 3
  no_of_installments?: number; // Total installments
  course?: string;             // Course name
  course_amount?: number;      // Individual course amount
  amount_paid?: number;        // Amount paid so far
  total_amount?: number;       // Total invoice amount
}

export interface BillingData {
  currentPlan: string;
  nextBillingDate: string;
  status: "active" | "inactive" | "cancelled";
  invoices: Invoice[];
}

export interface SettingsData {
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorAuth: boolean;
  language: string;
  timezone: string;
  currency: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    profile: ProfileData;
    billing?: BillingData;
    settings?: SettingsData;
  };
}

/* =======================
   FETCH PROFILE
======================= */

export const fetchProfileData = async (): Promise<ApiResponse> => {
  const response = await csrfFetch("http://localhost:8000/accounts/profile/", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }

  const apiData = await response.json();
  const backend = apiData.data;

  // Handle both nested address object (from profile endpoint) and flat fields
  const addressObj = backend.address || {};
  const addressParts = [
    backend.address_line_1 || addressObj.address_line_1 || "",
    backend.address_line_2 || addressObj.address_line_2 || "",
    backend.city || addressObj.city || "",
    backend.state || addressObj.state || "",
    backend.country || addressObj.country || "",
  ].filter(Boolean);

  return {
    success: true,
    message: "Profile fetched successfully",
    data: {
      profile: {
        id: String(backend.id),
        name: `${backend.first_name} ${backend.last_name}`.trim(),
        email: backend.email || "",
        phone: backend.phone_number || backend.phone || "",
        address: addressParts.join(", "),
        profilePicture: backend.profile_picture
          ? `http://localhost:8000${backend.profile_picture}`
          : null,
        createdAt: backend.created_at,
        updatedAt: backend.updated_at,
      },
    },
  };
};

/* =======================
   UPDATE PROFILE
======================= */

export const updateProfile = async (
  profileData: Partial<ProfileData>
): Promise<ApiResponse> => {
  const payload: Record<string, unknown> = {};

  if (profileData.name) {
    const parts = profileData.name.split(" ");
    payload.first_name = parts[0] || "";
    payload.last_name = parts.slice(1).join(" ");
  }

  if (profileData.phone) {
    payload.phone_number = profileData.phone;
  }

  if (profileData.address) {
    const parts = profileData.address.split(",").map(p => p.trim());
    if (parts[0]) payload.address_line_1 = parts[0];
    if (parts[1]) payload.address_line_2 = parts[1];
    if (parts[2]) payload.city = parts[2];
    if (parts[3]) payload.state = parts[3];
    if (parts[4]) payload.country = parts[4];
  }

  const response = await csrfFetch(
    "http://localhost:8000/accounts/edit_profile/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(`Profile update failed: ${response.status}`);
  }

  return response.json();
};

/* =======================
   UPLOAD PROFILE PICTURE
======================= */

export const uploadProfilePicture = async (file: File): Promise<ApiResponse> => {
  const formData = new FormData();
  formData.append('profile_picture', file);

  // Use csrfFetch to include CSRF token automatically
  const response = await csrfFetch("http://localhost:8000/accounts/upload_profile_picture/", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Profile picture upload failed: ${response.status}`);
  }

  return response.json();
};

/* =======================
   UPDATE SETTINGS
======================= */

export const updateSettings = async (
  settingsData: Partial<SettingsData>
): Promise<ApiResponse> => {
  const response = await csrfFetch(
    "http://localhost:8000/accounts/update_settings/",
    {
      method: "POST",
      body: JSON.stringify(settingsData),
    }
  );

  if (!response.ok) {
    throw new Error(`Settings update failed: ${response.status}`);
  }

  return response.json();
};

/* =======================
   CHANGE PASSWORD
======================= */

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  status: number;
  user?: {
    id: number;
    email: string;
    username: string;
    password_changed_at: string;
  };
  action?: string;
}

export const changePassword = async (
  passwordData: ChangePasswordData
): Promise<ChangePasswordResponse> => {
  const response = await csrfFetch(
    "http://localhost:8000/accounts/change_password/",
    {
      method: "POST",
      body: JSON.stringify(passwordData),
    }
  );

  // Handle session timeout (401) gracefully
  if (response.status === 401) {
    // Redirect will be triggered by csrfFetch, just return or throw
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    // Only try to parse JSON if not 401
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Password change failed: ${response.status}`);
  }

  return response.json();
};

/* =======================
   LOGOUT
======================= */

export interface LogoutResponse {
  success: boolean;
  message: string;
  status: number;
  user_email: string | null;
  session_cleared: boolean;
}

export const logoutUser = async (): Promise<LogoutResponse> => {
  // ✅ Using csrfFetch wrapper for POST
  const response = await csrfFetch("http://localhost:8000/accounts/logout/", {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Logout failed: ${response.status}`);
  }

  return response.json();
};

/* =======================
   PAYMENT DUE TYPES
======================= */

// export interface PaymentDueData {
//   course_id: number;
//   course_title: string;
//   no_of_installments: number;
//   second_installment_paid: number;
//   third_installment_paid: number;
// }

export interface PaymentDueData {
  course_id: number;
  course_title: string;
  no_of_installments: number;
  currency: string;
  currency_code: string;
  total_fee: number;
  per_installment: number;
  course_duration_months: number;
  end_at: string;

  second_installment_paid: number;
  second_installment_due: number;
  second_installment_due_date?: string;

  third_installment_paid: number;
  third_installment_due: number;
  third_installment_due_date?: string;
}


export interface PaymentDueResponse {
  success: boolean;
  message: string;
  status: number;
  data: PaymentDueData[];
  timestamp: string;
}

export interface InvoiceRegistrantData {
  // Original fields
  invoice_id: number;
  serial_no: string;
  order_id: number;
  course_id?: number;
  course: string;
  payment_id?: string;
  created_at: string;

  // Additional enrollment fields
  end_at?: string;
  amount?: number;

  // Phase 2 Enhancement Fields (from backend)
  course_amount?: number;
  amount_paid?: number;
  total_amount?: number;
  currency?: string;           // "₹" or "$"
  currency_code?: string;      // "INR" or "USD"
  status?: 'paid' | 'pending'; // Invoice status
  payment_method?: string;     // "razorpay", "credit_card", etc.
  installment_number?: number; // 1, 2, or 3
  no_of_installments?: number; // Total installments
  download_url?: string;       // Pre-formatted download URL
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  status: number;
  orders_exist: number;
  data: InvoiceRegistrantData[];
  timestamp: string;
}

/* =======================
   FETCH PAYMENT DUE
======================= */

export const fetchPaymentDue = async (): Promise<PaymentDueResponse> => {
  const response = await csrfFetch("http://localhost:8000/accounts/payment_due/", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch payment due: ${response.status}`);
  }

  return response.json();
};

/* =======================
   FETCH INVOICE LIST
======================= */

export const fetchInvoiceList = async (): Promise<InvoiceListResponse> => {
  const response = await csrfFetch("http://localhost:8000/accounts/invoice/", {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch invoice list: ${response.status}`);
  }

  return response.json();
};

/* =======================
   COMBINED BILLING DATA
======================= */

export interface ReminderItem {
  title: string;
  course: string;
  due: string;
  amount: string;
}

export interface BillingPaymentHistory {
  id: number;
  month: string;
  amount: string;
  status: "Paid" | "Pending" | "Due";
}

export interface PurchasedPayment {
  id: number;
  date: string;
  amount: string;
  status: "Paid" | "Pending";
}

export interface PurchasedCourse {
  id: number;
  title: string;
  category: string;
  url_link_name: string;
  purchaseDate: string;
  accessTill: string;
  price?: number;
  currency?: string;  // "₹" or "$" - dynamically set based on user's country
}

export interface PurchasedCourseResponse {
  success: boolean;
  message: string;
  status: number;
  user_type: string;
  courses: {
    total_count: number;
    courses_list: {
      id: number;
      title: string;
      category: string;
      url_link_name: string;
      description?: string;
    }[];
  };
  timestamp: string;
}

export interface CombinedBillingResponse {
  reminders: ReminderItem[];
  basicInstallments: BillingPaymentHistory[];
  customInstallments: BillingPaymentHistory[];
  purchasedPayments: PurchasedPayment[];
}
