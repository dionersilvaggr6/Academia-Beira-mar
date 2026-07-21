# SPEC — Fase 2A: Login + Papéis + Treinos

> Área de aluno da Academia Beira Mar — sub-fase A (fundação).
> Estado: **design aprovado** (2026-07-20) → aguarda revisão da SPEC pelo Henrique.
> Responsável: Henrique (DH) — CMTecnologia. Base: [SPEC.md](../../../SPEC.md) (Fase 1, já no ar).

---

## 1. Objetivo

Dar login à academia: o **instrutor** cria contas de alunos e monta-lhes treinos;
o **aluno** entra e vê os seus treinos. É a fundação de autenticação + papéis sobre a
qual as fases 2B (agenda) e 2C (plano/avaliação) vão assentar.

**Sucesso da 2A:** um instrutor consegue criar um aluno (por convite), montar-lhe treinos
por divisão, e o aluno consegue entrar e ver só os seus treinos — de forma segura.

---

## 2. Âmbito

**Inclui:**
- Autenticação (Supabase Auth): login email+senha, convite, definir senha.
- Papéis: `aluno` e `instrutor`.
- Painel do instrutor: listar/criar alunos (convite), montar treinos (divisões + exercícios).
- Área do aluno: ver as suas divisões e exercícios.
- Segurança por RLS (cada aluno só vê o seu; instrutor gere os seus alunos).

**NÃO inclui (fica para 2B/2C):**
- Agenda de aulas e reservas (2B).
- Situação do plano / pagamento (2C).
- Avaliação física / evolução (2C).
- Registo aberto ao público — **contas só nascem quando o aluno adquire um plano**.

---

## 3. Papéis e acesso

| Papel | Como nasce | O que pode |
|-------|-----------|-----------|
| **instrutor** | 1º criado à mão (bootstrap); os seguintes **convidados por outro instrutor** | Gerir **todos** os alunos e treinos; convidar alunos e outros instrutores |
| **aluno** | Criado por um instrutor (após fechar plano) via convite | Ver só os seus treinos; definir/alterar a sua senha |

> **Nota (ponto 3):** qualquer instrutor pode criar/editar os treinos de **qualquer** aluno.
> O campo `created_by` fica só para registo (auditoria), não limita permissões.

---

## 4. Fluxos

**Criar aluno (instrutor):**
1. Instrutor entra em `/instrutor` → "Novo aluno" → introduz nome + email (+ telefone).
2. O sistema cria o utilizador no Supabase Auth e envia **convite por email**.
3. O aluno recebe o email → clica → **define a própria senha** → fica com acesso a `/aluno`.

**Criar instrutor (qualquer instrutor):**
1. Em `/instrutor` → "Novo instrutor" → nome + email.
2. Envia convite com papel `instrutor`; o novo instrutor define a senha e passa a gerir tudo.
3. O **1º instrutor** de todos é criado à mão no arranque (bootstrap).

**Montar treino (instrutor):**
1. No painel, escolhe um aluno → "Treinos".
2. Cria uma **divisão** (ex.: "Treino A — Peito/Tríceps").
3. Adiciona **exercícios** (nome, séries, repetições, carga, observações).

**Aluno usa:**
1. Entra em `/login` (email+senha) → `/aluno`.
2. Vê as suas divisões (A, B, C…) → clica numa → vê os exercícios.

---

## 5. Modelo de dados (novas tabelas)

Sobre o `auth.users` (gerido pelo Supabase Auth):

**profiles** — 1:1 com o utilizador auth
- `id` (uuid, pk, = auth.users.id)
- `nome` (text)
- `role` (text: `aluno` | `instrutor`)
- `telefone` (text, opcional)
- `created_at` (timestamp)

**treinos** — uma divisão de treino de um aluno
- `id` (uuid, pk)
- `aluno_id` (uuid, fk → profiles.id)
- `nome` (text, ex.: "Treino A")
- `foco` (text, opcional, ex.: "Peito/Tríceps")
- `ordem` (int)
- `created_by` (uuid, fk → profiles.id do instrutor)
- `created_at` (timestamp)

**exercicios** — exercício dentro de uma divisão
- `id` (uuid, pk)
- `treino_id` (uuid, fk → treinos.id)
- `nome` (text)
- `series` (int)
- `repeticoes` (text, ex.: "10-12")
- `carga` (text, opcional, ex.: "20kg")
- `observacoes` (text, opcional)
- `ordem` (int)

---

## 6. Segurança (prioridade CM — dados de alunos)

- **RLS (Row Level Security)** ativa nas 3 tabelas:
  - `aluno` só faz SELECT dos treinos/exercícios onde `aluno_id = auth.uid()`.
  - `instrutor` faz SELECT/INSERT/UPDATE/DELETE em **todos** os treinos/exercícios e alunos.
  - `profiles`: cada um lê o seu; instrutor lê e gere todos.
  - O papel é verificado por uma função segura (ex.: `is_instrutor()`) usada nas políticas.
- **Sessões** via cookies do Supabase (`@supabase/ssr`); páginas `/aluno` e `/instrutor`
  protegidas por **middleware** do Next.js (redireciona quem não tem sessão/papel).
- **Convites e criação de utilizadores** usam a **service role key** do Supabase —
  **só no servidor** (Server Action), nunca no cliente, nunca no git (env).
- **Sem PII em logs.** Nunca logar emails/senhas/dados de aluno.
- Validação com **Zod** em todas as entradas (convite, treino, exercício).

---

## 7. Páginas / rotas

- `/login` — entrar (email+senha); tratar callback de convite (definir senha).
- `/aluno` — lista de divisões do aluno → detalhe de exercícios. (protegida: papel aluno)
- `/instrutor` — lista de alunos; criar aluno; montar treinos/exercícios. (protegida: papel instrutor)
- `middleware.ts` — protege `/aluno` e `/instrutor`, redireciona por sessão/papel.
- Cobrir **3 estados de UX** (a carregar / vazio / erro) em todos os fluxos assíncronos.

---

## 8. Stack técnica (adições à Fase 1)

- **Supabase Auth** + **@supabase/supabase-js** + **@supabase/ssr** (sessões no Next.js)
- **Drizzle** para as 3 tabelas; políticas **RLS** via migração SQL
- **Zod** (validação), **Biome**, **TypeScript strict** — como na Fase 1
- Testes: **Vitest** (unit/integração) + **Playwright** (E2E contra base de TESTE, nunca produção)

---

## 9. Dependências (a preparar; não bloqueiam o desenho)

- **1º instrutor** — criado manualmente no arranque (bootstrap); os seguintes por convite.
- **Envio de emails de convite** — **email por defeito do Supabase** (sem SMTP próprio por agora).
- **Service role key** do Supabase → adicionar ao `.env.local` e à Vercel (env do servidor).
- **Base de dados de TESTE/staging** — para o E2E não escrever na produção (dívida herdada da Fase 1).

---

## 10. Questões em aberto — RESOLVIDAS (2026-07-20)

1. ✅ **Emails de convite:** usar o **email por defeito do Supabase**.
2. ✅ **Instrutores:** 1º criado à mão (bootstrap); os seguintes **convidados por outro instrutor** no painel.
3. ✅ **Permissões:** **qualquer instrutor** cria/edita treinos de **qualquer** aluno (não há dono).

(Sem questões em aberto — pronto para o plano.)
