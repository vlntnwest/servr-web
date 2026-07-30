"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  onComplete?: (value: string) => void;
}

/**
 * Champ de saisie d'un code à usage unique (OTP), affiché en cases séparées.
 * - auto-avance à la frappe, retour arrière vers la case précédente
 * - coller un code complet remplit toutes les cases
 * - chiffres uniquement
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  disabled,
  onComplete,
}: OtpInputProps) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  const focusIndex = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const commit = (next: string) => {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
    return cleaned;
  };

  const setChar = (index: number, char: string) => {
    const chars = value.split("");
    while (chars.length < length) chars.push("");
    chars[index] = char;
    return commit(chars.join(""));
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    if (digits.length > 1) {
      // saisie multiple (autofill dans une case) → on remplit à partir d'ici
      const joined = commit(value.slice(0, index) + digits);
      focusIndex(joined.length);
      return;
    }
    setChar(index, digits);
    if (index < length - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[index]) {
        setChar(index, "");
      } else {
        setChar(index - 1, "");
        focusIndex(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    const joined = commit(digits);
    focusIndex(joined.length);
  };

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
          aria-label={`Chiffre ${i + 1}`}
          className={cn(
            "h-12 w-full min-w-0 rounded-sm border border-border bg-transparent text-center text-lg font-semibold transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
      ))}
    </div>
  );
}
