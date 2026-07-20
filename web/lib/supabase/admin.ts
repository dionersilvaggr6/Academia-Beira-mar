import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a SERVICE ROLE KEY — só pode ser usado no servidor (Server Actions).
 * Usado para operações de administração (convites, criar utilizadores).
 * NUNCA importar em código de cliente.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltam NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
