export type NavItem = { href: string; label: string };

/**
 * Anchors shared by the desktop nav (Header) and the mobile drawer
 * (MobileMenu) so the two never drift apart.
 */
export const HEADER_NAV: readonly NavItem[] = [
  { href: "/#modalidades", label: "Modalidades" },
  { href: "/#planos", label: "Planos" },
  { href: "/#depoimentos", label: "Depoimentos" },
  { href: "/#localizacao", label: "Onde estamos" },
];
