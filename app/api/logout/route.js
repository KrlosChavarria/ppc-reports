import { cookies } from "next/headers";
import { COOKIE } from "@/lib/server/auth";

export async function POST() {
  cookies().delete(COOKIE);
  return Response.json({ ok: true });
}
