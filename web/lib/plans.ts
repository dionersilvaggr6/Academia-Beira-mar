import type { Plano } from "./plans.schema";

export const PLANS: Plano[] = [
  { id: "diaria", nome: "Diária", preco: 35, forma: "avulso" },
  { id: "semanal", nome: "Semanal", preco: 79, forma: "avulso" },
  { id: "quinzenal", nome: "Quinzenal", preco: 99, forma: "avulso" },
  { id: "mensal", nome: "Mensal", preco: 140, forma: "avulso" },
  {
    id: "mensal-recorrente",
    nome: "Mensal Recorrente",
    preco: 125,
    forma: "cartão",
  },
  {
    id: "mensal-dupla",
    nome: "Mensal Dupla",
    preco: 129,
    forma: "cada (2 pessoas)",
  },
  {
    id: "trimestral",
    nome: "Trimestral",
    preco: 125,
    parcelas: 3,
    forma: "cartão",
  },
  {
    id: "semestral",
    nome: "Semestral",
    preco: 119,
    parcelas: 6,
    forma: "cartão",
  },
  {
    id: "anual-parcelado",
    nome: "Anual Parcelado",
    preco: 99,
    parcelas: 12,
    forma: "cartão",
  },
  {
    id: "anual-vista",
    nome: "Anual à Vista",
    preco: 999,
    forma: "Pix ou dinheiro",
    destaque: true,
  },
];

/**
 * Formata o preço de um plano em pt-BR — ex. "R$ 140,00" ou, quando o plano
 * tem parcelas, "3× de R$ 125,00". Única fonte de verdade: usada pelo card
 * de planos (`PlanoCard`) e pelo checkout (resumo do pedido) para nunca
 * divergirem.
 */
export function precoLabel(plano: Plano): string {
  const val = plano.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return plano.parcelas ? `${plano.parcelas}× de ${val}` : val;
}

/** Busca um plano pelo id — usado pelo checkout para validar/pré-selecionar. */
export function findPlano(id: string): Plano | undefined {
  return PLANS.find((p) => p.id === id);
}
