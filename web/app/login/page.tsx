import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getProfile } from "@/lib/auth/profile";

export const metadata = { title: "Entrar — Academia Beira Mar" };

export default async function LoginPage() {
  const profile = await getProfile();
  if (profile) redirect(profile.role === "instrutor" ? "/instrutor" : "/aluno");

  return (
    <section className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-center font-extrabold text-2xl text-bm-cream uppercase">
        Área do <span className="text-bm-orange">Aluno</span>
      </h1>
      <p className="mt-2 text-center text-bm-cream/60 text-sm">
        Entra com o teu email e senha.
      </p>
      <LoginForm />
    </section>
  );
}
