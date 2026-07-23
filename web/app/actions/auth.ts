"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/profile";
import { definirSenhaSchema } from "@/lib/schemas/definir-senha.schema";
import { recuperarSenhaSchema } from "@/lib/schemas/recuperar-senha.schema";
import { resolveOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

export type LoginResult = { ok: false; error: string };

export async function login(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "Email ou senha inválidos." };
  }

  const profile = await getProfile();
  redirect(profile?.role === "instrutor" ? "/instrutor" : "/aluno");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("[logout] falha ao terminar sessão:", error.message);
  }
  redirect("/login");
}

export type DefinirSenhaResult =
  | { ok: true; redirectTo: "/instrutor" | "/aluno" }
  | { ok: false; error: string };

/**
 * Define a senha de quem chegou pelo link de convite (já autenticado pelo
 * callback). Não usa `redirect()` diretamente para o form poder mostrar o
 * estado de sucesso antes de navegar — ver DefinirSenhaForm.
 */
export async function definirSenha(
  _prev: DefinirSenhaResult | null,
  formData: FormData,
): Promise<DefinirSenhaResult> {
  const parsed = definirSenhaSchema.safeParse({
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.senha,
  });
  if (error) {
    return {
      ok: false,
      error:
        "Não foi possível definir a senha. O link pode ter expirado — peça um novo convite.",
    };
  }

  const profile = await getProfile();
  return {
    ok: true,
    redirectTo: profile?.role === "instrutor" ? "/instrutor" : "/aluno",
  };
}

export type RecuperarSenhaResult = { ok: true } | { ok: false; error: string };

/**
 * Pede o email de recuperação de senha do Supabase. Por segurança, **nunca**
 * revela se o email existe: qualquer resultado (email inexistente, envio
 * falhado, Supabase em baixo) devolve `{ ok: true }` — só um email em
 * formato inválido é rejeitado, porque isso é feedback de formulário, não
 * confirmação de conta. O email nunca é incluído no log de erro.
 */
export async function recuperarSenha(
  _prev: RecuperarSenhaResult | null,
  formData: FormData,
): Promise<RecuperarSenhaResult> {
  const parsed = recuperarSenhaSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Email inválido",
    };
  }

  try {
    const headersList = await headers();
    const origin = resolveOrigin(headersList, process.env.NEXT_PUBLIC_SITE_URL);
    const supabase = await createClient();
    // O SDK devolve o erro no objeto (não lança), por isso tem de ser
    // inspecionado — caso contrário falhas reais (ex.: limite de emails do
    // Supabase) passam despercebidas. Ao utilizador continuamos a devolver
    // sempre a mesma resposta neutra, para não revelar se o email existe.
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      { redirectTo: `${origin}/definir-senha` },
    );
    if (error) {
      console.error(
        "[recuperarSenha] Supabase recusou o pedido:",
        error.message,
      );
    }
  } catch (err) {
    console.error(
      "[recuperarSenha] falha ao solicitar recuperação:",
      err instanceof Error ? err.message : "erro",
    );
  }

  return { ok: true };
}
