"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { createStaff, getRestaurants, assignCommercial } from "@/lib/api";
import { isLeader } from "@/lib/roles";
import type { BackOfficeRestaurant } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function StaffPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"COMMERCIAL" | "SUPREME_LEADER">("COMMERCIAL");
  const [staffStatus, setStaffStatus] = useState<string | null>(null);

  const [restaurants, setRestaurants] = useState<BackOfficeRestaurant[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const { data } = await res.json();
      if (!isLeader(data.role)) { router.replace("/back-office"); return; }
      setAllowed(true);
      setRestaurants(await getRestaurants());
      setLoading(false);
    };
    init();
  }, [supabase, router]);

  const submitStaff = async () => {
    setStaffStatus(null);
    const { error } = await createStaff(email, role);
    setStaffStatus(error ?? "Compte créé / invité.");
    if (!error) setEmail("");
  };

  const reassign = async (restaurantId: string, commercialId: string) => {
    await assignCommercial(restaurantId, commercialId || null);
    setRestaurants(await getRestaurants());
  };

  if (loading || !allowed) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-6 space-y-10">
      <section className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Comptes internes</h1>
        <div className="space-y-1.5">
          <Label htmlFor="staff-email">Email</Label>
          <Input id="staff-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="staff-role">Rôle</Label>
          <select
            id="staff-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "COMMERCIAL" | "SUPREME_LEADER")}
            className="w-full border border-black/10 rounded-md h-10 px-3"
          >
            <option value="COMMERCIAL">Commercial</option>
            <option value="SUPREME_LEADER">Supreme Leader</option>
          </select>
        </div>
        {staffStatus && <p className="text-sm text-[#676767]">{staffStatus}</p>}
        <Button onClick={submitStaff} disabled={!email}>Créer / inviter</Button>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Réattribution commercial</h2>
        <ul className="space-y-2">
          {restaurants.map((r) => (
            <li key={r.id} className="flex items-center gap-3 border border-black/10 rounded-lg p-3">
              <span className="flex-1">{r.name} <span className="text-xs text-[#676767]">({r.city})</span></span>
              <Input
                defaultValue={r.commercialId ?? ""}
                placeholder="commercialId (UUID, vide = aucun)"
                className="max-w-xs"
                onBlur={(e) => reassign(r.id, e.target.value.trim())}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
