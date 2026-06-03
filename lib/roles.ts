import type { UserRole } from "@/types/api";

export function canAccessBackOffice(role: UserRole | null | undefined): boolean {
  return role === "COMMERCIAL" || role === "SUPREME_LEADER";
}

export function isLeader(role: UserRole | null | undefined): boolean {
  return role === "SUPREME_LEADER";
}
