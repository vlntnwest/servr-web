"use client";

import { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ImageUp, Loader2 } from "lucide-react";
import {
  createRestaurant,
  updateRestaurant,
  setRestaurantId,
  uploadImage,
} from "@/lib/api";
import { PreviewPane } from "@/components/onboarding/primitives";
import {
  AppBar,
  Button,
  Eyebrow,
  Field,
  Input,
  Opt,
  WizardFoot,
} from "@/components/onboarding/ui";
import { type NavProps, type WizardBiz, todayHoursLabel } from "./shared";

// ── 3 — Identité ───────────────────────────────────────────────────────────────

export function ScreenIdentite({
  go,
  back,
  biz,
  setBiz,
  restaurantId,
  onRestaurantCreated,
}: NavProps & {
  biz: WizardBiz;
  setBiz: (b: WizardBiz) => void;
  restaurantId: string | null;
  onRestaurantCreated: (id: string, slug: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const r = {
    ...biz,
    imageUrl: localPhoto ?? biz.imageUrl,
    todayHours: todayHoursLabel(),
  };

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setLocalPhoto(URL.createObjectURL(f));
  };

  const handleContinue = async () => {
    setError(null);
    if (
      !biz.name.trim() ||
      !biz.address.trim() ||
      !biz.city.trim() ||
      !biz.phone.trim()
    ) {
      setError("Renseignez le nom, l'adresse, la ville et le téléphone.");
      return;
    }
    if (!/^[0-9]{5}$/.test(biz.zipCode)) {
      setError("Le code postal doit contenir exactement 5 chiffres.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: biz.name.trim(),
        address: biz.address.trim(),
        zipCode: biz.zipCode,
        city: biz.city.trim(),
        phone: biz.phone.trim(),
        ...(biz.email.trim() ? { email: biz.email.trim() } : {}),
      };

      let id = restaurantId;
      if (!id) {
        const res = await createRestaurant(payload);
        if (res.error || !res.data) {
          setError(res.error ?? "Création impossible.");
          setSaving(false);
          return;
        }
        id = res.data.id;
        setRestaurantId(id);
        onRestaurantCreated(id, res.data.slug ?? "");
      } else {
        const res = await updateRestaurant(payload);
        if ("error" in res) {
          setError(res.error);
          setSaving(false);
          return;
        }
      }

      let imageUrl = biz.imageUrl;
      if (file) {
        const url = await uploadImage(file);
        if (!url) {
          // Le restaurant est créé/à jour : on bloque seulement le passage à
          // l'étape suivante, un nouveau Continuer retentera l'upload.
          setError(
            "L'envoi de la photo a échoué (JPEG, PNG, WebP ou GIF, 5 Mo max). Réessayez ou choisissez une autre photo.",
          );
          setSaving(false);
          return;
        }
        imageUrl = url;
        await updateRestaurant({ imageUrl: url });
      }

      setBiz({ ...biz, imageUrl });
      setSaving(false);
      go(4);
    } catch {
      setError("Une erreur est survenue.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <AppBar step="Étape 1 sur 4" />
      <div className="flex-1 grid min-h-0 grid-cols-[minmax(0,1fr)] min-[1100px]:grid-cols-[minmax(0,1fr)_564px]">
        <div className="overflow-y-auto px-14 py-11 flex flex-col">
          <div className="flex-1">
            <div className="mb-7">
              <Eyebrow>Identité</Eyebrow>
              <h1 className="font-display text-display-sm tracking-tight mt-2 mb-1.5">
                Présentez votre établissement
              </h1>
              <p className="text-brand-stone">
                Ces infos apparaissent en tête de votre vitrine. Modifiez-les et
                regardez l&apos;aperçu se mettre à jour.
              </p>
            </div>

            <Field label="Nom de l'établissement">
              <Input
                value={biz.name}
                onChange={(e) => setBiz({ ...biz, name: e.target.value })}
                placeholder="Ex. Le Bistrot du Coin"
                maxLength={50}
              />
            </Field>

            <Field
              label={
                <>
                  Photo de présentation <Opt>· format 16:9</Opt>
                </>
              }
            >
              <div
                className="relative aspect-[16/9] rounded-card border-[1.5px] border-brand-border overflow-hidden"
                style={{
                  background: r.imageUrl
                    ? `center/cover no-repeat url(${r.imageUrl})`
                    : "linear-gradient(135deg,#a8d040,#1a4a20)",
                }}
              >
                {!r.imageUrl && (
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0_14px,rgba(0,0,0,0.05)_14px_16px)]" />
                )}
                <button
                  className="absolute bottom-3 right-3 inline-flex items-center gap-2 h-9 px-4 rounded-sm text-body-sm font-semibold cursor-pointer bg-brand-ink/80 text-brand-cream"
                  onClick={() => fileRef.current?.click()}
                  type="button"
                >
                  <ImageUp size={15} /> Changer la photo
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={pickPhoto}
                />
              </div>
              <span className="text-brand-stone text-[12px] mt-1.5">
                JPEG, PNG ou WebP · 5 Mo max
              </span>
            </Field>

            <Field label="Adresse">
              <Input
                value={biz.address}
                onChange={(e) => setBiz({ ...biz, address: e.target.value })}
                placeholder="N° et rue"
                maxLength={255}
              />
            </Field>
            <div className="grid gap-[14px] grid-cols-[160px_1fr]">
              <Field label="Code postal">
                <Input
                  value={biz.zipCode}
                  onChange={(e) => setBiz({ ...biz, zipCode: e.target.value })}
                  maxLength={5}
                  inputMode="numeric"
                  placeholder="75002"
                />
              </Field>
              <Field label="Ville">
                <Input
                  value={biz.city}
                  onChange={(e) => setBiz({ ...biz, city: e.target.value })}
                  placeholder="Paris"
                  maxLength={50}
                />
              </Field>
            </div>
            <div className="grid gap-[14px] grid-cols-2">
              <Field label="Téléphone">
                <Input
                  value={biz.phone}
                  onChange={(e) => setBiz({ ...biz, phone: e.target.value })}
                  placeholder="01 23 45 67 89"
                />
              </Field>
              <Field
                label={
                  <>
                    Email <Opt>· optionnel</Opt>
                  </>
                }
              >
                <Input
                  value={biz.email}
                  onChange={(e) => setBiz({ ...biz, email: e.target.value })}
                  placeholder="contact@..."
                  type="email"
                />
              </Field>
            </div>

            {error && (
              <p className="text-brand-maroon text-[14px]">{error}</p>
            )}
          </div>
        </div>
        <PreviewPane
          r={r}
          categories={[{ id: "x", name: "Menu", products: [] }]}
          placeholder
        />
      </div>
      <WizardFoot>
        <Button variant="ghost" onClick={back} disabled={saving}>
          <ChevronLeft size={18} /> Retour
        </Button>
        <Button size="lg" onClick={handleContinue} disabled={saving}>
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Continuer <ArrowRight size={18} />
            </>
          )}
        </Button>
      </WizardFoot>
    </div>
  );
}
