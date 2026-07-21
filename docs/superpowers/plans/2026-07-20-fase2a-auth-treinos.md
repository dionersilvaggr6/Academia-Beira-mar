# Fase 2A — Login + Papéis + Treinos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Área de aluno com login: instrutor cria alunos (convite) e monta treinos por divisão; aluno entra e vê só os seus treinos — com segurança (RLS).

**Architecture:** Autenticação e dados protegidos via **Supabase Auth + @supabase/ssr** (cliente server/browser + middleware). As 3 tabelas novas são definidas em Drizzle e protegidas por **RLS** no Postgres; as leituras/escritas passam pelo **cliente Supabase autenticado** (JWT do utilizador → RLS aplica-se). Convites e criação de utilizadores usam a **service role key**, só em Server Actions.

**Tech Stack:** Next.js 16 (App Router), React 19, TS strict, Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`), Drizzle (schema/migração), Zod, Biome, Vitest, Playwright.

## Global Constraints

- App em `beira-mar/web/`. Todos os caminhos são relativos a essa pasta salvo indicação.
- TypeScript **strict**; zero `any`/`as` cego — Zod ou `satisfies`.
- **Zod** valida toda a entrada (convite, treino, exercício).
- **3 estados de UX** (a carregar / vazio / erro) em todo o fluxo assíncrono.
- **Segurança:** RLS ativa; proteção de rotas por `getUser()` no servidor (nunca `getSession()`); **service role key só no servidor**, nunca `NEXT_PUBLIC_`, nunca no git; **sem PII em logs**.
- Ficheiros focados (200–400 linhas típico). Biome limpo antes de cada commit.
- **Env novas:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas), `SUPABASE_SERVICE_ROLE_KEY` (server-only).
- **Commits:** conventional commits em EN + trailer `Assinado-por: DH — CMTecnologia`.
- **E2E que escreve na BD:** só contra base de TESTE (`E2E_ALLOW_DB=1`), nunca produção (regra herdada da Fase 1).

---

## File Structure

```
web/
  lib/supabase/
    server.ts        # createClient() server (cookies)
    client.ts        # createClient() browser
    middleware.ts    # updateSession()
    admin.ts         # createAdminClient() — service role, server-only
  lib/auth/
    profile.ts       # getUser(), getProfile(), requireRole()
  lib/schemas/
    invite.schema.ts # Zod: convidar aluno/instrutor
    treino.schema.ts # Zod: treino + exercicio
  db/
    schema.ts        # (+) profiles, treinos, exercicios
    rls.sql          # políticas RLS + is_instrutor()
  app/
    middleware.ts    # raiz: chama updateSession
    login/page.tsx           # entrar
    definir-senha/page.tsx   # callback de convite
    aluno/page.tsx           # área do aluno (lista divisões)
    aluno/[treinoId]/page.tsx# exercícios de uma divisão
    instrutor/page.tsx       # painel: alunos + criar
    instrutor/aluno/[id]/page.tsx # gerir treinos de um aluno
    actions/
      auth.ts        # login, logout, definir senha
      pessoas.ts     # convidar aluno/instrutor (service role)
      treinos.ts     # criar/editar treino + exercícios
  components/aluno/  e  components/instrutor/  (UI)
  tests/  e  e2e/
```

---

### Task 0: Dependências, env e clientes Supabase

**Files:** Create `lib/supabase/{server,client,middleware,admin}.ts`, `middleware.ts`; Modify `.env.example`.

- [ ] **Step 1: Instalar deps** — `npm i @supabase/supabase-js @supabase/ssr`
- [ ] **Step 2: `.env.example`** — acrescentar:
```
NEXT_PUBLIC_SUPABASE_URL="https://<projeto>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service role key — SERVER ONLY>"
```
- [ ] **Step 3: `lib/supabase/server.ts`**
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* Server Component: o middleware trata */ }
        },
      },
    },
  );
}
```
- [ ] **Step 4: `lib/supabase/client.ts`**
```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```
- [ ] **Step 5: `lib/supabase/middleware.ts`** (updateSession — refresca sessão)
```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    },
  );
  await supabase.auth.getUser();
  return response;
}
```
- [ ] **Step 6: `middleware.ts`** (raiz de web/)
```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
export async function middleware(request: NextRequest) { return updateSession(request); }
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"] };
```
- [ ] **Step 7: `lib/supabase/admin.ts`** (service role — só servidor)
```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
```
- [ ] **Step 8: Build sanity** — `npm run build` → passa.
- [ ] **Step 9: Commit** — `feat: add supabase auth clients and middleware` + trailer DH.

