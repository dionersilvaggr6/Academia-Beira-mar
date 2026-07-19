import { Contacto } from "@/components/sections/Contacto";
import { Diferenciais } from "@/components/sections/Diferenciais";
import { Hero } from "@/components/sections/Hero";
import { Localizacao } from "@/components/sections/Localizacao";
import { Modalidades } from "@/components/sections/Modalidades";
import { PersonalTrainer } from "@/components/sections/PersonalTrainer";
import { Planos } from "@/components/sections/Planos";
import { Sobre } from "@/components/sections/Sobre";

export default function Home() {
  return (
    <>
      <Hero />
      <Modalidades />
      <PersonalTrainer />
      <Diferenciais />
      <Planos />
      <Sobre />
      <Localizacao />
      <Contacto />
    </>
  );
}
