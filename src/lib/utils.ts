import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy");
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "dd MMM yyyy, hh:mm a");
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    sent: "info",
    viewed: "purple",
    quote_received: "success",
    expired: "danger",
    draft: "default",
    closed: "default",
    pending: "warning",
    accepted: "success",
    rejected: "danger",
    negotiating: "purple",
    confirmed: "success",
    invoice_generated: "info",
    dispatched: "purple",
    in_transit: "warning",
    delivered: "success",
    cancelled: "danger",
    paid: "success",
    overdue: "danger",
    approved: "success",
    in_review: "warning",
    new: "info",
    quoted: "success",
    active: "success",
    inactive: "default",
  };
  return map[status] || "default";
}

export function getStatusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function truncate(str: string, maxLength = 50): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
