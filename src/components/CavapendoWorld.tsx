/**
 * CavapendoWorld — CSS-only decorative background for the homepage.
 *
 * Previously rendered a full Three.js Canvas with orbs, crystals, sparkles
 * and stars. Replaced with a pure CSS gradient/glow approach to free the
 * single WebGL context for the gallery, preventing "Context Lost" errors.
 */

interface CavapendoWorldProps {
  className?: string;
}

function CavapendoWorld({ className = "" }: CavapendoWorldProps) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Primary gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--trace)/0.55),transparent_36%),radial-gradient(circle_at_20%_30%,rgba(231,211,183,0.55),transparent_26%),radial-gradient(circle_at_80%_28%,rgba(202,181,155,0.32),transparent_24%),linear-gradient(180deg,#fbf4ec_0%,#efe3d7_52%,#d8c3b1_100%)]" />

      {/* Warm floor glow */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_center,rgba(95,58,38,0.18),transparent_58%)] blur-2xl" />

      {/* Central orb glow (replaces 3D orb) */}
      <div className="absolute left-1/2 top-[38%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(135,100,75,0.35),rgba(135,100,75,0.12)_40%,transparent_70%)] blur-xl md:h-72 md:w-72" />

      {/* Dream gate ring glow */}
      <div className="absolute left-1/2 top-[32%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8c3a4]/15 md:h-96 md:w-96" />
      <div className="absolute left-1/2 top-[32%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b58f69]/10 rotate-45 md:h-64 md:w-64" />

      {/* Floating crystal accents */}
      <div className="absolute left-[15%] top-[22%] h-3 w-3 rounded-full bg-[#8c7055]/40 blur-sm" />
      <div className="absolute right-[18%] top-[18%] h-2 w-2 rounded-full bg-[#d6b38c]/35 blur-sm" />
      <div className="absolute left-[28%] bottom-[30%] h-2.5 w-2.5 rounded-full bg-[#9b7d60]/30 blur-sm" />
      <div className="absolute right-[22%] top-[45%] h-2 w-2 rounded-full bg-[#b48664]/25 blur-sm" />
      <div className="absolute left-[42%] top-[15%] h-1.5 w-1.5 rounded-full bg-[#7d5f47]/35 blur-[2px]" />
      <div className="absolute right-[35%] bottom-[25%] h-1.5 w-1.5 rounded-full bg-[#5e4938]/30 blur-[2px]" />

      {/* Sparkle-like dots */}
      <div className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 10% 20%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 30% 60%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 50% 35%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 70% 50%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 85% 25%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 20% 80%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 60% 75%, #e5c6a4 50%, transparent 100%),
            radial-gradient(1px 1px at 90% 70%, #e5c6a4 50%, transparent 100%)`,
        }}
      />
    </div>
  );
}

export default CavapendoWorld;
