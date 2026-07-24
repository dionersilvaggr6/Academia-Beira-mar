import { describe, expect, it } from "vitest";
import { SITE } from "@/content/site";
import { PLANS } from "@/lib/plans";
import { buildLocalBusinessJsonLd } from "@/lib/seo/local-business-json-ld";

const SITE_URL = "https://academia-beira-mar.vercel.app";

describe("buildLocalBusinessJsonLd", () => {
  const jsonLd = buildLocalBusinessJsonLd({
    site: SITE,
    plans: PLANS,
    siteUrl: SITE_URL,
  });

  it("usa o @context/@type do schema.org para academia", () => {
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toEqual(["HealthClub", "LocalBusiness"]);
  });

  it("usa o nome, telefone e imagem reais de SITE", () => {
    expect(jsonLd.name).toBe(SITE.name);
    expect(jsonLd.telephone).toBe(`+${SITE.whatsapp}`);
    expect(jsonLd.image).toBe(`${SITE_URL}/opengraph-image`);
    expect(jsonLd.url).toBe(`${SITE_URL}/`);
  });

  it("deriva o endereço estruturado a partir de SITE.address/SITE.city", () => {
    expect(jsonLd.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Capão da Canoa",
      addressRegion: "RS",
      postalCode: "95555-000",
      addressCountry: "BR",
    });
  });

  it("gera um openingHoursSpecification por cada entrada de SITE.hours", () => {
    expect(jsonLd.openingHoursSpecification).toHaveLength(SITE.hours.length);
  });

  it("converte 'Segunda a Sexta' + horas em dayOfWeek/opens/closes", () => {
    const semana = jsonLd.openingHoursSpecification[0];
    expect(semana).toEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "05:30",
      closes: "22:00",
    });
  });

  it("converte 'Sábado' num único dia", () => {
    const sabado = jsonLd.openingHoursSpecification[1];
    expect(sabado).toEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "10:00",
      closes: "16:00",
    });
  });

  it("'Domingo — Fechado' não inventa opens/closes (campos omitidos, não undefined)", () => {
    const domingo = jsonLd.openingHoursSpecification[2];
    expect(domingo).toBeDefined();
    if (!domingo) return;
    expect(domingo.dayOfWeek).toEqual(["Sunday"]);
    expect("opens" in domingo).toBe(false);
    expect("closes" in domingo).toBe(false);
  });

  it("sameAs inclui o Instagram real", () => {
    expect(jsonLd.sameAs).toEqual([SITE.instagram]);
  });

  it("aggregateRating usa a nota real dos stats e a contagem real de reviews (sem inflar)", () => {
    expect(jsonLd.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 5,
      reviewCount: SITE.reviews.length,
    });
  });

  it("priceRange deriva do menor e maior preço de PLANS, em BRL", () => {
    const min = Math.min(...PLANS.map((p) => p.preco));
    const max = Math.max(...PLANS.map((p) => p.preco));
    const fmt = (v: number) =>
      v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    expect(jsonLd.priceRange).toBe(`${fmt(min)} – ${fmt(max)}`);
  });

  it("nunca inclui geo (não há coordenadas reais em SITE)", () => {
    expect(jsonLd).not.toHaveProperty("geo");
  });
});
