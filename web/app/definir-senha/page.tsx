import { DefinirSenhaForm } from "@/components/auth/DefinirSenhaForm";
import { ButtonLink } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { getProfile } from "@/lib/auth/profile";

export const metadata = { title: "Definir senha — Academia Beira Mar" };

// Depende da sessão criada pelo callback do convite — nunca pré-renderizada
// no build (igual à página de login).
export const dynamic = "force-dynamic";

export default async function DefinirSenhaPage() {
  const profile = await getProfile();

  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-center font-extrabold text-2xl text-fg uppercase">
        Defina sua <span className="text-flame">senha</span>
      </h1>

      {profile ? (
        <>
          <p className="mt-2 text-center text-fg-dim text-sm">
            Crie uma senha para acessar sua conta.
          </p>
          <DefinirSenhaForm />
        </>
      ) : (
        <GlassCard className="mt-8 text-center">
          <p className="text-fg-dim text-sm">
            Não encontramos uma sessão ativa. O link de convite pode ter
            expirado ou já ter sido usado.
          </p>
          <ButtonLink href="/login" className="mt-4 inline-flex">
            Ir para o login
          </ButtonLink>
        </GlassCard>
      )}
    </section>
  );
}
