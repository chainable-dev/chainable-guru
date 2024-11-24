export const APP_ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    CALLBACK: "/auth/callback",
    RESET_PASSWORD: "/reset-password",
    FORGOT_PASSWORD: "/forgot-password",
  },

  // Main app routes
  APP: {
    HOME: "/",
    CHAT: "/chat",
    PROFILE: "/profile",
    SETTINGS: "/settings",
  },

  // API routes
  API: {
    CHAT: "/api/chat",
    VOTE: "/api/vote",
    UPLOAD: "/api/upload",
    DOCUMENTS: "/api/documents",
  },
} as const;

export const AUTH_CALLBACKS = {
  // OAuth callback URLs
  GOOGLE: `${process.env.NEXT_PUBLIC_SITE_URL}${APP_ROUTES.AUTH.CALLBACK}`,
  GITHUB: `${process.env.NEXT_PUBLIC_SITE_URL}${APP_ROUTES.AUTH.CALLBACK}`,
  
  // Default redirects
  DEFAULT_SUCCESS: APP_ROUTES.APP.HOME,
  DEFAULT_ERROR: APP_ROUTES.AUTH.LOGIN,
  
  // Session timeouts
  SESSION_EXPIRY: 60 * 60 * 24 * 7, // 7 days
} as const;

export const API_ENDPOINTS = {
  // External API endpoints
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Internal API endpoints
  INTERNAL: {
    CHAT: APP_ROUTES.API.CHAT,
    VOTE: APP_ROUTES.API.VOTE,
    UPLOAD: APP_ROUTES.API.UPLOAD,
    DOCUMENTS: APP_ROUTES.API.DOCUMENTS,
  },
} as const;

// Public paths that don't require authentication
export const PUBLIC_PATHS = [
  APP_ROUTES.AUTH.LOGIN,
  APP_ROUTES.AUTH.REGISTER,
  APP_ROUTES.AUTH.CALLBACK,
  APP_ROUTES.AUTH.RESET_PASSWORD,
  APP_ROUTES.AUTH.FORGOT_PASSWORD,
] as const;

// Cookie names
export const COOKIES = {
  AUTH_TOKEN: "sb-auth-token",
  THEME: "theme",
  SIDEBAR_STATE: "sidebar:state",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: "theme",
  SIDEBAR_STATE: "sidebar:state",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: "Invalid email or password",
    SESSION_EXPIRED: "Your session has expired",
    UNAUTHORIZED: "You are not authorized to access this resource",
  },
  API: {
    INTERNAL_ERROR: "An internal error occurred",
    NOT_FOUND: "Resource not found",
    INVALID_REQUEST: "Invalid request",
  },
} as const; 