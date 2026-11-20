import { cookies } from "next/headers";
import { checkPassword, sessionValue, COOKIE } from "@/lib/server/auth";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!checkPassword(password)) {
    return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  cookies().set(COOKIE, sessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return Response.json({ ok: true });
}
