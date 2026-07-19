import { z } from "zod";

export const planoSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(1),
  preco: z.number().positive(),
  parcelas: z.number().int().positive().optional(),
  forma: z.string().min(1),
  destaque: z.boolean().optional(),
});

export type Plano = z.infer<typeof planoSchema>;