> Dependência: as 3 env vars têm de existir em `.env.local` (Supabase → Settings → API). Sem elas, os passos de runtime/E2E ficam pendentes; o build passa (as chaves são lidas em runtime).

---

### Task 1: Schema das tabelas (Drizzle) + push

**Files:** Modify `db/schema.ts`.

**Interfaces:** Produces tabelas `profiles`, `treinos`, `exercicios` (nomes/colunas conforme SPEC §5).

- [ ] **Step 1: Acrescentar a `db/schema.ts`**
```ts
import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // = auth.users.id
  nome: text("nome").notNull(),
  role: text("role").notNull().default("aluno"), // 'aluno' | 'instrutor'
  telefone: text("telefone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const treinos = pgTable("treinos", {
  id: uuid("id").defaultRandom().primaryKey(),
  alunoId: uuid("aluno_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  foco: text("foco"),
  ordem: integer("ordem").notNull().default(0),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercicios = pgTable("exercicios", {
  id: uuid("id").defaultRandom().primaryKey(),
  treinoId: uuid("treino_id").notNull().references(() => treinos.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  series: integer("series").notNull(),
  repeticoes: text("repeticoes").notNull(),
  carga: text("carga"),
  observacoes: text("observacoes"),
  ordem: integer("ordem").notNull().default(0),
});
```
- [ ] **Step 2: Verificar tipos** — `npx tsc --noEmit` → OK.
- [ ] **Step 3: Push** (com DATABASE_URL): `npx drizzle-kit push` → tabelas criadas.
- [ ] **Step 4: Commit** — `feat: add profiles, treinos, exercicios tables` + trailer DH.

---

### Task 2: RLS + função is_instrutor()

**Files:** Create `db/rls.sql`.

- [ ] **Step 1: `db/rls.sql`** — ativar RLS e políticas
```sql
alter table profiles enable row level security;
alter table treinos enable row level security;
alter table exercicios enable row level security;

-- função segura para saber se o utilizador atual é instrutor
create or replace function is_instrutor() returns boolean
language sql security definer stable as $$
  select exists(select 1 from profiles p where p.id = auth.uid() and p.role = 'instrutor');
$$;

-- profiles: cada um lê o seu; instrutor lê/gere todos
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_instrutor());
create policy profiles_instrutor_write on profiles for all using (is_instrutor()) with check (is_instrutor());
create policy profiles_self_update on profiles for update using (id = auth.uid());

-- treinos: aluno lê os seus; instrutor gere todos
create policy treinos_aluno_read on treinos for select using (aluno_id = auth.uid() or is_instrutor());
create policy treinos_instrutor_all on treinos for all using (is_instrutor()) with check (is_instrutor());

-- exercicios: seguem o dono do treino
create policy exercicios_read on exercicios for select using (
  is_instrutor() or exists(select 1 from treinos t where t.id = treino_id and t.aluno_id = auth.uid())
);
create policy exercicios_instrutor_all on exercicios for all using (is_instrutor()) with check (is_instrutor());
```
- [ ] **Step 2: Aplicar** — correr o SQL no Supabase (SQL Editor) OU `psql $DATABASE_URL -f db/rls.sql`.
- [ ] **Step 3: Commit** — `feat: add RLS policies and is_instrutor()` + trailer DH.

> Nota de verificação: um aluno autenticado não deve conseguir `select` treinos de outro (testar no passo E2E/manual).

---

### Task 3: Schemas Zod (convite, treino) + testes

**Files:** Create `lib/schemas/invite.schema.ts`, `lib/schemas/treino.schema.ts`, `tests/schemas.test.ts`.

**Interfaces:** Produces `inviteSchema` ({nome, email, role}), `treinoSchema`, `exercicioSchema`.

