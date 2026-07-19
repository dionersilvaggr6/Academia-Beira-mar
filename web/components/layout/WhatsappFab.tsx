import { waLink } from "@/lib/whatsapp";

export function WhatsappFab() {
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl shadow-lg transition hover:scale-105"
    >
      💬
    </a>
  );
}
