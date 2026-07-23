import { z } from "zod";
import { METODOS_PAGAMENTO } from "@/lib/payments/provider";

/**
 * Dados do pedido de checkout. `planoId` é validado contra `PLANS`
 * separadamente em `app/actions/checkout.ts` (aqui só garante que veio
 * preenchido) — mantém este schema livre de importar dados estáticos.
 */
export const checkoutSchema = z.object({
  planoId: z.string().min(1, "Escolha um plano"),
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  telefone: z
    .string()
    .min(8, "Telefone inválido")
    .regex(/^[\d\s()+-]{8,20}$/, "Telefone inválido")
    .refine((v) => (v.match(/\d/g) ?? []).length >= 8, "Telefone inválido"),
  metodo: z.enum(METODOS_PAGAMENTO, {
    message: "Escolha uma forma de pagamento",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
