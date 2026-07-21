"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-fg-dim text-sm transition hover:text-flame"
      >
        Sair
      </button>
    </form>
  );
}
