import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { OpeningHour, ExceptionalHour, PreparationLevel } from "@/types/api";

export type DaySlots = { dateKey: string; label: string; slots: string[] };
export const PREP_MINUTES: Record<PreparationLevel, number> = { EASY: 15, MEDIUM: 25, BUSY: 40 };

function zonedParts(instant: Date, tz: string) {
  const todayStr = formatInTimeZone(instant, tz, "yyyy-MM-dd");
  const isoDow = parseInt(formatInTimeZone(instant, tz, "i"), 10);
  return { todayStr, dayOfWeek: isoDow === 7 ? 0 : isoDow };
}

export function getSchedulableSlots(
  openingHours: OpeningHour[],
  exceptionalHours: ExceptionalHour[],
  timezone: string,
  prepLevel: PreparationLevel,
  now = new Date(),
): DaySlots[] {
  if (!openingHours || openingHours.length === 0) return [];
  const prepMin = PREP_MINUTES[prepLevel];
  const days: DaySlots[] = [];

  for (let i = 0; i < 2; i++) {
    const instant = new Date(now.getTime() + i * 86_400_000);
    const { todayStr, dayOfWeek } = zonedParts(instant, timezone);
    const exceptional = exceptionalHours.find((eh) => eh.date.slice(0, 10) === todayStr);

    let ranges: { openTime: string; closeTime: string }[];
    if (exceptional) {
      if (exceptional.isClosed) continue;
      ranges = exceptional.openTime && exceptional.closeTime
        ? [{ openTime: exceptional.openTime, closeTime: exceptional.closeTime }]
        : openingHours.filter((h) => h.dayOfWeek === dayOfWeek);
    } else {
      ranges = openingHours.filter((h) => h.dayOfWeek === dayOfWeek);
    }
    if (ranges.length === 0) continue;

    const slots: string[] = [];
    for (const r of [...ranges].sort((a, b) => a.openTime.localeCompare(b.openTime))) {
      let cursor = fromZonedTime(`${todayStr}T${r.openTime}:00`, timezone);
      const end = fromZonedTime(`${todayStr}T${r.closeTime}:00`, timezone);
      const earliest = new Date(now.getTime() + prepMin * 60 * 1000);
      if (cursor < earliest) cursor = new Date(earliest);
      const rem = cursor.getMinutes() % 15;
      if (rem !== 0) cursor = new Date(cursor.getTime() + (15 - rem) * 60 * 1000);
      while (cursor < end) {
        slots.push(cursor.toISOString());
        cursor = new Date(cursor.getTime() + 15 * 60 * 1000);
      }
    }
    if (slots.length === 0) continue;
    days.push({ dateKey: todayStr, label: i === 0 ? "Aujourd'hui" : "Demain", slots });
  }
  return days;
}
