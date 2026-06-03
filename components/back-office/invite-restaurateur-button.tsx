"use client";

import { useState } from "react";
import { inviteRestaurateur } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function InviteRestaurateurButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | "ok" | string>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    const { error } = await inviteRestaurateur(email);
    setLoading(false);
    if (error) setStatus(error);
    else { setStatus("ok"); setEmail(""); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Inviter un restaurateur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Inviter un restaurateur</DialogTitle></DialogHeader>
        <div className="space-y-3 p-4">
          <Input type="email" placeholder="email@restaurant.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
          {status === "ok" && <p className="text-sm text-green-600">Invitation envoyée.</p>}
          {status && status !== "ok" && <p className="text-sm text-destructive">{status}</p>}
          <Button onClick={submit} disabled={loading || !email} className="w-full">
            {loading ? "Envoi…" : "Envoyer l'invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
