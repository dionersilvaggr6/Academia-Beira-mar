import { DefinirSenhaGate } from "@/components/auth/DefinirSenhaGate";

export const metadata = { title: "Definir senha — Academia Beira Mar" };

// A sessão do convite é estabelecida no cliente a partir da hash da URL
// (ver DefinirSenhaGate) — nunca pré-renderizada no build (igual à página
// de login).
export const dynamic = "force-dynamic";

export default function DefinirSenhaPage() {
  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-center font-extrabold text-2xl text-fg uppercase">
        Defina sua <span className="text-flame">senha</span>
      </h1>
      <DefinirSenhaGate />
    </section>
  );
}
