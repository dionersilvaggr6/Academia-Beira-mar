// Imagens placeholder (Unsplash) — verificadas (HTTP 200). Substituir pelas
// fotos reais da Academia Beira Mar quando disponíveis. Centralizado aqui para
// troca fácil de qualquer imagem sem tocar nos componentes.
const u = (id: string, w = 1200): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const MODALIDADE_IMG: Record<string, string> = {
  musculacao: u("1517836357463-d25dfeac3438"),
  pilates: u("1544367567-0f2fcb009e0b"),
  funcional: u("1534438327276-14e5300c3a48"),
};

// Foto de ambiente para a secção "Sobre".
export const SOBRE_IMG = u("1571902943202-507ec2618e8f", 1400);

type GalleryImage = { src: string; alt: string };

export const GALLERY: readonly GalleryImage[] = [
  {
    id: "1571902943202-507ec2618e8f",
    alt: "Sala de musculação da Academia Beira Mar",
  },
  { id: "1534258936925-c58bed479fcb", alt: "Halteres e pesos livres" },
  {
    id: "1540497077202-7c8a3999166f",
    alt: "Aparelhos de musculação novos e completos",
  },
  { id: "1518611012118-696072aa579a", alt: "Kettlebell para treino funcional" },
  { id: "1581009146145-b5ef050c2e1e", alt: "Ambiente de treino da academia" },
  { id: "1550345332-09e3ac987658", alt: "Espaço de treino climatizado" },
].map((g) => ({ src: u(g.id), alt: g.alt }));
