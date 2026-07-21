# SPEC — Redesign & Rebranding do Site Academia Beira Mar

> Documento de design (brainstorming validado). Estado: **aguarda revisão do Henrique**.
> Data: 2026-07-20 · Responsável: Henrique (DH) — CMTecnologia
> Direção **"Force Dark"** aprovada em sessão de brainstorming com companheiro visual.

Esta SPEC **substitui a camada visual** da [SPEC.md](../../../SPEC.md) da Fase 1.
Mantém intacta a camada funcional já construída: captação de leads (Supabase),
WhatsApp pré-preenchido, dados dos 10 planos, e as áreas de aluno/instrutor (Fase 2A).
É um **rebranding + redesign premium**, não uma reescrita funcional.

---

## 1. Objetivo

Elevar o site de "bonito e funcional" para **premium, memorável e 100% Beira Mar**.
O site atual é um dark genérico (referência Linear/Stripe). O redesign dá-lhe
**identidade própria**: energia noturna de treino + tecnologia + assinatura de marca forte.

**Sucesso do redesign:**
1. Hero com impacto imediato (3D + tipografia forte) que faz o visitante parar.
2. Prova social real bem destacada (5★, +5.700 seguidores, reviews, Wellhub).
3. Conversão clara: cada plano → WhatsApp; formulário → lead.
4. Performance premium: rápido em mobile, acessível, respeita "reduzir movimento".
5. Coerência total: uma linguagem visual do header ao footer (e nas áreas de aluno).

---

## 2. Decisões travadas (brainstorming)

| Decisão | Escolha | Nota |
|---------|---------|------|
| **Direção visual** | **B · Force Dark** | Grafite quase-preto + laranja incandescente + glassmorphism. Energia noturna (Gymshark/Nike Training). |
| **Tipografia display** | **Chakra Petch** (600/700) | Quadrada, techy, com corte. Títulos, wordmark, números. |
| **Tipografia corpo** | **Inter** (400–700) | Limpa e legível. |
| **3D (three.js)** | **M · Partículas que se transformam** | Milhares de partículas que morfam entre haltere → coração → pin do mapa → wordmark, ao scroll. |
| **Estrutura** | 15 blocos aprovados (§9) | Página única com âncoras + sub-página loja no futuro. |
| **Imagens** | **fal.ia — modelo mais barato** | Fotos geradas como placeholder até haver reais. |
| **Skills** | impeccable · framer-motion · three.js · 21st.dev | Método de execução. |

---

## 3. Sistema de design "Force Dark"

Tokens definidos em `app/globals.css` (Tailwind v4 `@theme`). **Fonte única de verdade** — nada hardcoded nos componentes.

### 3.1 Cores

```
/* Superfícies */
--bg-base:      #0A0A0B   /* fundo dominante */
--bg-elev-1:    #121316   /* cards, secções */
--bg-elev-2:    #1A1A1E   /* cards sobre cards */
--graphite:     #3A3A40   /* bordas fortes, detalhes */

/* Texto */
--text-primary:   #F3F3F5
--text-secondary: #AEB3BD
--text-muted:     #6B6B70

/* Acento — laranja "molten" (marca) */
--accent:       #FF6A2B   /* CTA, destaques */
--accent-hi:    #FFA15E   /* fim de gradiente, brilho */
--accent-deep:  #C2410C   /* sombras do acento */
--accent-glow:  rgba(255,106,43,.5)

/* Estado */
--success: #5FD398   --warn: #FFC46B   --error: #FF8A72

/* Vidro (glassmorphism) */
--glass-bg:     rgba(20,22,28,.6)
--glass-border: rgba(255,255,255,.08)
--glass-blur:   14px
```

Contraste: garantir **AA** (≥4.5:1 texto normal, ≥3:1 texto grande) sobre `--bg-base`.
`--text-secondary` sobre `--bg-base` valida; `--text-muted` só para texto grande/decorativo.

### 3.2 Tipografia

- **Display:** Chakra Petch — `h1`–`h3`, wordmark, contadores, labels de secção (uppercase, `letter-spacing:.02–.1em`).
- **Corpo:** Inter — parágrafos, UI, formulários, botões.
- Carregadas via `next/font/google` (self-host automático, sem FOUT, sem chamada externa em runtime).
- **Escala fluida** (clamp): hero `clamp(2.75rem, 8vw, 6rem)`; H2 `clamp(1.8rem, 4vw, 3rem)`; corpo `1rem/1.6`.

