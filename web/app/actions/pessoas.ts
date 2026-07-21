"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth/profile";
import { inviteSchema } from "@/lib/schemas/invite.schema";
import { resolveOrigin } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Convida um aluno ou instrutor por email (só instrutores podem). */
export async function convidarPessoa(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("instrutor");

  const parsed = inviteSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const { nome, email, role } = parsed.data;
  const admin = createAdminClient();

  try {
    const headersList = await headers();
    const origin = resolveOrigin(headersList, process.env.NEXT_PUBLIC_SITE_URL);

    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { nome, role },
      redirectTo: `${origin}/definir-senha`,
    });
    if (error) throw error;

    const { error: pErr } = await admin
      .from("profiles")
      .upsert({ id: data.user.id, nome, role });
    if (pErr) throw pErr;

    revalidatePath("/instrutor");
    return { ok: true };
  } catch (err) {
    console.error(
      "[convidarPessoa] falha:",
      err instanceof Error ? err.message : "erro",
    );
    return {
      ok: false,
      error: "Não foi possível convidar. Confirma o email e tenta de novo.",
    };
  }
}
