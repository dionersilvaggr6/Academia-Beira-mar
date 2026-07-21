import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticação (convites, magic links, recuperação de senha).
 *
 * O link de convite do Supabase (`inviteUserByEmail`) não suporta PKCE — o
 * browser que aceita o convite nunca é o mesmo que o enviou, então o GoTrue
 * envia `token_hash` + `type` (fluxo OTP), não `code`. Tratamos os dois casos
 * aqui: `token_hash` (convites, magic link, recuperação) e `code` (OAuth/PKCE,
 * caso venha a ser usado no futuro).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = searchParams.get("next") ?? "/definir-senha";
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL("/login?erro=convite", request.url));
}
