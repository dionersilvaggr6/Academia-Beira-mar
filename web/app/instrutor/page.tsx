import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ConvidarForm } from "@/components/instrutor/ConvidarForm";
import { Badge } from "@/components/ui/Badge";
import { isPendingInvite } from "@/lib/auth/invite-status";
import { requireRole } from "@/lib/auth/profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Painel do instrutor — Beira Mar" };

// Página autenticada e personalizada — sempre renderizada por pedido (nunca
// pré-renderizada no build; depende da sessão e do Supabase em runtime).
export const dynamic = "force-dynamic";

/**
 * Cruza os ids de perfis (`profiles`) com a lista de utilizadores do Auth
 * para saber quem ainda não aceitou o convite (ver `isPendingInvite`).
 *
 * Uma ginásio pequeno cabe sempre numa página (`perPage: 1000`), por isso
 * não é preciso paginar. Se a chamada admin falhar por qualquer razão
 * (env em falta, Supabase em baixo, etc.), degrada em silêncio devolvendo
 * "ninguém pendente" — a lista de alunos nunca deve deixar de aparecer por
 * causa disto.
 */
async function loadPendingAlunoIds(ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (error) throw error;

    const userById = new Map(data.users.map((user) => [user.id, user]));
    return new Set(
      ids.filter((id) => {
        const user = userById.get(id);
        return user ? isPendingInvite(user) : false;
      }),
    );
  } catch (err) {
    console.error(
      "[InstrutorPage] falha ao verificar convites pendentes:",
      err instanceof Error ? err.message : "erro",
    );
    return new Set();
  }
}

export default async function InstrutorPage() {
  const profile = await requireRole("instrutor");
  const supabase = await createClient();
  const { data: alunos } = await supabase
    .from("profiles")
    .select("id,nome")
    .eq("role", "aluno")
    .order("nome");

  const pendingIds = await loadPendingAlunoIds((alunos ?? []).map((a) => a.id));

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="min-w-0 break-words font-extrabold text-2xl text-fg uppercase">
          Painel — {profile.nome}
        </h1>
        <LogoutButton />
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-bold text-fg">Novo aluno</h2>
          <ConvidarForm role="aluno" label="Convidar aluno" />
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <h2 className="font-bold text-fg">Novo instrutor</h2>
          <ConvidarForm role="instrutor" label="Convidar instrutor" />
        </div>
      </div>

      <h2 className="mt-10 font-bold text-flame">Alunos</h2>
      {!alunos || alunos.length === 0 ? (
        <p className="mt-2 text-fg-dim">
          Ainda não há alunos. Convide o primeiro acima.
        </p>
      ) : (
        <div className="mt-3 grid gap-2">
          {alunos.map((a) => (
            <Link
              key={a.id}
              href={`/instrutor/aluno/${a.id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-fg transition hover:border-flame/40"
            >
              <span className="min-w-0 truncate">{a.nome}</span>
              {pendingIds.has(a.id) && (
                <Badge className="shrink-0 text-warn">Convite pendente</Badge>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
