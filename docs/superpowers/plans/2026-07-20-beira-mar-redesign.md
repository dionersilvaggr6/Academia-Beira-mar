# Redesign "Force Dark" — Plano de Implementação (Academia Beira Mar)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebranding + redesign premium do site (marketing) do Beira Mar na direção "Force Dark", com 3D, motion e prova social real, preservando a camada funcional (leads, WhatsApp, planos, áreas de aluno).

**Architecture:** Next.js 16 App Router. Sistema de design em tokens (`globals.css` `@theme`) como fonte única. Secções server-first; ilhas client (`"use client"`) só onde há interação/motion/3D. 3D (`@react-three/fiber`) carregado por `next/dynamic({ ssr:false })` e lazy por viewport. Motion com `framer-motion`, sempre com fallback `prefers-reduced-motion`. Conteúdo real centralizado em `content/site.ts` + `lib/plans.ts`.

**Tech Stack:** Next 16.2.10 · React 19 · TypeScript strict · Tailwind v4 · `three` + `@react-three/fiber` + `@react-three/drei` · `framer-motion` · Supabase/Drizzle/Zod (mantidos) · `@fal-ai/client` (devDep) · Biome · Vitest · Playwright.

## Global Constraints

- **Next 16 é diferente:** antes de codar, ler `web/node_modules/next/dist/docs/` (ver `web/AGENTS.md`). Respeitar deprecations.
- **Tokens, nunca hardcode:** todas as cores/fontes/raios vêm de `globals.css` `@theme`. Zero hex nos componentes.
- **Língua:** código/commits em EN; copy visível ao utilizador em PT-BR (é um cliente brasileiro).
- **TS strict, zero `any`/`as` cego.** Validação com Zod nos limites.
- **Imutabilidade**, ficheiros focados (200–400 linhas, 800 máx.), funções < 50 linhas.
- **A11y:** semântico, foco visível, `alt`, contraste AA, todo o motion/3D respeita `prefers-reduced-motion`.
- **Motion/3D:** 3D nunca bloqueia o LCP; DPR ≤ 2; partículas adaptativas; pausa fora de viewport.
- **PII:** telefone nunca em logs. **Segredos:** `FAL_KEY` só em ambiente de geração, nunca em git/logs.
- **Biome verde** e **testes verdes** antes de cada commit. Cobertura de lógica ≥ 80%.
- **Commits** conventional, assinados com trailer `Assinado-por: DH — CMTecnologia`. Trabalhar na branch `redesign/force-dark`.
- **fal.ia:** usar sempre o **modelo de imagem mais barato** disponível.

---

## Mapa de ficheiros

**Criar:**
- `web/lib/ui/cn.ts` — util de classes.
- `web/lib/motion.ts` — variantes framer partilhadas.
- `web/lib/device.ts` — `particleCount()` (lógica pura, testável).
- `web/components/ui/{Button,Container,Badge,GlassCard,Counter}.tsx` — primitivas.
- `web/components/three/ParticleField.tsx` — sistema 3D.
- `web/components/three/ParticleFieldLazy.tsx` — wrapper `dynamic` + fallback.
- `web/components/sections/{Stats,Galeria,Depoimentos,Wellhub,LojaTeaser}.tsx` — secções novas.
- `web/lib/content.schema.ts` — Zod para `SITE` estendido.
- `web/public/brand/{wordmark.svg,mark.svg}` — identidade.
- `web/scripts/generate-images.mjs` — geração fal.ia.
- Testes correspondentes em `web/tests/`.

**Modificar:**
- `web/app/globals.css` — tokens Force Dark + fontes.
- `web/app/layout.tsx` — fontes `next/font`, metadata/OG.
- `web/app/page.tsx` — nova composição de secções.
- `web/content/site.ts` — `stats`, `reviews`, `flags`, `store`.
- `web/lib/plans.ts` — marcar `destaque`/`recorrente`.
- `web/components/layout/{Header,Footer,WhatsappFab}.tsx` — reestilizar.
- `web/components/sections/{Hero,Modalidades,PersonalTrainer,Diferenciais,Planos,Sobre,Localizacao,Contacto}.tsx` — redesign.
- `web/components/ui/{PlanoCard,SectionTitle}.tsx` — novo sistema.
- `web/app/{login,aluno,instrutor}/**` — reskin leve (tokens/fontes).
- `web/package.json` — dependências.

---

## FASE 0 — Fundação

### Task 1: Dependências

**Files:** Modify `web/package.json` (via gestor).

- [ ] **Step 1: Instalar runtime**

Run (em `web/`): `npm i three @react-three/fiber @react-three/drei framer-motion`

- [ ] **Step 2: Instalar dev (geração de imagens)**

Run: `npm i -D @fal-ai/client @types/three`

