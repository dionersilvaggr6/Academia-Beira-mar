# Blockers — Beira Mar

(Nenhum bloqueio crítico. Dependências do cliente — fotos, logo SVG, gateway/CNPJ, domínio —
não bloqueiam a Fase 1: usamos placeholders e WhatsApp.)

## ✅ Supabase — RESOLVIDO (2026-07-19)
Conta criada, projeto `innnumingpzoptfpikzs` (região São Paulo, aws-1-sa-east-1, Session pooler porta 5432).
Tabela `leads` criada via `drizzle-kit push`. Ligação testada (insert OK). `.env.local` tem a DATABASE_URL.

## ⚠️ PENDENTE DE SEGURANÇA
A password do Supabase foi **colada no chat** durante o setup. **Avisar o Henrique para fazer
"Reset database password" no Supabase** quando o site estiver estável, e atualizar o `.env.local`
com a nova (eu ajudo). Há também um **lead de teste** ("TESTE — Claude") na tabela que o Henrique
pode apagar no Table Editor do Supabase.
