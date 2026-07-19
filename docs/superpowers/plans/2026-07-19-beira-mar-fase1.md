# Beira Mar — Fase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar o site institucional da Academia Beira Mar (Fase 1): apresentação, planos, captação de leads e conversão por WhatsApp.

**Architecture:** App Next.js 15 (App Router) de uma página (homepage com secções + âncoras). Conteúdo estático (modalidades, planos, diferenciais) vem de módulos de dados tipados. O único fluxo dinâmico é o formulário de lead, que grava numa tabela Supabase via Server Action, validada com Zod. Componentes de secção pequenos e focados.

**Tech Stack:** Next.js 15, React 19, TypeScript strict, Tailwind CSS v4, Supabase (Postgres), Drizzle ORM, Zod, Biome, Vitest (unit/integração), Playwright (E2E).

## Global Constraints

- TypeScript **strict**; zero `any`/`as` cego — usar `satisfies` ou Zod.
- **Zod** valida: env, dados de plano, payload do formulário.
- **Imutabilidade** — nunca mutar; criar cópias.
- **3 estados de UX** (a carregar / vazio / erro) em todo o fluxo assíncrono.
- **Ficheiros focados** (200–400 linhas típico, 800 máx). Um componente por secção.
- **Biome** limpo antes de cada commit.
- **Cores:** preto `#1A1A1A` · branco/creme `#F5F0E8` · laranja `#E8541E` (tokens, afináveis).
- **Sem secrets no código** — Supabase via env; `.env.local` fora do git.
- **Commits:** conventional commits em EN + trailer `Assinado-por: DH — CMTecnologia`.
- **Dados oficiais:** WhatsApp (51) 99744-2463 · IG @academiabeiramar · Av. Paraguassu, 78, Jardim Beira Mar, Capão da Canoa – RS · Horário Seg–Sex 05:30–22:00, Sáb 10:00–16:00, Dom fechado.

---

## File Structure

```
beira-mar/
  app/
    layout.tsx              # root layout, fontes, metadata, tema
    page.tsx                # homepage: monta as secções por ordem
    globals.css             # Tailwind v4 + tokens de cor
    actions/
      submit-lead.ts        # Server Action: valida (Zod) + grava lead
  components/
    layout/
      Header.tsx            # nav + âncoras
      Footer.tsx            # redes, endereço, horário
      WhatsappFab.tsx       # botão flutuante
    sections/
      Hero.tsx
      Modalidades.tsx
      PersonalTrainer.tsx
      Diferenciais.tsx
      Planos.tsx
      Sobre.tsx
      Localizacao.tsx
      Contacto.tsx          # formulário de lead (client component)
    ui/
      PlanoCard.tsx
      SectionTitle.tsx
  lib/
    plans.ts                # dados dos 10 planos (tipado)
    plans.schema.ts         # Zod schema do plano
    whatsapp.ts             # construtor de link wa.me
    env.ts                  # validação de env (Zod)
    lead.schema.ts          # Zod schema do formulário de lead
  db/
    schema.ts               # Drizzle: tabela leads
    client.ts               # cliente Drizzle/Supabase
  content/
    site.ts                 # constantes: contactos, horário, endereço, diferenciais
  tests/
    plans.test.ts
    whatsapp.test.ts
    lead.schema.test.ts
    submit-lead.test.ts
  e2e/
    lead-flow.spec.ts
  biome.json · tsconfig.json · next.config.ts · package.json · .env.example
```

---

### Task 0: Scaffold do projeto

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `biome.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.env.example`, `.gitignore`

- [ ] **Step 1: Criar app Next.js 15 + TS**

Na pasta `beira-mar/`:
```bash
npx create-next-app@latest . --ts --app --tailwind --eslint=false --src-dir=false --import-alias "@/*" --no-turbopack
```
Aceitar defaults. Confirma que gera `app/`, `tsconfig.json`, `package.json`.

- [ ] **Step 2: TypeScript strict**

