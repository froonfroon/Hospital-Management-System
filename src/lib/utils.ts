import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMedicalRecordNumber(mrn: string): string {
  // Format MRN cleanly: MRN-102938
  if (!mrn) return "";
  return mrn.startsWith("MRN-") ? mrn : `MRN-${mrn}`;
}

export function formatDate(dateString: string | Date, locale: "en" | "ar" = "en"): string {
  if (!dateString) return "—";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(dateString: string | Date, locale: "en" | "ar" = "en"): string {
  if (!dateString) return "—";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatCurrency(amount: number, currency: string = "USD", locale: "en" | "ar" = "en"): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
