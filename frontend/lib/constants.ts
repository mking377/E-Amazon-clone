// frontend/lib/constants.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  ORDERS: "/orders",
  SETTINGS: "/settings",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
};

export const LOCAL_STORAGE_KEYS = {
  THEME: "theme",
  USER: "user",
};
