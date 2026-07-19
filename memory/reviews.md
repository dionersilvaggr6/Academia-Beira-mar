# Reviews — Beira Mar

## 2026-07-19 — Review Fase 1 (revisor independente)

**Veredito:** 0 críticos · 4 importantes · site bem construído.

**Positivos:** Zod nos limites; env lazy resiliente (site funciona sem Supabase, form falha com msg amigável); estrutura limpa (1 componente/ficheiro); testes 10/10; sem secrets; noopener; aria-label no FAB e title no mapa.

**A corrigir (Importante, todos rápidos):**
1. Contacto.tsx: `<input>` sem `<label>`/id/aria — acessibilidade (WCAG 3.3.2/4.1.2). Add label sr-only + id.
2. submit-lead.ts: `catch {}` engole erro sem log — contra regra CM. Add `console.error` (sem PII) antes da msg amigável.
3. lead.schema.ts: telefone `min(8)` aceita lixo ("!!!!!!!!"). Add regex `/^[\d\s()+-]{8,20}$/`.
4. Contacto.tsx: mensagens sucesso/erro sem `aria-live`/`role` — WCAG 4.1.3. Add role=status/alert + aria-live.

Ficheiros: Contacto.tsx, submit-lead.ts, lead.schema.ts. Aplicar antes do go-live.