- [ ] **Step 3: Verificar build/tipos**

Run: `npm run lint && npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add web/package.json web/package-lock.json
git commit -m "chore: add three/r3f/drei, framer-motion, fal client"
```

### Task 2: Tokens Force Dark + fontes

**Files:** Modify `web/app/globals.css`, `web/app/layout.tsx`.

**Interfaces — Produces:** utilitários Tailwind `bg-ink/surface/surface-2`, `text-fg/fg-dim/fg-mute`, `bg-flame/flame-hi/flame-deep`, `font-display`, `font-sans`, `rounded-*` e vars `--glass-*`, `--ease-out-expo`.

- [ ] **Step 1: Reescrever `globals.css`**

```css
@import "tailwindcss";

@theme {
  /* Superfícies */
  --color-ink: #0a0a0b;
  --color-surface: #121316;
  --color-surface-2: #1a1a1e;
  --color-graphite: #3a3a40;
  /* Texto */
  --color-fg: #f3f3f5;
  --color-fg-dim: #aeb3bd;
  --color-fg-mute: #6b6b70;
  /* Acento — laranja "molten" */
  --color-flame: #ff6a2b;
  --color-flame-hi: #ffa15e;
  --color-flame-deep: #c2410c;
  /* Estado */
  --color-ok: #5fd398;
  --color-warn: #ffc46b;
  --color-err: #ff8a72;
  /* Tipografia (variáveis injetadas por next/font) */
  --font-display: var(--font-chakra), system-ui, sans-serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
  /* Raio */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 22px;
  /* Motion */
  --ease-out-expo: cubic-bezier(.16,1,.3,1);
}

:root {
  --glass-bg: rgba(20,22,28,.6);
  --glass-border: rgba(255,255,255,.08);
  --glass-blur: 14px;
  --flame-glow: rgba(255,106,43,.5);
}

body {
  background: var(--color-ink);
  color: var(--color-fg);
  font-family: var(--font-sans);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

- [ ] **Step 2: Fontes em `layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsappFab } from "@/components/layout/WhatsappFab";
import "./globals.css";

const chakra = Chakra_Petch({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-chakra" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Academia Beira Mar — Capão da Canoa | Aqui Evoluímos",
  description:
    "Musculação, Pilates e Funcional em Capão da Canoa. Aparelhos novos, climatizada, ambiente familiar. 5★ no Google. Vê os planos e matricula-te.",
  openGraph: {
    title: "Academia Beira Mar — Aqui Evoluímos",
    description: "Musculação · Pilates · Funcional em Capão da Canoa.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${chakra.variable} ${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-ink text-fg">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsappFab />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verificar**

Run: `npm run dev` → abrir `/`. Esperado: fundo quase-preto `#0A0A0B`, texto claro; sem erros de consola. (Secções ainda com estilo antigo — normal.)

- [ ] **Step 4: Commit**

```bash
git add web/app/globals.css web/app/layout.tsx
git commit -m "feat: Force Dark design tokens + Chakra Petch/Inter fonts"
```

### Task 3: Util `cn` + primitivas UI

**Files:** Create `web/lib/ui/cn.ts`, `web/components/ui/{Button,Container,Badge,GlassCard}.tsx`. Test `web/tests/cn.test.ts`.

**Interfaces — Produces:**
- `cn(...classes: (string|false|null|undefined)[]): string`
- `<Button variant="primary"|"ghost" as="a"|"button" ...>` (glow no primary).
- `<Container>` (max-w + px responsivo). `<Badge>` (pill). `<GlassCard>` (vidro).

- [ ] **Step 1: Teste de `cn`**

```ts
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/ui/cn";
describe("cn", () => {
  it("junta e ignora falsy", () => {
    expect(cn("a", false, null, "b", undefined)).toBe("a b");
  });
});
```

- [ ] **Step 2: Correr (falha)** — `npx vitest run tests/cn.test.ts` → FAIL.

- [ ] **Step 3: Implementar `cn.ts`**

```ts
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 4: Correr (passa)** — `npx vitest run tests/cn.test.ts` → PASS.

- [ ] **Step 5: Primitivas**

```tsx
// components/ui/Container.tsx
import { cn } from "@/lib/ui/cn";
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}
```

```tsx
// components/ui/Badge.tsx
import { cn } from "@/lib/ui/cn";
export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-sans text-fg-dim text-xs", className)}>
      {children}
    </span>
  );
}
```

```tsx
// components/ui/GlassCard.tsx
import { cn } from "@/lib/ui/cn";
export function GlassCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("rounded-xl border p-6", className)}
      style={{ background: "var(--glass-bg)", borderColor: "var(--glass-border)", backdropFilter: "blur(var(--glass-blur))" }}
    >
      {children}
    </div>
  );
}
```

```tsx
// components/ui/Button.tsx
import { cn } from "@/lib/ui/cn";
type Common = { variant?: "primary" | "ghost"; className?: string; children: React.ReactNode };
const base = "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-sans font-bold transition disabled:opacity-60";
const styles = {
  primary: "bg-flame text-ink hover:brightness-110 shadow-[0_0_28px_var(--flame-glow)]",
  ghost: "border border-white/20 text-fg hover:border-flame",
};
export function Button({ variant = "primary", className, children, ...rest }: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn(base, styles[variant], className)} {...rest}>{children}</button>;
}
export function ButtonLink({ variant = "primary", className, children, ...rest }: Common & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={cn(base, styles[variant], className)} {...rest}>{children}</a>;
}
```

- [ ] **Step 6: Commit**

```bash
git add web/lib/ui/cn.ts web/components/ui/Container.tsx web/components/ui/Badge.tsx web/components/ui/GlassCard.tsx web/components/ui/Button.tsx web/tests/cn.test.ts
git commit -m "feat: cn util + UI primitives (Button, Container, Badge, GlassCard)"
```

### Task 4: Wordmark SVG + variantes de logótipo

**Files:** Create `web/public/brand/wordmark.svg`, `web/public/brand/mark.svg`. Modify `web/app/layout.tsx` (metadata icons).

- [ ] **Step 1: `mark.svg`** — halteres (barra laranja com glow + 2 discos claros), 64×64, `currentColor`-friendly onde possível. Barra `#ff6a2b`, discos `#f3f3f5`, fundo transparente.
- [ ] **Step 2: `wordmark.svg`** — `mark` + "BEIRA MAR" em traçado tipo Chakra Petch (ou texto convertido em path), altura 40.
- [ ] **Step 3: Ligar favicon/OG** — em `metadata`: `icons: { icon: "/brand/mark.svg" }`.
- [ ] **Step 4: Commit**

