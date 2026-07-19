import { z } from "zod";

export const leadSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  telefone: z.string().min(8, "Telefone inválido"),
  interesse: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
