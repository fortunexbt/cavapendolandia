# Cavapendolandia - Guida Completa

## Database - Stato Attuale

Il database **è già configurato**! La tabella `initiatives` esiste già nella migration `20260305015807_1eba2a67-ead6-4df8-8027-93c0e0ddc2d7.sql`.

## Per Abilitare il Database su Lovable

Quando il tuo database Supabase sarà di nuovo online:

### 1. Connetti il progetto Supabase
- Vai su [Lovable](https://lovable.dev)
- Apri il progetto cavapendolandia
- Supabase dovrebbe connettersi automaticamente se hai già linkato il progetto

### 2. Verifica che le migration siano applicate
- Vai nella sezione **Supabase** su Lovable
- Controlla che le tabelle `offerings` e `initiatives` esistano
- Se manca qualcosa, esegui le migration dalla cartella `supabase/migrations/`

### 3. Per fare test locali senza database
Aggiungi al file `.env`:
```
VITE_DEMO_MODE=true
```
Questo attiva la modalità demo con dati finti.

---

## Prompt Esteso per Iterare il Progetto

Copia e incolla questo prompt in Lovable o usalo come guida:

---

**PROMPT: Sviluppo Cavapendolandia - Istruzioni per AI**

Cavapendolandia è un progetto artistico italiano per la condivisione di "cavapendolate" (contributi creativi). L'obiettivo è creare un'esperienza delicata, accessibile anche a un pubblico over-60.

### Stack Tecnico
- **Frontend**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Animations**: Framer Motion  
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router DOM v6
- **Data Fetching**: TanStack React Query

### Regole di Design
1. **Accessibilità**: Font grandi (minimo text-base per body, text-lg per titoli su mobile)
2. **Minimalismo**: Poche parole, testo essenziale
3. **Italian**: Tutta l'interfaccia è in italiano
4. **Tono**: Delicato, intimo, curatoriale

### Struttura delle Pagine
- `/` - Homepage con invito a lasciare una cavapendolata
- `/offri` - Form in 5 step per inviare contenuti (media, contenuto, titolo/note, autore, consenso)
- `/che-cose` - Spiegazione del progetto
- `/regole` - Regole di moderazione  
- `/rimozione` - Richiesta rimozione contenuti
- `/admin` - Login admin
- `/admin/anticamera` - Moderazione (pending)
- `/admin/archivio` - Offerte approvate
- `/admin/nascosti` - Offerte nascoste
- `/admin/rifiutati` - Offerte rifiutate

### Flusso Utente
1. L'utente arriva sulla homepage
2. Vede un'animation "CAVAPENDOLANDIA" che dura ~4.5 secondi
3. Legge "Che cosa significa Cavapendoli per te?"
4. Clicca "Lascia una cavapendolata" 
5. Compila il form in 5 step:
   - Step 1: Sceglie tipo media (Immagine, Video, Audio, Testo, PDF, Link)
   - Step 2: Carica il contenuto
   - Step 3: Aggiunge titolo e nota (opzionale)
   - Step 4: Sceglie come apparire (Anonimo, Nome, Instagram)
   - Step 5: Conferma i consensi
6. Il contenuto va in "Anticamera" (pending)
7. L'admin lo approva/rifiuta/nasconde

### Sistema di Iniziative
- L'admin può creare "iniziative" (prompt curatoriali)
- L'iniziativa attiva appare sulla homepage come "Un pensiero"
- Le iniziative servono per dare suggerimenti agli artisti

### Componenti Esistenti
- `CavapendoliPrelude` - Animation iniziale
- `MinimalHeader` - Header con navigazione
- `InitiativeHint` - Mostra l'iniziativa attiva
- `IniziativePanel` - Pannello admin per gestire iniziative
- `AnticameraOfferingRow` - Riga di moderazione

### Errori Comuni da Evitare
1. NON usare testi troppo lunghi - massimo 2-3 frasi
2. NON usare font troppo piccoli - usa text-lg come minimo
3. NON aggiungere animazioni complesse che rallentano
4. NON usare colori forti - preferire toni delicati

### Come Modificare il Form Offri
Il form è in `src/pages/Offri.tsx`. Ha 5 step:
- Step 1 (media): Selezione tipo
- Step 2 (contenuto): Upload/file/testo/link
- Step 3 (titolo): Input + textarea
- Step 4 (autore): Radio + input
- Step 5 (consenso): Checkbox

### Comandi Utili
```bash
npm run dev          # Dev server
npm run build       # Production build
npm run lint        # Check errori
npm run test        # Test
```

### Variabili d'Ambiente
Copia `.env.example` in `.env` e configura:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_DEMO_MODE=true  # Per test senza DB
```

---

## Prossimi Passi Consigliati

1. **Testa il form** - Usa demo mode o aspetta che il DB torni online
2. **Testa la moderazione** - Accedi a /admin e prova ad approvare/rifiutare
3. **Crea un'iniziativa** - Dal pannello admin, crea un prompt
4. **Verifica mobile** - Testa su telefono reale
5. **Aggiusta bug** - Eventuali problemi trovati durante test

---

Questo documento è per uso interno dello sviluppatore.