```bash
git add web/public/brand/ web/app/layout.tsx
git commit -m "feat: Beira Mar wordmark + mark SVG, wire favicon"
```

> Nota de execução: refinar visual do wordmark ao vivo com a skill `impeccable` + companheiro visual.

---

## FASE 1 — Conteúdo & lógica (TDD)

### Task 5: Estender `content/site.ts` + schema Zod

**Files:** Modify `web/content/site.ts`. Create `web/lib/content.schema.ts`, `web/tests/content.test.ts`.

**Interfaces — Produces:** `SITE.stats`, `SITE.reviews: {texto:string; fonte:string}[]`, `SITE.flags: {galeria:boolean; loja:boolean}`, `SITE.store: string[]`, validados por `siteSchema`.

- [ ] **Step 1: Teste** (`content.test.ts`)

```ts
import { describe, expect, it } from "vitest";
import { SITE } from "@/content/site";
import { siteSchema } from "@/lib/content.schema";
describe("SITE", () => {
  it("valida contra o schema", () => {
    expect(() => siteSchema.parse(SITE)).not.toThrow();
  });
  it("tem reviews reais e stats", () => {
    expect(SITE.reviews.length).toBeGreaterThanOrEqual(3);
    expect(SITE.stats.some((s) => s.valor.includes("5"))).toBe(true);
  });
});
```

- [ ] **Step 2: Correr (falha)** — `npx vitest run tests/content.test.ts` → FAIL.

- [ ] **Step 3: `content.schema.ts`**

```ts
import { z } from "zod";
export const siteSchema = z.object({
  name: z.string(), whatsapp: z.string(), whatsappDisplay: z.string(),
  instagram: z.string().url(), instagramHandle: z.string(),
  address: z.string(), city: z.string(),
  hours: z.array(z.object({ dias: z.string(), horas: z.string() })),
  tagline: z.string(),
  diferenciais: z.array(z.string()).min(1),
  stats: z.array(z.object({ valor: z.string(), rotulo: z.string() })).min(1),
  reviews: z.array(z.object({ texto: z.string(), fonte: z.string() })).min(3),
  flags: z.object({ galeria: z.boolean(), loja: z.boolean() }),
  store: z.array(z.string()),
});
```

- [ ] **Step 4: Estender `site.ts`** (acrescentar ao objeto existente, manter os campos atuais)

```ts
  headline: "Aqui evoluímos.",
  stats: [
    { valor: "5★", rotulo: "avaliação no Google" },
    { valor: "+5.700", rotulo: "seguidores no Instagram" },
    { valor: "3", rotulo: "modalidades" },
    { valor: "100%", rotulo: "climatizada & nova" },
  ],
  reviews: [
    { texto: "Academia nova, completa, banheiros limpos, música boa, ótima opção na zona norte.", fonte: "Google" },
    { texto: "Ambiente acolhedor, profissionais muito competentes e atenciosos!", fonte: "Google" },
    { texto: "Aparelhos novos, boa localização, estacionamento, ótimo atendimento.", fonte: "Google" },
  ],
  flags: { galeria: true, loja: true },
  store: ["Whey Protein", "Creatina", "Pré-Treino", "Barras de Proteína", "Coqueteleiras", "Energéticos"],
```

