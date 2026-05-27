import { ProductStatus } from "@/types/product";

export const PRODUCT_STATUS: Record<string, ProductStatus> = {
  HALAL: 'halal',
  HARAM: 'haram',
  MUSHBOOH: 'mushbooh',
};

export const STATUS_COLORS: Record<ProductStatus, string> = {
  halal: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  HALAL: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  haram: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  HARAM: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  mushbooh: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  MUSBOOH: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  halal: 'Halal',
  HALAL: 'Halal',
  haram: 'Haram',
  HARAM: 'Haram',
  mushbooh: 'Mushbooh',
  MUSBOOH: 'Mushbooh',
};

export const API_BASE_URL = 'https://api.scanbazar.com';

export const AUTH_TOKEN_KEY = 'admin_access_token';
export const USER_ROLE_KEY = 'user_role';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/admin/login`,
  SCANNED_PRODUCTS: `${API_BASE_URL}/api/admin-panel/scanned-products`,
  MY_STATS: `${API_BASE_URL}/api/admin-panel/my-stats`,
  ALL_REVIEWS: `${API_BASE_URL}/api/admin-panel/all-reviews`,
  ADMIN_STATS: `${API_BASE_URL}/api/admin-panel/stats`,
};
