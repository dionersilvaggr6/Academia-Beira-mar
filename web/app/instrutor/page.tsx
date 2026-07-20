import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ConvidarForm } from "@/components/instrutor/ConvidarForm";
import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Painel do instrutor — Beira Mar" };

export default async function InstrutorPage() {
  const profile = await requireRole("instrutor");
  const supabase = await createClient();
  const { data: alunos } = await supabase
    .from("profiles")
    .select("id,nome")
    .eq("role", "aluno")
    .order("nome");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <header className="flex items-center justify-between">
        <h1 className="font-extrabold text-2xl text-bm-cream uppercase">
          Painel — {profile.nome}
        </h1>
        <LogoutButton />
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-bold text-bm-cream">Novo aluno</h2>
          <ConvidarForm role="aluno" label="Convidar aluno" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-bold text-bm-cream">Novo instrutor</h2>
          <ConvidarForm role="instrutor" label="Convidar instrutor" />
        </div>
      </div>

      <h2 className="mt-10 font-bold text-bm-orange">Alunos</h2>
      {!alunos || alunos.length === 0 ? (
        <p className="mt-2 text-bm-cream/60">
          Ainda não há alunos. Convida o primeiro acima.
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {alunos.map((a) => (
            <Link
              key={a.id}
              href={`/instrutor/aluno/${a.id}`}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-bm-cream transition hover:border-bm-orange/40"
            >
              {a.nome}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