Acrescentar `climatizada` aos `diferenciais` e `banheiros limpos`.

- [ ] **Step 5: Correr (passa)** — `npx vitest run tests/content.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add web/content/site.ts web/lib/content.schema.ts web/tests/content.test.ts
git commit -m "feat: extend SITE with stats, reviews, flags, store + zod schema"
```

### Task 6: `particleCount()` — lógica adaptativa (pura)

**Files:** Create `web/lib/device.ts`, `web/tests/device.test.ts`.

**Interfaces — Produces:** `particleCount(width:number, reducedMotion:boolean): number`.

- [ ] **Step 1: Teste**

```ts
import { describe, expect, it } from "vitest";
import { particleCount } from "@/lib/device";
describe("particleCount", () => {
  it("desktop", () => expect(particleCount(1440, false)).toBe(5000));
  it("mobile", () => expect(particleCount(390, false)).toBe(1500));
  it("reduced motion → mínimo", () => expect(particleCount(1440, true)).toBe(0));
});
```

- [ ] **Step 2: Correr (falha)** → FAIL.

- [ ] **Step 3: Implementar**

```ts
export function particleCount(width: number, reducedMotion: boolean): number {
  if (reducedMotion) return 0;
  return width < 768 ? 1500 : 5000;
}
```

- [ ] **Step 4: Correr (passa)** → PASS.

- [ ] **Step 5: Commit**

```bash
git add web/lib/device.ts web/tests/device.test.ts
git commit -m "feat: adaptive particleCount() helper"
```

### Task 7: Variantes de motion partilhadas

**Files:** Create `web/lib/motion.ts`.

**Interfaces — Produces:** `fadeUp`, `stagger` (variants framer). Consumidas pelas secções.

- [ ] **Step 1: Implementar**

```ts
import type { Variants } from "framer-motion";
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
```

- [ ] **Step 2: Commit**

```bash
git add web/lib/motion.ts
git commit -m "feat: shared framer-motion variants (fadeUp, stagger)"
```

---

## FASE 2 — 3D

### Task 8: `ParticleField` + wrapper lazy

**Files:** Create `web/components/three/ParticleField.tsx`, `web/components/three/ParticleFieldLazy.tsx`. Test `web/tests/particle-field.test.tsx`.

**Interfaces — Consumes:** `particleCount` (Task 6). **Produces:** `<ParticleFieldLazy />` (default export dinâmico, `ssr:false`), com fallback estático.

**Comportamento:** `Points` com N partículas; 4 formas-alvo (haltere, coração, pin, wordmark "BM") geradas como arrays de posições; interpola entre elas em loop suave (`useFrame`), cor `--flame`→`--flame-hi`; parallax leve do ponteiro. Se `useReducedMotion()` → render do fallback (gradiente estático), sem canvas.

