# UX Acceptance - Cavapendolandia

Data verifica: 2026-02-27

## Checklist richiesta

- [x] Soglia feels like entering a place (not a landing page).
- [x] Entra default is "Vaga" and is effortless.
- [x] Silenzio feels like attention, not emptiness.
- [x] Offri is understandable without tech literacy.
- [x] Copy is consistent, poetic, minimal.
- [x] No original drawings or recognizable derivations.
- [x] Mobile experience is as good as desktop.
- [x] Nothing feels like a social feed.

## Verifica sintetica per area

## Soglia (`/`)
- Domanda centrale aumentata e resa focale.
- Micro-copy di soglia introdotta: "Un luogo delicato. Lascia qualcosa che possa stare qui."
- Scelte "Entra / Lascia un'offerta" rese equivalenti e non aggressive.
- Fade-in lento e sfalsato su titolo, domanda, micro-copy e scelte.

## Entra (`/entra`)
- Modalita presenti: `Vaga` (default), `Nuovi arrivi`, `Silenzio`.
- Vaga: un contenuto alla volta, indicatore di deriva con punti pulsanti.
- Silenzio: riduzione distrazioni, microlinea "resta finche vuoi.", CTA minime.
- Empty state umanizzato: "Qui non c'e ancora nulla."

## Dettaglio offerta (`/o/:id`)
- Margini aumentati, chrome ridotto.
- Tone da oggetto trovato (etichetta discreta e metadati quieti).
- "un altro" reso azione principale.

## Offri (`/offri`)
- Progress trasformato in etichetta poetica di fase:
  - `1 - Scelta`
  - `2 - Deposito`
  - `3 - Nome`
  - `4 - Firma`
  - `5 - Consenso`
- Navigazione coerente: "← torna indietro".
- Helper step 2 uniformati:
  - "Piccolo va bene."
  - "Non deve spiegare tutto."
- Messaggi errore calmati in italiano non tecnico.

## Coerenza tipografica e ritmo
- Gerarchie tipografiche armonizzate (serif emotivo + mono leggero per micro-label).
- Contenitori max-width allineati e padding aumentato.
- Hover e passaggi ammorbiditi; transizioni pagina 220ms.

## Antonio path (5 minuti)

Percorso verificato:
1. `/` - percezione soglia + scelte immediate.
2. `/entra` - prova `Vaga`, poi `Silenzio`.
3. `/o/:id` - lettura "oggetto trovato", azione `un altro`.
4. `/offri` - completamento guidato fino a `Consenso`.
5. `/che-cose` + `/regole` - coerenza tono e patto del luogo.

Esito: percorso lineare, comprensibile, coerente con "entrare, offrire, vagare".
