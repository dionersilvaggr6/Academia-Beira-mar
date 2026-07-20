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

export type TreinoInput = z.infer<typeof treinoSchema>;
export type ExercicioInput = z.infer<typeof exercicioSchema>;
