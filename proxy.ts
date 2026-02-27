import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Liberar rotas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/trocar-senha") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as any;

    // 🔐 Bloquear rota /usuarios se não for admin
    if (
      pathname.startsWith("/usuarios") &&
      decoded.perfil !== "admin"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      decoded.precisaTrocarSenha &&
      !pathname.startsWith("/trocar-senha")
    ) {
      return NextResponse.redirect(new URL("/trocar-senha", request.url));
    }

    return NextResponse.next();

  } catch (err) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
      Protege tudo menos:
      - /api/login
      - arquivos estáticos
    */
    "/((?!api/login|_next|favicon.ico).*)",
  ],
};