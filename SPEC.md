# SPEC — Site Academia Beira Mar

> Especificação técnica do projeto. Documento vivo — atualizado quando decisões mudam.
> Estado: **Fase 1 — aprovada para desenvolvimento** (aguarda revisão final da SPEC pelo Henrique).
> Data: 2026-07-18 · Responsável: Henrique (DH) — CMTecnologia

---

## 1. Visão geral

Plataforma web da **Academia Beira Mar**. Não é um site simples: é uma plataforma
com vários módulos, construída **por fases** para entregar valor cedo e sem risco.

- **Fase 1 (esta SPEC):** Site institucional + Planos + Captação de leads + WhatsApp.
- **Fase 2 (futura):** Área de aluno com login (treinos, agenda, plano ativo).
- **Fase 3 (futura):** Loja / e-commerce com "comprar online e retirar na loja" (click & collect).

Pagamento online (Pix + cartão) é preparado na estrutura da Fase 1, mas **ligado numa fase
seguinte**, quando existir conta no gateway + CNPJ. Até lá, a matrícula fecha por WhatsApp.

---

## 2. Objetivo da Fase 1

Colocar no ar um site rápido, bonito e responsivo que:
1. Apresenta a academia (modalidades, diferenciais, localização).
2. Mostra os planos de forma clara e fácil de editar.
3. **Converte** o visitante: cada plano leva ao WhatsApp; formulário capta leads.

**Sucesso da Fase 1:** site publicado, responsivo, com os planos corretos, botões de
WhatsApp a funcionar e formulário a guardar contactos.

---

## 3. Identidade visual

- **Estilo:** misto — base dark premium/moderna (referência Linear/Stripe) com a energia
  e os CTAs fortes de uma academia de musculação.
- **Paleta (do logótipo):**
  - Preto / grafite — fundo dominante — `#1A1A1A` (a afinar)
  - Branco / creme — texto e contraste — `#F5F0E8` (a afinar)
  - Laranja — destaques, CTAs, detalhes — `#E8541E` (a afinar)
- **Logótipo:** "Beira Mar Academia" (barbell laranja + branco). Ficheiro final ideal:
  PNG com fundo transparente ou SVG (a fornecer).
- **Responsivo:** mobile-first.
- **Referência analisada:** https://26fit.com.br/ (estrutura e secções).

---

## 4. Estrutura da página (Fase 1)

Homepage única com âncoras + navegação:

1. **Hero** — logótipo, headline forte, CTA duplo: "Matricular" (→ WhatsApp) e "Ver planos".
2. **Modalidades** — Musculação · Pilates · Funcional (cards com ícone).
3. **Personal Trainer** — destaque do serviço extra.
4. **Diferenciais** ("Porquê o Beira Mar") — aparelhos novos · estacionamento · academia
   nova e completa · ambiente familiar e acolhedor · atendimento humanizado · boa localização.
5. **Planos** — os 10 planos (§5) em cards; botão "EU QUERO" → WhatsApp com plano preenchido.
6. **Sobre / Institucional** — "saúde e bem-estar num ambiente familiar e acolhedor;
   nova academia em Capão da Canoa" (base real; texto final a afinar).
7. **Localização** — Av. Paraguassu, 78, Jardim Beira Mar, Capão da Canoa – RS, 95555-000 + mapa.
8. **Contacto / Captar lead** — formulário (nome, telefone, interesse) → guarda o lead;
   atalhos WhatsApp e Instagram.
9. **Footer** — redes sociais, endereço, horário.
10. **Botão WhatsApp flutuante** — sempre visível.

**Horário de funcionamento:** Seg–Sex 05:30–22:00 · Sáb 10:00–16:00 · Dom fechado.

---

## 5. Planos (fonte: banner oficial)

| Plano | Valor | Forma |
|-------|-------|-------|
| Diária | R$ 35,00 | avulso |
| Semanal | R$ 79,00 | avulso |
| Quinzenal | R$ 99,00 | avulso |
| Mensal | R$ 140,00 | avulso |
| Mensal Recorrente | R$ 125,00 | cartão |
| Mensal Dupla | R$ 129,00 | cada (2 pessoas) |
| Trimestral | 3× R$ 125,00 | cartão |
| Semestral | 6× R$ 119,00 | cartão |
| Anual Parcelado | 12× R$ 99,00 | cartão |
| Anual à Vista | R$ 999,00 | Pix ou dinheiro |

Os planos ficam num único ficheiro de dados (`plans.ts` ou tabela) para edição fácil.

---

## 6. Funcionalidades

- **CTA de plano → WhatsApp:** link `wa.me` para (51) 99744-2463, mensagem pré-preenchida
  com o nome do plano escolhido.
- **Botão WhatsApp flutuante.**
- **Formulário de lead:** nome, telefone, interesse (modalidade/plano). Guarda em Supabase.
  Cobre os **3 estados de UX**: a carregar / vazio / erro. Validação com Zod.
- **Links sociais:** Instagram @academiabeiramar.
- **Mapa** da localização (embed).
- **Pagamento online:** estrutura preparada (interface e dados de plano prontos);
  integração de gateway fica para fase seguinte.

---

## 7. Stack técnica (padrão CMTecnologia)

- **Next.js 15+ (App Router)**, React, **TypeScript strict**
- **Tailwind CSS v4**
- **Supabase (Postgres)** — armazenamento dos leads
- **Drizzle ORM** — schema da tabela de leads
- **Zod** — validação (formulário, env, dados de plano)
- **Biome.js** — lint + format
- **Testes** — unit + integração (alvo 80%); E2E no fluxo de lead
- **Hosting:** Vercel (recomendado; a confirmar)

---

## 8. Modelo de dados (Fase 1)

**Tabela `leads`:**
- `id` (uuid, pk)
- `nome` (text, obrigatório)
- `telefone` (text, obrigatório)
- `interesse` (text, opcional — plano/modalidade)
- `origem` (text — ex.: "formulario-site")
- `created_at` (timestamp)

Sem dados sensíveis. Telefone é o único PII — tratado com cuidado, nunca em logs.

---

## 9. Dependências externas (fornecidas pelo cliente — não bloqueiam o arranque)

- 📸 Fotos e textos reais (até lá: placeholders).
- 🖼️ Logótipo em PNG transparente / SVG.
- 💳 Conta no gateway + CNPJ + dados bancários (para ligar o pagamento online).
- 🌐 Domínio (ex.: academiabeiramar.com.br) e conta de hosting.
- 🔑 Credenciais Supabase (projeto a criar).

---

## 10. Fora do âmbito da Fase 1

- Área de aluno / login / treinos (Fase 2).
- Loja / e-commerce / click & collect (Fase 3).
- Pagamento online ativo (preparado, ligado depois).
- Localizador de múltiplas unidades (Beira Mar assume-se com **uma** unidade;
  a confirmar — estrutura fica preparada para expandir).

---

## 11. Questões em aberto (a fechar antes/durante o plano)

1. ~~Diferenciais concretos~~ ✅ resolvido (§4.4, via ficha Google).
2. ~~Uma unidade só?~~ ✅ confirmado: **uma unidade** (Capão da Canoa – RS).
3. ~~Horário de funcionamento~~ ✅ resolvido (Seg–Sex 05:30–22:00 · Sáb 10:00–16:00 · Dom fechado).
4. **Domínio e conta de hosting** — ainda em aberto (não bloqueia o desenvolvimento).
