"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import { type ActionResult, apagarAluno } from "@/app/actions/pessoas";

/**
 * Zona destrutiva na página do aluno: apaga o perfil, os treinos e o acesso
 * à conta por completo (ação irreversível). Um único clique nunca apaga —
 * exige uma segunda confirmação deliberada: o instrutor tem de escrever o
 * primeiro nome do aluno antes de o botão final ficar ativo.
 */
export function ApagarAlunoButton({
  alunoId,
  alunoNome,
}: {
  alunoId: string;
  alunoNome: string;
}) {
  const router = useRouter();
  const confirmInputId = useId();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [state, action, pending] = useActionState<
    ActionResult | null,
    FormData
  >(apagarAluno, null);

  const primeiroNome = alunoNome.trim().split(/\s+/)[0] ?? "";
  const confirmado =
    primeiroNome !== "" &&
    confirmText.trim().toLowerCase() === primeiroNome.toLowerCase();

  // Depois de apagar com sucesso, o aluno já não existe — volta ao painel.
  useEffect(() => {
    if (state?.ok) {
      router.push("/instrutor");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="mt-10 rounded-xl border border-err/30 bg-white/[0.03] p-4">
      <h2 className="font-bold text-err">Zona de risco</h2>

      {!open ? (
        <>
          <p className="mt-1 text-fg-dim text-sm">
            Excluir {alunoNome} remove o perfil, os treinos e o acesso à conta
            por completo. Não é possível desfazer.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-3 rounded-lg border border-err/50 px-3 py-2 font-semibold text-err text-sm transition hover:bg-err/10"
          >
            Excluir aluno
          </button>
        </>
      ) : (
        <form action={action} className="mt-3 space-y-2">
          <input type="hidden" name="alunoId" value={alunoId} />
          <p className="text-fg-dim text-sm">
            Isto vai excluir <strong className="text-fg">{alunoNome}</strong>{" "}
            por completo: perfil, treinos, exercícios e o acesso à conta. Não é
            possível desfazer.
          </p>
          <label htmlFor={confirmInputId} className="block text-fg-dim text-sm">
            Para confirmar, escreve o primeiro nome do aluno (
            <strong className="text-fg">{primeiroNome}</strong>):
          </label>
          <input
            id={confirmInputId}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            className="w-full rounded-lg border border-err/40 bg-white/5 p-2 text-fg text-sm focus:border-err focus:outline-none sm:w-64"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!confirmado || pending}
              className="rounded-lg border border-err bg-err/10 px-3 py-2 font-semibold text-err text-sm transition hover:bg-err/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "A excluir…" : "Sim, excluir permanentemente"}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setConfirmText("");
              }}
              disabled={pending}
              className="rounded-lg border border-white/20 px-3 py-2 text-fg text-sm transition hover:border-flame disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {state && !state.ok && (
        <p role="alert" className="mt-2 text-err text-sm">
          {state.error}
        </p>
      )}
    </div>
  );
}
