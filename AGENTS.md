# AGENTS.md - Cavapendolandia Development Guide

Guidance for agentic coding agents working in this repository.

## Project Stack

- **Framework**: Vite + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router DOM v6
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form + Zod

## Commands

```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm run build:dev    # Dev build (no minification)
npm run lint         # ESLint
npm run test         # All tests (vitest run)
npm run test:watch   # Watch mode
npx vitest run src/test/offeringValidation.test.ts  # Single test file
npx vitest run --grep "should"                      # Pattern matching
```

## Code Style

### Imports
- Use `@/*` alias for `src/*`
- Order: external libs → internal components/hooks → utils/types
- Use `import { type X }` for type-only imports

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import type { Offering } from "@/integrations/supabase/types";
```

### Formatting
- 2 spaces indentation, double quotes, trailing commas
- Max ~100 chars per line (soft limit)
- ESLint + Prettier-like rules via `lovable-tagger`

### TypeScript
- `strict: false` in tsconfig
- Explicit typing for params/returns
- `type` for aliases, `interface` for object shapes
- `as const` for literal types

```typescript
const MAX_FILE_BYTES = 100 * 1024 * 1024;

interface Offering {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "hidden";
}
```

### Naming
- Components: PascalCase (`OfferingCard.tsx`)
- Hooks: `use*` prefix (`useAdmin.ts`)
- Utils: camelCase (`offeringValidation.ts`)
- Constants: UPPER_SNAKE_CASE for runtime values

### React Patterns
- Functional components with hooks
- Destructure props in signature
- `export default` for pages, named exports for utils
- Early returns for conditionals

```typescript
const Index = () => {
  if (loading) return <Skeleton />;
  return <div><h1>Title</h1></div>;
};
export default Index;
```

### Tailwind CSS
- Use `cn()` from `@/lib/utils` for conditional classes
- Arbitrary values sparingly (`bg-[#123456]`)
- Semantic colors (`text-foreground`, `bg-background`)
- Custom fonts via `font-mono-light`

```typescript
<button className={cn("px-4 py-2", isActive && "bg-primary")} />
```

### Error Handling
- Try/catch for async ops
- Handle Supabase errors by code
- User-friendly messages via toast/sonner

```typescript
try {
  const { error } = await supabase.from("offerings").insert(data);
  if (error) throw error;
  toast.success("Created!");
} catch (err) {
  toast.error("Failed to create");
}
```

### Testing
- Test files: `src/test/*.test.ts`
- Vitest with jsdom environment
- Globals enabled in config

```typescript
import { describe, it, expect } from "vitest";

describe("offeringValidation", () => {
  it("should validate handles", () => {
    expect(isValidInstagramHandle("@user")).toBe(true);
  });
});
```

### Supabase
- Client: `@/integrations/supabase/client`
- Types: `@/integrations/supabase/types`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

## File Structure

```
src/
├── components/ui/    # shadcn/ui components
├── components/admin/ # Admin components
├── pages/           # Route pages
│   └── admin/       # Admin pages
├── hooks/           # Custom hooks
├── lib/             # Utilities
├── integrations/    # Supabase
├── test/            # Test files
└── App.tsx          # Routes
```

## Routes (App.tsx)

- `/` - Index
- `/entra` - Enter
- `/o/:id` - Offering detail
- `/offri` - Submit offering
- `/che-cose` - About
- `/regole` - Rules
- `/rimozione` - Removal
- `/admin` - Admin login
- `/admin/anticamera` - Pending
- `/admin/archivio` - Approved
- `/admin/nascosti` - Hidden
- `/admin/rifiutati` - Rejected
- `/admin/o/:id` - Admin detail

## Environment

Copy `.env.example` to `.env`:
```
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

## Common Issues

1. **Tests failing**: Check jsdom in `vitest.config.ts`
2. **Import errors**: Verify `@/` alias in `tsconfig.app.json`
3. **Supabase errors**: Check `.env` vars
4. **Build errors**: Run `npm run lint` first
