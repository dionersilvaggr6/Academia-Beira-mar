"use server";

import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export type LoginResult = { ok: false; error: string };

export async function login(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult | null> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "Email ou senha inválidos." };
  }

  const profile = await getProfile();
  redirect(profile?.role === "instrutor" ? "/instrutor" : "/aluno");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
