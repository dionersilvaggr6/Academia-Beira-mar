import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsappFab } from "@/components/layout/WhatsappFab";
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
    "Musculação, Pilates e Funcional em Capão da Canoa. Aparelhos novos, climatizada, ambiente familiar. 5★ no Google. Vê os planos e matricula-te.",
  openGraph: {
    title: "Academia Beira Mar — Aqui Evoluímos",
    description: "Musculação · Pilates · Funcional em Capão da Canoa.",
    type: "website",
  },
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsappFab />
      </body>
    </html>
  );
}
