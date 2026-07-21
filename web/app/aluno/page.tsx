import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Os meus treinos — Beira Mar" };

export default async function AlunoPage() {
  const profile = await requireRole("aluno");
  const supabase = await createClient();
  const { data: treinos, error } = await supabase
    .from("treinos")
    .select("id,nome,foco,ordem")
    .order("ordem");

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-2xl text-fg uppercase">
            Olá, {profile.nome}
          </h1>
          <p className="text-fg-dim text-sm">Os seus treinos</p>
        </div>
        <LogoutButton />
      </header>

      {error ? (
        <p role="alert" className="mt-8 text-err">
          Não foi possível carregar os treinos.
        </p>
      ) : !treinos || treinos.length === 0 ? (
        <p className="mt-8 text-fg-dim">
          Ainda não tem treinos. Fale com o seu instrutor. 💪
        </p>
      ) : (
        <div className="mt-8 grid gap-3">
          {treinos.map((t) => (
            <Link
              key={t.id}
              href={`/aluno/${t.id}`}
              className="rounded-xl border border-flame/25 bg-white/[0.03] p-4 transition hover:border-flame/40"
            >
              <p className="font-bold text-fg">{t.nome}</p>
              {t.foco && <p className="text-fg-dim text-sm">{t.foco}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
