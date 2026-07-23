"use server";

import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import { leadSchema } from "@/lib/lead.schema";

export type LeadResult = { ok: true } | { ok: false; error: string };

export async function submitLead(
  _prev: LeadResult | null,
  formData: FormData,
): Promise<LeadResult> {
  const parsed = leadSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    interesse: formData.get("interesse") || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  try {
    await getDb().insert(leads).values(parsed.data);
    return { ok: true };
  } catch (err) {
    // Log do erro no servidor (sem PII — nunca os dados do lead). `err` pode
    // trazer o valor ofensivo embutido (ex.: mensagens de constraint únicos
    // do Postgres citam a linha), por isso nunca se regista o objeto inteiro
    // — só a mensagem.
    console.error(
      "[submitLead] falha ao gravar lead:",
      err instanceof Error ? err.message : "erro desconhecido",
    );
    return {
      ok: false,
      error: "Não foi possível enviar agora. Tenta pelo WhatsApp.",
    };
  }
}
