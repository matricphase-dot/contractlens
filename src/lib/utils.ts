import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function severityColor(severity: string) {
  switch (severity) {
    case "critical": return "bg-red-500/15 text-red-400 border-red-500/30";
    case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "medium": return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
    case "low": return "bg-green-500/15 text-green-400 border-green-500/30";
    default: return "bg-gray-500/15 text-gray-400 border-gray-500/30";
  }
}

export function contractTypeIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("nda") || t.includes("confidential")) return "Shield";
  if (t.includes("saas") || t.includes("service") || t.includes("msa")) return "FileText";
  if (t.includes("employment") || t.includes("offer")) return "Briefcase";
  if (t.includes("lease") || t.includes("rental")) return "Home";
  if (t.includes("vendor") || t.includes("supplier")) return "Truck";
  if (t.includes("license")) return "Key";
  if (t.includes("sales") || t.includes("purchase")) return "ShoppingCart";
  if (t.includes("partnership") || t.includes("jv")) return "Users";
  return "FileText";
}