- [ ] **Step 1: `invite.schema.ts`**
```ts
import { z } from "zod";
export const inviteSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  role: z.enum(["aluno", "instrutor"]),
});
export type InviteInput = z.infer<typeof inviteSchema>;
```
- [ ] **Step 2: `treino.schema.ts`**
```ts
import { z } from "zod";
export const exercicioSchema = z.object({
  nome: z.string().min(1),
  series: z.number().int().positive(),
  repeticoes: z.string().min(1),
  carga: z.string().optional(),
  observacoes: z.string().optional(),
});
export const treinoSchema = z.object({
  alunoId: z.string().uuid(),
  nome: z.string().min(1, "Dá um nome à divisão"),
  foco: z.string().optional(),
});
export type TreinoInput = z.infer<typeof treinoSchema>;
export type ExercicioInput = z.infer<typeof exercicioSchema>;
```
- [ ] **Step 3: `tests/schemas.test.ts`** (falha primeiro → implementar → passa)
```ts
import { describe, expect, it } from "vitest";
import { inviteSchema } from "@/lib/schemas/invite.schema";
import { exercicioSchema } from "@/lib/schemas/treino.schema";

describe("inviteSchema", () => {
  it("aceita instrutor válido", () => {
    expect(inviteSchema.safeParse({ nome: "Ana", email: "a@b.com", role: "instrutor" }).success).toBe(true);
  });
  it("rejeita role inválido", () => {
    expect(inviteSchema.safeParse({ nome: "Ana", email: "a@b.com", role: "admin" }).success).toBe(false);
  });
});
describe("exercicioSchema", () => {
  it("exige séries positivas", () => {
    expect(exercicioSchema.safeParse({ nome: "Supino", series: 0, repeticoes: "10" }).success).toBe(false);
  });
});
```
- [ ] **Step 4:** `npx vitest run tests/schemas.test.ts` → PASS.
- [ ] **Step 5: Commit** — `feat: add invite and treino zod schemas with tests` + trailer DH.

---

### Task 4: Auth helpers (getUser, getProfile, requireRole)

**Files:** Create `lib/auth/profile.ts`, `tests/require-role.test.ts`.

**Interfaces:** Produces `getSessionUser()`, `getProfile()`, `requireRole(role): Promise<Profile>` (redireciona se não autorizado).

- [ ] **Step 1: `lib/auth/profile.ts`**
```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "aluno" | "instrutor";
export type Profile = { id: string; nome: string; role: Role; telefone: string | null };

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("id,nome,role,telefone").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) redirect(profile.role === "instrutor" ? "/instrutor" : "/aluno");
  return profile;
}
```
- [ ] **Step 2:** Teste unitário de `requireRole` com `getProfile`/`redirect` mockados (verifica: sem perfil → redirect /login; papel errado → redirect na área certa; papel certo → devolve profile). Correr → PASS.
- [ ] **Step 3: Commit** — `feat: add auth profile helpers and role guard` + trailer DH.

---

### Task 5: Login + definir senha (convite)

**Files:** Create `app/login/page.tsx`, `app/definir-senha/page.tsx`, `app/actions/auth.ts`, `components/auth/LoginForm.tsx`.

**Interfaces:** Consumes clientes Supabase. Produces `login(prev, formData)`, `logout()`.

- [ ] **Step 1: `app/actions/auth.ts`** — login/logout (Server Actions) com `supabase.auth.signInWithPassword` e `signOut`; devolve `{ok:false,error}` amigável em falha; redirect por papel em sucesso.
- [ ] **Step 2: `components/auth/LoginForm.tsx`** — client component com `useActionState`, 3 estados (a carregar/erro/normal), campos email+senha com `<label>` (a11y).
- [ ] **Step 3: `app/login/page.tsx`** — se já autenticado, redireciona pela `getProfile`; senão mostra `<LoginForm/>`.
- [ ] **Step 4: `app/definir-senha/page.tsx`** — client: lê a sessão do convite (Supabase trata o token no URL), pede nova senha, chama `supabase.auth.updateUser({ password })`, redireciona para `/aluno`.
- [ ] **Step 5: Build** — `npm run build` → passa. **Commit** — `feat: add login and set-password flow` + trailer DH.

---

### Task 6: Convidar pessoas + gerir treinos (Server Actions) + testes

**Files:** Create `app/actions/pessoas.ts`, `app/actions/treinos.ts`, `tests/actions.test.ts`.

**Interfaces:** Consumes `inviteSchema`, `treinoSchema`, `createAdminClient`, `requireRole`. Produces `convidarPessoa(prev, formData)`, `criarTreino(prev, formData)`, `criarExercicio(prev, formData)`.

- [ ] **Step 1: `app/actions/pessoas.ts`** — `convidarPessoa`:
  1. `await requireRole("instrutor")` (só instrutor).
  2. `inviteSchema.safeParse(...)` → erro amigável se inválido.
  3. `admin.auth.admin.inviteUserByEmail(email, { data: { nome, role } })`.
  4. Inserir/garantir linha em `profiles` (id do novo user, nome, role).
  5. `return {ok:true}` / catch → `console.error` (sem PII sensível) + `{ok:false,error}`.
- [ ] **Step 2: `app/actions/treinos.ts`** — `criarTreino` e `criarExercicio`: `requireRole("instrutor")` → validar Zod → inserir via cliente Supabase (RLS confirma instrutor) → revalidatePath.
- [ ] **Step 3: `tests/actions.test.ts`** — mock de `@/lib/auth/profile` (requireRole) e do cliente admin/supabase; casos: convite válido → ok; role inválido → erro; não-instrutor → bloqueado. Correr → PASS.
- [ ] **Step 4: Commit** — `feat: add invite and treino server actions with tests` + trailer DH.

