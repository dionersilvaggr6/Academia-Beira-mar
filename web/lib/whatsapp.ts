import { SITE } from "@/content/site";

export function waLink(opts?: { plano?: string }): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  const msg = opts?.plano
    ? `Olá! Tenho interesse no plano ${opts.plano}.`
    : "Olá! Quero saber mais sobre a Academia Beira Mar.";
  return `${base}?text=${encodeURIComponent(msg)}`;
}
