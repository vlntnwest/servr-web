import { describe, it, expect } from "vitest";
import { getSchedulableSlots } from "./opening-hours";
import type { OpeningHour, ExceptionalHour } from "@/types/api";

const hours: OpeningHour[] = [
  { id: "1", restaurantId: "r", dayOfWeek: 1, openTime: "10:00", closeTime: "22:00", order: 0 },
  { id: "2", restaurantId: "r", dayOfWeek: 2, openTime: "10:00", closeTime: "22:00", order: 0 },
];
const now = new Date("2026-05-25T07:00:00Z"); // lundi 09:00 Paris

describe("getSchedulableSlots", () => {
  it("génère des créneaux aujourd'hui et demain seulement", () => {
    const days = getSchedulableSlots(hours, [], "Europe/Paris", "EASY", now);
    expect(days.map((d) => d.label)).toEqual(["Aujourd'hui", "Demain"]);
  });
  it("retourne [] si aucun horaire", () => {
    expect(getSchedulableSlots([], [], "Europe/Paris", "EASY", now)).toEqual([]);
  });
  it("ignore un jour fermé exceptionnellement", () => {
    const exc: ExceptionalHour[] = [{ id: "e", restaurantId: "r", date: "2026-05-26", isClosed: true, openTime: null, closeTime: null, label: null, createdAt: "2026-01-01T00:00:00Z" }];
    const days = getSchedulableSlots(hours, exc, "Europe/Paris", "EASY", now);
    expect(days.map((d) => d.label)).toEqual(["Aujourd'hui"]);
  });
});
