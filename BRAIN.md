# BRAIN — Beira Mar

Contexto rápido de sessão (humano). Estado detalhado em [STATE.md](STATE.md); spec em [SPEC.md](SPEC.md).

## O que é
Plataforma web da Academia Beira Mar, construída por fases. Ver SPEC.

## Fase atual
**Fase 1** — Site institucional + Planos + Captação + WhatsApp.
Estado: SPEC escrita, a aguardar revisão final do Henrique antes do plano de implementação.

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
Henrique revê a SPEC → invocar `writing-plans` → plano de implementação → código (TDD).
