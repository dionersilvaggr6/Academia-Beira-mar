import type { SITE } from "@/content/site";
import type { Plano } from "@/lib/plans.schema";

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type OpeningHoursSpecification = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: DayOfWeek[];
  opens?: string;
  closes?: string;
};

export type LocalBusinessJsonLd = {
  "@context": "https://schema.org";
  "@type": ["HealthClub", "LocalBusiness"];
  name: string;
  image: string;
  url: string;
  telephone: string;
  address: {
    "@type": "PostalAddress";
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: "BR";
  };
  openingHoursSpecification: OpeningHoursSpecification[];
  priceRange: string;
  sameAs: string[];
  aggregateRating: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
};

const WEEK_ORDER: DayOfWeek[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const PT_DIA_TO_EN: Record<string, DayOfWeek> = {
  domingo: "Sunday",
  segunda: "Monday",
  terça: "Tuesday",
  terca: "Tuesday",
  quarta: "Wednesday",
  quinta: "Thursday",
  sexta: "Friday",
  sábado: "Saturday",
  sabado: "Saturday",
};

const TIME_RE = /^\d{2}:\d{2}$/;
const CITY_RE = /^(.+?)\s[–—-]\s([^,]+),\s*(.+)$/;

/** "Segunda a Sexta" → [Monday..Friday]; "Sábado" → [Saturday]. */
function parseDiasSemana(dias: string): DayOfWeek[] {
  const partes = dias.split(/\s+a\s+/i).map((s) => s.trim().toLowerCase());

  if (partes.length === 2) {
    const [inicioPt, fimPt] = partes;
    const inicio = inicioPt ? PT_DIA_TO_EN[inicioPt] : undefined;
    const fim = fimPt ? PT_DIA_TO_EN[fimPt] : undefined;
    if (!inicio || !fim) {
      throw new Error(`SITE.hours: dias em formato inesperado: "${dias}"`);
    }
    const iInicio = WEEK_ORDER.indexOf(inicio);
    const iFim = WEEK_ORDER.indexOf(fim);
    if (iInicio === -1 || iFim === -1 || iFim < iInicio) {
      throw new Error(`SITE.hours: intervalo de dias inválido: "${dias}"`);
    }
    return WEEK_ORDER.slice(iInicio, iFim + 1);
  }

  const unico = PT_DIA_TO_EN[dias.trim().toLowerCase()];
  if (!unico) {
    throw new Error(`SITE.hours: dia não reconhecido: "${dias}"`);
  }
  return [unico];
}

/** "05:30 – 22:00" → { opens, closes }; "Fechado" → {} (nunca inventa horário). */
function parseHoras(horas: string): { opens?: string; closes?: string } {
  if (horas.trim().toLowerCase() === "fechado") return {};

  const [opens, closes] = horas.split(/\s*[–—-]\s*/).map((s) => s.trim());
  if (!opens || !closes || !TIME_RE.test(opens) || !TIME_RE.test(closes)) {
    throw new Error(`SITE.hours: horas em formato inesperado: "${horas}"`);
  }
  return { opens, closes };
}

/** "Capão da Canoa – RS, 95555-000" → locality/region/postalCode. */
function parseAddressCity(city: string): {
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
} {
  const match = CITY_RE.exec(city);
  const addressLocality = match?.[1]?.trim();
  const addressRegion = match?.[2]?.trim();
  const postalCode = match?.[3]?.trim();
  if (!addressLocality || !addressRegion || !postalCode) {
    throw new Error(`SITE.city em formato inesperado: "${city}"`);
  }
  return { addressLocality, addressRegion, postalCode };
}

function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Menor/maior preço real de PLANS, formatado em BRL — nunca hardcoded. */
function formatPriceRange(plans: readonly Plano[]): string {
  const precos = plans.map((p) => p.preco);
  return `${formatBRL(Math.min(...precos))} – ${formatBRL(Math.max(...precos))}`;
}

/** Extrai a nota (ex.: "5★" → 5) da stat de avaliação real de SITE.stats. */
function findRatingValue(stats: (typeof SITE)["stats"]): number {
  const avaliacao = stats.find((s) => /avalia/i.test(s.rotulo));
  if (!avaliacao) {
    throw new Error("SITE.stats: falta a stat de avaliação do Google.");
  }
  const valor = Number.parseFloat(avaliacao.valor);
  if (Number.isNaN(valor)) {
    throw new Error(
      `SITE.stats: valor de avaliação inválido: "${avaliacao.valor}"`,
    );
  }
  return valor;
}

/**
 * Constrói o JSON-LD (schema.org HealthClub/LocalBusiness) só a partir de
 * SITE/PLANS reais — nunca inventa coordenadas, telefone, contagem de
 * reviews ou horários. Campos não deriváveis (ex.: geo) ficam de fora do
 * tipo de retorno em vez de aparecerem como undefined/fake.
 */
export function buildLocalBusinessJsonLd(params: {
  site: typeof SITE;
  plans: readonly Plano[];
  siteUrl: string;
}): LocalBusinessJsonLd {
  const { site, plans, siteUrl } = params;
  const baseUrl = siteUrl.replace(/\/+$/, "");
  const address = parseAddressCity(site.city);

  return {
    "@context": "https://schema.org",
    "@type": ["HealthClub", "LocalBusiness"],
    name: site.name,
    image: `${baseUrl}/opengraph-image`,
    url: `${baseUrl}/`,
    telephone: `+${site.whatsapp}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address,
      ...address,
      addressCountry: "BR",
    },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: parseDiasSemana(h.dias),
      ...parseHoras(h.horas),
    })),
    priceRange: formatPriceRange(plans),
    sameAs: [site.instagram],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: findRatingValue(site.stats),
      reviewCount: site.reviews.length,
    },
  };
}
