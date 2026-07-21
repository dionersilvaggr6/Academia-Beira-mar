"use client";

import { useEffect, useState } from "react";
import { DefinirSenhaForm } from "@/components/auth/DefinirSenhaForm";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { parseHashTokens } from "@/lib/auth/hash-tokens";
import { createClient } from "@/lib/supabase/client";

type GateState = "loading" | "ready" | "empty";

/**
 * Estabelece a sessão do convite antes de mostrar o formulário de senha.
 *
 * O Supabase devolve o convite via fragmento da URL (`#access_token=...`),
 * que nunca chega ao servidor — por isso a sessão só pode ser criada no
 * cliente, com `setSession`. Depois de consumida, a hash é removida da URL
 * (`history.replaceState`) para não ficar exposta na barra de endereço ou no
 * histórico do navegador.
 *
 * Três estados: `loading` (a verificar convite/sessão), `empty` (sem hash e
 * sem sessão — link expirado ou já usado) e `ready` (sessão confirmada,
 * mostra o formulário).
 */
export function DefinirSenhaGate() {
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function bootstrap() {
      const tokens = parseHashTokens(window.location.hash);

      if (tokens) {
        const { error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });

        // Remove os tokens da URL assim que forem consumidos, com sucesso
        // ou não — nunca devem persistir na barra de endereço/histórico.
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );

        if (!cancelled) setState(error ? "empty" : "ready");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) setState(session ? "ready" : "empty");
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="mt-8 text-center text-fg-dim text-sm"
      >
        Verificando seu convite…
      </p>
    );
  }

  if (state === "empty") {
    return (
      <GlassCard className="mt-8 text-center">
        <p className="text-fg-dim text-sm">
          Não encontramos uma sessão ativa. O link de convite pode ter expirado
          ou já ter sido usado.
        </p>
        <ButtonLink href="/login" className="mt-4 inline-flex">
          Ir para o login
        </ButtonLink>
      </GlassCard>
    );
  }

  return (
    <>
      <p className="mt-2 text-center text-fg-dim text-sm">
        Crie uma senha para acessar sua conta.
      </p>
      <DefinirSenhaForm />
    </>
  );
}
