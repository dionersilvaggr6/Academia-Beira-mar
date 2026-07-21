/**
 * Deriva a origin (protocolo + host) do pedido atual, para montar URLs
 * absolutas (ex.: `redirectTo` do convite) sem hardcode de domínio.
 *
 * Prioridade:
 * 1. `x-forwarded-proto` + `host` dos headers — funciona automaticamente em
 *    localhost, previews da Vercel (cada preview tem o seu próprio host) e
 *    produção, porque reflete o pedido real.
 * 2. `NEXT_PUBLIC_SITE_URL`, se definida — usada só quando o proxy não
 *    indica o protocolo (ex.: `next dev` sem proxy à frente).
 * 3. Só o header `host`, assumindo `http` para localhost e `https` caso
 *    contrário.
 *
 * Recebe os headers por parâmetro (em vez de chamar `next/headers`
 * diretamente) para se manter uma função pura e testável.
 */
export function resolveOrigin(
  headers: Pick<Headers, "get">,
  siteUrlEnv: string | undefined,
): string {
  const host = headers.get("host");
  const proto = headers.get("x-forwarded-proto");

  if (host && proto) return `${proto}://${host}`;
  if (siteUrlEnv) return siteUrlEnv.replace(/\/+$/, "");
  if (host) return `${guessProtocol(host)}://${host}`;

  throw new Error(
    "Não foi possível determinar a origin do pedido (sem header host).",
  );
}

function guessProtocol(host: string): "http" | "https" {
  const hostname = host.split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1"
    ? "http"
    : "https";
}
