export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const TOKEN_STORAGE_KEY = "ezzyshop_auth_token";

export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20",
    dotClass: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/20",
    dotClass: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-600/20",
    dotClass: "bg-indigo-500",
  },
  shipped: {
    label: "Shipped",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-600/20",
    dotClass: "bg-purple-500",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20",
    dotClass: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20",
    dotClass: "bg-rose-500",
  },
};

export const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Paid",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  failed: {
    label: "Failed",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title_asc", label: "Name: A to Z" },
  { value: "title_desc", label: "Name: Z to A" },
];

export const DEFAULT_PAGE_LIMIT = 12;
