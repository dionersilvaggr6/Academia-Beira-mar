# STATE — Beira Mar

Snapshot determinístico. Atualizar a cada mudança de fase/tarefa.

## Fase
- **Atual:** Fase 1 — **COMPLETA e integrada na `main`** (2026-07-19)
- **Etapa do método:** todos os passos CM fechados (SPEC→plano→código→revisões→verificação→merge)
- **GitHub:** ✅ https://github.com/dionersilvaggr6/Academia-Beira-mar (branch main)
- **Vercel:** ✅ **NO AR** em https://academia-beira-mar.vercel.app (root=web, env DATABASE_URL set) — 2026-07-20
- **Próximo:** testar form→Supabase na produção · selo Gympass/bio · favicon/OG · fotos/logo reais

## Fase 2A (área de aluno — fundação)
- Design **aprovado** (2026-07-20): Supabase Auth (convite), papéis aluno/instrutor, treinos por divisão (A/B/C), RLS.
- SPEC escrita: docs/superpowers/specs/2026-07-20-fase2a-auth-treinos.md → **aguarda revisão do Henrique**
- Decomposição: 2A (login+treinos) → 2B (agenda) → 2C (plano+avaliação).
- Nota: Henrique optou por NÃO rotacionar a password Supabase (decisão dele). Token GitHub PAT exposto no chat — não revogado (decisão dele).

## Tarefas
- [x] Analisar site de referência (26fit)
- [x] Levantamento de requisitos (objetivo, modalidades, planos, estilo, cores)
- [x] Extrair planos e contactos do banner oficial
- [x] Aprovar desenho da Fase 1
- [x] Escrever SPEC.md
- [x] Revisão/aprovação da SPEC pelo Henrique
- [x] Resolver pontos em aberto (diferenciais, unidade, horário via ficha Google)
- [x] Plano de implementação (writing-plans) → docs/superpowers/plans/2026-07-19-beira-mar-fase1.md
- [x] Instalar Node.js (v24.18.0 + npm 11.16.0, via winget)
- [x] Task 0 — Scaffolding Next.js 16 + Tailwind v4 + Biome (commit 8d5179b)
- [x] Task 1-3 — Camada de dados: conteúdo, planos, WhatsApp + testes 5/5 (commit d2451e4)
- [x] Task 4-5 — Base de dados/lead: código pronto (lazy), testes 10/10 (commit 9e1651b)
- [x] Task 6-9 — UI completa + homepage montada (commit 9e1651b), a correr em localhost:3000
- [x] Ligar Supabase — tabela `leads` criada, ligação testada (1 lead de teste inserido) ✅
- [ ] ⚠️ Rotacionar a password do Supabase (foi colada no chat) — pendente, avisar Henrique
- [ ] Task 10 — E2E do formulário (agora possível, Supabase ligado)
- [ ] Task 11 — polimento final: rever responsivo + a11y no browser
- [ ] Publicação (deploy — Vercel)

## Pendentes / decisões em aberto
- Domínio + hosting (não bloqueia o desenvolvimento)
- Fotos/textos reais e logótipo SVG (placeholders até lá)

## Bloqueios
- Nenhum crítico. Dependências do cliente (fotos, logo SVG, gateway, domínio) não bloqueiam a Fase 1 (placeholders + WhatsApp).
