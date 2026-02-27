# Cavapendolandia

Piattaforma artistica minimale dove chiunque puo lasciare un'offerta su cosa significa "Cavapendoli", con moderazione manuale in Anticamera.

## Stack

- Vite + React + TypeScript
- Tailwind + shadcn/ui
- Supabase (DB, Auth, Storage, RLS)

## Setup locale

1. Installa dipendenze:

```bash
npm install
```

2. Crea file env:

```bash
cp .env.example .env.local
```

3. Compila le variabili:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

4. Avvia:

```bash
npm run dev
```

## Script utili

```bash
npm run lint
npm run test
npm run build
```

## Supabase: migrazioni richieste

Le migrazioni sono in `supabase/migrations` e includono:

- schema offerte + ruoli admin
- policy RLS per pubblico e moderazione
- bucket storage privato con lettura pubblica solo per offerte approvate
- validazioni contenuto (lunghezze, shape media, consenso)
- hardening anti-abuso MVP

Applica le migrazioni dal tuo progetto Supabase (CLI o SQL editor).

## Bootstrap primo admin

1. L'utente deve prima autenticarsi almeno una volta da `/admin` (magic link).
2. Poi esegui in SQL editor Supabase:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'INSERISCI_EMAIL_ADMIN'
on conflict (user_id, role) do nothing;
```

3. Effettua logout/login su `/admin`.

## Seed iniziale archivio

Per popolare una base curatoriale (8-15 offerte testuali/link), usa:

- `supabase/seeds/seed_offerings.sql`

## Background Cavapendoli (faint mode)

Per attivare i due layer di presenza sfocati, copia i file in:

- `public/cavapendoli/models-a.png`
- `public/cavapendoli/models-b.png`

Dettagli: `public/cavapendoli/README.txt`

## Documentazione operativa

- Playbook moderazione: `docs/MODERATION_PLAYBOOK_IT.md`
- Checklist go/no-go: `docs/GO_NO_GO_CHECKLIST_IT.md`
- Kit review Antonio: `docs/REVIEW_KIT_ANTONIO_IT.md`

## Note di progetto

- Lingua unica: italiano.
- Moderazione sempre manuale.
- Nessuna dinamica social (like/commenti/profili).
- Nessuna opera originale o derivazione riconoscibile nel visual design.
