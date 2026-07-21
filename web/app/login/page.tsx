import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getProfile } from "@/lib/auth/profile";

export const metadata = { title: "Entrar — Academia Beira Mar" };

// Verifica a sessão (Supabase) para redirecionar — sempre dinâmica, nunca
// pré-renderizada no build.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const profile = await getProfile();
  if (profile) redirect(profile.role === "instrutor" ? "/instrutor" : "/aluno");

  const { erro } = await searchParams;

  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-center font-extrabold text-2xl text-fg uppercase">
        Área de <span className="text-flame">Treino</span>
      </h1>
      <p className="mt-2 text-center text-fg-dim text-sm">
        Entre com seu email e senha. Alunos e instrutores.
      </p>
      {erro === "convite" && (
        <p role="alert" className="mt-4 text-center text-err text-sm">
          O link de convite expirou ou já foi usado. Entre com seu email e
          senha, ou peça um novo convite.
        </p>
      )}
      <LoginForm />
      <p className="mt-4 text-center text-fg-dim text-xs">
        <Link
          href="/recuperar-senha"
          className="hover:text-flame hover:underline"
        >
          Esqueceu sua senha?
        </Link>
      </p>
    </section>
  );
}
