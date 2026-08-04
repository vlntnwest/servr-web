import { describe, it, expect, afterEach, vi } from "vitest";
import robots from "./robots";

const PRIVATE_PREFIXES = ["/admin", "/back-office", "/account"];

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots.txt", () => {
  it("bloque tout par défaut (staging, previews)", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INDEXING", "");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("bloque tout tant que le drapeau n'est pas exactement 'true'", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INDEXING", "1");
    expect(robots().rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("garde les espaces privés interdits même indexation activée", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INDEXING", "true");
    const rules = robots().rules;
    expect(Array.isArray(rules)).toBe(false);
    const disallow = (rules as { disallow?: string | string[] }).disallow;
    const list = Array.isArray(disallow) ? disallow : [disallow];

    for (const prefix of PRIVATE_PREFIXES) {
      expect(list).toContain(prefix);
    }
    // Les pages de commande ne doivent pas non plus remonter dans les SERP.
    expect(list).toContain("/store/*/order/");
  });

  it("ouvre la boutique à l'indexation quand le drapeau est posé", () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INDEXING", "true");
    const rules = robots().rules as { allow?: string | string[] };
    expect(rules.allow).toBe("/");
  });
});
