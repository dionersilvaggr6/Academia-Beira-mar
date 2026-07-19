import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  nome: text("nome").notNull(),
  telefone: text("telefone").notNull(),
  interesse: text("interesse"),
  origem: text("origem").notNull().default("formulario-site"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
