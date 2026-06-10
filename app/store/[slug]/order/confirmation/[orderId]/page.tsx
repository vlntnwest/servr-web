"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderStatus =
  | "DRAFT"
  | "AWAITING_ACCEPTANCE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

type PublicOrder = {
  id: string;
  orderNumber: string | null;
  status: OrderStatus;
  requestExpiresAt: string | null;
};

async function fetchOrder(orderId: string): Promise<PublicOrder | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const { data } = await res.json();
    return data;
  } catch {
    return null;
  }
}

function countdownLabel(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const s = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function StoreOrderTrackingPage() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [, setTick] = useState(0);

  // Polling tant que la demande est en attente
  useEffect(() => {
    let active = true;
    const load = async () => {
      const o = await fetchOrder(orderId);
      if (active && o) setOrder(o);
    };
    load();
    if (order && order.status !== "AWAITING_ACCEPTANCE") {
      return () => {
        active = false;
      };
    }
    const id = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: re-evaluate polling when status changes, not on every order update
  }, [orderId, order?.status]);

  // Re-render chaque seconde pour le compte à rebours
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const status: OrderStatus = order?.status ?? "AWAITING_ACCEPTANCE";
  const ref = `#${order?.orderNumber ?? orderId.slice(-8)}`;

  const view = {
    AWAITING_ACCEPTANCE: {
      icon: <Clock className="w-14 h-14 text-brand-orange mx-auto mb-5" strokeWidth={1.5} />,
      title: "Demande envoyée",
      lines: ["En attente de confirmation du restaurant.", "Vous n'êtes pas encore débité."],
      countdown: countdownLabel(order?.requestExpiresAt ?? null),
    },
    DRAFT: {
      icon: <Clock className="w-14 h-14 text-brand-orange mx-auto mb-5" strokeWidth={1.5} />,
      title: "Demande envoyée",
      lines: ["En attente de confirmation du restaurant."],
      countdown: null,
    },
    IN_PROGRESS: {
      icon: <CheckCircle className="w-14 h-14 text-brand-forest mx-auto mb-5" strokeWidth={1.5} />,
      title: "Demande acceptée 🎉",
      lines: ["Le restaurant prépare votre commande."],
      countdown: null,
    },
    COMPLETED: {
      icon: <CheckCircle className="w-14 h-14 text-brand-forest mx-auto mb-5" strokeWidth={1.5} />,
      title: "Commande prête",
      lines: ["Votre commande est prête."],
      countdown: null,
    },
    DELIVERED: {
      icon: <CheckCircle className="w-14 h-14 text-brand-forest mx-auto mb-5" strokeWidth={1.5} />,
      title: "Commande remise",
      lines: ["Bon appétit !"],
      countdown: null,
    },
    CANCELLED: {
      icon: <XCircle className="w-14 h-14 text-brand-stone mx-auto mb-5" strokeWidth={1.5} />,
      title: "Demande refusée",
      lines: ["Le restaurant n'a pas pu accepter votre demande.", "Vous n'avez pas été débité."],
      countdown: null,
    },
    EXPIRED: {
      icon: <XCircle className="w-14 h-14 text-brand-stone mx-auto mb-5" strokeWidth={1.5} />,
      title: "Demande expirée",
      lines: ["Le restaurant n'a pas répondu à temps.", "Vous n'avez pas été débité."],
      countdown: null,
    },
  }[status];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        {view.icon}
        <h1 className="font-display-italic italic font-black text-[28px] leading-none text-brand-ink mb-3">
          {view.title}
        </h1>
        {view.lines.map((line) => (
          <p key={line} className="text-body text-brand-stone mb-1">
            {line}
          </p>
        ))}
        {view.countdown && (
          <p className="text-caption uppercase tracking-label text-brand-orange font-semibold mt-3 mb-1">
            Expire dans {view.countdown}
          </p>
        )}
        <p className="text-caption uppercase tracking-label text-brand-stone mt-4 mb-7">
          Commande · {ref}
        </p>
        <Button
          asChild
          className="rounded-full h-12 px-6 bg-brand-orange text-brand-cream hover:bg-brand-orange/90 text-body font-semibold tracking-cta"
        >
          <Link href={`/store/${slug}`}>Retour au menu</Link>
        </Button>
      </div>
    </div>
  );
}
