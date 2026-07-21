import { z } from "zod";

export const inviteSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  role: z.enum(["aluno", "instrutor"]),
});

export type InviteInput = z.infer<typeof inviteSchema>;
