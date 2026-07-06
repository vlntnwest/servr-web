import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { Logo } from "@/components/onboarding/primitives";

// Primitives Tailwind partagées de l'onboarding — remplacent les anciennes
// classes CSS scopées `.onb` (boutons, champs, chips, barres…).

// ── Eyebrow ─────────────────────────────────────────────────────────────────

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-caption font-semibold uppercase tracking-label text-brand-orange ${className}`}
    >
      {children}
    </span>
  );
}

// ── App bar & footer du wizard ────────────────────────────────────────────────

export function AppBar({ step }: { step: string }) {
  return (
    <div className="flex-none h-16 flex items-center justify-between px-8 border-b-[1.5px] border-brand-border">
      <Logo />
      <div className="flex items-center gap-4">
        <Eyebrow>{step}</Eyebrow>
      </div>
    </div>
  );
}

export function WizardFoot({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-14 py-[18px] border-t-[1.5px] border-brand-border bg-brand-cream">
      {children}
    </div>
  );
}

// ── Boutons ───────────────────────────────────────────────────────────────────

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "ink";
  size?: "md" | "lg" | "sm";
  block?: boolean;
};

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-cta whitespace-nowrap border-0 cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed";
const BTN_SIZE: Record<NonNullable<ButtonProps["size"]>, string> = {
  md: "h-11 px-[22px] text-body rounded-pill",
  lg: "h-[52px] px-7 text-principle rounded-pill",
  sm: "h-9 px-4 text-body-sm rounded-sm",
};
const BTN_VARIANT: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-orange text-brand-cream hover:bg-brand-orange/90",
  outline:
    "border-[1.5px] border-brand-border text-brand-ink hover:border-brand-ink",
  ghost: "text-brand-stone hover:bg-brand-ink/5 hover:text-brand-ink",
  ink: "bg-brand-ink text-brand-cream hover:bg-black",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BTN_BASE} ${BTN_SIZE[size]} ${BTN_VARIANT[variant]} ${
        block ? "w-full" : ""
      } ${className}`}
      {...props}
    />
  );
}

export function IconButton({
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: "md" | "sm" }) {
  const dim = size === "sm" ? "w-7 h-7" : "w-[38px] h-[38px]";
  return (
    <button
      className={`${dim} rounded-pill flex items-center justify-center text-brand-stone bg-transparent border-0 cursor-pointer transition-colors hover:bg-brand-ink/[0.06] hover:text-brand-ink ${className}`}
      {...props}
    />
  );
}

// ── Chips ─────────────────────────────────────────────────────────────────────

const CHIP_TONE = {
  open: "bg-brand-lime/[0.28] text-brand-forest",
  warn: "bg-brand-yellow/[0.28] text-[#7a5e08]",
  orange: "bg-brand-orange/[0.14] text-brand-orange",
} as const;

export function Chip({
  tone = "orange",
  className = "",
  children,
}: {
  tone?: keyof typeof CHIP_TONE;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-[5px] rounded-pill text-[11px] font-semibold tracking-pill ${CHIP_TONE[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Point vert (statut « ouvert / en ligne ») utilisé dans les chips open.
export function ChipDot() {
  return <span className="w-1.5 h-1.5 rounded-full bg-brand-forest" />;
}

// ── Champs de formulaire ──────────────────────────────────────────────────────

export function Field({
  label,
  children,
  className = "",
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-[7px] mb-[18px] ${className}`}>
      {label && (
        <label className="text-body-sm font-semibold">{label}</label>
      )}
      {children}
    </div>
  );
}

export function Opt({ children }: { children: ReactNode }) {
  return <span className="text-brand-stone font-normal">{children}</span>;
}

export const INPUT_CLASS =
  "h-12 px-[14px] w-full bg-white border-[1.5px] border-brand-border rounded-sm text-body text-brand-ink outline-none transition-colors placeholder:text-brand-stone focus:border-brand-orange focus:shadow-[0_0_0_3px_rgba(232,82,28,0.18)]";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${INPUT_CLASS} ${className}`} {...props} />;
}

export function IconInput({
  icon,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { icon: ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-brand-stone pointer-events-none">
        {icon}
      </span>
      <Input className={`pl-[42px] ${className}`} {...props} />
    </div>
  );
}
