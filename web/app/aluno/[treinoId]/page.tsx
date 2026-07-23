import Link from "next/link";
import { requireRole } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

// Página autenticada e personalizada — sempre renderizada por pedido (nunca
// pré-renderizada no build; depende da sessão e do Supabase em runtime).
export const dynamic = "force-dynamic";

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
      <Link href="/aluno" className="text-flame text-sm">
        ← Voltar
      </Link>
      <h1 className="mt-2 font-extrabold text-2xl text-fg">
        {treino?.nome ?? "Treino"}
      </h1>
      {treino?.foco && <p className="text-fg-dim">{treino.foco}</p>}

      {!exs || exs.length === 0 ? (
        <p className="mt-8 text-fg-dim">Sem exercícios nesta divisão ainda.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {exs.map((e) => (
            <li
              key={e.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="font-bold text-fg">{e.nome}</p>
              <p className="text-flame text-sm">
                {e.series} × {e.repeticoes}
                {e.carga ? ` · ${e.carga}` : ""}
              </p>
              {e.observacoes && (
                <p className="text-fg-dim text-sm">{e.observacoes}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
