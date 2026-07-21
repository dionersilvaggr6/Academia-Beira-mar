import Link from "next/link";
import { CriarExercicioForm } from "@/components/instrutor/CriarExercicioForm";
import { CriarTreinoForm } from "@/components/instrutor/CriarTreinoForm";
import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

type Exercicio = {
  id: string;
  treino_id: string;
  nome: string;
  series: number;
  repeticoes: string;
  carga: string | null;
};

export default async function GerirAlunoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("instrutor");
  const { id } = await params;
  const supabase = await createClient();

  const { data: aluno } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", id)
    .single();
  const { data: treinos } = await supabase
    .from("treinos")
    .select("id,nome,foco")
    .eq("aluno_id", id)
    .order("ordem");

  const treinoIds = (treinos ?? []).map((t) => t.id);
  let exs: Exercicio[] = [];
  if (treinoIds.length > 0) {
    const res = await supabase
      .from("exercicios")
      .select("id,treino_id,nome,series,repeticoes,carga")
      .in("treino_id", treinoIds)
      .order("ordem");
    exs = res.data ?? [];
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/instrutor" className="text-flame text-sm">
        ← Voltar
      </Link>
      <h1 className="mt-2 font-extrabold text-2xl text-fg">
        Treinos de {aluno?.nome ?? "aluno"}
      </h1>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="font-bold text-fg">Nova divisão</h2>
        <CriarTreinoForm alunoId={id} />
      </div>

      <div className="mt-6 space-y-4">
        {(treinos ?? []).map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-flame/25 bg-white/[0.03] p-4"
          >
            <p className="font-bold text-fg">
              {t.nome}
              {t.foco ? ` — ${t.foco}` : ""}
            </p>
            <ul className="mt-2 space-y-1">
              {exs
                .filter((e) => e.treino_id === t.id)
                .map((e) => (
                  <li key={e.id} className="text-fg-dim text-sm">
                    {e.nome} — {e.series}×{e.repeticoes}
                    {e.carga ? ` · ${e.carga}` : ""}
                  </li>
                ))}
            </ul>
            <CriarExercicioForm treinoId={t.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
