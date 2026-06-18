# Servr Web — App client & back-office

> Le **visage web** de la plateforme Servr : la boutique en ligne où les clients commandent et
> paient, et le back-office où restaurateurs et équipe plateforme gèrent menus, commandes et
> restaurants. Application **Next.js 15 / React 19**.

---

## 🌐 L'écosystème Servr

Servr est une plateforme de commande en ligne pour restaurants, composée de **trois projets
complémentaires** qui partagent **une seule base de données Supabase (PostgreSQL)** et **une seule
authentification (Supabase Auth)**.

| Projet | Rôle | Stack | Public |
| --- | --- | --- | --- |
| **servr-api** | Backend / cerveau, base de données, paiements | Node.js · Express · Prisma · Stripe Connect · Socket.IO | — |
| **[servr-web](.)** | App client (boutique) + back-office restaurateur/plateforme | Next.js 15 · React 19 · Tailwind v4 | Clients & restaurateurs (bureau) |
| **servr-mobile** | App restaurateur / tablette de cuisine | Expo · React Native · NativeWind | Restaurateurs (tablette) |

```
        Clients (navigateur)                 Restaurateurs (tablette / cuisine)
                │                                          │
                ▼                                          ▼
        ┌───────────────┐                         ┌──────────────────┐
        │   servr-web   │   commande + paiement   │   servr-mobile   │  réception + impression
        │   (Next.js)   │                         │   (Expo / RN)    │
        └──────┬────────┘                         └────────┬─────────┘
               │       REST /api/v1  + JWT Supabase        │
               └──────────────────┬───────────────────────┘
                                  ▼
                          ┌────────────────┐     Stripe Connect (paiement)
                          │   servr-api    │───────────────┐
                          │(Express/Prisma)│               ▼
                          └────────────────┘         comptes connectés
```

**Où se place servr-web :** c'est le **point d'entrée des clients** (boutique publique + paiement
Stripe) **et** l'outil de gestion sur ordinateur pour les restaurateurs (menu, horaires, stats) et
la plateforme (back-office commercial / admin). La tablette de cuisine, elle, c'est `servr-mobile`.

---

## 📖 Présentation

`servr-web` sert **trois publics** depuis une seule app Next.js (App Router) :

1. **Client (boutique)** — `/store/[slug]` : parcourt le menu, ajoute au panier, paie via Stripe ou
   sur place, et suit l'état de sa commande en temps réel.
2. **Restaurateur (admin)** — `/admin/[restaurantId]` : gère son menu, ses commandes, ses horaires,
   ses codes promo, ses statistiques et son onboarding Stripe.
3. **Plateforme (back-office)** — `/back-office` : `COMMERCIAL` et `SUPREME_LEADER` gèrent les
   restaurants, invitent des restaurateurs et administrent le staff.

L'app ne touche jamais la base directement : tout passe par l'API `servr-api` (`/api/v1`), avec le
JWT Supabase de l'utilisateur connecté.

## 🧱 Stack technique

- **Framework** : Next.js 15 (App Router) · React 19 · TypeScript (strict)
- **Style** : Tailwind CSS v4 (`@tailwindcss/postcss`) · `tailwind-merge` · `class-variance-authority`
- **UI** : primitives Radix UI (dialog, tabs, checkbox, radio, scroll-area…) · icônes `lucide-react`
- **Animation** : Framer Motion
- **Auth & data** : `@supabase/ssr` + `@supabase/supabase-js` (auth cookie SSR)
- **Dates** : `date-fns-tz` · `dayjs` (gestion des fuseaux par restaurant)
- **Analytics** : `@vercel/analytics` + `@vercel/speed-insights`
- **Tests** : Vitest + jsdom
- **Polices** : DM Sans · Archivo Black (Google Fonts)

## 🚀 Démarrage

```bash
git clone <repo-url>
cd servr-web

npm install

# Créer un fichier .env.local (voir « Variables d'environnement » ci-dessous)

npm run dev                        # http://localhost:3000
```

> Nécessite que `servr-api` tourne (par défaut sur `http://localhost:5001`) et un projet Supabase
> accessible.

## 📜 Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de dev (http://localhost:3000) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | ESLint (next/core-web-vitals + next/typescript) |
| `npm test` | Tests Vitest (une passe) |
| `npm run test:watch` | Tests Vitest en watch |

## 🔐 Variables d'environnement

À placer dans `.env.local` :

