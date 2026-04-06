# Prompt per Agente AI -- Cavapendolandia (Phase 6+)

---

## Benvenuto su Cavapendolandia

Sono Fortune, il creatore di questo progetto artistico italiano. Questo documento descrive lo stato attuale dell'architettura e le linee guida per lavorarci.

---

## Cos'e Cavapendolandia

Cavapendolandia e un luogo delicato dove le persone lasciano una "cavapendolata" -- un contributo creativo (immagini, suoni, testi, video, link) in risposta alla domanda: "Che cosa significa Cavapendoli per te?"

Il progetto ha un'anima curatoriale: i contributi passano per l'Anticamera (moderazione) prima di essere pubblicati in Galleria.

---

## Architettura Tecnica

### Stack

- **Frontend:** Vite + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Routing:** React Router v6 (tutte le pagine lazy-loaded)
- **Data fetching:** TanStack React Query
- **Backend:** Supabase (Postgres, Auth, Storage, RLS)
- **i18n:** react-i18next (compilato ma disabilitato via feature flag)

### Struttura File

```
src/
  App.tsx                    # Router + provider radice
  main.tsx                   # Entry point
  components/
    shared/                   # PageLayout, ModalBackdrop, SeahorseIcon
    admin/                    # AdminNav, AnticameraOfferingRow, IniziativePanel
    CavapendoWorld.tsx        # Sfondo Prato animato
    CavapendoliPrelude.tsx     # Animation apertura
    InitiativeHint.tsx         # Initiative callout
    OfferingCard.tsx           # Card per galleria
  features/
    offerings/               # Feature offerings
      api/offerings.repo.ts   # Data access layer
    initiatives/             # Feature iniziative
    pages-cms/               # Feature CMS pagine (flag: PAGES_CMS)
    meadow/                   # Feature prato (flag: PRATO_EDITOR)
    visitor-messages/         # Feature messaggi (flag: VISITOR_MESSAGES)
  hooks/
    useAdmin.ts              # Auth admin + role check
    useThemeMode.ts          # Dark/light mode
    useActiveInitiative.ts   # Initiative attiva
  lib/
    featureFlags.ts          # Definizione flag
    offeringMedia.ts         # Helpers signed URL
    offeringSubmission.ts    # Logica submit
    offeringValidation.ts    # Validazione lato client
  pages/
    *.tsx                    # Tutte le pagine pubbliche
    admin/*.tsx              # Tutte le pagine admin
supabase/
  migrations/                # 11 file migration (in ordine cronologico)
  seeds/seed_offerings.sql   # Seed iniziale
```

### Route Map

**Pubbliche:**
- `/` -- Homepage
- `/galleria` -- Archivio offerings approvate
- `/o/:id` -- Dettaglio offering
- `/offri` -- Form 5-step submit
- `/che-cose`, `/regole`, `/rimozione`, `/entra`, `/grazie`, `/contatti`

**Admin:**
- `/admin` -- Login magic link
- `/admin/offerings/pending` -- Anticamera
- `/admin/offerings/approved` -- Archivio
- `/admin/offerings/hidden` -- Nascosti
- `/admin/offerings/rejected` -- Rifiutati
- `/admin/o/:id` -- Dettaglio admin offering
- `/admin/iniziative` -- Gestione iniziative
- `/admin/pagine` -- CMS pagine (flag: PAGES_CMS)
- `/admin/prato` -- Editor prato (flag: PRATO_EDITOR)
- `/admin/messaggi` -- Messaggi visitor (flag: VISITOR_MESSAGES)

---

## Vincolo Operativo: Lovable/Supabase

Il progetto usa Supabase sulla piattaforma Lovable. Questo comporta:

> **Non c'e accesso diretto pg_dump/psql alla DB gestita.**
> Le migration devono essere applicate via:
> 1. `supabase db push` (CLI, se linkato)
> 2. Copy-paste manuale nel SQL Editor del dashboard Supabase

Tutte le migration sono in `supabase/migrations/` e vanno eseguite in ordine cronologico. Vedi `docs/MIGRATION_HANDOFF.md`.

---

## Feature Flags

I flag sono **build-time**, letti da `VITE_*` env vars:

| Flag | Descrizione |
|------|-------------|
| `VITE_FEATURE_PAGES_CMS` | Abilita CMS contenuti pagina (`/admin/pagine`) |
| `VITE_FEATURE_PRATO_EDITOR` | Abilita editor prato (`/admin/prato`) |
| `VITE_FEATURE_VISITOR_MESSAGES` | Abilita messaggi visitor (`/admin/messaggi`) |
| `VITE_FEATURE_I18N` | Abilita internazionalizzazione (IT/EN) |

Per attivare un flag: aggiungere a `.env.local`, poi rebuild.

---

## Storage Buckets

| Bucket | Visibilita | Uso |
|--------|-----------|-----|
| `offerings` | Privato (signed URL per approved) | Media user-submitted |
| `site-assets` | Pubblico | Assets admin (CMS, prato, branding) |

---

## Bootstrap Admin

1. Utente autenticato almeno una volta via `/admin` (magic link)
2. In SQL Editor:
```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'EMAIL_ADMIN'
on conflict (user_id, role) do nothing;
```
3. Logout/login

---

## Linee Guida per l'Agente

### Verifica prima di tutto
1. `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` sono configurati
2. Migration applicate (SQL Editor o CLI)
3. Almeno un admin bootstrapato

### Per testare senza DB
```env
VITE_DEMO_MODE=true
```
Attiva mock data (2 offerings demo + 1 iniziativa demo).

### Flow da testare
1. **Invio:** `/offri` -> pending in Anticamera
2. **Approvazione:** Anticamera -> approva -> appare in Galleria
3. **Iniziative:** crea da admin -> appare in homepage
4. **Messaggi:** visitor invia da `/contatti` -> vista in `/admin/messaggi`

### Se trovi errori
1. Correggili direttamente se possibile
2. Se qualcosa non e chiaro, chiedi prima di procedere
3. Riporta sempre cosa hai fatto e cosa hai trovato

---

## Note Importanti

- **Tono:** Il sito e delicato, intimo. Nessun testo rumoroso.
- **Lingua:** Tutto e in italiano.
- **Pubblico:** Include persone over-60, quindi font grandi e UX semplice.
- **Stile:** Minimalista, pochi elementi, tanto spazio bianco.
- **Moderazione:** Sempre manuale -- niente auto-approve.
- **No social:** Nessun like, commento, o profilo pubblico.

---

## Documentazione

| Documento | Uso |
|-----------|-----|
| `docs/ARCHITECTURE.md` | Struttura app, feature boundaries, gallery, data access |
| `docs/DB_OPERATING_MODEL.md` | Vincolo Lovable/Supabase, workflow migration, flag strategy |
| `docs/MIGRATION_HANDOFF.md` | Template setup nuovo ambiente |
| `docs/ADMIN_OPERATIONS.md` | Guide operative admin |
| `docs/MODERATION_PLAYBOOK_IT.md` | Playbook moderazione |
| `docs/GO_NO_GO_CHECKLIST_IT.md` | Checklist go/no-go |

---

## Comandi Utili

```bash
npm run dev      # Dev server :8080
npm run build    # Production build
npm run lint     # Check errori
npm run test     # Test
```

---

Grazie per l'aiuto! Se hai domande, sono qui.

-- Fortune
