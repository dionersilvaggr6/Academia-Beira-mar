import Link from "next/link";
import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export default async function TreinoDetalhePage({
  params,
}: {
  params: Promise<{ treinoId: string }>;
}) {
  await requireRole("aluno");
  const { treinoId } = await params;
  const supabase = await createClient();

  const { data: treino } = await supabase
    .from("treinos")
    .select("nome,foco")
    .eq("id", treinoId)
    .single();
  const { data: exs } = await supabase
    .from("exercicios")
    .select("id,nome,series,repeticoes,carga,observacoes,ordem")
    .eq("treino_id", treinoId)
    .order("ordem");

  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/aluno" className="text-bm-orange text-sm">
        ← Voltar
      </Link>
      <h1 className="mt-2 font-extrabold text-2xl text-bm-cream">
        {treino?.nome ?? "Treino"}
      </h1>
      {treino?.foco && <p className="text-bm-cream/60">{treino.foco}</p>}

      {!exs || exs.length === 0 ? (
        <p className="mt-8 text-bm-cream/60">
          Sem exercícios nesta divisão ainda.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {exs.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="font-bold text-bm-cream">{e.nome}</p>
              <p className="text-bm-orange text-sm">
                {e.series} × {e.repeticoes}
                {e.carga ? ` · ${e.carga}` : ""}
              </p>
              {e.observacoes && (
                <p className="text-bm-cream/60 text-sm">{e.observacoes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
