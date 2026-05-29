"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { canAccessBackOffice, isLeader } from "@/lib/roles";
import type { UserRole } from "@/types/api";
import Link from "next/link";

export default function BackOfficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) { router.replace("/"); return; }
      const { data } = await res.json();
      if (!canAccessBackOffice(data.role)) { router.replace("/"); return; }
      setRole(data.role);
      setLoading(false);
    };
    init();
  }, [supabase, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-background border-b border-black/8">
        <div className="flex items-center h-[65px] px-4 max-w-screen-xl mx-auto gap-4">
          <Link href="/back-office" className="font-bold">Back-office</Link>
          {isLeader(role) && (
            <Link href="/back-office/staff" className="text-sm text-[#676767] hover:text-black">Staff</Link>
          )}
          <span className="ml-auto text-xs text-[#676767]">{role}</span>
          <button
            className="p-2 hover:bg-black/5 rounded-full"
            onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
            aria-label="Se déconnecter"
          >
            <LogOut className="w-5 h-5 text-[#676767]" />
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
