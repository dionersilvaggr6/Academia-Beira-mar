import { z } from "zod";

export const apagarAlunoSchema = z.object({
  alunoId: z.string().uuid("Aluno inválido"),
});

export type ApagarAlunoInput = z.infer<typeof apagarAlunoSchema>;
