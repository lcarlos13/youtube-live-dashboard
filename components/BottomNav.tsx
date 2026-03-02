"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  role: "admin" | "user" | null;
  name: string | null;
};

export default function BottomNav({ role, name }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path
      ? "text-white"
      : "text-zinc-500 hover:text-zinc-300";

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 backdrop-blur-md">

      {/* Linha principal */}
      <div className="flex justify-around items-center py-3">
        <Link href="/" className={`flex flex-col items-center text-xs ${isActive("/")}`}>
          <span className="text-xl">🏠</span>
          Home
        </Link>

        <Link href="/lives" className={`flex flex-col items-center text-xs ${isActive("/lives")}`}>
          <span className="text-xl">🎥</span>
          Lives
        </Link>

        <Link href="/escalas" className={`flex flex-col items-center text-xs ${isActive("/escalas")}`}>
          <span className="text-xl">📋</span>
          Escalas
        </Link>

        {role === "admin" && (
          <Link
            href="/usuarios"
            className={`flex flex-col items-center text-xs ${isActive("/usuarios")}`}
          >
            <span className="text-xl">👥</span>
            Usuários
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-zinc-500 hover:text-red-400"
        >
          <span className="text-xl">🚪</span>
          Sair
        </button>
      </div>

      {/* Linha do usuário */}
      {name && (
        <div className="border-t border-zinc-800 px-4 py-1 text-xs text-zinc-400 flex justify-end">
          Logado como{" "}
          <span className="ml-1 text-zinc-200 font-medium truncate max-w-[120px]">
            {name}
          </span>
        </div>
      )}
    </nav>
  );
}