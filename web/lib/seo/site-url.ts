/**
 * Base URL absoluta e estática do site, usada por metadados que exigem URL
 * completa e não têm acesso ao pedido (sitemap, robots, `metadataBase`,
 * JSON-LD) — ao contrário de `lib/site-url.ts` (`resolveOrigin`), que deriva
 * a origin a partir dos headers do pedido atual.
 *
 * Fonte: `NEXT_PUBLIC_SITE_URL`, com fallback para o domínio de produção.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://academia-beira-mar.vercel.app"
).replace(/\/+$/, "");
