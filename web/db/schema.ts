import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull(),
  interesse: text("interesse"),
  origem: text("origem").notNull().default("formulario-site"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- Fase 2A: área de aluno ---

// perfil 1:1 com auth.users (o id é o mesmo do utilizador Supabase Auth)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  nome: text("nome").notNull(),
  role: text("role").notNull().default("aluno"), // 'aluno' | 'instrutor'
  telefone: text("telefone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// divisão de treino de um aluno (Treino A, B, C…)
export const treinos = pgTable("treinos", {
  id: uuid("id").defaultRandom().primaryKey(),
  alunoId: uuid("aluno_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  foco: text("foco"),
  ordem: integer("ordem").notNull().default(0),
  createdBy: uuid("created_by").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// exercício dentro de uma divisão
export const exercicios = pgTable("exercicios", {
  id: uuid("id").defaultRandom().primaryKey(),
  treinoId: uuid("treino_id")
    .notNull()
    .references(() => treinos.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  series: integer("series").notNull(),
  repeticoes: text("repeticoes").notNull(),
  carga: text("carga"),
  observacoes: text("observacoes"),
  ordem: integer("ordem").notNull().default(0),
});
