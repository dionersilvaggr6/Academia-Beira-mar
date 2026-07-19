import { z } from "zod";

const schema = z.object({ DATABASE_URL: z.string().url() });

let cached: z.infer<typeof schema> | null = null;

/**
 * Valida a env de forma preguiçosa (só quando é preciso a base de dados),
 * para o site compilar e correr mesmo sem o Supabase ligado ainda.
 */
export function getEnv(): z.infer<typeof schema> {
  if (!cached) cached = schema.parse(process.env);
  return cached;
}
