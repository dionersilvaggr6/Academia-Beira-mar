/**
 * Tokens de sessão devolvidos pelo Supabase no fragmento (`#...`) da URL —
 * fluxo implícito usado por `inviteUserByEmail` e (potencialmente) por
 * recuperação de senha. O fragmento nunca é enviado ao servidor, por isso
 * só pode ser lido no cliente (`window.location.hash`).
 */
export type HashTokens = {
  accessToken: string;
  refreshToken: string;
  type: string | null;
};

/**
 * Extrai `access_token` / `refresh_token` (e `type`, se presente) do
 * fragmento da URL. Função pura e testável: recebe a string da hash (com ou
 * sem o `#` inicial) em vez de ler `window.location` diretamente.
 *
 * Devolve `null` quando a hash está vazia, não é um par chave=valor válido,
 * ou falta algum dos dois tokens — nesses casos não há sessão para
 * estabelecer.
 */
export function parseHashTokens(hash: string): HashTokens | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (!accessToken || !refreshToken) return null;

  return { accessToken, refreshToken, type: params.get("type") };
}

/**
 * Erro devolvido pelo Supabase no fragmento quando o link **não** pode ser
 * usado — tipicamente expirado (`otp_expired`) ou já consumido. Nesse caso
 * não vêm tokens nenhuns, só `error` / `error_code` / `error_description`.
 *
 * Sem isto, um link inválido deixava a pessoa parada na homepage sem
 * qualquer explicação (o `parseHashTokens` devolve `null` e mais nada
 * acontece).
 */
export function parseHashError(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const code = params.get("error_code");
  const error = params.get("error");
  if (!code && !error) return null;

  return code ?? error;
}
