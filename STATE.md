# STATE — Beira Mar

Snapshot determinístico. Atualizar a cada mudança de fase/tarefa.

## REDESIGN "Force Dark" + ÁREA DE ALUNO — ✅ EM PRODUÇÃO (2026-07-21)
- **Estado:** PR #1 **MERGED** na `main` (merge commit `4d56de9`) e **deployado em produção**: https://academia-beira-mar.vercel.app
- **Verificado em produção:** 13/13 secções presentes · `/` `/login` `/recuperar-senha` `/definir-senha` → HTTP 200 · `/aluno` → 307 (redirect de auth, correto).
- **Env vars na Vercel:** ✅ completas (URL + ANON_KEY postas por mim; SERVICE_ROLE_KEY posta pelo Henrique; DATABASE_URL já existia).
- **Qualidade final:** 152 testes verdes · Biome/tsc/build verdes · cobertura ≥80% na lógica · E2E + responsivo medido (0 overflow a 375/768/1280) · revisão sénior com Important todos corrigidos.
- **Área de aluno/instrutor (Fase 2A fechada):** editar/excluir treinos e exercícios · excluir aluno (com proteções) · selo "Convite pendente" · convite → definir senha · recuperar senha · catálogo de 74 exercícios + 4 modelos prontos · seletor por categoria · login renomeado "Área de Treino".
- **3D:** partículas passaram a fundo ambiente global (todas as páginas), 1 canvas, opacity 30%, pausa em tab oculta, contraste medido ≥4.5:1.
- **Polish (impeccable):** faixa de números (de-slop), diferenciais (lista editorial), sobre (sem duplicação + foto), mapa escuro, imagens Unsplash.
- **SPEC:** docs/superpowers/specs/2026-07-20-beira-mar-redesign-design.md · **Plano:** docs/superpowers/plans/2026-07-20-beira-mar-redesign.md
- **Feito:** tokens Force Dark (grafite+laranja+glass), Chakra Petch+Inter, hero 3D de partículas (three.js, morph haltere→coração→pin→"BM", fallback WebGL/reduced-motion, pausa off-screen), framer-motion (reduced-motion global), 13 secções redesenhadas, prova social real (5★, +5.700, reviews, Wellhub), copy PT-BR, reskin área aluno/instrutor.
- **Preservado:** captação de leads (submitLead/Supabase), WhatsApp, planos, RLS — só restyle.
- **Qualidade:** 71 testes verdes · Biome verde · tsc verde · build verde · 0 erros de consola · a11y spot-check limpo. Verificado ao vivo em localhost:3001.
- **Saltado (decisão do Henrique):** geração de imagens fal.ia — Modalidades/Galeria usam fundos-gradiente; `/generated/*.webp` a gerar depois ou substituir por fotos reais.
- **Pendente antes de produção:** push+PR (a pedido) · gerar/colocar imagens reais · E2E Playwright + Lighthouse (passo manual) · nota Next 16: `middleware`→`proxy` (deprecação).

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
