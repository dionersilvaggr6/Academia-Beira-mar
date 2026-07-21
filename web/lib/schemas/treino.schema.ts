import { z } from "zod";

export const exercicioSchema = z.object({
  nome: z.string().min(1, "Nome do exercício em falta"),
  series: z.number().int().positive("Séries devem ser > 0"),
  repeticoes: z.string().min(1, "Repetições em falta"),
  carga: z.string().optional(),
  observacoes: z.string().optional(),
});

export const treinoSchema = z.object({
  alunoId: z.string().uuid("Aluno inválido"),
  nome: z.string().min(1, "Dá um nome à divisão"),
  foco: z.string().optional(),
});

export const editarTreinoSchema = treinoSchema.extend({
  id: z.string().uuid("Divisão inválida"),
});

export const apagarTreinoSchema = z.object({
  id: z.string().uuid("Divisão inválida"),
  alunoId: z.string().uuid("Aluno inválido"),
});

export const editarExercicioSchema = exercicioSchema.extend({
  id: z.string().uuid("Exercício inválido"),
  alunoId: z.string().uuid("Aluno inválido"),
});

export const apagarExercicioSchema = z.object({
  id: z.string().uuid("Exercício inválido"),
  alunoId: z.string().uuid("Aluno inválido"),
});

export type TreinoInput = z.infer<typeof treinoSchema>;
export type ExercicioInput = z.infer<typeof exercicioSchema>;
export type EditarTreinoInput = z.infer<typeof editarTreinoSchema>;
export type ApagarTreinoInput = z.infer<typeof apagarTreinoSchema>;
export type EditarExercicioInput = z.infer<typeof editarExercicioSchema>;
export type ApagarExercicioInput = z.infer<typeof apagarExercicioSchema>;