### 3.3 Espaçamento, raio, sombra, motion

- **Espaçamento:** escala base-4 do Tailwind. Secções: `py` fluido `clamp(4rem, 10vw, 8rem)`.
- **Raio:** `sm 8 · md 12 · lg 16 · xl 22 · pill 999`.
- **Sombra:** elevação escura + **glow laranja** exclusivo dos CTAs primários.
- **Motion tokens:** durações `fast 150 · base 250 · slow 400 · cinematic 700` (ms); easing `--ease-out-expo: cubic-bezier(.16,1,.3,1)`; spring padrão para framer-motion.

### 3.4 Wordmark / assinatura

- **"BEIRA MAR"** em Chakra Petch + **marca de halteres** à esquerda (barra laranja com brilho + dois discos brancos). SVG próprio em `public/brand/wordmark.svg` + variação só-ícone `mark.svg` (favicon/OG).
- **Motivo:** ponto laranja (`.`) a fechar headlines ("EVOLUÍMOS**.**") — assinatura recorrente.
- Substitui os placeholders `next.svg`/`vercel.svg` atuais.

---

## 4. 3D — partículas que se transformam (three.js)

**Stack:** `three` + `@react-three/fiber` + `@react-three/drei`.

- **Comportamento:** sistema de `Points` (BufferGeometry) que interpola posições entre 4 formas-alvo: **haltere → coração → pin do mapa → wordmark "BM"**. Transição ao **scroll** (progresso da secção hero) e/ou loop temporizado suave. Cor: gradiente laranja (`--accent`→`--accent-hi`); leve parallax que segue o ponteiro.
- **Contagem adaptativa:** ~5.000 partículas desktop · ~1.500 mobile (detetar por largura/`deviceMemory`).
- **Carregamento:** `next/dynamic` com `ssr:false` + `IntersectionObserver` — o bundle 3D só carrega quando o hero entra em viewport; pausa render quando fora de vista.
- **DPR limitado** a `Math.min(devicePixelRatio, 2)`.
- **Fallbacks obrigatórios:**
  - `prefers-reduced-motion: reduce` → imagem/gradiente estático das partículas (sem animação).
  - WebGL indisponível → poster estático.
  - Mobile fraco → menos partículas, sem parallax de ponteiro.
- **Orçamento:** manter ~60fps; o 3D nunca bloqueia o LCP (texto do hero renderiza primeiro, 3D entra por cima).

---

## 5. Movimento (framer-motion)

**Princípios:** intencional, rápido, nunca gratuito; tudo respeita `prefers-reduced-motion` (desliga/reduz).

Padrões por tipo:
- **Reveals de scroll:** `fade + translateY(16px)`, `whileInView`, `once:true`, com **stagger** nos filhos (cards).
- **Botões magnéticos / hover:** CTAs primários reagem ao ponteiro (leve atração + glow).
- **Contadores animados:** números da faixa de prova social contam ao entrar em vista.
- **Carrossel de depoimentos:** transição suave (spring), auto-play pausável.
- **Parallax de luz:** halos laranja movem-se devagar com o scroll.
- **Header:** encolhe e ativa vidro ao descer.

---

## 6. Imagens (fal.ia)

- **Modelo:** sempre o **mais barato** disponível no fal.ia (ordem de preferência a confirmar no momento: `fal-ai/sana` ou `fal-ai/flux/schnell` — o de menor custo/megapixel). Decidido na task de geração, com o custo registado.
- **Uso:** placeholders fotográficos até existirem fotos reais — sala de musculação, estúdio de Pilates, zona funcional, detalhes de equipamento, ambiente. Tratamento: escuro, cinematográfico, luz de acento laranja, moderno.
- **Pipeline:** script Node isolado (`scripts/generate-images.mjs`, fora do bundle) → grava em `web/public/generated/` → servidas via `next/image` (AVIF/WebP, `sizes` corretos, `priority` só no hero).
- **Segredo:** o token fal.ia (ficheiro no Ambiente de Trabalho) é **lido apenas em tempo de geração** e passado como `FAL_KEY` de ambiente ao script. **Nunca** entra no código, em logs, no `.env` versionado, nem em commits. `.env.local` continua gitignored.
- ⚠️ **Nota de honestidade:** imagens de IA são **ilustrativas/placeholder**, não fotos reais da academia. Marcar como tal internamente e **substituir por fotos reais** assim que o cliente as fornecer (evita passar cenários gerados como sendo o espaço real).

