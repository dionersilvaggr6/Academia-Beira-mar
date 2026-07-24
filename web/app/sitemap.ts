import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

/**
 * Só as rotas públicas e indexáveis — as áreas autenticadas e utilitárias
 * (login, definir/recuperar senha, aluno, instrutor, checkout/sucesso,
 * checkout/erro, api) ficam de fora, e também estão bloqueadas em
 * `app/robots.ts`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
