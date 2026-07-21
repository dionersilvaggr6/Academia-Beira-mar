/**
 * Campos do `User` do Supabase (`@supabase/supabase-js` / `@supabase/auth-js`)
 * relevantes para decidir se um convite continua pendente. Tipo local
 * mínimo (em vez de importar `User` diretamente) para a função ficar pura e
 * fácil de testar — mas com o mesmo shape, incluindo `| null`, porque a API
 * devolve `null` (não `undefined`) para timestamps por preencher.
 */
export type InviteStatusUser = {
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
};

/**
 * Um convite fica pendente enquanto a pessoa nunca confirmou o email
 * (aceitou o convite) nem nunca entrou. `email_confirmed_at`/`confirmed_at`
 * ficam definidos assim que o link do convite é validado pelo Supabase —
 * mesmo antes de a pessoa definir a senha — por isso, uma vez confirmado,
 * já não é tratado como pendente (só porque ainda não fez um novo login
 * "a frio"). `last_sign_in_at` funciona como sinal adicional para o caso de
 * nenhum dos dois campos de confirmação estar definido.
 */
export function isPendingInvite(user: InviteStatusUser): boolean {
  const confirmed =
    Boolean(user.email_confirmed_at) || Boolean(user.confirmed_at);
  const signedIn = Boolean(user.last_sign_in_at);
  return !confirmed && !signedIn;
}
