"use client";

import { useActionState, useEffect, useState } from "react";
import {
  type ActionResult,
  apagarExercicio,
  editarExercicio,
} from "@/app/actions/treinos";

const input =
  "rounded-lg border border-white/10 bg-white/5 p-2 text-fg text-sm placeholder:text-fg-dim focus:border-flame focus:outline-none";

type Exercicio = {
  id: string;
  treino_id: string;
  nome: string;
  series: number;
  repeticoes: string;
  carga: string | null;
  observacoes: string | null;
};

export function ExercicioItem({
  exercicio,
  alunoId,
}: {
  exercicio: Exercicio;
  alunoId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editState, editAction, editPending] = useActionState<
    ActionResult | null,
    FormData
  >(editarExercicio, null);
  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionResult | null,
    FormData
  >(apagarExercicio, null);

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  if (editing) {
    return (
      <li>
        <form
          action={editAction}
          className="mt-1 flex flex-wrap items-center gap-2"
        >
          <input type="hidden" name="id" value={exercicio.id} />
          <input type="hidden" name="alunoId" value={alunoId} />
          <input
            name="nome"
            required
            defaultValue={exercicio.nome}
            className={`${input} w-full sm:w-auto`}
            aria-label="Exercício"
          />
          <input
            name="series"
            type="number"
            min="1"
            required
            defaultValue={exercicio.series}
            className={`${input} w-20`}
            aria-label="Séries"
          />
          <input
            name="repeticoes"
            required
            defaultValue={exercicio.repeticoes}
            className={`${input} w-24`}
            aria-label="Repetições"
          />
          <input
            name="carga"
            defaultValue={exercicio.carga ?? ""}
            className={`${input} w-24`}
            aria-label="Carga"
          />
          <input
            name="observacoes"
            defaultValue={exercicio.observacoes ?? ""}
            placeholder="Observações"
            className={`${input} w-full sm:w-auto`}
            aria-label="Observações"
          />
          <button
            type="submit"
            disabled={editPending}
            className="rounded-lg bg-flame px-3 py-2 font-semibold text-ink text-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {editPending ? "…" : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-white/20 px-3 py-2 text-fg text-sm transition hover:border-flame"
          >
            Cancelar
          </button>
          {editState && !editState.ok && (
            <p role="alert" className="w-full text-err text-sm">
              {editState.error}
            </p>
          )}
        </form>
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 text-fg-dim text-sm">
      <span>
        {exercicio.nome} — {exercicio.series}×{exercicio.repeticoes}
        {exercicio.carga ? ` · ${exercicio.carga}` : ""}
      </span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-flame text-xs hover:underline"
        >
          Editar
        </button>
        {confirmingDelete ? (
          <form
            action={deleteAction}
            className="flex flex-wrap items-center gap-2"
          >
            <input type="hidden" name="id" value={exercicio.id} />
            <input type="hidden" name="alunoId" value={alunoId} />
            <span className="text-fg-dim text-xs">Confirma?</span>
            <button
              type="submit"
              disabled={deletePending}
              className="font-semibold text-err text-xs hover:underline disabled:opacity-60"
            >
              {deletePending ? "…" : "Sim"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-fg-dim text-xs hover:underline"
            >
              Não
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="text-err text-xs hover:underline"
          >
            Excluir
          </button>
        )}
      </span>
      {deleteState && !deleteState.ok && (
        <p role="alert" className="w-full text-err text-xs">
          {deleteState.error}
        </p>
      )}
    </li>
  );
}
