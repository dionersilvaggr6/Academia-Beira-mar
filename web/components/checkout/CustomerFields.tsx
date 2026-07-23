const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 p-3 font-sans text-fg placeholder:text-fg-mute focus:border-flame focus:outline-none";

/** Campos do cliente (nome/email/telefone) — validados no servidor por `checkoutSchema`. */
export function CustomerFields() {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="nome" className="sr-only">
          Nome completo
        </label>
        <input
          id="nome"
          name="nome"
          required
          placeholder="Nome completo"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="telefone" className="sr-only">
          Telefone / WhatsApp
        </label>
        <input
          id="telefone"
          name="telefone"
          required
          inputMode="tel"
          placeholder="Telefone / WhatsApp"
          className={inputClass}
        />
      </div>
    </div>
  );
}
