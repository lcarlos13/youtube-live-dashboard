"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path
      ? "text-white"
      : "text-zinc-500 hover:text-zinc-300";

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-zinc-900 border-t border-zinc-800
        flex justify-around items-center
        py-3
        backdrop-blur-md
      "
    >
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center text-xs font-medium transition-colors ${isActive("/")}`}
      >
        <span className="text-xl">🏠</span>
        Home
      </Link>

      {/* Lives */}
      <Link
        href="/lives"
        className={`flex flex-col items-center text-xs font-medium transition-colors ${isActive("/lives")}`}
      >
        <span className="text-xl">🎥</span>
        Lives
      </Link>

      {/* Escalas */}
      <Link
        href="/escalas"
        className={`flex flex-col items-center text-xs font-medium transition-colors ${isActive("/escalas")}`}
      >
        <span className="text-xl">📋</span>
        Escalas
      </Link>
    </nav>
  );
}