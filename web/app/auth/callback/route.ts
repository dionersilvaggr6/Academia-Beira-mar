import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticação (recuperação de senha, magic link, e futuro
 * OAuth/PKCE).
 *
 * NÃO trata convites: `inviteUserByEmail` usa o fluxo implícito do Supabase
 * e devolve `access_token`/`refresh_token` no fragmento da URL
 * (`#access_token=...`), que nunca chega ao servidor — por isso o convite
 * aponta direto para `/definir-senha`, que consome a hash no cliente (ver
 * `lib/auth/hash-tokens.ts` e `DefinirSenhaGate`). Aqui tratamos só
 * `token_hash` + `type` (fluxo OTP: recuperação, magic link) e `code`
 * (OAuth/PKCE).
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
