import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// localStorage key for auth state
const AUTH_STORAGE_KEY = "deepeigen_auth_user";

interface User {
  email: string;
  rememberMe?: boolean;
  // Add other user properties as needed
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  is_active?: boolean;
  is_staff?: boolean;
  is_superadmin?: boolean;
  date_joined?: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  isInitialized: boolean; // Track if we've checked localStorage
}

// Helper to get user from localStorage
const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return null;
};

// Helper to save user to localStorage
const saveUserToStorage = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Initialize state from localStorage
const getInitialState = (): AuthState => {
  const storedUser = getStoredUser();
  return {
    user: storedUser,
    isInitialized: true,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Save to localStorage whenever user is set
      saveUserToStorage(action.payload);
    },
    logout: (state) => {
      state.user = null;
      // Clear localStorage on logout
      saveUserToStorage(null);
    },
    // Action to clear auth state without clearing storage (for session expiry)
    clearAuthState: (state) => {
      state.user = null;
    },
    // Action to reinitialize from localStorage (useful for page refresh)
    reinitializeAuth: (state) => {
      const storedUser = getStoredUser();
      state.user = storedUser;
      state.isInitialized = true;
    },
  },
});

export const { setUser, logout, clearAuthState, reinitializeAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.user;
export const selectIsInitialized = (state: { auth: AuthState }) =>
  state.auth.isInitialized;
