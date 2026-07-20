import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "aluno" | "instrutor";
export type Profile = {
  id: string;
  nome: string;
  role: Role;
  telefone: string | null;
};

/** Devolve o perfil do utilizador autenticado, ou null se não houver sessão. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id,nome,role,telefone")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

/**
 * Garante que o utilizador tem o papel pedido.
 * Sem sessão → /login. Papel errado → redireciona para a área do seu papel.
 */
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role !== role) {
    redirect(profile.role === "instrutor" ? "/instrutor" : "/aluno");
  }
  return profile;
}
