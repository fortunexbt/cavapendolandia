Canonical source sheets live in:

- /public/cavapendoli/source/bw-sheet.png
- /public/cavapendoli/source/color-sheet-a.png
- /public/cavapendoli/source/color-sheet-b.png

Accepted input aliases (kept for convenience):

- /public/cavapendoli/models-bw.png
- /public/cavapendoli/models-a.png
- /public/cavapendoli/models-b.png

Expected format:

- each image is 1536x1024
- each image is a 3x3 collage (8-9 models)
- slicing is automatic via CSS background-position (no manual cuts)

Rendering behavior:

- models are rendered as faint, blurred, drifting peripheral sprites
- center stays clean for text and actions
- opacity and color are tuned by page mode:
  - soglia: mostly B/W, almost no color
  - entra/vaga: balanced B/W + color
  - entra/silenzio: mostly B/W, color strongly reduced
  - offri/dettaglio/info pages: very low presence

Design guardrails:

- mission first: content remains primary
- no social-feed look
- no central hero illustration effect
