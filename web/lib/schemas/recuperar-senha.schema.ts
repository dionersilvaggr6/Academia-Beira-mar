import { z } from "zod";

export const recuperarSenhaSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;
