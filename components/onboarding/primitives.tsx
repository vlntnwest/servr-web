"use client";

import {
  MapPin,
  Clock,
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { formatEuros } from "@/lib/utils";

export const euro = formatEuros;

export function Logo({ light, size = 24 }: { light?: boolean; size?: number }) {
  return (
    <span
      className={`font-display tracking-[-1px] ${light ? "text-brand-cream" : ""}`}
      style={{ fontSize: size }}
    >
      My<span className="text-brand-orange">.</span>Spots
    </span>
  );
}

/* Faux QR — deterministic grid, no real data encoded. */
export function QR() {
  const N = 21;
  const seed = [
    0.71, 0.13, 0.94, 0.42, 0.28, 0.67, 0.55, 0.19, 0.83, 0.36, 0.77, 0.05,
    0.62, 0.49, 0.91, 0.24, 0.58, 0.33, 0.86, 0.11, 0.7,
  ];
  const cells: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const v =
        Math.sin(
          (x + 2) * 12.9898 + (y + 5) * 78.233 + seed[(x + y) % N] * 100,
        ) * 43758.5453;
      if (v - Math.floor(v) > 0.52) cells.push([x, y]);
    }
  const finder = (ox: number, oy: number) => (
    <g key={`f${ox}${oy}`}>
      <rect
        x={ox}
        y={oy}
        width="7"
        height="7"
        rx="1.4"
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="1"
      />
      <rect
        x={ox + 2}
        y={oy + 2}
        width="3"
        height="3"
        rx="0.6"
        fill="#1a1a1a"
      />
    </g>
  );
  const inFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
  return (
    <svg
      viewBox="0 0 21 21"
      shapeRendering="crispEdges"
      className="w-full h-full"
    >
      {cells
        .filter(([x, y]) => !inFinder(x, y))
        .map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="1" height="1" fill="#1a1a1a" />
        ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

/* Circular progress ring */
export function Ring({ done, total }: { done: number; total: number }) {
  const r = 17,
    c = 2 * Math.PI * r;
  const off = c * (1 - (total ? done / total : 0));
  return (
    <svg width="42" height="42" viewBox="0 0 42 42">
      <circle
        cx="21"
        cy="21"
        r={r}
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="4"
      />
      <circle
        cx="21"
        cy="21"
        r={r}
        fill="none"
        stroke="var(--color-brand-orange)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform="rotate(-90 21 21)"
        style={{ transition: "stroke-dashoffset .4s" }}
      />
    </svg>
  );
}

export interface PreviewProduct {
  id: string;
  name: string;
  desc?: string;
  price: number;
  bg?: string;
  popular?: boolean;
}
export interface PreviewCategory {
  id: string;
  name: string;
  sub?: string;
  products: PreviewProduct[];
}
export interface PreviewRestaurant {
  name: string;
  slug: string;
  address: string;
  zipCode: string;
  city: string;
  todayHours?: string;
  imageUrl?: string | null;
}

const HERO_BG = "linear-gradient(135deg,#a8d040,#1a4a20)";

const SKELETON =
  "bg-[linear-gradient(90deg,#e8e0ce,#efe8d8,#e8e0ce)] rounded-sm";
const SEC_HEAD = "flex items-baseline gap-2.5 px-7 pt-[18px] pb-3";
const SEC_TITLE = "font-display text-card-label tracking-tight";
const SEC_SUB =
  "font-display text-[11px] tracking-section uppercase text-brand-stone";
const GRID = "grid grid-cols-2 gap-3 px-7 pb-3";
const PROD_CARD =
  "bg-white border-[1.5px] border-brand-border rounded-card p-[14px] flex gap-[14px]";

/* Live storefront mock — used in reveal, split preview, and final preview */
export function StorefrontPreview({
  r,
  categories,
  placeholder,
}: {
  r: PreviewRestaurant;
  categories: PreviewCategory[];
  placeholder?: boolean;
}) {
  return (
    <div className="min-h-full bg-brand-cream text-brand-ink">
      <div className="grid grid-cols-[38%_1fr] gap-6 p-7">
        <div
          className="aspect-[16/9] rounded-card relative overflow-hidden after:content-[''] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_45%),repeating-linear-gradient(45deg,transparent_0_14px,rgba(0,0,0,0.05)_14px_16px)]"
          style={{
            background: r.imageUrl
              ? `center/cover no-repeat url(${r.imageUrl})`
              : HERO_BG,
          }}
        />
        <div>
          <div className="font-display-italic italic font-black text-[34px] leading-none tracking-[-0.01em]">
            {r.name || "Votre établissement"}
          </div>
          <div className="flex items-center gap-1.5 text-body-sm text-brand-stone mt-2">
            <MapPin size={14} />
            <span>
              {r.address || "Votre adresse"}
              {r.zipCode || r.city ? `, ${r.zipCode} ${r.city}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-body-sm text-brand-stone mt-2">
            <Clock size={14} />
            <span>Aujourd&apos;hui : {r.todayHours || "—"}</span>
          </div>
          <div className="mt-3.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-pill text-[11px] font-semibold tracking-pill bg-brand-lime/[0.28] text-brand-forest">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />
              Ouvert
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-7 pt-1 pb-4 flex-wrap">
        {categories.map((c, i) => (
          <button
            key={c.id}
            className={`px-[14px] py-1.5 rounded-pill text-body-sm font-medium border-[1.5px] cursor-pointer ${
              i === 0
                ? "bg-brand-ink text-brand-cream border-brand-ink"
                : "border-brand-border bg-transparent"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {placeholder ? (
        <div>
          <div className={SEC_HEAD}>
            <h3 className={SEC_TITLE}>Votre menu</h3>
            <span className={SEC_SUB}>Bientôt</span>
          </div>
          <div className={GRID}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${PROD_CARD} items-center`}>
                <div className={`w-[84px] h-[84px] rounded-note flex-none ${SKELETON}`} />
                <div className="flex-1">
                  <div className={`h-4 w-[70%] ${SKELETON}`} />
                  <div className={`h-[11px] w-[95%] mt-2.5 ${SKELETON}`} />
                  <div className={`h-[11px] w-[55%] mt-1.5 ${SKELETON}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        categories.map((c) => (
          <div key={c.id}>
            <div className={SEC_HEAD}>
              <h3 className={SEC_TITLE}>{c.name}</h3>
              {c.sub && <span className={SEC_SUB}>{c.sub}</span>}
            </div>
            <div className={GRID}>
              {c.products.map((p) => (
                <div key={p.id} className={PROD_CARD}>
                  <div
                    className="w-[84px] h-[84px] rounded-note flex-none"
                    style={{ background: p.bg || HERO_BG }}
                  />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="font-display-italic italic font-black text-card-name leading-none">
                      {p.name}
                    </div>
                    {p.desc && (
                      <div className="text-body-sm text-brand-stone mt-1.5 leading-[1.4] line-clamp-2">
                        {p.desc}
                      </div>
                    )}
                    <div className="mt-auto pt-2 flex items-center gap-2 text-body-sm">
                      <span className="font-semibold">{euro(p.price)}</span>
                      {p.popular && (
                        <span className="text-brand-orange text-caption font-semibold uppercase tracking-pill">
                          · Populaire
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="ml-auto self-center w-[34px] h-[34px] rounded-pill border-[1.5px] border-brand-border flex items-center justify-center flex-none bg-transparent cursor-pointer">
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <div className="h-7" />
    </div>
  );
}

/* The split-screen right pane: a scaled storefront inside a faux browser */
export function PreviewPane({
  r,
  categories,
  placeholder,
  scale = 0.46,
}: {
  r: PreviewRestaurant;
  categories: PreviewCategory[];
  placeholder?: boolean;
  scale?: number;
}) {
  return (
    <div className="hidden min-[1100px]:block bg-brand-cream border-l-[1.5px] border-brand-border relative overflow-hidden">
      <div className="absolute inset-0 flex items-start justify-center pt-16">
        <div
          className="bg-brand-cream rounded-md overflow-hidden shadow-modal border-[1.5px] border-brand-border"
          style={{
            width: 1180,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          <StorefrontPreview
            r={r}
            categories={categories}
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
}

/* Floating activation checklist — the spine of the onboarding */
export interface ChecklistItem {
  id: string;
  label: string;
  step: number;
}
export function ChecklistFab({
  items,
  currentId,
  doneIds,
  collapsed,
  onToggle,
  onJump,
}: {
  items: ChecklistItem[];
  currentId: string | null;
  doneIds: string[];
  collapsed: boolean;
  onToggle: () => void;
  onJump: (step: number) => void;
}) {
  const done = doneIds.length;
  const total = items.length;

  if (collapsed) {
    return (
      <div className="fixed right-6 bottom-24 z-[200] w-72 bg-brand-cream border-[1.5px] border-brand-border rounded-card shadow-modal overflow-hidden">
        <div
          className="flex items-center gap-3 px-[18px] py-[14px] cursor-pointer"
          onClick={onToggle}
        >
          <Ring done={done} total={total} />
          <div className="flex-1">
            <div className="font-bold text-[15px]">
              Activez votre établissement
            </div>
            <div className="text-brand-stone text-[11px] uppercase tracking-[0.04em] mt-[3px]">
              {done}/{total} étapes
            </div>
          </div>
          <ChevronDown size={18} className="rotate-180 text-brand-stone" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-6 bottom-24 z-[200] w-[344px] bg-brand-cream border-[1.5px] border-brand-border rounded-card shadow-modal overflow-hidden">
      <div
        className="flex items-center gap-3 px-[18px] py-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="w-[42px] h-[42px] flex-none relative flex items-center justify-center">
          <Ring done={done} total={total} />
          <span className="font-display text-[13px] absolute">
            {done}/{total}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-body leading-[1.1]">
            Activez votre établissement
          </div>
          <div className="text-caption text-brand-stone uppercase tracking-pill mt-[3px]">
            Reprenez quand vous voulez
          </div>
        </div>
        <ChevronDown size={18} className="text-brand-stone" />
      </div>
      <div className="px-3 pt-1 pb-[14px] border-t-[1.5px] border-brand-border">
        {items.map((it) => {
          const isDone = doneIds.includes(it.id);
          const isCur = it.id === currentId;
          return (
            <button
              key={it.id}
              className="flex items-center gap-3 px-2 py-2.5 rounded-sm w-full text-left transition-colors bg-transparent border-0 cursor-pointer hover:bg-brand-ink/[0.04]"
              onClick={() => onJump(it.step)}
            >
              <span
                className={`w-6 h-6 rounded-pill border-[1.5px] flex items-center justify-center flex-none ${
                  isDone
                    ? "bg-brand-forest border-brand-forest text-brand-cream"
                    : isCur
                      ? "border-brand-orange text-brand-orange"
                      : "border-brand-border text-brand-stone"
                }`}
              >
                {isDone ? (
                  <Check size={14} />
                ) : isCur ? (
                  <span className="w-[7px] h-[7px] rounded-full bg-brand-orange" />
                ) : (
                  <span className="w-[7px] h-[7px]" />
                )}
              </span>
              <span
                className={`flex-1 text-body-sm ${isCur ? "font-bold" : "font-medium"}`}
              >
                {it.label}
              </span>
              {!isDone && (
                <ChevronRight size={16} className="text-brand-stone" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
