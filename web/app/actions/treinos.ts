"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/profile";
import {
  apagarExercicioSchema,
  apagarTreinoSchema,
  editarExercicioSchema,
  editarTreinoSchema,
  exercicioSchema,
  treinoSchema,
} from "@/lib/schemas/treino.schema";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Cria uma divisão de treino para um aluno (só instrutores). */
export async function criarTreino(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const instrutor = await requireRole("instrutor");

  const parsed = treinoSchema.safeParse({
    alunoId: formData.get("alunoId"),
    nome: formData.get("nome"),
    foco: formData.get("foco") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("treinos").insert({
    aluno_id: parsed.data.alunoId,
    nome: parsed.data.nome,
    foco: parsed.data.foco ?? null,
    created_by: instrutor.id,
  });
  if (error) {
    console.error("[criarTreino] falha:", error.message);
    return { ok: false, error: "Não foi possível criar a divisão." };
  }

  revalidatePath(`/instrutor/aluno/${parsed.data.alunoId}`);
  return { ok: true };
}

/** Adiciona um exercício a uma divisão (só instrutores). */
export async function criarExercicio(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("instrutor");

  const treinoId = String(formData.get("treinoId") ?? "");
  const parsed = exercicioSchema.safeParse({
    nome: formData.get("nome"),
    series: Number(formData.get("series")),
    repeticoes: formData.get("repeticoes"),
    carga: formData.get("carga") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("exercicios").insert({
    treino_id: treinoId,
    nome: parsed.data.nome,
    series: parsed.data.series,
    repeticoes: parsed.data.repeticoes,
    carga: parsed.data.carga ?? null,
    observacoes: parsed.data.observacoes ?? null,
  });
  if (error) {
    console.error("[criarExercicio] falha:", error.message);
    return { ok: false, error: "Não foi possível adicionar o exercício." };
  }

  revalidatePath("/instrutor");
  return { ok: true };
}

/** Atualiza nome e foco de uma divisão de treino (só instrutores). */
export async function editarTreino(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("instrutor");

  const parsed = editarTreinoSchema.safeParse({
    id: formData.get("id"),
    alunoId: formData.get("alunoId"),
    nome: formData.get("nome"),
    foco: formData.get("foco") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("treinos")
    .update({ nome: parsed.data.nome, foco: parsed.data.foco ?? null })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[editarTreino] falha:", error.message);
    return { ok: false, error: "Não foi possível atualizar a divisão." };
  }

  revalidatePath(`/instrutor/aluno/${parsed.data.alunoId}`);
  return { ok: true };
}

/** Apaga uma divisão de treino e os seus exercícios (só instrutores). */
export async function apagarTreino(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("instrutor");

  const parsed = apagarTreinoSchema.safeParse({
    id: formData.get("id"),
    alunoId: formData.get("alunoId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  // Apagar primeiro os exercícios: não confiar só na cascade da BD.
  const { error: exercisesError } = await supabase
    .from("exercicios")
    .delete()
    .eq("treino_id", parsed.data.id);
  if (exercisesError) {
    console.error(
      "[apagarTreino] falha ao apagar exercícios:",
      exercisesError.message,
    );
    return { ok: false, error: "Não foi possível apagar a divisão." };
  }

  const { error } = await supabase
    .from("treinos")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[apagarTreino] falha:", error.message);
    return { ok: false, error: "Não foi possível apagar a divisão." };
  }

  revalidatePath(`/instrutor/aluno/${parsed.data.alunoId}`);
  return { ok: true };
}

/** Atualiza um exercício (só instrutores). */
export async function editarExercicio(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("instrutor");

  const parsed = editarExercicioSchema.safeParse({
    id: formData.get("id"),
    alunoId: formData.get("alunoId"),
    nome: formData.get("nome"),
    series: Number(formData.get("series")),
    repeticoes: formData.get("repeticoes"),
    carga: formData.get("carga") || undefined,
    observacoes: formData.get("observacoes") || undefined,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicios")
    .update({
      nome: parsed.data.nome,
      series: parsed.data.series,
      repeticoes: parsed.data.repeticoes,
      carga: parsed.data.carga ?? null,
      observacoes: parsed.data.observacoes ?? null,
    })
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[editarExercicio] falha:", error.message);
    return { ok: false, error: "Não foi possível atualizar o exercício." };
  }

  revalidatePath(`/instrutor/aluno/${parsed.data.alunoId}`);
  return { ok: true };
}

/** Apaga um exercício (só instrutores). */
export async function apagarExercicio(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireRole("instrutor");

  const parsed = apagarExercicioSchema.safeParse({
    id: formData.get("id"),
    alunoId: formData.get("alunoId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("exercicios")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[apagarExercicio] falha:", error.message);
    return { ok: false, error: "Não foi possível apagar o exercício." };
  }

  revalidatePath(`/instrutor/aluno/${parsed.data.alunoId}`);
  return { ok: true };
}
