"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireRole } from "@/lib/auth/profile";
import { apagarAlunoSchema } from "@/lib/schemas/apagar-aluno.schema";
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
    if (pErr) {
      // O convite já criou o utilizador de auth, mas o perfil falhou — sem
      // isto ficaria um utilizador "preso" (existe no auth, sem perfil) que
      // o Supabase recusa reconvidar pelo mesmo email. Remove-o para o email
      // voltar a ficar disponível.
      const { error: cleanupError } = await admin.auth.admin.deleteUser(
        data.user.id,
      );
      if (cleanupError) {
        console.error(
          "[convidarPessoa] falha ao limpar utilizador órfão:",
          cleanupError.message,
        );
      }
      throw pErr;
    }

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

/**
 * Apaga um aluno por completo (só instrutores): a conta de autenticação,
 * exercícios, divisões de treino e o perfil. Irreversível — a UI
 * (`ApagarAlunoButton`) exige uma segunda confirmação deliberada antes de
 * submeter.
 *
 * A conta de auth é apagada PRIMEIRO, antes de tocar em qualquer linha
 * dependente: se isto falhar, nada foi alterado (estado retomável). Se em
 * vez disso apagássemos o perfil/treinos primeiro e o `deleteUser` falhasse
 * no fim, ficava um utilizador de auth órfão sem perfil — o mesmo problema
 * que `convidarPessoa` evita ao limpar o utilizador quando o upsert falha.
 * Só depois de confirmado o `deleteUser` é que se apagam as linhas
 * dependentes em camadas explícitas (exercícios → treinos → perfil), em vez
 * de confiar só na cascade da BD — mesma prática já usada em `apagarTreino`
 * (app/actions/treinos.ts). `db/schema.ts` também declara
 * `onDelete: "cascade"` em treinos→profiles e exercicios→treinos, por isso
 * mesmo que um passo explícito seja saltado por engano a BD limpa as linhas
 * dependentes.
 *
 * Nunca regista nome/email do aluno — só mensagens de erro genéricas.
 */
export async function apagarAluno(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const instrutor = await requireRole("instrutor");

  const parsed = apagarAlunoSchema.safeParse({
    alunoId: formData.get("alunoId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }
  const { alunoId } = parsed.data;

  if (alunoId === instrutor.id) {
    return { ok: false, error: "Não podes excluir a tua própria conta." };
  }

  const admin = createAdminClient();

  try {
    const { data: alvo, error: alvoError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", alunoId)
      .single();
    if (alvoError || !alvo) throw alvoError ?? new Error("aluno não existe");
    if (alvo.role !== "aluno") {
      return { ok: false, error: "Só é possível excluir contas de aluno." };
    }

    // Apaga a conta de auth primeiro: uma falha aqui não deixa nada por
    // apagar (ver nota no topo da função).
    const { error: authError } = await admin.auth.admin.deleteUser(alunoId);
    if (authError) throw authError;

    const { data: treinosData, error: treinosError } = await admin
      .from("treinos")
      .select("id")
      .eq("aluno_id", alunoId);
    if (treinosError) throw treinosError;

    const treinoIds = (treinosData ?? []).map((t: { id: string }) => t.id);
    if (treinoIds.length > 0) {
      const { error: exerciciosError } = await admin
        .from("exercicios")
        .delete()
        .in("treino_id", treinoIds);
      if (exerciciosError) throw exerciciosError;
    }

    const { error: treinosDeleteError } = await admin
      .from("treinos")
      .delete()
      .eq("aluno_id", alunoId);
    if (treinosDeleteError) throw treinosDeleteError;

    const { error: profileDeleteError } = await admin
      .from("profiles")
      .delete()
      .eq("id", alunoId);
    if (profileDeleteError) throw profileDeleteError;

    revalidatePath("/instrutor");
    return { ok: true };
  } catch (err) {
    console.error(
      "[apagarAluno] falha:",
      err instanceof Error ? err.message : "erro",
    );
    return {
      ok: false,
      error: "Não foi possível excluir o aluno. Tenta de novo.",
    };
  }
}