Em `tsconfig.json`, garantir em `compilerOptions`: `"strict": true`, `"noUncheckedIndexedAccess": true`.

- [ ] **Step 3: Instalar dependências**

```bash
npm i zod drizzle-orm postgres
npm i -D @biomejs/biome drizzle-kit vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 4: Configurar Biome**

`biome.json`:
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 }
}
```

- [ ] **Step 5: Tokens de cor (Tailwind v4)**

Em `app/globals.css`, após `@import "tailwindcss";`:
```css
@theme {
  --color-bm-black: #1a1a1a;
  --color-bm-cream: #f5f0e8;
  --color-bm-orange: #e8541e;
}
body { background: var(--color-bm-black); color: var(--color-bm-cream); }
```

- [ ] **Step 6: `.env.example` + `.gitignore`**

`.env.example`:
```
DATABASE_URL="postgresql://..."   # Supabase (Session Pooler)
```
Confirmar que `.gitignore` inclui `.env*`, `node_modules`, `.next`.

- [ ] **Step 7: Build sanity**

Run: `npm run build`
Expected: build passa (página default do Next).

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js 15 + Tailwind v4 + Biome

Assinado-por: DH — CMTecnologia"
```

---

### Task 1: Conteúdo do site (constantes tipadas)

**Files:**
- Create: `content/site.ts`

**Interfaces:**
- Produces: `SITE` (objeto com `whatsapp`, `instagram`, `address`, `city`, `hours`, `diferenciais`, `tagline`).

- [ ] **Step 1: Escrever `content/site.ts`**

```ts
export const SITE = {
  name: "Academia Beira Mar",
  whatsapp: "5551997442463", // formato E.164 sem +
  whatsappDisplay: "(51) 99744-2463",
  instagram: "https://instagram.com/academiabeiramar",
  instagramHandle: "@academiabeiramar",
  address: "Av. Paraguassu, 78 — Jardim Beira Mar",
  city: "Capão da Canoa – RS, 95555-000",
  hours: [
    { dias: "Segunda a Sexta", horas: "05:30 – 22:00" },
    { dias: "Sábado", horas: "10:00 – 16:00" },
    { dias: "Domingo", horas: "Fechado" },
  ],
  tagline: "Saúde e bem-estar num ambiente familiar e acolhedor.",
  diferenciais: [
    "Aparelhos novos",
    "Estacionamento",
    "Academia nova e completa",
    "Ambiente familiar e acolhedor",
    "Atendimento humanizado",
    "Boa localização",
  ],
} as const;
```

- [ ] **Step 2: Commit**

```bash
git add content/site.ts
git commit -m "feat: add site content constants

Assinado-por: DH — CMTecnologia"
```

---

### Task 2: Dados dos planos (com schema Zod + teste)

**Files:**
- Create: `lib/plans.schema.ts`, `lib/plans.ts`, `tests/plans.test.ts`

**Interfaces:**
- Produces: `Plano` (type), `PLANS: Plano[]`. Campos: `id: string`, `nome: string`, `preco: number`, `parcelas?: number`, `forma: string`, `destaque?: boolean`.

- [ ] **Step 1: Schema Zod do plano** (`lib/plans.schema.ts`)

```ts
import { z } from "zod";
export const planoSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  preco: z.number().positive(),
  parcelas: z.number().int().positive().optional(),
  forma: z.string().min(1),
  destaque: z.boolean().optional(),
});
export type Plano = z.infer<typeof planoSchema>;
```

- [ ] **Step 2: Teste que falha** (`tests/plans.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { PLANS } from "@/lib/plans";
import { planoSchema } from "@/lib/plans.schema";

