import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import { InviteHashRedirect } from "@/components/auth/InviteHashRedirect";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsappFab } from "@/components/layout/WhatsappFab";
import { MotionProvider } from "@/components/MotionProvider";
import { ParticleFieldLazy } from "@/components/three/ParticleFieldLazy";
import "./globals.css";

const chakra = Chakra_Petch({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Academia Beira Mar — Capão da Canoa | Aqui Evoluímos",
  description:
    "Musculação, Pilates e Funcional em Capão da Canoa. Aparelhos novos, climatizada, ambiente familiar. 5★ no Google. Veja os planos e matricule-se.",
  openGraph: {
    title: "Academia Beira Mar — Aqui Evoluímos",
    description: "Musculação · Pilates · Funcional em Capão da Canoa.",
    type: "website",
  },
  icons: { icon: "/brand/mark.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${chakra.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink text-fg">
        <InviteHashRedirect />
        {/*
         * Fundo 3D ambiente — instância única do campo de partículas,
         * montada aqui (não mais dentro do Hero) para rodar em todas as
         * páginas. `fixed inset-0` + `z-0` explícito (nunca z-index
         * negativo: o `body` tem fundo opaco `--color-ink` e um z-index
         * negativo aqui poderia acabar atrás dele). `pointer-events-none`
         * + `aria-hidden` para nunca capturar clique nem ser lido por
         * leitor de tela. Opacidade reduzida (30%) mantém o contraste do
         * texto >= 4,5:1 mesmo nas telas utilitárias com muito texto sobre
         * fundo liso (login, aluno, instrutor, definir/recuperar senha).
         */}
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-30"
          aria-hidden
        >
          <ParticleFieldLazy />
        </div>
        <MotionProvider>
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsappFab />
          </div>
        </MotionProvider>
      </body>
    </html>
  );
}
