"use client";

import {
  ArrowRight,
  Bell,
  CheckCircle,
  ChevronLeft,
  Clock,
  ShoppingBag,
} from "lucide-react";
import { QR } from "@/components/onboarding/primitives";
import {
  AppBar,
  Button,
  Chip,
  ChipDot,
  Eyebrow,
} from "@/components/onboarding/ui";
import { type NavProps } from "./shared";

// ── 7 — Passerelle app mobile ──────────────────────────────────────────────────

export function ScreenMobile({ go, back }: NavProps) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <AppBar step="Passer en ligne · 1 sur 2" />
      <div className="flex-1 grid min-h-0 grid-cols-[1fr] min-[900px]:grid-cols-[1fr_460px]">
        <div className="px-14 py-16 flex flex-col justify-center">
          <Eyebrow>Recevoir les commandes</Eyebrow>
          <h1 className="font-display text-display tracking-tight mt-3.5 mb-3">
            Installez l&apos;app de réception
          </h1>
          <p className="text-principle text-brand-stone max-w-[42ch]">
            Les commandes arrivent en temps réel sur votre téléphone ou votre
            tablette de cuisine. Vous acceptez, refusez et suivez chaque
            commande — sans jamais en rater une.
          </p>
          <div className="flex items-center gap-7 my-9 flex-wrap">
            <div className="w-[168px] h-[168px] bg-white border-[1.5px] border-brand-border rounded-card p-3.5 flex-none">
              <QR />
            </div>
            <div className="flex flex-col gap-3">
              <a className="flex items-center gap-3 h-14 pr-[22px] pl-[18px] rounded-md bg-brand-ink text-brand-cream cursor-pointer">
                <ShoppingBag size={22} />
                <span>
                  <span className="block text-[10px] opacity-70 uppercase tracking-label">
                    Télécharger sur
                  </span>
                  <span className="block text-principle font-semibold leading-none mt-0.5">
                    App Store
                  </span>
                </span>
              </a>
              <a className="flex items-center gap-3 h-14 pr-[22px] pl-[18px] rounded-md bg-brand-ink text-brand-cream cursor-pointer">
                <ShoppingBag size={22} />
                <span>
                  <span className="block text-[10px] opacity-70 uppercase tracking-label">
                    Disponible sur
                  </span>
                  <span className="block text-principle font-semibold leading-none mt-0.5">
                    Google Play
                  </span>
                </span>
              </a>
            </div>
          </div>
          <ul className="flex flex-col gap-3.5 mt-3 list-none p-0">
            <li className="flex items-center gap-3 text-body">
              <span className="w-[34px] h-[34px] rounded-pill bg-secondary flex items-center justify-center flex-none">
                <Bell size={17} />
              </span>
              Notification à chaque nouvelle commande
            </li>
            <li className="flex items-center gap-3 text-body">
              <span className="w-[34px] h-[34px] rounded-pill bg-secondary flex items-center justify-center flex-none">
                <CheckCircle size={17} />
              </span>
              Accepter ou refuser en un geste
            </li>
            <li className="flex items-center gap-3 text-body">
              <span className="w-[34px] h-[34px] rounded-pill bg-secondary flex items-center justify-center flex-none">
                <Clock size={17} />
              </span>
              Suivi des temps de préparation en direct
            </li>
          </ul>
          <div className="flex gap-3 mt-8">
            <Button variant="ghost" onClick={back}>
              <ChevronLeft size={18} /> Retour
            </Button>
            <Button size="lg" onClick={() => go(8)}>
              J&apos;ai l&apos;app, continuer <ArrowRight size={18} />
            </Button>
          </div>
        </div>
        <div className="hidden min-[900px]:flex bg-brand-ink items-center justify-center overflow-hidden p-8">
          <div className="w-[300px] h-[600px] bg-black rounded-[44px] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
            <div className="w-full h-full bg-brand-cream rounded-[32px] overflow-hidden flex flex-col">
              <div className="h-11 flex items-center justify-center">
                <span className="w-[120px] h-[26px] bg-black rounded-b-[16px]" />
              </div>
              <div className="px-4 pt-1 pb-2.5 flex items-center justify-between">
                <span className="font-display text-[18px]">Commandes</span>
                <Chip tone="open">
                  <ChipDot />
                  En ligne
                </Chip>
              </div>
              <div className="m-3 bg-white border-[1.5px] border-brand-orange rounded-card p-[14px] shadow-[0_0_0_3px_rgba(232,82,28,0.16)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-display-italic italic font-black text-[18px]">
                    Commande #1042
                  </span>
                  <Chip tone="orange">Nouvelle</Chip>
                </div>
                <div className="text-brand-stone text-[13px] leading-[1.6]">
                  1 × Plat signature
                  <br />1 × Entrée · 2 × Boisson
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    Refuser
                  </Button>
                  <Button size="sm" className="flex-1">
                    Accepter
                  </Button>
                </div>
              </div>
              <div className="m-3 bg-white border-[1.5px] border-brand-border rounded-card p-[14px]">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Commande #1041</span>
                  <span className="text-brand-stone text-[12px]">
                    En préparation
                  </span>
                </div>
                <div className="text-brand-stone text-[13px] mt-1.5">
                  Retrait à 12:45 · 2 articles
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
