import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import { InviteHashRedirect } from "@/components/auth/InviteHashRedirect";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsappFab } from "@/components/layout/WhatsappFab";
import { MotionProvider } from "@/components/MotionProvider";
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
        <MotionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsappFab />
        </MotionProvider>
      </body>
    </html>
  );
}
