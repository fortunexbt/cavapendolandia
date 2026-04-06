# Prompt per Agente AI - Cavapendolandia

---

## Ciao! Benvenuto su Cavapendolandia

Sono Fortune, il creatore di questo progetto artistico italiano. Ti scrivo per spiegarti dove siamo arrivati e cosa c'è da fare.

---

## Cos'è Cavapendolandia

Cavapendolandia è un luogo delicato dove le persone lasciano una "cavapendolata" - un contributo creativo (immagini, suoni, testi, video) in risposta alla domanda: "Che cosa significa Cavapendoli per te?"

Il progetto ha un'anima curatoriale: i contributi passano per l'Anticamera (moderazione) prima di essere pubblicati.

---

## Cosa Abbiamo Fatto

### ✅ Completato

1. **Frontend Vite + React + TypeScript**
   - Setup completo con Tailwind CSS e shadcn/ui
   - Animazioni con Framer Motion
   - Routing con React Router v6
   - Data fetching con TanStack React Query

2. **Pagine Pubbliche**
   - Homepage con animation iniziale "CAVAPENDOLANDIA"
   - `/offri` - Form in 5 step per inviare cavapendolate
   - `/che-cose` - Spiegazione del progetto
   - `/regole` - Regole di moderazione
   - `/rimozione` - Richiesta rimozione

3. **Admin Dashboard**
   - Login con email/password (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
   - `/admin/anticamera` - Moderazione contenuti pending
   - `/admin/archivio` - Contenuti approvati
   - `/admin/nascosti` - Contenuti nascosti
   - `/admin/rifiutati` - Contenuti rifiutati

4. **Sistema Iniziative**
   - Tabella `initiatives` nel database (già configurata!)
   - Admin può creare prompt curatoriali
   - L'iniziativa attiva appare sulla homepage

5. **Database Supabase**
   - Tabelle: `offerings`, `initiatives`, `user_roles`
   - Auth configurato
   - Storage per media
   - RLS policies

---

## Cosa Non Funziona / C'è da Fare

### 🚨 IL DATABASE ERA OFFLINE

Il database Supabase era offline quando abbiamo lavorato. **Ora dovrebbe essere tornato online**. La tabella `initiatives` esiste già nella migration `20260305015807_1eba2a67-ead6-4df8-8027-93c0e0ddc2d7.sql`.

**Verifica prima di tutto che il DB sia accessibile.**

### 📋 Task Prioritarie

1. **Testare il flusso completo**
   - Fai una cavapendolata dal form `/offri`
   - Verifica che vada in Anticamera
   - Approvala dall'admin
   - Verifica che appaia nell'archivio

2. **Testare le iniziative**
   - Crea un'iniziativa da admin
   - Verifica che appaia sulla homepage

3. **Fixare bug noti**
   - L'animation iniziale a volte non si nasconde correttamente (abbiamo provato a fixarlo ma potrebbe ripresentarsi)
   - Alcuni errori TypeScript nel file Anticamera.tsx (solo in demo mode)

### 🎨 Miglioramenti UI/UX

1. **Accessibilità** - Abbiamo aumentato i font per il pubblico over-60, ma potrebbe servire ancora tuning
2. **Mobile** - Testa bene su mobile, alcuni elementi potrebbero uscire dai bordi
3. **Form Offri** - Il flusso è un po' lungo, valuta se semplificare

---

## Dettagli Tecnici

### Variabili d'Ambiente
Se ti serve connetterti al DB:
```
VITE_SUPABASE_URL=your-supabase-url.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Per Testare Senza DB
```
VITE_DEMO_MODE=true
```
Questo attiva dati finti.

### Comandi
```bash
npm run dev      # Server locale su :8080
npm run build    # Production build
npm run lint    # Check errori
npm run test    # Test
```

---

## Il Tuo Obiettivo

1. **Verifica che tutto funzioni** con il database reale
2. **Testa il flusso utente**: invia → moderazione → pubblicazione
3. **Testa le iniziative**: crea → verifica che appaia in homepage
4. **Riporta eventuali bug** o problemi

Se trovi errori, correggili. Se qualcosa non è chiaro, chiedi.

---

## Note Importanti

- **Tono**: Il sito è delicato, intimo. Nessun testo rumoroso.
- **Lingua**: Tutto è in italiano.
- **Pubblico**: Include persone over-60, quindi font grandi e UX semplice.
- **Stile**: Minimalista, pochi elementi, tanto spazio bianco.

---

Grazie per l'aiuto! Se hai domande, sono qui.

- Fortune
