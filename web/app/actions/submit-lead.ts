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
  } catch {
    return {
      ok: false,
      error: "Não foi possível enviar agora. Tenta pelo WhatsApp.",
    };
  }
}
