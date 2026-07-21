"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/profile";
import {
  apagarExercicioSchema,
  apagarTreinoSchema,
  aplicarModeloSchema,
  editarExercicioSchema,
  editarTreinoSchema,
  exercicioSchema,
  treinoSchema,
} from "@/lib/schemas/treino.schema";
import { createClient } from "@/lib/supabase/server";
import { MODELOS } from "@/lib/treinos/modelos";

export type ActionResult = { ok: true } | { ok: false; error: string };

// Séries/repetições ficam sempre à escolha do instrutor por aluno; a BD exige
// NOT NULL nestas colunas, por isso um modelo aplica um valor neutro que a UI
// deixa claro que precisa de ajuste (não é uma prescrição real).
const SERIES_PLACEHOLDER = 3;
const REPETICOES_PLACEHOLDER = "10-12";

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

/**
 * Aplica um modelo de treino pronto a um aluno (só instrutores): cria uma
 * divisão por cada `divisao` do modelo, com os exercícios já preenchidos.
 * Séries/repetições ficam com um valor provisório — o instrutor ajusta depois.
 */
export async function aplicarModelo(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const instrutor = await requireRole("instrutor");

  const parsed = aplicarModeloSchema.safeParse({
    alunoId: formData.get("alunoId"),
    modeloId: formData.get("modeloId"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos",
    };
  }

  const modelo = MODELOS.find((m) => m.id === parsed.data.modeloId);
  if (!modelo) {
    return { ok: false, error: "Modelo inválido" };
  }

  const supabase = await createClient();

  for (const [i, divisao] of modelo.divisoes.entries()) {
    const { data: treino, error: treinoError } = await supabase
      .from("treinos")
      .insert({
        aluno_id: parsed.data.alunoId,
        nome: divisao.nome,
        foco: divisao.foco,
        ordem: i,
        created_by: instrutor.id,
      })
      .select("id")
      .single();

    if (treinoError || !treino) {
      console.error(
        "[aplicarModelo] falha ao criar divisão:",
        treinoError?.message,
      );
      return {
        ok: false,
        error:
          i > 0
            ? `Não foi possível criar a divisão "${divisao.nome}". As primeiras ${i} divisões já foram aplicadas — confere o treino do aluno antes de tentar de novo.`
            : `Não foi possível aplicar o modelo (falhou ao criar "${divisao.nome}").`,
      };
    }

    const exerciciosRows = divisao.exercicios.map((nome, idx) => ({
      treino_id: treino.id,
      nome,
      series: SERIES_PLACEHOLDER,
      repeticoes: REPETICOES_PLACEHOLDER,
      carga: null,
      observacoes: null,
      ordem: idx,
    }));

    const { error: exerciciosError } = await supabase
      .from("exercicios")
      .insert(exerciciosRows);

    if (exerciciosError) {
      console.error(
        "[aplicarModelo] falha ao criar exercícios:",
        exerciciosError.message,
      );
      return {
        ok: false,
        error: `A divisão "${divisao.nome}" foi criada, mas os exercícios não — confere o treino do aluno antes de tentar de novo.`,
      };
    }
  }

  revalidatePath(`/instrutor/aluno/${parsed.data.alunoId}`);
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
