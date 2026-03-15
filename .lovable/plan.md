

## Refactor completo della Galleria 3D

### Problema centrale
Il sistema "fly-to" è rotto: dopo che la camera arriva al target, `onCameraArrived` chiama `setCameraTarget(null)` che ri-abilita `OrbitControls` — ma i controls hanno ancora `target={[0, 1, 0]}` come default, quindi la vista scatta al centro della stanza. Questo rende la navigazione frustrante e imprevedibile.

### Piano (un unico file: `CavapendoGallery.tsx`)

**1. Eliminare il sistema fly-to, navigazione libera pura**
- Rimuovere `CameraController`, `CameraTarget`, `cameraTarget` state, `onCameraArrived`
- Clicking un quadro o creatura → apre il modal direttamente, senza muovere la camera
- L'utente naviga liberamente con mouse/touch, si avvicina ai quadri con lo zoom, e clicca quando è pronto
- Questo elimina completamente il bug dello snap-back

**2. Confini robusti con clamp ogni frame**
- `useFrame` clamp su `camera.position` (bound ±15.5) E `controls.target` (bound ±14)
- `onChange` di OrbitControls fa lo stesso clamp come backup
- `maxDistance={14}` ridotto, `minDistance={0.5}` per avvicinarsi molto ai quadri
- `enablePan` con `panSpeed={0.4}` per muoversi dolcemente lungo le pareti

**3. Luci più naturali**
- Ridurre il numero di spotlights (da 6 a 3 — troppi causano anche problemi di performance)
- Alzare l'ambient a `0.25` per evitare zone troppo scure
- Tenere solo: 1 directional per ombre, 1 warm spot sul fondo, 2 fill laterali

**4. Audio — nessuna modifica sostanziale**
- Il sistema di cache audio funziona già. Mantenere così com'è.
- Solo ridurre i log di console per pulizia.

**5. Pulizia generale**
- Rimuovere le ~80 righe di codice del CameraController e fly-to logic
- Semplificare il componente `Scene` eliminando props non più necessari (`cameraTarget`, `setCameraTarget`, `onCameraArrived`)
- Rimuovere `BoundsGuard` come componente separato, integrare il clamp direttamente nel `Scene` con un singolo `useFrame`

### Risultato atteso
- Navigazione fluida e prevedibile: l'utente si muove liberamente, mai riportato al centro
- Click sui quadri/creature apre i modal istantaneamente
- Camera non esce mai dalla stanza
- Codice più semplice (~80 righe in meno)

