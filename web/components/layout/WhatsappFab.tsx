import { waLink } from "@/lib/whatsapp";

export function WhatsappFab() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-flame text-2xl text-ink shadow-[0_0_28px_var(--flame-glow)] transition hover:scale-105 hover:brightness-110"
    >
      💬
    </a>
  );
}
