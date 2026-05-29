"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRestaurants } from "@/lib/api";
import type { BackOfficeRestaurant } from "@/types/api";
import { Loader2 } from "lucide-react";
import InviteRestaurateurButton from "@/components/back-office/invite-restaurateur-button";

export default function BackOfficeHome() {
  const [restaurants, setRestaurants] = useState<BackOfficeRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants().then((r) => { setRestaurants(r); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Restaurants ({restaurants.length})</h1>
        <InviteRestaurateurButton />
      </div>

      {restaurants.length === 0 ? (
        <p className="text-[#676767]">Aucun restaurant dans votre périmètre.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <li key={r.id}>
              <Link
                href={`/back-office/restaurants/${r.id}`}
                className="block border border-black/10 rounded-lg p-4 hover:bg-black/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.isOpen ? "bg-green-100 text-green-700" : "bg-black/5 text-[#676767]"}`}>
                    {r.isOpen ? "Ouvert" : "Fermé"}
                  </span>
                </div>
                <p className="text-sm text-[#676767] mt-1">{r.city}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
