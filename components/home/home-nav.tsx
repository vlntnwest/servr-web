"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Actions du header de l'accueil, dépendantes de l'état d'authentification :
 * - connecté   → « Tableau de bord » (→ /admin)
 * - déconnecté → « Connexion » (login qui redirige vers /admin) + « Commencer »
 */
export function HomeNav() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Avant de connaître l'état, on réserve la hauteur pour éviter le saut de layout
  // et le flash « Connexion » chez un utilisateur déjà connecté.
  if (!ready) {
    return <div className="h-9" aria-hidden />;
  }

  if (user) {
    return (
      <Link
        href="/admin"
        className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Tableau de bord
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login?redirect=/admin"
        className="text-sm font-medium text-muted-foreground hover:text-black transition-colors"
      >
        Connexion
      </Link>
      <Link
        href="/register/restaurateur"
        className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Commencer
      </Link>
    </>
  );
}
