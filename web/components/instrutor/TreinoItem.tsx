"use client";

import { useActionState, useEffect, useState } from "react";
import {
  type ActionResult,
  apagarTreino,
  editarTreino,
} from "@/app/actions/treinos";
import { CriarExercicioForm } from "@/components/instrutor/CriarExercicioForm";
import { ExercicioItem } from "@/components/instrutor/ExercicioItem";

const input =
  "rounded-lg border border-white/10 bg-white/5 p-2 text-fg text-sm placeholder:text-fg-dim focus:border-flame focus:outline-none";

type Treino = { id: string; nome: string; foco: string | null };
type Exercicio = {
  id: string;
  treino_id: string;
  nome: string;
  series: number;
  repeticoes: string;
  carga: string | null;
  observacoes: string | null;
};

export function TreinoItem({
  treino,
  alunoId,
  exercicios,
}: {
  treino: Treino;
  alunoId: string;
  exercicios: Exercicio[];
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [editState, editAction, editPending] = useActionState<
    ActionResult | null,
    FormData
  >(editarTreino, null);
  const [deleteState, deleteAction, deletePending] = useActionState<
    ActionResult | null,
    FormData
  >(apagarTreino, null);

  useEffect(() => {
    if (editState?.ok) setEditing(false);
  }, [editState]);

  if (editing) {
    return (
      <div className="rounded-xl border border-flame/25 bg-white/[0.03] p-4">
        <form action={editAction} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={treino.id} />
          <input type="hidden" name="alunoId" value={alunoId} />
          <input
            name="nome"
            required
            defaultValue={treino.nome}
            className={`${input} w-full sm:w-auto`}
            aria-label="Nome da divisão"
          />
          <input
            name="foco"
            defaultValue={treino.foco ?? ""}
            className={`${input} w-full sm:w-auto`}
            aria-label="Foco"
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
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-flame/25 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold text-fg">
          {treino.nome}
          {treino.foco ? ` — ${treino.foco}` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-flame text-sm hover:underline"
          >
            Editar
          </button>
          {confirmingDelete ? (
            <form
              action={deleteAction}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="id" value={treino.id} />
              <input type="hidden" name="alunoId" value={alunoId} />
              <span className="text-fg-dim text-sm">Tem a certeza?</span>
              <button
                type="submit"
                disabled={deletePending}
                className="font-semibold text-err text-sm hover:underline disabled:opacity-60"
              >
                {deletePending ? "…" : "Sim"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-fg-dim text-sm hover:underline"
              >
                Não
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-err text-sm hover:underline"
            >
              Excluir
            </button>
          )}
        </div>
      </div>
      {deleteState && !deleteState.ok && (
        <p role="alert" className="mt-1 text-err text-sm">
          {deleteState.error}
        </p>
      )}

      <ul className="mt-2 space-y-1">
        {exercicios.map((e) => (
          <ExercicioItem key={e.id} exercicio={e} alunoId={alunoId} />
        ))}
      </ul>
      <CriarExercicioForm treinoId={treino.id} />
    </div>
  );
}
