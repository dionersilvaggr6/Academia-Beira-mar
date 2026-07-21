"use client";

import { useState } from "react";
import { CATALOGO, TODOS_EXERCICIOS } from "@/lib/treinos/catalogo";

const OUTRO = "__outro__";

const fieldClass =
  "rounded-lg border border-white/10 bg-white/5 p-2 text-fg text-sm placeholder:text-fg-dim focus:border-flame focus:outline-none";

/**
 * Seletor de nome de exercício agrupado por categoria do catálogo, com uma
 * opção final "Outro (escrever)" que revela um campo de texto livre — para
 * não perder exercícios fora do catálogo (novos ou já existentes).
 *
 * Mantém sempre o campo submetido chamado `nome` (só um controlo de cada vez
 * tem esse `name`, para o FormData nunca ter duas entradas em conflito).
 */
export function ExercicioNomeSelect({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const conhecido =
    defaultValue !== "" && TODOS_EXERCICIOS.includes(defaultValue);
  const [selecionado, setSelecionado] = useState(
    defaultValue === "" ? "" : conhecido ? defaultValue : OUTRO,
  );
  const isOutro = selecionado === OUTRO;

  return (
    <>
      <select
        aria-label="Exercício"
        value={selecionado}
        onChange={(e) => setSelecionado(e.target.value)}
        name={isOutro ? undefined : "nome"}
        required={!isOutro}
        className={`${fieldClass} w-full sm:w-auto`}
      >
        <option value="" disabled>
          Escolhe um exercício…
        </option>
        {CATALOGO.map((categoria) => (
          <optgroup key={categoria.id} label={categoria.nome}>
            {categoria.exercicios.map((exercicio) => (
              <option key={exercicio} value={exercicio}>
                {exercicio}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={OUTRO}>Outro (escrever)</option>
      </select>
      {isOutro && (
        <input
          name="nome"
          required
          defaultValue={defaultValue === OUTRO ? "" : defaultValue}
          placeholder="Nome do exercício"
          aria-label="Nome do exercício"
          className={`${fieldClass} w-full sm:w-auto`}
        />
      )}
    </>
  );
}
