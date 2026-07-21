/**
 * Catálogo de exercícios por grupo muscular.
 *
 * Serve para o instrutor escolher de uma lista em vez de escrever à mão
 * (evita erros de escrita e nomes inconsistentes entre alunos). Séries,
 * repetições e carga ficam SEMPRE à escolha do instrutor — o catálogo só
 * fornece o nome e a organização.
 *
 * Fonte única: para acrescentar um exercício, basta editar este ficheiro.
 */

export type CategoriaId =
  | "peito"
  | "costas"
  | "ombros"
  | "biceps"
  | "triceps"
  | "quadriceps"
  | "posterior"
  | "panturrilha"
  | "abdomen"
  | "funcional";

export type Categoria = {
  readonly id: CategoriaId;
  readonly nome: string;
  readonly exercicios: readonly string[];
};

export const CATALOGO: readonly Categoria[] = [
  {
    id: "peito",
    nome: "Peito",
    exercicios: [
      "Supino reto com barra",
      "Supino reto com halteres",
      "Supino inclinado com halteres",
      "Supino inclinado com barra",
      "Supino declinado",
      "Crucifixo na máquina",
      "Crucifixo com halteres",
      "Crossover na polia",
      "Peck deck",
      "Flexão de braço",
      "Pullover",
    ],
  },
  {
    id: "costas",
    nome: "Costas",
    exercicios: [
      "Puxada alta na frente",
      "Puxada com triângulo",
      "Remada curvada com barra",
      "Remada baixa no cabo",
      "Remada unilateral (serrote)",
      "Remada cavalinho",
      "Barra fixa",
      "Pulldown na polia",
      "Levantamento terra",
    ],
  },
  {
    id: "ombros",
    nome: "Ombros",
    exercicios: [
      "Desenvolvimento com halteres",
      "Desenvolvimento com barra",
      "Desenvolvimento na máquina",
      "Elevação lateral com halteres",
      "Elevação frontal",
      "Crucifixo inverso",
      "Remada alta",
      "Encolhimento (trapézio)",
    ],
  },
  {
    id: "biceps",
    nome: "Bíceps",
    exercicios: [
      "Rosca direta com barra",
      "Rosca direta com halteres",
      "Rosca alternada",
      "Rosca martelo",
      "Rosca scott",
      "Rosca concentrada",
      "Rosca na polia",
    ],
  },
  {
    id: "triceps",
    nome: "Tríceps",
    exercicios: [
      "Tríceps na polia com corda",
      "Tríceps na polia com barra",
      "Tríceps testa",
      "Tríceps francês",
      "Mergulho no banco",
      "Paralelas",
      "Coice (kickback)",
    ],
  },
  {
    id: "quadriceps",
    nome: "Pernas — Quadríceps",
    exercicios: [
      "Agachamento livre",
      "Agachamento no Smith",
      "Leg press 45°",
      "Cadeira extensora",
      "Afundo (avanço)",
      "Hack machine",
      "Agachamento búlgaro",
    ],
  },
  {
    id: "posterior",
    nome: "Pernas — Posterior e Glúteo",
    exercicios: [
      "Cadeira flexora",
      "Mesa flexora",
      "Stiff",
      "Elevação pélvica (hip thrust)",
      "Cadeira abdutora",
      "Glúteo na polia",
      "Agachamento sumô",
    ],
  },
  {
    id: "panturrilha",
    nome: "Panturrilha",
    exercicios: [
      "Elevação de panturrilhas em pé",
      "Panturrilha sentado",
      "Panturrilha no leg press",
    ],
  },
  {
    id: "abdomen",
    nome: "Abdômen e Core",
    exercicios: [
      "Abdominal na máquina",
      "Abdominal remador",
      "Prancha",
      "Prancha lateral",
      "Elevação de pernas",
      "Abdominal oblíquo",
      "Abdominal infra",
    ],
  },
  {
    id: "funcional",
    nome: "Funcional e Cardio",
    exercicios: [
      "Burpee",
      "Kettlebell swing",
      "Corda naval",
      "Box jump",
      "Esteira",
      "Bicicleta ergométrica",
      "Remo ergômetro",
      "Escada (simulador)",
    ],
  },
];

/** Todos os nomes do catálogo, achatados (para autocomplete/validação). */
export const TODOS_EXERCICIOS: readonly string[] = CATALOGO.flatMap(
  (c) => c.exercicios,
);
