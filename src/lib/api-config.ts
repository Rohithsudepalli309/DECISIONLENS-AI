export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "production"; // staging, production, development
export const LOG_LEVEL = APP_ENV === 'production' ? 'error' : 'debug';
