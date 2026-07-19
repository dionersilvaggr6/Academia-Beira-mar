# Reviews — Beira Mar

## 2026-07-19 — Review Fase 1 (revisor independente)

**Veredito:** 0 críticos · 4 importantes · site bem construído.

**Positivos:** Zod nos limites; env lazy resiliente (site funciona sem Supabase, form falha com msg amigável); estrutura limpa (1 componente/ficheiro); testes 10/10; sem secrets; noopener; aria-label no FAB e title no mapa.

**A corrigir (Importante) — TODAS CORRIGIDAS (commit bfefc77, 2026-07-19):**
1. ✅ Contacto.tsx: labels sr-only + id nos inputs.
2. ✅ submit-lead.ts: `console.error` no catch (sem PII).
3. ✅ lead.schema.ts: regex `/^[\d\s()+-]{8,20}$/` + 2 testes novos.
4. ✅ Contacto.tsx: role=status/alert + aria-live nas mensagens.
Testes: 12/12 verdes.