describe("PLANS", () => {
  it("tem os 10 planos oficiais", () => {
    expect(PLANS).toHaveLength(10);
  });
  it("todos válidos pelo schema", () => {
    for (const p of PLANS) expect(() => planoSchema.parse(p)).not.toThrow();
  });
  it("inclui a Anual à Vista a 999", () => {
    const anual = PLANS.find((p) => p.id === "anual-vista");
    expect(anual?.preco).toBe(999);
  });
});
```

- [ ] **Step 3: Correr — deve falhar**

Run: `npx vitest run tests/plans.test.ts`
Expected: FAIL (`@/lib/plans` não existe).

- [ ] **Step 4: Implementar `lib/plans.ts`** (dados do banner oficial)

```ts
import type { Plano } from "./plans.schema";

export const PLANS: Plano[] = [
  { id: "diaria", nome: "Diária", preco: 35, forma: "avulso" },
  { id: "semanal", nome: "Semanal", preco: 79, forma: "avulso" },
  { id: "quinzenal", nome: "Quinzenal", preco: 99, forma: "avulso" },
  { id: "mensal", nome: "Mensal", preco: 140, forma: "avulso" },
  { id: "mensal-recorrente", nome: "Mensal Recorrente", preco: 125, forma: "cartão" },
  { id: "mensal-dupla", nome: "Mensal Dupla", preco: 129, forma: "cada (2 pessoas)" },
  { id: "trimestral", nome: "Trimestral", preco: 125, parcelas: 3, forma: "cartão" },
  { id: "semestral", nome: "Semestral", preco: 119, parcelas: 6, forma: "cartão" },
  { id: "anual-parcelado", nome: "Anual Parcelado", preco: 99, parcelas: 12, forma: "cartão" },
  { id: "anual-vista", nome: "Anual à Vista", preco: 999, forma: "Pix ou dinheiro", destaque: true },
];
```

- [ ] **Step 5: Correr — deve passar**

Run: `npx vitest run tests/plans.test.ts`
Expected: PASS (3 testes).

- [ ] **Step 6: Commit**

```bash
git add lib/plans.ts lib/plans.schema.ts tests/plans.test.ts
git commit -m "feat: add typed plans data with zod schema and tests

Assinado-por: DH — CMTecnologia"
```

---

### Task 3: Construtor de link WhatsApp (com teste)

**Files:**
- Create: `lib/whatsapp.ts`, `tests/whatsapp.test.ts`

**Interfaces:**
- Produces: `waLink(opts?: { plano?: string }): string` → URL `https://wa.me/<num>?text=<encoded>`.

- [ ] **Step 1: Teste que falha** (`tests/whatsapp.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { waLink } from "@/lib/whatsapp";

describe("waLink", () => {
  it("usa o número oficial", () => {
    expect(waLink()).toContain("https://wa.me/5551997442463");
  });
  it("inclui o plano na mensagem, url-encoded", () => {
    const url = waLink({ plano: "Anual à Vista" });
    expect(url).toContain("Anual%20%C3%A0%20Vista");
  });
});
```

- [ ] **Step 2: Correr — deve falhar**

Run: `npx vitest run tests/whatsapp.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar** (`lib/whatsapp.ts`)

```ts
import { SITE } from "@/content/site";

export function waLink(opts?: { plano?: string }): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  const msg = opts?.plano
    ? `Olá! Tenho interesse no plano ${opts.plano}.`
    : "Olá! Quero saber mais sobre a Academia Beira Mar.";
  return `${base}?text=${encodeURIComponent(msg)}`;
}
```

- [ ] **Step 4: Correr — deve passar**

Run: `npx vitest run tests/whatsapp.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/whatsapp.ts tests/whatsapp.test.ts
git commit -m "feat: add whatsapp deep-link builder with tests

