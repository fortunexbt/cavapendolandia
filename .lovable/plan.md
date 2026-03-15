

## Fix: Gallery not filling viewport

### Problem
From the screenshot, the 3D canvas only renders in the top ~20% of the viewport. The rest is black empty space.

**Root cause:** The wrapper div in `CavapendoGallery` has conflicting height declarations — `h-full`, inline `height: "100%"`, and `min-h-[600px]` — while the parent passes `h-[calc(100vh-3.5rem)]` via className. The `h-full` resolves to the parent's height but may conflict with the inline style. Additionally, the Canvas has `position: "relative"` which can cause it to not fill its container properly.

### Fix (1 file)

**`src/components/CavapendoGallery.tsx` — line 2046**

Remove the conflicting inline `height` and `minHeight` styles from the wrapper div. Let the className from the parent (`h-[calc(100vh-3.5rem)]`) drive the height. Remove `h-full` and `min-h-[600px]` from the component's own classes since they conflict:

```tsx
// Before
<div className={`relative w-full h-full min-h-[600px] ${className}`} 
     style={{ height: "100%", minHeight: "600px", isolation: "isolate" }}>

// After  
<div className={`relative w-full ${className}`} 
     style={{ isolation: "isolate" }}>
```

Also fix the Canvas style — remove `position: "relative"` (Canvas from @react-three/fiber fills its parent by default) and ensure `width`/`height` are `100%`:

```tsx
// Before
style={{ background: "linear-gradient(...)", width: "100%", height: "100%", position: "relative", zIndex: 0 }}

// After
style={{ background: "#1a1a1a", width: "100%", height: "100%" }}
```

The dark background (`#1a1a1a`) matches the gallery room interior better than the light gradient.

