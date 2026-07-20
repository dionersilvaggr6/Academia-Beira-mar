"use client";

import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-bm-cream/60 text-sm transition hover:text-bm-orange"
      >
        Sair
      </button>
    </form>
  );
}