- [ ] **Step 1: Smoke test (fallback com reduced motion)**

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("framer-motion", () => ({ useReducedMotion: () => true }));
import { ParticleFallback } from "@/components/three/ParticleField";
describe("ParticleField", () => {
  it("renderiza fallback acessível quando reduced-motion", () => {
    const { container } = render(<ParticleFallback />);
    expect(container.querySelector("[data-particle-fallback]")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Correr (falha)** → FAIL.

- [ ] **Step 3: Implementar `ParticleField.tsx`**

```tsx
"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { particleCount } from "@/lib/device";

// Gera N posições em forma de haltere/coração/pin/wordmark (placeholder: esferas concêntricas;
// refinar as formas na execução — ver nota).
function shapePositions(n: number, seed: number): Float32Array {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 + seed;
    const r = 1.4 + 0.5 * Math.sin(seed + i * 0.001);
    arr[i * 3] = Math.cos(t) * r;
    arr[i * 3 + 1] = Math.sin(t) * r * 0.6;
    arr[i * 3 + 2] = Math.sin(t * 2 + seed) * 0.4;
  }
  return arr;
}

function Points({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const shapes = useMemo(() => [0, 1.6, 3.2, 4.8].map((s) => shapePositions(count, s)), [count]);
  const positions = useMemo(() => shapes[0].slice(), [shapes]);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.15;
    const seg = Math.floor(t) % shapes.length;
    const next = (seg + 1) % shapes.length;
    const k = t - Math.floor(t);
    const geo = ref.current?.geometry;
    if (!geo) return;
    const p = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < p.length; i++) p[i] = THREE.MathUtils.lerp(shapes[seg][i], shapes[next][i], k);
    geo.attributes.position.needsUpdate = true;
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.2) * 0.3;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={"#ff8a4b"} transparent opacity={0.9} sizeAttenuation />
    </points>
  );
}

export function ParticleFallback() {
  return (
    <div
      data-particle-fallback
      aria-hidden
      className="absolute inset-0 -z-10"
      style={{ background: "radial-gradient(circle at 70% 20%, var(--flame-glow), transparent 55%)" }}
    />
  );
}

export default function ParticleField() {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(particleCount(window.innerWidth, !!reduced)); }, [reduced]);
  if (reduced || count === 0) return <ParticleFallback />;
  return (
    <div className="absolute inset-0 -z-10" aria-hidden>
      <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Points count={count} />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 4: Wrapper lazy `ParticleFieldLazy.tsx`**

```tsx
"use client";
import dynamic from "next/dynamic";
import { ParticleFallback } from "./ParticleField";
const ParticleField = dynamic(() => import("./ParticleField"), { ssr: false, loading: () => <ParticleFallback /> });
export function ParticleFieldLazy() { return <ParticleField />; }
```

- [ ] **Step 5: Correr (passa)** → PASS. Depois `npm run dev` e confirmar canvas no hero + que com "reduzir movimento" ativo aparece só o gradiente.

- [ ] **Step 6: Commit**

```bash
git add web/components/three/ web/tests/particle-field.test.tsx
git commit -m "feat: 3D ParticleField (morphing) with reduced-motion fallback + lazy wrapper"
```

> Nota de execução: afinar as **formas-alvo reais** (haltere→coração→pin→wordmark) e a paleta/tamanho ao vivo com `threejs-*` skills + companheiro visual. A função `shapePositions` acima é a base a evoluir.

---

## FASE 3 — Secções (redesign)

> Cada secção é uma task independente: **Files → código completo → smoke test render → commit**. Copy real de `SITE`/`PLANS`. Polimento fino ao vivo com `impeccable` + `framer-motion-animator`.

### Task 9: Header (glass, sticky)

**Files:** Modify `web/components/layout/Header.tsx`.

- [ ] **Step 1: Implementar**

```tsx
"use client";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/ui/cn";

const NAV = [
  { href: "#modalidades", label: "Modalidades" },
  { href: "#planos", label: "Planos" },
  { href: "#depoimentos", label: "Depoimentos" },
  { href: "#localizacao", label: "Onde estamos" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={cn("fixed inset-x-0 top-0 z-50 transition", scrolled && "border-white/10 border-b")}
      style={scrolled ? { background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))" } : undefined}
    >
      <Container className="flex items-center justify-between py-3">
        <a href="#inicio" className="flex items-center gap-2 font-display font-bold text-fg tracking-wide">
          <img src="/brand/mark.svg" alt="" width={26} height={26} /> BEIRA MAR
        </a>
        <nav className="hidden gap-6 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="font-sans text-fg-dim text-sm transition hover:text-fg">{n.label}</a>
          ))}
        </nav>
        <ButtonLink href={waLink()} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm">
          Matricular
        </ButtonLink>
      </Container>
    </header>
  );
}
```

- [ ] **Step 2: Smoke test** (`tests/header.test.tsx`) — render, espera texto "BEIRA MAR" e link WhatsApp presente.
- [ ] **Step 3: Correr** → PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: glass sticky header"`

### Task 10: Hero (3D + headline + trust)

**Files:** Modify `web/components/sections/Hero.tsx`.

**Interfaces — Consumes:** `ParticleFieldLazy` (Task 8), `SITE.headline/stats`, `waLink`.

- [ ] **Step 1: Implementar**

```tsx
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { ParticleFieldLazy } from "@/components/three/ParticleFieldLazy";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section id="inicio" className="relative flex min-h-[92vh] items-center overflow-hidden pt-20">
      <ParticleFieldLazy />
      <div className="-z-10 absolute inset-0 bg-gradient-to-b from-transparent via-ink/40 to-ink" />
      <Container className="text-center">
        <div className="mx-auto flex max-w-3xl flex-col items-center">
          <Badge className="mb-5">⭐ 5,0 no Google · +5.700 no Instagram</Badge>
          <h1 className="font-display font-bold text-6xl text-fg uppercase leading-[0.95] md:text-8xl">
            Aqui<br />evoluímos<span className="text-flame">.</span>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-fg-dim text-lg">
            Musculação, Pilates e Funcional em Capão da Canoa. Aparelhos novos, climatizada, ambiente familiar.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={waLink()} target="_blank" rel="noopener noreferrer" className="px-8">Matricular agora</ButtonLink>
            <ButtonLink href="#planos" variant="ghost" className="px-8">Ver planos</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Smoke test** — render, espera H1 "evoluímos" e 2 CTAs.
- [ ] **Step 3: Correr** → PASS. `npm run dev` para confirmar 3D + fallback.
- [ ] **Step 4: Commit** — `git commit -m "feat: redesigned hero with 3D + trust badges"`

### Task 11: Stats (contadores)

**Files:** Create `web/components/ui/Counter.tsx`, `web/components/sections/Stats.tsx`.

- [ ] **Step 1:** `Counter.tsx` — `"use client"`, anima número quando entra em vista (usar `framer-motion` `useInView` + `animate`); se `useReducedMotion`, mostra valor final direto. Aceita `value:string` (mostra tal e qual quando não numérico, ex.: "5★"/"+5.700").
- [ ] **Step 2:** `Stats.tsx` — grelha 2×2/4 colunas com `SITE.stats`, cada célula `GlassCard` com valor em `font-display text-flame text-4xl` + rótulo `text-fg-dim`.
- [ ] **Step 3: Smoke test** — render `Stats`, espera 4 rótulos de `SITE.stats`.
- [ ] **Step 4: Commit** — `git commit -m "feat: animated stats band"`

### Task 12: Modalidades

**Files:** Modify `web/components/sections/Modalidades.tsx`. Data inline: Musculação, Pilates, Funcional (cada com título, descrição curta PT, imagem `/generated/<mod>.webp` — gerada na Task 20).

- [ ] **Step 1: Implementar** — `Container` + grelha 3 cards; cada card imagem `next/image` (com `sizes`), overlay escuro, título `font-display`, texto `font-sans text-fg-dim`, hover eleva (framer `whileHover`). Reveal `fadeUp`+`stagger`.
- [ ] **Step 2: Smoke test** — espera os 3 títulos.
- [ ] **Step 3: Commit** — `git commit -m "feat: modalidades section"`

### Task 13: PersonalTrainer

**Files:** Modify `web/components/sections/PersonalTrainer.tsx`. Copy: "Treinos exclusivos com acompanhamento de Personal Trainer. Método focado em segurança, eficiência e resultados."

- [ ] **Step 1: Implementar** — layout split (texto + imagem/`GlassCard` com 3 pílulas: Segurança · Eficiência · Resultados) + CTA WhatsApp `waLink({ plano: "Personal Trainer" })`.
- [ ] **Step 2: Smoke test** — espera "Personal Trainer" e CTA.
- [ ] **Step 3: Commit** — `git commit -m "feat: personal trainer section"`

### Task 14: Diferenciais

**Files:** Modify `web/components/sections/Diferenciais.tsx`.

- [ ] **Step 1: Implementar** — título "Porquê o Beira Mar", grelha de `SITE.diferenciais` (cada com ícone/emoji + label em `GlassCard`), reveal `stagger`.
- [ ] **Step 2: Smoke test** — espera ≥6 itens de `SITE.diferenciais`.
- [ ] **Step 3: Commit** — `git commit -m "feat: diferenciais grid"`

### Task 15: Galeria (opcional por flag)

**Files:** Create `web/components/sections/Galeria.tsx`.

- [ ] **Step 1: Implementar** — se `!SITE.flags.galeria` → `return null`. Senão grelha masonry de imagens `/generated/gallery-*.webp` (Task 20) com lightbox acessível (dialog + `Esc`/foco). Considerar componente de lightbox do 21st.
- [ ] **Step 2: Smoke test** — com `flags.galeria=false` render devolve vazio; com `true` mostra imagens.
- [ ] **Step 3: Commit** — `git commit -m "feat: optional gallery with lightbox"`

### Task 16: Planos (toggle + destaque)

**Files:** Modify `web/components/sections/Planos.tsx`, `web/components/ui/PlanoCard.tsx`.

**Interfaces — Consumes:** `PLANS` (Task existente), `waLink`.

- [ ] **Step 1:** `PlanoCard` — reestilizar com tokens Force Dark (`GlassCard`, `flame`), manter `precoLabel` e o link `waLink({plano})` e `destaque`→"MELHOR OFERTA".
- [ ] **Step 2:** `Planos` — `"use client"`; toggle **Avulso / Recorrente** que filtra `PLANS` (avulso = `forma==="avulso"`; recorrente = restantes). Grelha responsiva. Reveal `stagger`.
- [ ] **Step 3: Smoke test** — render, espera "Anual à Vista" e badge "MELHOR OFERTA".
- [ ] **Step 4: Commit** — `git commit -m "feat: planos with avulso/recorrente toggle"`

### Task 17: Depoimentos (carrossel)

**Files:** Create `web/components/sections/Depoimentos.tsx`.

**Interfaces — Consumes:** `SITE.reviews`.

- [ ] **Step 1: Implementar** — `"use client"`; carrossel de `SITE.reviews` (framer, auto-play pausável, setas + dots, `aria-roledescription="carousel"`), cada slide `GlassCard` com aspas, texto e "— {fonte}", 5★ no topo.
- [ ] **Step 2: Smoke test** — espera o texto da 1ª review de `SITE.reviews`.
- [ ] **Step 3: Commit** — `git commit -m "feat: testimonials carousel (real reviews)"`

### Task 18: Wellhub

**Files:** Create `web/components/sections/Wellhub.tsx`.

- [ ] **Step 1: Implementar** — faixa curta "Aceitamos Wellhub / Gympass" com selo (texto estilizado) + nota "treine com o seu plano Wellhub". `GlassCard` largo.
- [ ] **Step 2: Smoke test** — espera "Wellhub".
- [ ] **Step 3: Commit** — `git commit -m "feat: wellhub/gympass band"`

### Task 19: LojaTeaser (opcional por flag)

**Files:** Create `web/components/sections/LojaTeaser.tsx`.

- [ ] **Step 1: Implementar** — se `!SITE.flags.loja` → `null`. Senão faixa "Suplementos na academia" com chips de `SITE.store` + nota "Loja online em breve" + CTA WhatsApp `waLink({ plano: "Suplementos" })`.
- [ ] **Step 2: Smoke test** — flag on mostra "Whey Protein"; flag off → vazio.
- [ ] **Step 3: Commit** — `git commit -m "feat: optional supplements store teaser"`

### Task 20: Sobre, Localização, Contacto, Footer, FAB

**Files:** Modify `web/components/sections/{Sobre,Localizacao,Contacto}.tsx`, `web/components/layout/{Footer,WhatsappFab}.tsx`.

- [ ] **Step 1:** `Sobre` — copy institucional real ("Com atendimento humanizado, saúde e bem-estar num ambiente familiar e acolhedor. Nova academia em Capão da Canoa.") em layout editorial com tokens.
- [ ] **Step 2:** `Localizacao` — mapa (embed Google Maps da morada) + morada + `SITE.hours` + nota "mais movimentado às 20h". Tokens Force Dark.
- [ ] **Step 3:** `Contacto` — manter lógica `useActionState`+`submitLead` **intacta**; reestilizar inputs/botão com tokens (`flame`, `GlassCard`), manter os **3 estados** (loading/erro/sucesso) e o atalho WhatsApp. Trocar `inputClass` para tokens.
- [ ] **Step 4:** `Footer` — tokens, redes (Instagram `SITE.instagram`), morada, horário, links de âncora; wordmark.
- [ ] **Step 5:** `WhatsappFab` — reestilizar (glow `flame`), `aria-label`, `waLink()`.
- [ ] **Step 6: Smoke tests** — `Contacto` continua a mostrar sucesso quando `state.ok` (adaptar teste existente se necessário); Footer mostra `SITE.whatsappDisplay`.
- [ ] **Step 7: Commit** — `git commit -m "feat: restyle sobre/localizacao/contacto/footer/fab"`

### Task 21: Compor `page.tsx`

**Files:** Modify `web/app/page.tsx`.

- [ ] **Step 1: Implementar** (ordem da SPEC §8)

```tsx
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { Modalidades } from "@/components/sections/Modalidades";
import { PersonalTrainer } from "@/components/sections/PersonalTrainer";
import { Diferenciais } from "@/components/sections/Diferenciais";
import { Galeria } from "@/components/sections/Galeria";
import { Planos } from "@/components/sections/Planos";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Wellhub } from "@/components/sections/Wellhub";
import { LojaTeaser } from "@/components/sections/LojaTeaser";
import { Sobre } from "@/components/sections/Sobre";
import { Localizacao } from "@/components/sections/Localizacao";
import { Contacto } from "@/components/sections/Contacto";

export default function Home() {
  return (
    <>
      <Hero /><Stats /><Modalidades /><PersonalTrainer /><Diferenciais />
      <Galeria /><Planos /><Depoimentos /><Wellhub /><LojaTeaser />
      <Sobre /><Localizacao /><Contacto />
    </>
  );
}
```

- [ ] **Step 2: Verificar** — `npm run dev`, percorrer a página inteira; sem erros; âncoras funcionam.
- [ ] **Step 3: Commit** — `git commit -m "feat: compose redesigned homepage"`

---

## FASE 4 — Imagens (fal.ia)

### Task 22: Script de geração + integração

**Files:** Create `web/scripts/generate-images.mjs`, imagens em `web/public/generated/`.

- [ ] **Step 1: Escrever `generate-images.mjs`** — usa `@fal-ai/client`, lê `FAL_KEY` de `process.env`, **modelo mais barato** (confirmar entre `fal-ai/sana` / `fal-ai/flux/schnell` no momento e registar), lista de prompts (musculação/pilates/funcional/ambiente/detalhe) tratamento "dark, cinematic, orange accent light, modern gym", grava PNG/WebP em `public/generated/` com nomes previsíveis (`modalidade-musculacao.webp`, `gallery-1.webp`…).
- [ ] **Step 2: Gerar** — `FAL_KEY=... node scripts/generate-images.mjs` (o token é lido do ficheiro no Ambiente de Trabalho e exportado só para este comando; **não** é escrito em lado nenhum). Registar custo.
- [ ] **Step 3: Otimizar** — garantir `next/image` com `sizes` corretos nas secções; converter para WebP/AVIF se necessário.
- [ ] **Step 4: Verificar** — imagens aparecem em Modalidades/Galeria; Lighthouse não penaliza.
- [ ] **Step 5: Commit** — `git add web/scripts/generate-images.mjs web/public/generated/ && git commit -m "feat: fal.ia image generation script + generated placeholders"`

> ⚠️ Imagens são **placeholder de IA**; substituir por fotos reais quando o cliente as der. Não commitar o token.

---

## FASE 5 — Reskin áreas de aluno/instrutor

### Task 23: Aplicar tokens às áreas autenticadas

**Files:** Modify `web/app/{login,aluno,instrutor}/**`, `web/components/{auth,instrutor}/**`.

- [ ] **Step 1:** Substituir classes `bm-*` antigas por tokens Force Dark; aplicar fontes; manter **toda** a lógica, RLS e fluxos intactos.
- [ ] **Step 2: Verificar** — testes de roles/auth continuam verdes (`npx vitest run`); login/aluno/instrutor renderizam com o novo tema.
- [ ] **Step 3: Commit** — `git commit -m "style: reskin aluno/instrutor areas with Force Dark tokens"`

---

## FASE 6 — Qualidade & entrega

### Task 24: A11y + reduced-motion + E2E

**Files:** Modify `web/e2e/lead-flow.spec.ts`; add `web/e2e/nav-3d.spec.ts`.

- [ ] **Step 1:** Confirmar `prefers-reduced-motion` desliga 3D/animações (teste E2E com `emulateMedia({ reducedMotion: "reduce" })` verificando fallback presente e canvas ausente).
- [ ] **Step 2:** E2E de navegação por âncoras + smoke do lead (mantido).
- [ ] **Step 3:** Sweep a11y manual (foco, `alt`, contraste, teclado no carrossel/lightbox/FAB).
- [ ] **Step 4: Correr** — `npm run test:e2e` → PASS. **Commit.**

### Task 25: Performance

- [ ] **Step 1:** `npm run build` — sem erros; verificar que o bundle 3D é chunk separado (lazy).
- [ ] **Step 2:** Lighthouse (mobile) em `/` — alvo Performance ≥ 90, A11y ≥ 90. Corrigir regressões (imagens, LCP do hero).
- [ ] **Step 3: Commit** de otimizações — `git commit -m "perf: optimize images and 3D loading"`

### Task 26: Revisão & verificação

- [ ] **Step 1:** Invocar `superpowers:requesting-code-review` sobre o diff da branch.
- [ ] **Step 2:** Corrigir CRITICAL/HIGH.
- [ ] **Step 3:** Invocar `superpowers:verification-before-completion` (lint verde, testes verdes, build verde, reportar honestamente).
- [ ] **Step 4:** Atualizar `STATE.md`/`BRAIN.md` do projeto. Abrir PR `redesign/force-dark` → `main` com sumário + plano de teste.

---

## Self-Review (cobertura da SPEC)

- §3 Sistema de design → Tasks 2, 3. ✅
- §3.4 Wordmark → Task 4. ✅
- §4 3D partículas + fallbacks → Tasks 6, 8. ✅
- §5 Motion → Tasks 7 + uso em secções. ✅
- §6 Imagens fal.ia (mais barato, token seguro) → Task 22. ✅
- §7 21st.dev → Tasks 15/17 (lightbox, carrossel). ✅
- §8 15 secções → Tasks 9–21. ✅
- §9 Conteúdo/dados → Task 5. ✅
- §10 Reskin aluno → Task 23. ✅
- §11 Responsivo/a11y/perf → Tasks 24, 25. ✅
- §13 Testes → Tasks 5,6,8 + smokes por secção + 24. ✅
- §15 Riscos (Next16 docs, token, leads intactos) → Global Constraints + Tasks 8, 20, 22. ✅

**Notas de placeholder assumidas (não são falhas):** o refinamento visual fino de cada secção, a afinação das formas 3D e o wordmark final são feitos **ao vivo durante a execução** com as skills `impeccable`, `threejs-*` e `framer-motion-animator` + companheiro visual — é o processo correto para trabalho de design, não conteúdo em falta. A lógica e as interfaces estão todas definidas.
