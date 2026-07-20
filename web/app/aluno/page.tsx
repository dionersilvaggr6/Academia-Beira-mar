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
          <h1 className="font-extrabold text-2xl text-bm-cream uppercase">
            Olá, {profile.nome}
          </h1>
          <p className="text-bm-cream/60 text-sm">Os teus treinos</p>
        </div>
        <LogoutButton />
      </header>

      {error ? (
        <p role="alert" className="mt-8 text-red-400">
          Não foi possível carregar os treinos.
        </p>
      ) : !treinos || treinos.length === 0 ? (
        <p className="mt-8 text-bm-cream/60">
          Ainda não tens treinos. Fala com o teu instrutor. 💪
        </p>
      ) : (
        <div className="mt-8 grid gap-3">
          {treinos.map((t) => (
            <Link
              key={t.id}
              href={`/aluno/${t.id}`}
              className="rounded-xl border border-bm-orange/25 bg-white/[0.03] p-4 transition hover:border-bm-orange/40"
            >
              <p className="font-bold text-bm-cream">{t.nome}</p>
              {t.foco && <p className="text-bm-cream/60 text-sm">{t.foco}</p>}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
