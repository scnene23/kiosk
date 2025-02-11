// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (token) {
    try {
      const userData = jwt.verify(token, JWT_SECRET);

      // Criar cookie de sessão temporária
      const response = NextResponse.next();
      response.cookies.set("next-auth.session-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 600, // Expira em 10 minutos
      });

      return response;
    } catch (error) {
      return NextResponse.redirect(new URL("/auth", req.url)); // Redirecionar para login caso o token seja inválido
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/homepage/frontOfficeView/registrationForm",
};
