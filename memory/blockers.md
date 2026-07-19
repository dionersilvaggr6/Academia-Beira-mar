# Blockers — Beira Mar

(Nenhum bloqueio crítico. Dependências do cliente — fotos, logo SVG, gateway/CNPJ, domínio —
não bloqueiam a Fase 1: usamos placeholders e WhatsApp.)

## ⏰ LEMBRETE PENDENTE (pedido pelo Henrique 2026-07-19)
**Supabase adiado.** Henrique pediu para ignorar o Supabase por agora e **lembrá-lo quando for necessário**.
É necessário antes de:
- Task 4, Step 4 — `drizzle-kit push` (criar a tabela `leads` na base de dados real)
- Guardar leads a sério (a Server Action da Task 5 corre, mas os testes usam mock; sem DB real não grava)
- Task 10 E2E contra DB real
→ Quando chegar a esse ponto, PARAR e avisar o Henrique para criarmos a conta Supabase gratuita.
O resto da Fase 1 (scaffold, planos, WhatsApp, secções, form na interface) corre sem isto.
