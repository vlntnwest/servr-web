import { describe, it, expect, vi } from "vitest";

// Set env before module is imported
vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "test-token" } },
      }),
      refreshSession: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Static import — module is evaluated once with the env already set
import {
  getUserMe,
  createRestaurant,
  getRestaurants,
  inviteRestaurateur,
  createStaff,
  assignCommercial,
  becomeRestaurateur,
} from "./api";

describe("getUserMe", () => {
  it("returns user profile on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: { id: "1", email: "a@b.com", fullName: "Jean", phone: "06" },
      }),
    });

    const result = await getUserMe();
    expect(result).toEqual({
      data: { id: "1", email: "a@b.com", fullName: "Jean", phone: "06" },
    });
  });

  it("passes through server error body on non-ok response", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });

    const result = await getUserMe();
    // apiFetch passes through the response body regardless of ok status
    expect(result).toEqual({ error: "Server error" });
  });
});

describe("createRestaurant", () => {
  it("returns restaurant data on success", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          id: "resto-uuid",
          name: "Le Gourmet",
          slug: "le-gourmet",
          address: "1 rue de la Paix",
          zipCode: "75001",
          city: "Paris",
          phone: "0612345678",
          email: null,
          imageUrl: null,
          preparationLevel: "EASY",
          timezone: "Europe/Paris",
          createdAt: "2026-05-12T00:00:00.000Z",
          updatedAt: "2026-05-12T00:00:00.000Z",
        },
      }),
    });

    const result = await createRestaurant({
      name: "Le Gourmet",
      address: "1 rue de la Paix",
      zipCode: "75001",
      city: "Paris",
      phone: "0612345678",
    });

    expect(result).toEqual({
      data: expect.objectContaining({ id: "resto-uuid", name: "Le Gourmet" }),
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/restaurants/"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Le Gourmet",
          address: "1 rue de la Paix",
          zipCode: "75001",
          city: "Paris",
          phone: "0612345678",
        }),
      }),
    );
  });

  it("returns error on failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Validation failed" }),
    });

    const result = await createRestaurant({
      name: "",
      address: "1 rue de la Paix",
      zipCode: "75001",
      city: "Paris",
      phone: "0612345678",
    });

    expect(result).toEqual({ error: "Validation failed" });
  });
});

describe("getRestaurants", () => {
  it("returns scoped list", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [{ id: "r1", name: "X" }] }) });
    const res = await getRestaurants();
    expect(res).toEqual([{ id: "r1", name: "X" }]);
    expect(mockFetch.mock.calls.at(-1)![0]).toContain("/api/v1/restaurants");
  });
});

describe("inviteRestaurateur", () => {
  it("POSTs the email", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ message: "Invitation sent" }) });
    await inviteRestaurateur("resto@x.fr");
    const call = mockFetch.mock.calls.at(-1)!;
    expect(call[0]).toContain("/api/v1/invites/restaurateur");
    expect(JSON.parse(call[1].body)).toEqual({ email: "resto@x.fr" });
    expect(call[1].method).toBe("POST");
  });
});

describe("createStaff", () => {
  it("POSTs email and role", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 201, json: async () => ({ data: { id: "n1", role: "COMMERCIAL" } }) });
    await createStaff("c@x.fr", "COMMERCIAL");
    const call = mockFetch.mock.calls.at(-1)!;
    expect(call[0]).toContain("/api/v1/staff");
    expect(JSON.parse(call[1].body)).toEqual({ email: "c@x.fr", role: "COMMERCIAL" });
  });
});

describe("assignCommercial", () => {
  it("PATCHes commercialId", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: {} }) });
    await assignCommercial("r1", "c2");
    const call = mockFetch.mock.calls.at(-1)!;
    expect(call[0]).toContain("/api/v1/restaurants/r1/commercial");
    expect(JSON.parse(call[1].body)).toEqual({ commercialId: "c2" });
    expect(call[1].method).toBe("PATCH");
  });
});

describe("becomeRestaurateur", () => {
  it("POSTs to become-restaurateur", async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: { id: "u1", role: "RESTAURATEUR" } }) });
    await becomeRestaurateur();
    expect(mockFetch.mock.calls.at(-1)![0]).toContain("/api/v1/user/me/become-restaurateur");
  });
});
