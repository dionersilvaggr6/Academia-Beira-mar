# BRAIN — Beira Mar

Contexto rápido de sessão (humano). Estado detalhado em [STATE.md](STATE.md); spec em [SPEC.md](SPEC.md).

## O que é
Plataforma web da Academia Beira Mar, construída por fases. Ver SPEC.

## Fase atual
**Redesign "Force Dark"** — COMPLETO na branch `redesign/force-dark` (2026-07-21).
Rebranding premium: tokens Force Dark, Chakra Petch+Inter, hero 3D de partículas (three.js), framer-motion, 13 secções, prova social real, copy PT-BR, reskin da área de aluno. Leads/WhatsApp/planos preservados. 71 testes verdes, build verde, verificado ao vivo. Aguarda decisão do Henrique para push + PR → main. (Fase 1 já estava no ar; Fase 2A desenhada.)

## Decisões-chave
- Faseamento: F1 site/planos/captação · F2 área de aluno · F3 loja click&collect.
- Pagamento: online + WhatsApp; gateway decidido depois; F1 arranca só com WhatsApp.
- Modalidades: Musculação, Pilates, Funcional. Extra: Personal trainer.
- Estilo misto (dark premium + energia). Cores: preto + branco/creme + laranja (logo).
- Conteúdo: placeholders primeiro.
- Sem prazo (qualidade primeiro).

## Dados oficiais
- Endereço: Av. Paraguassu, 78 — Jardim Beira Mar
- WhatsApp: (51) 99744-2463 · Instagram: @academiabeiramar
- 10 planos (ver SPEC §5). Referência de estrutura: 26fit.com.br.

## Próximo passo
Henrique vê o redesign (localhost:3001) → decide push + PR `redesign/force-dark → main`.
Depois: gerar/colocar imagens (fal.ia ou fotos reais), E2E+Lighthouse, deploy.
