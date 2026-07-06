"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import {
  getMenuAdmin,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  reorderProducts,
  getOptionGroups,
} from "@/lib/api";
import type { Category, Product, OptionGroup } from "@/types/api";
import { ProductSheet, type FlatProduct } from "@/components/admin/products-tab";
import { euro } from "@/components/onboarding/primitives";
import {
  AppBar,
  Button,
  Field,
  IconButton,
  Input,
  Opt,
  WizardFoot,
} from "@/components/onboarding/ui";
import { type NavProps } from "./shared";

// ── 5 — Menu builder ─────────────────────────────────────────────────────────

interface CategoryDraft {
  id?: string;
  name: string;
  subHeading: string;
}

export function ScreenMenu({
  go,
  back,
  hydrated,
}: NavProps & { hydrated: boolean }) {
  const [menu, setMenu] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState<{ product: FlatProduct | null } | null>(
    null,
  );
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [notif, setNotif] = useState<string | null>(null);
  const [catModal, setCatModal] = useState<CategoryDraft | null>(null);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);

  const reload = async () => {
    const data = await getMenuAdmin();
    setMenu(data);
    setActiveCat((cur) =>
      cur && data.some((c) => c.id === cur) ? cur : (data[0]?.id ?? null),
    );
    setLoading(false);
  };

  const refreshGroups = async () => setOptionGroups(await getOptionGroups());

  useEffect(() => {
    if (hydrated) {
      reload();
      getOptionGroups().then(setOptionGroups);
    }
  }, [hydrated]);

  const cat = menu.find((c) => c.id === activeCat) ?? menu[0];
  const products = (cat?.productCategories ?? [])
    .map((pc) => pc.product)
    .filter(Boolean);

  const handleDelete = async (productId: string) => {
    await deleteProduct(productId);
    reload();
  };

  // Drag & drop — onReorder tire à chaque permutation pendant le drag : on ne
  // fait que l'optimiste local ici, et on persiste une seule fois au drag end.
  const menuRef = useRef<Category[]>([]);
  menuRef.current = menu;

  const handleCatReorder = (next: Category[]) => {
    setMenu(next);
  };
  const persistCatOrder = () => {
    reorderCategories(menuRef.current.map((c) => c.id));
  };

  const handleProdReorder = (next: Product[]) => {
    if (!cat) return;
    setMenu((prev) =>
      prev.map((c) =>
        c.id === cat.id
          ? {
              ...c,
              productCategories: next
                .map((p) =>
                  c.productCategories.find((pc) => pc.product.id === p.id),
                )
                .filter((pc): pc is NonNullable<typeof pc> => Boolean(pc)),
            }
          : c,
      ),
    );
  };
  const persistProdOrder = () => {
    const c = menuRef.current.find((x) => x.id === cat?.id);
    if (c)
      reorderProducts(c.productCategories.map((pc) => pc.product.id));
  };

  const confirmDeleteCat = async () => {
    if (!catToDelete) return;
    await deleteCategory(catToDelete.id);
    setCatToDelete(null);
    reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans">
      <AppBar step="Étape 3 sur 4" />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-brand-orange" />
        </div>
      ) : (
        <div className="flex-1 grid min-h-0 grid-cols-[1fr] min-[760px]:grid-cols-[260px_1fr]">
          <div className="px-4 py-6 overflow-y-auto border-b-[1.5px] min-[760px]:border-b-0 min-[760px]:border-r-[1.5px] border-brand-border">
            <div className="text-caption uppercase tracking-label text-brand-stone font-semibold px-2 pb-3">
              Catégories
            </div>
            <Reorder.Group axis="y" values={menu} onReorder={handleCatReorder}>
              {menu.map((c) => (
                <SortableCatItem
                  key={c.id}
                  cat={c}
                  active={c.id === cat?.id}
                  onDragEnd={persistCatOrder}
                  onSelect={() => setActiveCat(c.id)}
                  onEdit={() =>
                    setCatModal({
                      id: c.id,
                      name: c.name,
                      subHeading: c.subHeading ?? "",
                    })
                  }
                  onDelete={() => setCatToDelete(c)}
                />
              ))}
            </Reorder.Group>
            <button
              className="flex items-center justify-center gap-2 w-full mt-2.5 p-2.5 border-[1.5px] border-dashed border-brand-border rounded-sm text-brand-orange font-semibold text-body-sm bg-transparent cursor-pointer hover:bg-brand-orange/[0.06]"
              onClick={() => setCatModal({ name: "", subHeading: "" })}
            >
              <Plus size={16} /> Ajouter une catégorie
            </button>
          </div>

          <div className="px-8 py-7 overflow-y-auto">
            <div className="flex items-center gap-3.5 px-[18px] py-4 rounded-card bg-brand-orange/[0.08] border-[1.5px] border-brand-orange/[0.25] mb-[22px]">
              <span className="w-10 h-10 rounded-pill bg-brand-orange text-brand-cream flex items-center justify-center flex-none">
                <ShoppingBag size={20} />
              </span>
              <div>
                <div className="font-bold">Menu de démarrage chargé</div>
                <div className="text-brand-stone text-[13px]">
                  On a pré-rempli un menu type. Modifiez, supprimez, ajoutez,
                  réorganisez — tout est à vous.
                </div>
              </div>
            </div>

            {cat && (
              <div className="flex items-baseline gap-2.5 mb-3.5">
                <h2 className="font-display text-card-label tracking-tight">
                  {cat.name}
                </h2>
                {cat.subHeading && (
                  <span className="text-brand-stone text-[13px]">
                    {cat.subHeading}
                  </span>
                )}
              </div>
            )}

            {cat && (
              <Reorder.Group
                axis="y"
                values={products}
                onReorder={handleProdReorder}
              >
                {products.map((p) => (
                  <SortableProductItem
                    key={p.id}
                    product={p}
                    onDragEnd={persistProdOrder}
                    onEdit={() =>
                      cat &&
                      setSheet({
                        product: {
                          ...p,
                          categorieId: cat.id,
                          categorieName: cat.name,
                        },
                      })
                    }
                    onDelete={() => handleDelete(p.id)}
                  />
                ))}
              </Reorder.Group>
            )}

            {cat && (
              <button
                className="flex items-center gap-2.5 p-4 border-[1.5px] border-dashed border-brand-border rounded-card text-brand-orange font-semibold justify-center w-full bg-transparent cursor-pointer hover:bg-brand-orange/[0.06]"
                onClick={() => setSheet({ product: null })}
              >
                <Plus size={18} /> Ajouter un produit
              </button>
            )}
          </div>
        </div>
      )}

      <WizardFoot>
        <Button variant="ghost" onClick={back}>
          <ChevronLeft size={18} /> Retour
        </Button>
        <Button size="lg" onClick={() => go(6)}>
          Voir ma vitrine <ArrowRight size={18} />
        </Button>
      </WizardFoot>

      {sheet && cat && (
        <ProductSheet
          open
          presentation="modal"
          product={sheet.product}
          categories={menu}
          optionGroups={optionGroups}
          defaultCategorieId={cat.id}
          onClose={() => setSheet(null)}
          onSaved={() => {
            setSheet(null);
            reload();
          }}
          onError={(m) => {
            setNotif(m);
            setTimeout(() => setNotif(null), 4000);
          }}
          onRefreshGroups={refreshGroups}
        />
      )}

      {notif && (
        <div className="fixed top-[18px] left-1/2 -translate-x-1/2 z-[400] bg-brand-maroon text-brand-cream px-[18px] py-2.5 rounded-pill text-[14px] font-semibold shadow-modal">
          {notif}
        </div>
      )}

      {catModal && (
        <CategoryModal
          draft={catModal}
          nextOrder={menu.length}
          onClose={() => setCatModal(null)}
          onSaved={(newId) => {
            setCatModal(null);
            if (newId) setActiveCat(newId);
            reload();
          }}
        />
      )}

      {catToDelete && (
        <div
          className="fixed inset-0 bg-brand-ink/45 flex items-center justify-center z-[300] p-6"
          onClick={() => setCatToDelete(null)}
        >
          <div
            className="bg-brand-cream rounded-card shadow-modal w-[420px] max-h-[86%] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-none flex items-center justify-between px-5 py-4 border-b-[1.5px] border-brand-border">
              <span className="font-display-italic italic font-black text-heading">
                Supprimer la catégorie ?
              </span>
              <IconButton onClick={() => setCatToDelete(null)}>
                <X size={18} />
              </IconButton>
            </div>
            <div className="flex-1 min-h-0 p-[22px] overflow-y-auto">
              <p className="text-[14px] text-brand-stone">
                «&nbsp;{catToDelete.name}&nbsp;» et tous ses produits seront
                supprimés définitivement.
              </p>
            </div>
            <div className="flex-none px-[22px] py-4 border-t-[1.5px] border-brand-border flex gap-3">
              <Button variant="ghost" block onClick={() => setCatToDelete(null)}>
                Annuler
              </Button>
              <Button
                block
                className="!bg-brand-maroon hover:!bg-brand-maroon"
                onClick={confirmDeleteCat}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortableCatItem({
  cat,
  active,
  onSelect,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  cat: Category;
  active: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const dragging = useRef(false);

  return (
    <Reorder.Item
      value={cat}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      transition={{ layout: { duration: 0 } }}
    >
      <div
        className={`group flex items-center gap-2.5 px-3 py-[11px] rounded-sm text-body font-medium w-full text-left mb-0.5 ${
          active ? "bg-secondary" : ""
        }`}
      >
        <GripVertical
          size={16}
          className="text-brand-stone flex-none cursor-grab touch-none"
          onPointerDown={(e) => {
            dragging.current = true;
            controls.start(e);
          }}
        />
        <button
          type="button"
          className="flex-1 min-w-0 bg-transparent border-0 text-left cursor-pointer p-0 text-inherit"
          onPointerUp={() => {
            if (dragging.current) {
              dragging.current = false;
              return;
            }
            onSelect();
          }}
          onClick={(e) => {
            if (dragging.current) e.preventDefault();
          }}
        >
          <span>{cat.name}</span>
        </button>
        <span className="text-caption text-brand-stone">
          {cat.productCategories?.length ?? 0}
        </span>
        <div
          className={`flex gap-0.5 ml-1 transition-opacity ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <IconButton size="sm" onClick={onEdit} aria-label="Modifier">
            <Pencil size={14} />
          </IconButton>
          <IconButton size="sm" onClick={onDelete} aria-label="Supprimer">
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
    </Reorder.Item>
  );
}

function SortableProductItem({
  product: p,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={p}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      transition={{ layout: { duration: 0 } }}
    >
      <div className="flex items-center gap-4 p-[14px] bg-white border-[1.5px] border-brand-border rounded-card mb-2.5">
        <GripVertical
          size={18}
          className="text-brand-stone flex-none cursor-grab touch-none"
          onPointerDown={(e) => controls.start(e)}
        />
        <div
          className="w-16 h-16 rounded-note flex-none bg-secondary"
          style={
            p.imageUrl
              ? { background: `center/cover no-repeat url(${p.imageUrl})` }
              : undefined
          }
        />
        <div className="flex-1 min-w-0">
          <div className="font-display-italic italic font-black text-card-name">
            {p.name}
          </div>
          <div className="text-body-sm text-brand-stone mt-[3px] line-clamp-1">
            {p.description}
          </div>
        </div>
        <span className="font-semibold">{euro(parseFloat(p.price))}</span>
        <div className="flex gap-1.5 ml-auto">
          <IconButton onClick={onEdit}>
            <Pencil size={17} />
          </IconButton>
          <IconButton onClick={onDelete}>
            <Trash2 size={17} />
          </IconButton>
        </div>
      </div>
    </Reorder.Item>
  );
}

function CategoryModal({
  draft,
  nextOrder,
  onClose,
  onSaved,
}: {
  draft: CategoryDraft;
  nextOrder: number;
  onClose: () => void;
  onSaved: (newId?: string) => void;
}) {
  const [name, setName] = useState(draft.name);
  const [subHeading, setSubHeading] = useState(draft.subHeading);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(draft.id);

  const save = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Le nom est requis.");
      return;
    }
    setSaving(true);
    const sub = subHeading.trim();
    const result =
      isEdit && draft.id
        ? await updateCategory(draft.id, {
            name: name.trim(),
            ...(sub ? { subHeading: sub } : {}),
          })
        : await createCategory({
            name: name.trim(),
            ...(sub ? { subHeading: sub } : {}),
            displayOrder: nextOrder,
          });
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    onSaved(isEdit ? undefined : result.data?.id);
  };

  return (
    <div
      className="fixed inset-0 bg-brand-ink/45 flex items-center justify-center z-[300] p-6"
      onClick={onClose}
    >
      <div
        className="bg-brand-cream rounded-card shadow-modal w-[460px] max-h-[86%] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-none flex items-center justify-between px-5 py-4 border-b-[1.5px] border-brand-border">
          <span className="font-display-italic italic font-black text-heading">
            {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
          </span>
          <IconButton onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="flex-1 min-h-0 p-[22px] overflow-y-auto">
          <Field label="Nom">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex. Entrées"
              maxLength={50}
              autoFocus
            />
          </Field>
          <Field
            label={
              <>
                Sous-titre <Opt>(optionnel)</Opt>
              </>
            }
          >
            <Input
              value={subHeading}
              onChange={(e) => setSubHeading(e.target.value)}
              placeholder="Ex. Nos suggestions du moment"
              maxLength={255}
            />
          </Field>
          {error && <p className="text-brand-maroon text-[14px]">{error}</p>}
        </div>
        <div className="flex-none px-[22px] py-4 border-t-[1.5px] border-brand-border flex gap-3">
          <Button variant="ghost" block onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button block onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isEdit ? (
              "Enregistrer"
            ) : (
              "Créer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
