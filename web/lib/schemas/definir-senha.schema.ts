import { z } from "zod";

export const definirSenhaSchema = z
  .object({
    senha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type DefinirSenhaInput = z.infer<typeof definirSenhaSchema>;
