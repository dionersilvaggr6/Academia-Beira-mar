import Link from "next/link";
import { ApagarAlunoButton } from "@/components/instrutor/ApagarAlunoButton";
import { AplicarModeloForm } from "@/components/instrutor/AplicarModeloForm";
import { CriarTreinoForm } from "@/components/instrutor/CriarTreinoForm";
import { TreinoItem } from "@/components/instrutor/TreinoItem";
import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

type Treino = { id: string; nome: string; foco: string | null };
type Exercicio = {
  id: string;
  treino_id: string;
  nome: string;
  series: number;
  repeticoes: string;
  carga: string | null;
  observacoes: string | null;
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
  const { data: treinosData } = await supabase
    .from("treinos")
    .select("id,nome,foco")
    .eq("aluno_id", id)
    .order("ordem");
  const treinos: Treino[] = treinosData ?? [];

  const treinoIds = treinos.map((t) => t.id);
  let exs: Exercicio[] = [];
  if (treinoIds.length > 0) {
    const res = await supabase
      .from("exercicios")
      .select("id,treino_id,nome,series,repeticoes,carga,observacoes")
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

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="font-bold text-fg">Aplicar modelo pronto</h2>
        <AplicarModeloForm alunoId={id} />
      </div>

      <div className="mt-6 space-y-4">
        {treinos.map((t) => (
          <TreinoItem
            key={t.id}
            treino={t}
            alunoId={id}
            exercicios={exs.filter((e) => e.treino_id === t.id)}
          />
        ))}
      </div>

      {aluno && <ApagarAlunoButton alunoId={id} alunoNome={aluno.nome} />}
    </section>
  );
}
