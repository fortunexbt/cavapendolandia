

## Plan: Redirect to Gallery after submission

After a successful submission, replace the current "Accolta" confirmation screen with a brief thank-you message that auto-redirects to `/galleria`, or add a prominent link to the gallery alongside the existing options.

### Approach
In `src/pages/Offri.tsx`, update the `submitted === true` confirmation screen (lines ~195-225):

1. Add `useNavigate` from react-router-dom
2. After successful submission, show the current "Accolta" message briefly, then auto-navigate to `/galleria` after ~3 seconds
3. Also replace the "Entra" link with a direct "Vai alla Galleria" link so users can click immediately
4. Keep the "Lascia un'altra cavapendolata" button as-is

### Changes
- **`src/pages/Offri.tsx`**: Import `useNavigate`, add a `useEffect` in the submitted state that calls `navigate('/galleria')` after a 3-second delay. Update the confirmation links to include a prominent "Vai alla Galleria →" link.