Assinado-por: DH — CMTecnologia"
```

---

### Task 4: Validação de env + base de dados (Drizzle/Supabase)

**Files:**
- Create: `lib/env.ts`, `db/schema.ts`, `db/client.ts`, `drizzle.config.ts`

**Interfaces:**
- Produces: `env.DATABASE_URL`; `leads` (tabela Drizzle); `db` (cliente).

- [ ] **Step 1: Validação de env** (`lib/env.ts`)

```ts
import { z } from "zod";
const schema = z.object({ DATABASE_URL: z.string().url() });
export const env = schema.parse(process.env);
```

- [ ] **Step 2: Schema Drizzle** (`db/schema.ts`)

```ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull(),
  interesse: text("interesse"),
  origem: text("origem").notNull().default("formulario-site"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 3: Cliente** (`db/client.ts`)

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";

const client = postgres(env.DATABASE_URL, { prepare: false });
export const db = drizzle(client);
```

- [ ] **Step 4: `drizzle.config.ts` + migração**

```ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```
Run (depois de criar projeto Supabase e pôr `DATABASE_URL` em `.env.local`):
`npx drizzle-kit push`
Expected: tabela `leads` criada.

> Nota: se o Supabase ainda não existir, este passo fica pendente; o resto do plano continua (o teste da Task 5 usa mock do `db`).

- [ ] **Step 5: Commit**

```bash
git add lib/env.ts db/ drizzle.config.ts
git commit -m "feat: add env validation and drizzle leads schema

Assinado-por: DH — CMTecnologia"
```

---

### Task 5: Captação de lead — schema + Server Action (com teste)

**Files:**
- Create: `lib/lead.schema.ts`, `app/actions/submit-lead.ts`, `tests/lead.schema.test.ts`, `tests/submit-lead.test.ts`

**Interfaces:**
- Consumes: `db`, `leads` (Task 4).
- Produces: `leadSchema`; `submitLead(prev, formData): Promise<LeadResult>` onde `LeadResult = { ok: true } | { ok: false; error: string }`.

- [ ] **Step 1: Schema do lead** (`lib/lead.schema.ts`)

```ts
import { z } from "zod";
export const leadSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  telefone: z.string().min(8, "Telefone inválido"),
  interesse: z.string().optional(),
});
export type LeadInput = z.infer<typeof leadSchema>;
```

- [ ] **Step 2: Teste do schema** (`tests/lead.schema.test.ts`)

```ts
import { describe, it, expect } from "vitest";
import { leadSchema } from "@/lib/lead.schema";

describe("leadSchema", () => {
  it("aceita lead válido", () => {
    expect(leadSchema.safeParse({ nome: "Ana", telefone: "51999999999" }).success).toBe(true);
  });
  it("rejeita nome curto", () => {
    expect(leadSchema.safeParse({ nome: "A", telefone: "51999999999" }).success).toBe(false);
  });
});
```

- [ ] **Step 3: Correr — deve falhar**, depois criar a Server Action.

Run: `npx vitest run tests/lead.schema.test.ts` → FAIL → implementar Step 1 → PASS.

- [ ] **Step 4: Server Action** (`app/actions/submit-lead.ts`)

```ts
"use server";
import { leadSchema } from "@/lib/lead.schema";
import { db } from "@/db/client";
import { leads } from "@/db/schema";

export type LeadResult = { ok: true } | { ok: false; error: string };

export async function submitLead(_prev: LeadResult | null, formData: FormData): Promise<LeadResult> {
  const parsed = leadSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    interesse: formData.get("interesse") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }
  try {
    await db.insert(leads).values(parsed.data);
    return { ok: true };
  } catch {
    return { ok: false, error: "Erro ao enviar. Tenta novamente." };
  }
}
```

- [ ] **Step 5: Teste da action com `db` mockado** (`tests/submit-lead.test.ts`)

```ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/db/client", () => ({
  db: { insert: () => ({ values: vi.fn().mockResolvedValue(undefined) }) },
}));

import { submitLead } from "@/app/actions/submit-lead";

