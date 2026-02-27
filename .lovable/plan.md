

# Cavapendolandia — Piano di Implementazione

Un luogo digitale intimo e misterioso dove chiunque può lasciare un "deposito" su cosa significhi Cavapendoli. Nessun social, nessun like, nessun profilo. Solo entrare, offrire, vagare.

---

## 1. Backend & Database (Lovable Cloud + Supabase)

Attivare Lovable Cloud per gestire:
- **Tabella `offerings`**: tipo media, file/testo/link, titolo, nota, firma (anonimo/nome/pseudonimo/@IG), consensi, stato (pending/approved/rejected/hidden), nota curatoriale, data
- **Storage bucket** per i file caricati (immagini, video, audio, PDF) con limite 100 MB
- **Autenticazione admin** con magic link via email
- **RLS policies**: lettura pubblica solo per offerte approvate, scrittura pubblica per nuove offerte, gestione completa solo per admin

---

## 2. Soglia (Home) — `/`

La porta d'ingresso. Molto spazio bianco, atmosfera sospesa.
- Titolo grande: **CAVAPENDOLANDIA**
- Domanda centrale: *"Che cosa significa Cavapendoli per te?"*
- Due pulsanti: **Entra** / **Lascia un'offerta**
- Micro-testo: *"Qui si lascia qualcosa. E si vaga."*
- Footer quasi nascosto: Che cos'è · Regole · Rimozione
- Elemento visivo astratto: un'ombra/sagoma sottile ai bordi, animazione lentissima di oscillazione

---

## 3. Archivio (Entra) — `/entra`

Esplorazione delle offerte approvate in due modalità:

### Modalità Vaga (default)
- Offerte mostrate in ordine casuale, una alla volta o in griglia morbida
- Pulsante "un altro" per continuare a vagare

### Modalità Silenzio
- Un contributo alla volta, grande, con molto margine bianco
- Respiro visivo, focus totale sull'offerta
- Pulsanti: "un altro" / "lascia un'offerta"

Header minimale con nome del sito e link "Lascia un'offerta"

---

## 4. Dettaglio Offerta — `/o/[id]`

Pagina singola per ogni offerta approvata:
- Media in evidenza (immagine/video/audio/testo/PDF/link)
- Titolo (se presente) o "Offerta"
- Caption/nota (se presente)
- Firma: Anonimo o nome/pseudonimo
- Data in piccolo
- Nota curatoriale (se aggiunta dall'admin)
- Link: "un altro" / "torna all'Archivio" / "lascia un'offerta"

---

## 5. Lascia un'offerta (Upload) — `/offri`

Flusso cerimoniale in pochi step:

1. **Cosa lasci?** — Scelta tipo: Immagine, Video, Audio, Testo, PDF, Link
2. **Contenuto** — Upload file o campo testo/link. Micro-nota: *"Piccolo va bene."*
3. **Nome & nota** — Titolo (opzionale), nota breve (opzionale)
4. **Come vuoi apparire?** — Anonimo (default), nome/pseudonimo, @IG (opzionale)
5. **Consenso** — Checkbox obbligatori (diritti + archivio) e facoltativo (ricondivisione)
6. **Conferma** — *"La tua offerta è stata accolta. Ora è in attesa di entrare."*

Nessuna registrazione richiesta.

---

## 6. Pagine informative

### Che cos'è — `/che-cose`
Testo breve e poetico (6-10 righe) che evoca senza spiegare troppo.

### Regole — `/regole`
7 punti gentili e chiari sullo spirito del luogo.

### Rimozione — `/rimozione`
Istruzioni semplici per richiedere la cancellazione via email.

---

## 7. Area Admin (protetta da login magic link)

### Anticamera — `/admin/anticamera`
- Lista offerte in attesa con preview, tipo, titolo, autore, data
- Filtri per tipo media
- Azioni rapide: Approva / Rifiuta / Apri dettaglio

### Dettaglio moderazione — `/admin/o/[id]`
- Media in grande + tutti i metadati e consensi
- Azioni: Approva / Rifiuta / Oscura (se già approvato)
- Campo opzionale per nota curatoriale

### Archivio admin — `/admin/archivio`
- Tutte le offerte approvate con possibilità di oscurarle

### Rifiutati — `/admin/rifiutati`
- Storico delle offerte rifiutate

---

## 8. Direzione visiva

- **Palette**: molto bianco, toni neutri, testo scuro, accenti sottilissimi
- **Tipografia**: pulita, spaziata, poetica
- **Elementi astratti originali**: silhouette generiche, fili sottili, segni come alfabeto inventato
- **Animazioni**: lente, oscillanti, quasi respiranti — solo ai bordi, mai invadenti
- **Nessuna opera originale dell'artista** in nessun punto del sito

