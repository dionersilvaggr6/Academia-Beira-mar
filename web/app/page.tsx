import { Contacto } from "@/components/sections/Contacto";
import { Depoimentos } from "@/components/sections/Depoimentos";
import { Diferenciais } from "@/components/sections/Diferenciais";
import { Galeria } from "@/components/sections/Galeria";
import { Hero } from "@/components/sections/Hero";
import { Localizacao } from "@/components/sections/Localizacao";
import { LojaTeaser } from "@/components/sections/LojaTeaser";
import { Modalidades } from "@/components/sections/Modalidades";
import { PersonalTrainer } from "@/components/sections/PersonalTrainer";
import { Planos } from "@/components/sections/Planos";
import { Sobre } from "@/components/sections/Sobre";
import { Stats } from "@/components/sections/Stats";
import { Wellhub } from "@/components/sections/Wellhub";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Modalidades />
      <PersonalTrainer />
      <Diferenciais />
      <Galeria />
      <Planos />
      <Depoimentos />
      <Wellhub />
      <LojaTeaser />
      <Sobre />
      <Localizacao />
      <Contacto />
    </>
  );
}