---

### Task 7: Área do aluno (/aluno)

**Files:** Create `app/aluno/page.tsx`, `app/aluno/[treinoId]/page.tsx`, `components/aluno/*`.

- [ ] **Step 1: `app/aluno/page.tsx`** — `const profile = await requireRole("aluno")`; buscar as divisões do aluno via cliente Supabase (RLS devolve só as dele); lista com link para cada. Cobrir **vazio** ("Ainda não tens treinos") e **erro**.
- [ ] **Step 2: `app/aluno/[treinoId]/page.tsx`** — mostrar exercícios da divisão (nome, séries×reps, carga, obs). Estado vazio/erro.
- [ ] **Step 3: `tsc --noEmit` + build** → OK. **Commit** — `feat: add student area (aluno)` + trailer DH.

---

### Task 8: Painel do instrutor (/instrutor)

**Files:** Create `app/instrutor/page.tsx`, `app/instrutor/aluno/[id]/page.tsx`, `components/instrutor/*`.

- [ ] **Step 1: `app/instrutor/page.tsx`** — `requireRole("instrutor")`; lista de alunos (via RLS instrutor vê todos); botões "Novo aluno" e "Novo instrutor" (formulários que chamam `convidarPessoa` com o `role` certo). Estados vazio/erro.
- [ ] **Step 2: `app/instrutor/aluno/[id]/page.tsx`** — gerir treinos do aluno: form "Nova divisão" (`criarTreino`), e por divisão form "Novo exercício" (`criarExercicio`). Estados a carregar/erro.
- [ ] **Step 3: `tsc --noEmit` + build** → OK. **Commit** — `feat: add instructor panel` + trailer DH.

---

### Task 9: E2E do fluxo (base de TESTE)

**Files:** Create `e2e/aluno-treinos.spec.ts`.

- [ ] **Step 1: Teste** (skip por defeito, corre com `E2E_ALLOW_DB=1` contra staging): instrutor faz login → cria divisão para um aluno de teste → aluno faz login → vê a divisão. Usar contas de teste semeadas.
- [ ] **Step 2:** `npx playwright test` → o teste com DB fica **skipped** por defeito (sem escrever em produção). **Commit** — `test: add e2e for aluno/instrutor flow` + trailer DH.

---

### Task 10: Verificação + segurança + deploy

- [ ] **Step 1:** `npx biome check --write .` → limpo.
- [ ] **Step 2:** `npx tsc --noEmit` → OK.
- [ ] **Step 3:** `npx vitest run` → todos passam.
- [ ] **Step 4:** `npm run build` → verde.
- [ ] **Step 5: Revisão de segurança** — dispatch `security-reviewer` (foco: RLS cobre todos os caminhos; service role só no servidor; sem PII em logs; proteção de rotas por `getUser()`; nenhum segredo `NEXT_PUBLIC_` indevido).
- [ ] **Step 6: Verificação** — invocar `superpowers:verification-before-completion`; reportar honestamente.
- [ ] **Step 7: Deploy** — adicionar as 3 env vars na Vercel (Settings → Environment Variables), push → deploy automático. Confirmar login em produção.
- [ ] **Step 8: Commit** — `chore: fase 2A verification and security pass` + trailer DH.

---

## Self-Review

**Spec coverage:** §1/§2 objetivo/âmbito → Tasks 5-8. §3 papéis → Task 4 (requireRole) + Task 6 (convites). §4 fluxos → Tasks 5/6/8. §5 dados → Task 1. §6 segurança (RLS, sessões, service role, PII, Zod) → Tasks 0/2/4/6 + Task 10 (security review). §7 rotas/middleware → Tasks 0/5/7/8. §8 stack → Task 0. §9 dependências (bootstrap 1º instrutor, email default, service key, base de teste) → notas nas tasks. §10 (resolvido) ✔.

**Placeholders:** UI descrita a nível de comportamento (não é lacuna — é o mesmo tratamento da Fase 1); lógica e segurança têm código concreto. Sem "TBD".

**Type consistency:** `Profile`, `Role`, `requireRole`, `getProfile`, `inviteSchema`, `treinoSchema`, `exercicioSchema`, `convidarPessoa`, `criarTreino`, `criarExercicio`, clientes `createClient`/`createAdminClient` — usados de forma consistente.

**Dependência externa:** Tasks que tocam runtime/DB precisam das 3 env vars Supabase e do 1º instrutor (bootstrap). Documentado; não bloqueiam build/tsc.
