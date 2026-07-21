"use client";

import { useEffect } from "react";
import { parseHashTokens } from "@/lib/auth/hash-tokens";

const DEFINIR_SENHA_PATH = "/definir-senha";
const REDIRECT_TYPES = new Set(["invite", "recovery"]);

/**
 * Rede de segurança: enquanto o `redirectTo` do convite não estiver na
 * allowlist de URLs do Supabase, o GoTrue cai de volta para o Site URL
 * (`/`) e os tokens da sessão chegam na hash de uma página que não sabe
 * lidar com eles.
 *
 * Montado no layout raiz, verifica ao carregar qualquer página (fora de
 * `/definir-senha`) se a hash traz `access_token` com `type=invite` ou
 * `type=recovery` e, se sim, redireciona para `/definir-senha` preservando
 * a hash — que passa a ser consumida lá (ver `DefinirSenhaGate`).
 *
 * Não renderiza nada.
 */
export function InviteHashRedirect() {
  useEffect(() => {
    if (window.location.pathname === DEFINIR_SENHA_PATH) return;

    const tokens = parseHashTokens(window.location.hash);
    if (!tokens?.type || !REDIRECT_TYPES.has(tokens.type)) return;

    window.location.replace(`${DEFINIR_SENHA_PATH}${window.location.hash}`);
  }, []);

  return null;
}
