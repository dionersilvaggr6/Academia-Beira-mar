import { z } from "zod";

export const siteSchema = z.object({
  name: z.string(),
  whatsapp: z.string(),
  whatsappDisplay: z.string(),
  instagram: z.string().url(),
  instagramHandle: z.string(),
  address: z.string(),
  city: z.string(),
  hours: z.array(z.object({ dias: z.string(), horas: z.string() })),
  tagline: z.string(),
  diferenciais: z.array(z.string()).min(1),
  stats: z.array(z.object({ valor: z.string(), rotulo: z.string() })).min(1),
  reviews: z.array(z.object({ texto: z.string(), fonte: z.string() })).min(3),
  flags: z.object({ galeria: z.boolean(), loja: z.boolean() }),
  store: z.array(z.string()),
});