function fd(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

describe("submitLead", () => {
  it("ok com dados válidos", async () => {
    const r = await submitLead(null, fd({ nome: "Ana", telefone: "51999999999" }));
    expect(r).toEqual({ ok: true });
  });
  it("erro com nome curto", async () => {
    const r = await submitLead(null, fd({ nome: "A", telefone: "51999999999" }));
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 6: Correr — deve passar**

Run: `npx vitest run tests/submit-lead.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add lib/lead.schema.ts app/actions/submit-lead.ts tests/lead.schema.test.ts tests/submit-lead.test.ts
git commit -m "feat: add lead capture server action with validation and tests

Assinado-por: DH — CMTecnologia"
```

---

### Task 6: Componentes UI base (PlanoCard, SectionTitle)

**Files:**
- Create: `components/ui/SectionTitle.tsx`, `components/ui/PlanoCard.tsx`

**Interfaces:**
- Consumes: `Plano` (Task 2), `waLink` (Task 3).
- Produces: `<SectionTitle>`, `<PlanoCard plano={...} />`.

- [ ] **Step 1: `SectionTitle.tsx`** — título de secção (creme, com sublinhado laranja).

```tsx
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl md:text-4xl font-extrabold text-bm-cream">
      <span className="border-b-4 border-bm-orange pb-1">{children}</span>
    </h2>
  );
}
```

- [ ] **Step 2: `PlanoCard.tsx`** — card de plano com preço formatado e CTA WhatsApp.

```tsx
import type { Plano } from "@/lib/plans.schema";
import { waLink } from "@/lib/whatsapp";

function precoLabel(p: Plano): string {
  const val = p.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return p.parcelas ? `${p.parcelas}× de ${val}` : val;
}

export function PlanoCard({ plano }: { plano: Plano }) {
  return (
    <div className={`rounded-2xl border p-6 ${plano.destaque ? "border-bm-orange" : "border-white/10"} bg-white/5`}>
      <h3 className="text-lg font-bold text-bm-cream">{plano.nome}</h3>
      <p className="mt-2 text-2xl font-extrabold text-bm-orange">{precoLabel(plano)}</p>
      <p className="text-sm text-bm-cream/60">{plano.forma}</p>
      <a href={waLink({ plano: plano.nome })} target="_blank" rel="noopener noreferrer"
         className="mt-4 inline-block rounded-lg bg-bm-orange px-4 py-2 font-semibold text-bm-black">
        EU QUERO
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add components/ui/
git commit -m "feat: add SectionTitle and PlanoCard UI components

Assinado-por: DH — CMTecnologia"
```

---

### Task 7: Secções de conteúdo (Hero, Modalidades, Personal, Diferenciais, Planos, Sobre, Localização)

**Files:**
- Create: `components/sections/*.tsx` (uma por secção)

**Interfaces:**
- Consumes: `SITE`, `PLANS`, `PlanoCard`, `SectionTitle`, `waLink`.
- Produces: cada `<Hero/>`, `<Modalidades/>`, etc.

> Estas são secções apresentacionais. São verificadas por: `tsc --noEmit`, render no browser, e o E2E da Task 10. Cada componente é pequeno e focado; usa placeholders de imagem (next/image com src de `/public/placeholder-*.jpg` ou gradientes) até às fotos reais.

- [ ] **Step 1: `Hero.tsx`** — full-height, fundo escuro, headline + subheadline, dois CTAs (`waLink()` "Matricular" e âncora `#planos` "Ver planos"), logo.
- [ ] **Step 2: `Modalidades.tsx`** — grid 3 cards: Musculação, Pilates, Funcional (ícone + descrição curta).
- [ ] **Step 3: `PersonalTrainer.tsx`** — banner destaque do serviço extra + CTA WhatsApp.
- [ ] **Step 4: `Diferenciais.tsx`** — mapeia `SITE.diferenciais` em pills/cards.
- [ ] **Step 5: `Planos.tsx`** — `SectionTitle` + grid de `PlanoCard` sobre `PLANS`. `id="planos"`.
- [ ] **Step 6: `Sobre.tsx`** — `SITE.tagline` + parágrafo institucional (placeholder afinável).
- [ ] **Step 7: `Localizacao.tsx`** — endereço (`SITE.address`, `SITE.city`), horário (`SITE.hours`), iframe Google Maps embed da morada. `id="localizacao"`.
- [ ] **Step 8: Verificar tipos** — `npx tsc --noEmit` → sem erros.
- [ ] **Step 9: Commit**

```bash
git add components/sections/
git commit -m "feat: add content sections (hero, modalidades, planos, etc.)

Assinado-por: DH — CMTecnologia"
```

---

### Task 8: Formulário de contacto com 3 estados de UX (client component)

**Files:**
- Create: `components/sections/Contacto.tsx`

**Interfaces:**
- Consumes: `submitLead` (Task 5), `SITE`, `waLink`.
- Produces: `<Contacto/>` com `id="contacto"`.

- [ ] **Step 1: Implementar** com `useActionState` (React 19) cobrindo os 3 estados.

```tsx
"use client";
import { useActionState } from "react";
import { submitLead, type LeadResult } from "@/app/actions/submit-lead";
import { SITE } from "@/content/site";
import { waLink } from "@/lib/whatsapp";

export function Contacto() {
  const [state, action, pending] = useActionState<LeadResult | null, FormData>(submitLead, null);
  return (
    <section id="contacto" className="mx-auto max-w-lg px-4 py-16">
      {state?.ok ? (
        <p className="rounded-lg bg-green-600/20 p-4 text-bm-cream">Recebemos o teu contacto! Em breve falamos contigo. 💪</p>
      ) : (
        <form action={action} className="space-y-4">
          <input name="nome" required placeholder="O teu nome"
                 className="w-full rounded-lg bg-white/5 p-3 text-bm-cream" />
          <input name="telefone" required placeholder="Telefone / WhatsApp"
                 className="w-full rounded-lg bg-white/5 p-3 text-bm-cream" />
          <input name="interesse" placeholder="Plano/modalidade de interesse (opcional)"
                 className="w-full rounded-lg bg-white/5 p-3 text-bm-cream" />
          {state && !state.ok && <p className="text-sm text-red-400">{state.error}</p>}
          <button type="submit" disabled={pending}
                  className="w-full rounded-lg bg-bm-orange p-3 font-bold text-bm-black disabled:opacity-60">
            {pending ? "A enviar…" : "Quero começar"}
          </button>
          <a href={waLink()} className="block text-center text-sm text-bm-orange">ou fala connosco no WhatsApp</a>
        </form>
      )}
    </section>
  );
}
```

Estados: **a carregar** (`pending`), **vazio/inicial** (form limpo), **erro** (`state.error`), sucesso (mensagem).

- [ ] **Step 2: Verificar tipos** — `npx tsc --noEmit`.
- [ ] **Step 3: Commit**

```bash
git add components/sections/Contacto.tsx
git commit -m "feat: add lead contact form with loading/error/success states

Assinado-por: DH — CMTecnologia"
```

---

### Task 9: Layout, Header, Footer, WhatsApp flutuante e montagem da homepage

**Files:**
- Create: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, `components/layout/WhatsappFab.tsx`
- Modify: `app/layout.tsx`, `app/page.tsx`

**Interfaces:**
- Consumes: todas as secções + `SITE`.

- [ ] **Step 1: `Header.tsx`** — nav com âncoras (#planos, #localizacao, #contacto) + logo; responsivo (menu mobile).
- [ ] **Step 2: `Footer.tsx`** — `SITE.address`, `SITE.city`, `SITE.hours`, links IG/WhatsApp.
- [ ] **Step 3: `WhatsappFab.tsx`** — botão fixo bottom-right com `waLink()`.
- [ ] **Step 4: `app/layout.tsx`** — metadata (title, description, og), fonte (next/font), Header + children + Footer + WhatsappFab. `lang="pt-BR"`.
- [ ] **Step 5: `app/page.tsx`** — montar por ordem: Hero, Modalidades, PersonalTrainer, Diferenciais, Planos, Sobre, Localizacao, Contacto.

```tsx
import { Hero } from "@/components/sections/Hero";
import { Modalidades } from "@/components/sections/Modalidades";
import { PersonalTrainer } from "@/components/sections/PersonalTrainer";
import { Diferenciais } from "@/components/sections/Diferenciais";
import { Planos } from "@/components/sections/Planos";
import { Sobre } from "@/components/sections/Sobre";
import { Localizacao } from "@/components/sections/Localizacao";
import { Contacto } from "@/components/sections/Contacto";

export default function Home() {
  return (
    <>
      <Hero />
      <Modalidades />
      <PersonalTrainer />
      <Diferenciais />
      <Planos />
      <Sobre />
      <Localizacao />
      <Contacto />
    </>
  );
}
```

- [ ] **Step 6: Build** — `npm run build` → passa.
- [ ] **Step 7: Commit**

```bash
git add app/ components/layout/
git commit -m "feat: assemble homepage with header, footer and floating whatsapp

Assinado-por: DH — CMTecnologia"
```

---

### Task 10: E2E do fluxo de lead (Playwright)

**Files:**
- Create: `e2e/lead-flow.spec.ts`, `playwright.config.ts`

- [ ] **Step 1: Config Playwright** (`playwright.config.ts`) — baseURL `http://localhost:3000`, webServer `npm run dev`.

- [ ] **Step 2: Teste E2E** (`e2e/lead-flow.spec.ts`)

```ts
import { test, expect } from "@playwright/test";

test("homepage mostra planos e envia lead", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Anual à Vista")).toBeVisible();
  await page.getByPlaceholder("O teu nome").fill("Ana Teste");
  await page.getByPlaceholder("Telefone / WhatsApp").fill("51999999999");
  await page.getByRole("button", { name: /quero começar/i }).click();
  await expect(page.getByText(/recebemos o teu contacto/i)).toBeVisible();
});
```

> Requer Supabase configurado (ou um mock/seed de teste). Se ainda não houver DB, marcar `test.skip` com nota e correr após a Task 4/Step 4.

- [ ] **Step 3: Correr** — `npx playwright test` → PASS (com DB) ou skip documentado.
- [ ] **Step 4: Commit**

```bash
git add e2e/ playwright.config.ts
git commit -m "test: add e2e lead flow

Assinado-por: DH — CMTecnologia"
```

---

### Task 11: Verificação final + responsividade + acessibilidade

- [ ] **Step 1:** `npx biome check --write .` → sem erros.
- [ ] **Step 2:** `npx tsc --noEmit` → sem erros.
- [ ] **Step 3:** `npx vitest run` → todos os testes passam (cobertura alvo 80%).
- [ ] **Step 4:** `npm run build` → verde.
- [ ] **Step 5:** Rever no browser (mobile 375px e desktop): contraste creme/laranja sobre preto legível, CTAs a abrir WhatsApp, form a validar e a gravar.
- [ ] **Step 6:** Invocar `superpowers:verification-before-completion` e reportar honestamente.
- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: final verification, lint and a11y pass for Fase 1

Assinado-por: DH — CMTecnologia"
```

---

## Self-Review

**Spec coverage:** SPEC §4 (secções) → Tasks 7–9. §5 (planos) → Task 2/6/7. §6 (funcionalidades: WhatsApp → Task 3; form/leads/3-estados → Tasks 5/8; social/mapa → Tasks 7/9) ✔. §7 (stack) → Task 0. §8 (modelo de dados) → Task 4. §9/§10 (deps externas / fora de âmbito) → sem tarefas (correto). Pagamento online: preparado via dados de plano + interface, integração fora da Fase 1 (conforme spec). ✔

**Placeholders:** imagens/textos são placeholders **intencionais** (decisão de conteúdo da spec), não lacunas de plano. Sem "TBD" em lógica.

**Type consistency:** `Plano`, `LeadInput`, `LeadResult`, `waLink`, `submitLead`, `SITE`, `PLANS` usados de forma consistente entre tarefas.

**Dependência de ambiente:** Tasks 4/10 dependem do Supabase; documentado que não bloqueiam as restantes (mock nos testes unit/integração).
