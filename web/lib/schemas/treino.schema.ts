import { z } from "zod";
import { MODELOS } from "@/lib/treinos/modelos";

const MODELO_IDS = MODELOS.map((m) => m.id);

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

export const criarExercicioSchema = exercicioSchema.extend({
  treinoId: z.string().uuid("Divisão inválida"),
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

export const aplicarModeloSchema = z.object({
  alunoId: z.string().uuid("Aluno inválido"),
  modeloId: z
    .string()
    .refine((id) => MODELO_IDS.includes(id), "Modelo inválido"),
});

export type TreinoInput = z.infer<typeof treinoSchema>;
export type ExercicioInput = z.infer<typeof exercicioSchema>;
export type CriarExercicioInput = z.infer<typeof criarExercicioSchema>;
export type EditarTreinoInput = z.infer<typeof editarTreinoSchema>;
export type ApagarTreinoInput = z.infer<typeof apagarTreinoSchema>;
export type EditarExercicioInput = z.infer<typeof editarExercicioSchema>;
export type ApagarExercicioInput = z.infer<typeof apagarExercicioSchema>;
export type AplicarModeloInput = z.infer<typeof aplicarModeloSchema>;
