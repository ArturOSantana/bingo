import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Só protege a rota raiz (admin)
  if (pathname !== "/") return NextResponse.next();

  const adminCookie = req.cookies.get("admin_auth");

  if (adminCookie?.value === "1") {
    return NextResponse.next();
  }

  // Redireciona para a página de login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/"],
};
