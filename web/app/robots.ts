import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site-url";

/**
 * Liberta tudo por padrão e bloqueia só as áreas autenticadas/utilitárias
 * (nunca têm valor de SEO e não devem aparecer em resultados de busca).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/aluno",
        "/instrutor",
        "/login",
        "/definir-senha",
        "/recuperar-senha",
        "/checkout/sucesso",
        "/checkout/erro",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