| Variable | Visibilité | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Publique | URL de base de `servr-api` (ex. `http://localhost:5001`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Publique | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publique | Clé anon Supabase (auth navigateur) |
| `INTERNAL_API_SECRET` | Privée | Secret partagé avec le backend pour les appels serveur internes (en-tête `x-internal-secret`) |

## 🗂️ Structure des routes (App Router)

| Route | Public | Rôle |
| --- | --- | --- |
| `/` | Tous | Landing marketing |
| `/login` · `/register` | Tous | Connexion / inscription client (Supabase) |
| `/register/restaurateur` | Tous | Inscription restaurateur (rôle `RESTAURATEUR`, support d'un token d'invitation) |
| `/auth/callback` | — | Route handler : échange du code OAuth → session |
| `/store/[slug]` | Client | **Boutique** : menu, panier, checkout (layout charge resto + horaires) |
| `/store/[slug]/order/confirmation/[orderId]` | Client | Suivi de commande en direct (polling + compte à rebours) |
| `/store/[slug]/order/cancel` | Client | Annulation de commande |
| `/account` · `/account/orders` | Client | Profil & historique de commandes |
| `/admin` | Restaurateur | Redirige vers son premier restaurant (ou `/admin/create`) |
| `/admin/create` | Restaurateur | Création du premier restaurant |
| `/admin/[restaurantId]` | Restaurateur | **Dashboard** à onglets : commandes, stats, produits, horaires, promos, réglages |
| `/admin/stripe/refresh` · `/admin/stripe/return` | Restaurateur | Aller / retour de l'onboarding Stripe Connect |
| `/back-office` | Commercial / Leader | Liste des restaurants gérés, invitation de restaurateurs |
| `/back-office/restaurants/[restaurantId]` | Commercial / Leader | Gestion d'un restaurant (même dashboard que l'admin) |
| `/back-office/staff` | Leader | Création de staff, réassignation des commerciaux |
| `/legal` | Tous | Mentions légales (RGPD) |

### Dossiers

```
servr-web/
├── app/                      # routes (App Router) — voir tableau ci-dessus
├── components/
│   ├── ui/                   # primitives Radix (button, dialog, tabs, sheet, responsive-modal…)
│   ├── store/                # en-tête resto, fiche client, badge ouvert/fermé
│   ├── menu/                 # nav catégories, fiches produit, section populaire
│   ├── cart/                 # panier, item, modal de checkout, message & date de commande
│   ├── admin/                # onglets du dashboard (orders, stats, products, options, promos, settings…)
│   ├── back-office/          # bouton d'invitation restaurateur
│   ├── auth/ · layout/       # bouton auth, header global
├── contexts/                 # cart-context, user-context, restaurant-context
├── hooks/                    # use-is-mobile
├── lib/
│   ├── api.ts                # client de l'API backend (tous les appels /api/v1)
│   ├── supabase/             # client.ts (navigateur) + server.ts (SSR, cookies)
│   ├── utils.ts              # cn(), formatEuros(), totaux panier, libellés/couleurs de statut
│   ├── roles.ts              # canAccessBackOffice(), isLeader()
│   └── redirectUtils.ts      # isSafeRedirect() (anti open-redirect)
└── types/api.ts              # types du domaine (Restaurant, Order, Product, OptionGroup…)
```

## 🔌 Communication avec le backend

Tout transite par `lib/api.ts` :

- **Base** : `${NEXT_PUBLIC_API_URL}/api/v1`.
- **Auth** : le JWT Supabase (`supabase.auth.getSession()`) est injecté en
  `Authorization: Bearer <token>`.
- **Refresh automatique** : sur une réponse `401`, le client tente `refreshSession()` et rejoue la
  requête ; en cas d'échec, redirection vers `/login?reason=session_expired`.
- **Appels publics serveur** (menu, resto par slug, horaires) : ajoutent l'en-tête
  `x-internal-secret` (`INTERNAL_API_SECRET`) et utilisent le cache Next.js (`revalidate`).

## 🧠 État global (contexts)

| Context | Gère | Persistance |
| --- | --- | --- |
| `cart-context` | Panier (items + options), message, créneau ; conversion en payload checkout | `sessionStorage` (`cart-v2`) |
| `user-context` | Utilisateur connecté (`/user/me`), synchronisé sur `onAuthStateChange` | — |
| `restaurant-context` | Restaurant courant, slug, horaires & horaires exceptionnels (scope `/store/[slug]`) | — |

## 🧭 Parcours principaux

**Client.** `/store/[slug]` → ajout au panier (avec options) → checkout (infos client, code promo,
créneau, paiement Stripe **ou** sur place) → redirection Stripe → page de confirmation suivie en
direct.

**Restaurateur.** `/register/restaurateur` → `/admin/create` → configuration (menu, options,
horaires, Stripe) → `/admin/[restaurantId]` pour suivre les commandes et les stats. *Le suivi
opérationnel des commandes en cuisine se fait sur `servr-mobile`.*

**Plateforme.** `COMMERCIAL` / `SUPREME_LEADER` accèdent au `/back-office` pour gérer les
restaurants, inviter des restaurateurs et (Leader) administrer le staff.

## 🔒 Sécurité & autorisation

- Auth Supabase en cookies (SSR) ; le JWT accompagne chaque appel API.
- Garde-fous de routes côté client selon le rôle (`RESTAURATEUR`, `COMMERCIAL`, `SUPREME_LEADER`) —
  l'autorisation **fait foi côté backend**.
- `isSafeRedirect()` empêche les open-redirects.
- Images servies depuis Supabase Storage / Vercel Blob, optimisées par `next/image`.

## 🧪 Tests

Vitest + jsdom. Les tests vivent à côté du code dans `lib/` (`api.test.ts`, `opening-hours.test.ts`,
`roles.test.ts`, `redirectUtils.test.ts`). `npm test` pour une passe, `npm run test:watch` en continu.

## 📄 Licence

Projet privé — tous droits réservés.
