/**
 * Modelos de divisão de treino prontos a aplicar.
 *
 * O instrutor escolhe um modelo e o sistema cria as divisões já com os
 * exercícios preenchidos. **Séries, repetições e carga ficam em branco** —
 * são sempre decisão do instrutor, que ajusta a cada aluno.
 *
 * Todos os nomes de exercício devem existir em `catalogo.ts` (há um teste
 * que garante essa invariante).
 */

export type ModeloDivisao = {
  readonly nome: string;
  readonly foco: string;
  readonly exercicios: readonly string[];
};

export type Modelo = {
  readonly id: string;
  readonly nome: string;
  readonly descricao: string;
  readonly divisoes: readonly ModeloDivisao[];
};

export const MODELOS: readonly Modelo[] = [
  {
    id: "abc",
    nome: "ABC — Push / Pull / Pernas",
    descricao:
      "Clássico de 3 divisões para quem treina 3 a 6 vezes por semana.",
    divisoes: [
      {
        nome: "Treino A",
        foco: "Peito, Ombro e Tríceps",
        exercicios: [
          "Supino reto com barra",
          "Supino inclinado com halteres",
          "Crossover na polia",
          "Elevação lateral com halteres",
          "Tríceps na polia com corda",
        ],
      },
      {
        nome: "Treino B",
        foco: "Costas, Bíceps e Posterior de Ombro",
        exercicios: [
          "Puxada alta na frente",
          "Remada curvada com barra",
          "Crucifixo inverso",
          "Rosca direta com barra",
          "Rosca martelo",
        ],
      },
      {
        nome: "Treino C",
        foco: "Pernas Completas e Abdômen",
        exercicios: [
          "Agachamento livre",
          "Leg press 45°",
          "Cadeira extensora",
          "Cadeira flexora",
          "Elevação de panturrilhas em pé",
          "Abdominal na máquina",
        ],
      },
    ],
  },
  {
    id: "ab",
    nome: "AB — Superiores / Inferiores",
    descricao: "Duas divisões, ideal para quem treina 2 a 4 vezes por semana.",
    divisoes: [
      {
        nome: "Treino A",
        foco: "Superiores",
        exercicios: [
          "Supino reto com halteres",
          "Puxada alta na frente",
          "Desenvolvimento com halteres",
          "Remada baixa no cabo",
          "Rosca direta com halteres",
          "Tríceps na polia com corda",
        ],
      },
      {
        nome: "Treino B",
        foco: "Inferiores e Core",
        exercicios: [
          "Agachamento livre",
          "Leg press 45°",
          "Cadeira extensora",
          "Cadeira flexora",
          "Elevação de panturrilhas em pé",
          "Prancha",
        ],
      },
    ],
  },
  {
    id: "abcd",
    nome: "ABCD — 4 divisões",
    descricao:
      "Mais volume por grupo muscular, para quem treina 4 a 6 vezes por semana.",
    divisoes: [
      {
        nome: "Treino A",
        foco: "Peito e Tríceps",
        exercicios: [
          "Supino reto com barra",
          "Supino inclinado com halteres",
          "Crossover na polia",
          "Tríceps testa",
          "Tríceps na polia com corda",
        ],
      },
      {
        nome: "Treino B",
        foco: "Costas e Bíceps",
        exercicios: [
          "Puxada alta na frente",
          "Remada curvada com barra",
          "Remada unilateral (serrote)",
          "Rosca direta com barra",
          "Rosca martelo",
        ],
      },
      {
        nome: "Treino C",
        foco: "Ombros e Abdômen",
        exercicios: [
          "Desenvolvimento com halteres",
          "Elevação lateral com halteres",
          "Elevação frontal",
          "Crucifixo inverso",
          "Abdominal na máquina",
          "Prancha",
        ],
      },
      {
        nome: "Treino D",
        foco: "Pernas Completas",
        exercicios: [
          "Agachamento livre",
          "Leg press 45°",
          "Cadeira extensora",
          "Cadeira flexora",
          "Stiff",
          "Elevação de panturrilhas em pé",
        ],
      },
    ],
  },
  {
    id: "full-body",
    nome: "Full Body — Iniciante",
    descricao:
      "Uma única divisão que trabalha o corpo todo, 3 vezes por semana. Ideal para quem está a começar.",
    divisoes: [
      {
        nome: "Treino Full Body",
        foco: "Corpo inteiro",
        exercicios: [
          "Agachamento livre",
          "Supino reto com halteres",
          "Puxada alta na frente",
          "Desenvolvimento com halteres",
          "Rosca direta com halteres",
          "Tríceps na polia com corda",
          "Prancha",
        ],
      },
    ],
  },
];
