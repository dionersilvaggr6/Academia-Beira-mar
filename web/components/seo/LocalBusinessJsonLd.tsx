import { SITE } from "@/content/site";
import { PLANS } from "@/lib/plans";
import { buildLocalBusinessJsonLd } from "@/lib/seo/local-business-json-ld";
import { SITE_URL } from "@/lib/seo/site-url";

/**
 * JSON-LD (schema.org HealthClub/LocalBusiness) da home — ajuda buscadores e
 * o Google Business a mostrar endereço, horário e avaliação diretamente nos
 * resultados. Dados vêm só de `SITE`/`PLANS` (ver `buildLocalBusinessJsonLd`)
 * — nunca inventa coordenadas, telefone ou contagem de reviews.
 */
export function LocalBusinessJsonLd() {
  const jsonLd = buildLocalBusinessJsonLd({
    site: SITE,
    plans: PLANS,
    siteUrl: SITE_URL,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Neutraliza "<" para o payload nunca fechar a tag <script> prematuramente
        // nem injetar markup (recomendação oficial do Next para JSON-LD).
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