---

## 7. 21st.dev

Acelerar UI com componentes base testados (via `21st` CLI + shadcn):
- Inicializar shadcn no projeto (`components.json`) com os tokens Force Dark.
- Candidatos a buscar/adaptar no 21st: **testimonial carousel**, **marquee** (faixa Wellhub/logos), **bento/stat cards**, **pricing cards**, **animated counter**, **gallery/lightbox**.
- Regra: procurar no 21st **antes** de escrever UI à mão; adaptar ao sistema de design em vez de colar tal e qual.

---

## 8. Arquitetura da página (15 blocos)

Ordem aprovada. Componentes em `components/sections/` (reescritos) + novos.

| # | Secção | Conteúdo real | Componente |
|---|--------|---------------|------------|
| 0 | **Header sticky (glass)** | Wordmark · nav âncoras · telefone · CTA WhatsApp | `layout/Header` (reescrito) |
| 1 | **Hero — partículas 3D** | "AQUI EVOLUÍMOS." · CTA duplo · selos 5★/+5.700/Wellhub | `sections/Hero` + `three/ParticleField` |
| 2 | **Faixa de números** | 5★ Google · +5.700 seguidores · 3 modalidades · nova & climatizada | `sections/Stats` (novo) |
| 3 | **Modalidades** | Musculação · Pilates · Funcional (foto + hover) | `sections/Modalidades` |
| 4 | **Personal Trainer** | Método: segurança, eficiência, resultados | `sections/PersonalTrainer` |
| 5 | **Porquê o Beira Mar** | Aparelhos novos · climatizado · estacionamento · banheiros limpos · ambiente familiar · atendimento humanizado · boa localização | `sections/Diferenciais` |
| 6 | **Galeria** *(opcional)* | Grelha de fotos (fal.ia) + lightbox | `sections/Galeria` (novo) |
| 7 | **Planos** | 10 planos · toggle avulso/recorrente · destaque · "EU QUERO" → WhatsApp | `sections/Planos` + `ui/PlanoCard` |
| 8 | **Depoimentos** | Reviews reais Google/Facebook 5★ (carrossel) | `sections/Depoimentos` (novo) |
| 9 | **Wellhub/Gympass** | Faixa "Aceitamos Wellhub/Gympass" | `sections/Wellhub` (novo) |
| 10 | **Loja (teaser)** *(opcional)* | Whey, creatina, pré-treino · "disponível na academia" · ponte Fase 3 | `sections/LojaTeaser` (novo) |
| 11 | **Sobre / Institucional** | História · missão · ambiente familiar · Capão da Canoa | `sections/Sobre` |
| 12 | **Localização + Horário** | Mapa · Av. Paraguassu 78 · horários · pico 20h | `sections/Localizacao` |
| 13 | **Captação de lead** | Form (nome, telefone, interesse) → Supabase · 3 estados UX | `sections/Contacto` |
| 14 | **Footer + WhatsApp FAB** | Redes · morada · horário · botão flutuante | `layout/Footer` + `layout/WhatsappFab` |

Secções opcionais (6 Galeria, 10 Loja) ficam **implementadas mas fáceis de esconder** por flag em `content/site.ts`.

---

## 9. Conteúdo & dados

Reutiliza e **estende** os ficheiros existentes (edição fácil, sem hardcode espalhado):
- `content/site.ts` — acrescentar: `stats` (5★, seguidores, etc.), `reviews[]` (texto + fonte), `flags` (galeria/loja on/off), `store` (lista de categorias de suplemento para o teaser).
- `lib/plans.ts` — mantém os 10 planos (fonte da verdade). Marcar `destaque` no melhor plano.
- `lib/whatsapp.ts` — mantém geração de link `wa.me` com plano pré-preenchido.
- **Reviews (reais, para citar):**
  - "Academia nova, completa, banheiros limpos, música boa, ótima opção na zona norte"
  - "Ambiente acolhedor, profissionais muito competentes e atenciosos!"
  - "Aparelhos novos, boa localização, estacionamento, ótimo atendimento."

