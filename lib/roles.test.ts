import { describe, it, expect } from "vitest";
import { canAccessBackOffice, isLeader } from "./roles";

describe("canAccessBackOffice", () => {
  it("true for COMMERCIAL and SUPREME_LEADER", () => {
    expect(canAccessBackOffice("COMMERCIAL")).toBe(true);
    expect(canAccessBackOffice("SUPREME_LEADER")).toBe(true);
  });
  it("false for CUSTOMER, RESTAURATEUR, null", () => {
    expect(canAccessBackOffice("CUSTOMER")).toBe(false);
    expect(canAccessBackOffice("RESTAURATEUR")).toBe(false);
    expect(canAccessBackOffice(null)).toBe(false);
  });
});

describe("isLeader", () => {
  it("true only for SUPREME_LEADER", () => {
    expect(isLeader("SUPREME_LEADER")).toBe(true);
    expect(isLeader("COMMERCIAL")).toBe(false);
  });
});
