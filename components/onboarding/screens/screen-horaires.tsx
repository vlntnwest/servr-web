"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { getOpeningHours, updateOpeningHours } from "@/lib/api";
import { PreviewPane } from "@/components/onboarding/primitives";
import {
  AppBar,
  Button,
  Eyebrow,
  WizardFoot,
} from "@/components/onboarding/ui";
import {
  type NavProps,
  type WizardBiz,
  DEFAULT_DAYS,
  todayHoursLabel,
} from "./shared";

// ── 4 — Horaires & retrait ──────────────────────────────────────────────────────

export function ScreenHoraires({
  go,
  back,
  biz,
  hydrated,
}: NavProps & { biz: WizardBiz; hydrated: boolean }) {
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Précharge les horaires déjà enregistrés (reprise).
  useEffect(() => {
    if (!hydrated) return;
    getOpeningHours().then((hours) => {
      if (!hours || hours.length === 0) return;
      setDays((prev) =>
        prev.map((d) => {
          const ranges = hours
            .filter((h) => h.dayOfWeek === d.dow)
            .sort((a, b) => a.openTime.localeCompare(b.openTime))
            .map((h) => [h.openTime, h.closeTime] as [string, string]);
          return ranges.length
            ? { ...d, open: true, ranges }
            : { ...d, open: false, ranges: [] };
        }),
      );
    });
  }, [hydrated]);

  const toggleDay = (dow: number) =>
    setDays((ds) =>
      ds.map((d) =>
        d.dow === dow
          ? {
              ...d,
              open: !d.open,
              ranges:
                !d.open && d.ranges.length === 0
                  ? [["11:30", "14:30"]]
                  : d.ranges,
            }
          : d,
      ),
    );
  const setRange = (dow: number, i: number, idx: 0 | 1, val: string) =>
    setDays((ds) =>
      ds.map((d) =>
        d.dow === dow
          ? {
              ...d,
              ranges: d.ranges.map((rg, j) =>
                j === i ? (idx === 0 ? [val, rg[1]] : [rg[0], val]) : rg,
              ),
            }
          : d,
      ),
    );
  const addRange = (dow: number) =>
    setDays((ds) =>
      ds.map((d) =>
        d.dow === dow ? { ...d, ranges: [...d.ranges, ["18:30", "22:00"]] } : d,
      ),
    );
  const removeRange = (dow: number, i: number) =>
    setDays((ds) =>
      ds.map((d) =>
        d.dow === dow
          ? { ...d, ranges: d.ranges.filter((_, j) => j !== i) }
          : d,
      ),
    );

  const handleContinue = async () => {
    setError(null);
    setSaving(true);
    try {
      const flat: {
        dayOfWeek: number;
        openTime: string;
        closeTime: string;
        order: number;
      }[] = [];
      days.forEach((d) => {
        if (!d.open) return;
        d.ranges.forEach((rg) => {
          flat.push({
            dayOfWeek: d.dow,
            openTime: rg[0],
            closeTime: rg[1],
            order: flat.length,
          });
        });
      });
      await updateOpeningHours(flat);
      setSaving(false);
      go(5);
    } catch {
      setError("Enregistrement impossible.");
      setSaving(false);
    }
  };

  const r = { ...biz, todayHours: todayHoursLabel() };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <AppBar step="Étape 2 sur 4" />
      <div className="flex-1 grid min-h-0 grid-cols-[minmax(0,1fr)] min-[1100px]:grid-cols-[minmax(0,1fr)_564px]">
        <div className="overflow-y-auto px-14 py-11 flex flex-col">
          <div className="flex-1">
            <div className="mb-7">
              <Eyebrow>Horaires &amp; retrait</Eyebrow>
              <h1 className="font-display text-display-sm tracking-tight mt-2 mb-1.5">
                Quand peut-on retirer&nbsp;?
              </h1>
              <p className="text-brand-stone">
                Pré-rempli pour démarrer · ajustez vos créneaux et votre cadence
                de préparation.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {days.map((d) => (
                <div
                  key={d.dow}
                  className={`grid grid-cols-[132px_64px_1fr] items-center gap-4 px-[18px] py-[14px] bg-white border-[1.5px] border-brand-border rounded-card ${
                    d.open ? "" : "opacity-60"
                  }`}
                >
                  <span className="font-semibold">{d.label}</span>
                  <button
                    className={`relative w-11 h-[26px] rounded-pill flex-none border-0 cursor-pointer transition-colors ${
                      d.open ? "bg-brand-orange" : "bg-brand-border"
                    }`}
                    onClick={() => toggleDay(d.dow)}
                    type="button"
                  >
                    <span
                      className={`absolute top-[3px] w-5 h-5 rounded-full bg-white transition-[left] ${
                        d.open ? "left-[21px]" : "left-[3px]"
                      }`}
                    />
                  </button>
                  {d.open ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      {d.ranges.map((rg, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 pl-3 pr-2 py-1 border-[1.5px] border-brand-border rounded-pill text-body-sm"
                        >
                          <input
                            type="time"
                            value={rg[0]}
                            onChange={(e) =>
                              setRange(d.dow, i, 0, e.target.value)
                            }
                            className="w-16 h-[30px] border-0 bg-transparent font-semibold tabular-nums p-0 text-center outline-none"
                          />
                          <span className="text-brand-stone">–</span>
                          <input
                            type="time"
                            value={rg[1]}
                            onChange={(e) =>
                              setRange(d.dow, i, 1, e.target.value)
                            }
                            className="w-16 h-[30px] border-0 bg-transparent font-semibold tabular-nums p-0 text-center outline-none"
                          />
                          <button
                            className="w-[22px] h-[22px] rounded-pill flex items-center justify-center text-brand-stone cursor-pointer hover:bg-brand-ink/[0.06] hover:text-brand-maroon"
                            onClick={() => removeRange(d.dow, i)}
                            type="button"
                            aria-label="Supprimer le créneau"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-dashed border-brand-border rounded-pill text-body-sm text-brand-stone bg-transparent cursor-pointer hover:border-brand-orange hover:text-brand-orange"
                        onClick={() => addRange(d.dow)}
                        type="button"
                      >
                        <Plus size={14} /> Créneau
                      </button>
                    </div>
                  ) : (
                    <span className="text-body-sm text-brand-stone">Fermé</span>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-brand-maroon text-[14px] mt-4">{error}</p>
            )}
          </div>
        </div>
        <PreviewPane
          r={r}
          categories={[{ id: "x", name: "Menu", products: [] }]}
          placeholder
        />
      </div>
      <WizardFoot>
        <Button variant="ghost" onClick={back} disabled={saving}>
          <ChevronLeft size={18} /> Retour
        </Button>
        <Button size="lg" onClick={handleContinue} disabled={saving}>
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Continuer <ArrowRight size={18} />
            </>
          )}
        </Button>
      </WizardFoot>
    </div>
  );
}