Telefone é o único PII — nunca em logs (mantém-se a regra da Fase 1).

---

## 10. Áreas de aluno/instrutor (Fase 2A)

**Reskin leve, não redesign.** Aplicar os tokens Force Dark + fontes (Chakra Petch/Inter) para coerência visual; manter fluxos, RLS e lógica intactos. Sem novas funcionalidades aqui.

---

## 11. Responsivo, acessibilidade e performance

- **Mobile-first.** Breakpoints Tailwind. Grelhas colapsam para 1 coluna; hero 3D reduz partículas.
- **A11y:** HTML semântico, foco visível, navegação por teclado, `alt` em todas as imagens, `aria` no carrossel/lightbox/FAB, contraste AA, `prefers-reduced-motion` em todo o motion e 3D.
- **Performance (orçamento):** LCP < 2.5s mobile; bundle 3D lazy e fora do caminho crítico; imagens `next/image` (AVIF/WebP); fontes `next/font`; alvo Lighthouse ≥ 90 em Performance e Acessibilidade.

---

## 12. Stack técnica

Mantém a base CMTec (Next.js 16.2.10 App Router · React 19 · TS strict · Tailwind v4 · Supabase · Drizzle · Zod · Biome · Vitest · Playwright).

**Novas dependências:**
- `three`, `@react-three/fiber`, `@react-three/drei` — 3D.
- `framer-motion` — motion.
- `@fal-ai/client` — **só em devDependencies** (script de geração de imagens).
- shadcn/ui + utilitários (via 21st) — componentes base.

> ⚠️ `web/AGENTS.md` avisa: **"This is NOT the Next.js you know"** (Next 16). Antes de codar, ler os guias em `node_modules/next/dist/docs/`. Respeitar deprecations.

---

## 13. Testes

- Manter a suite existente verde (schemas, planos, whatsapp, submit-lead, roles).
- **Novos unit:** helpers de `stats`/`reviews`/`flags`; lógica de contagem de partículas por dispositivo (função pura).
- **Componentes:** render + estados dos novos (`Stats`, `Depoimentos`, `Wellhub`) com Testing Library.
- **E2E (Playwright):** fluxo do lead (mantido) + smoke do 3D (canvas monta, fallback com reduced-motion) + navegação por âncoras.
- Alvo de cobertura **≥ 80%** (lógica; excluir shaders/render 3D da métrica).

---

## 14. Fora de âmbito

- Loja online real / checkout (Fase 3 — aqui só o teaser).
- Pagamento online ativo (preparado, ligado depois).
- Redesign profundo dos fluxos de aluno/instrutor (só reskin).
- Fotos e logótipo **reais** (placeholders fal.ia até o cliente fornecer).

---

## 15. Riscos & mitigações

| Risco | Mitigação |
|-------|-----------|
| 3D pesa no mobile | Lazy-load, poucas partículas, pausa fora de vista, fallback reduced-motion. |
| Imagens IA parecerem "falsas"/enganosas | Tratar como placeholder explícito; substituir por fotos reais assim que possível. |
| Custo fal.ia | Modelo mais barato + gerar só o necessário + reutilizar; registar custo. |
| Next 16 com APIs diferentes | Ler `node_modules/next/dist/docs/` antes de codar. |
| Regressão na captação de leads | Não tocar na lógica; caracterizar com testes antes de mexer no `Contacto`. |
| Token fal.ia exposto | Só em env de geração, nunca em git/logs; varrer diff antes de commit. |

---

## 16. Dependências do cliente (não bloqueiam o arranque)

- 📸 Fotos e vídeos reais (até lá: fal.ia).
- 🖼️ Logótipo oficial em SVG (até lá: wordmark desenhado por nós).
- ✅ Confirmar textos institucionais e reviews a destacar.
- 🌐 Domínio próprio (não bloqueia).

---

## 17. Próximos passos

1. Revisão desta SPEC pelo Henrique.
2. `writing-plans` → plano de implementação faseado (design system → 3D → secções → imagens → polimento → testes).
3. Execução com TDD + skills (impeccable, framer-motion, three.js, 21st.dev).
4. Verificação (`verification-before-completion`) → PR → deploy Vercel.
