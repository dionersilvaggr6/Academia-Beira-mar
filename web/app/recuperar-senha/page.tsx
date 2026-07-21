import Link from "next/link";
import { RecuperarSenhaForm } from "@/components/auth/RecuperarSenhaForm";

export const metadata = { title: "Recuperar senha — Academia Beira Mar" };

// Mesma razão das outras páginas de auth: depende só de uma server action,
// nunca pré-renderizada no build.
export const dynamic = "force-dynamic";

export default function RecuperarSenhaPage() {
  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-center font-extrabold text-2xl text-fg uppercase">
        Recuperar <span className="text-flame">senha</span>
      </h1>
      <p className="mt-2 text-center text-fg-dim text-sm">
        Informe seu email para receber o link de redefinição de senha.
      </p>
      <RecuperarSenhaForm />
      <p className="mt-6 text-center text-fg-dim text-sm">
        <Link href="/login" className="hover:text-flame hover:underline">
          Voltar para o login
        </Link>
      </p>
    </section>
  );
}
