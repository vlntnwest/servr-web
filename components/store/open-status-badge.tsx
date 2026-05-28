import { cn } from "@/lib/utils";

interface OpenStatusBadgeProps {
  isOpen: boolean;
}

export default function OpenStatusBadge({ isOpen }: OpenStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-caption px-3 py-1 rounded-full font-semibold tracking-pill",
        isOpen
          ? "bg-brand-lime/25 text-brand-forest"
          : "bg-destructive/10 text-destructive",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isOpen ? "bg-brand-forest" : "bg-destructive",
        )}
      />
      {isOpen ? "Ouvert" : "Fermé"}
    </span>
  );
}
