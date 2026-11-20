// ── Acceso de administrador ─────────────────────────────────────
// Una sola contraseña (ADMIN_PASSWORD). Al entrar se guarda una cookie
// httpOnly con un hash derivado; quien no la tenga solo puede ver los
// links públicos de cliente (/share?t=...).

import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "ppc_session";

function expected() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  const secret = process.env.SESSION_SECRET || pw;
  return crypto.createHmac("sha256", secret).update("ppc-admin:" + pw).digest("hex");
}

function safeEqual(a, b) {
  const ba = Buffer.from(a || "");
  const bb = Buffer.from(b || "");
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export function checkPassword(pw) {
  return !!process.env.ADMIN_PASSWORD && safeEqual(pw, process.env.ADMIN_PASSWORD);
}

export function sessionValue() {
  return expected();
}

export function isAuthed() {
  // Sin ADMIN_PASSWORD en local, no se pide contraseña.
  if (!process.env.ADMIN_PASSWORD) return process.env.NODE_ENV !== "production";
  return safeEqual(cookies().get(COOKIE)?.value, expected());
}

export function unauthorized() {
  return Response.json({ error: "No autorizado" }, { status: 401 });
}
