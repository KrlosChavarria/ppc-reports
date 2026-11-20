import { getAll } from "@/lib/server/storage";
import { isAuthed, unauthorized } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAuthed()) return unauthorized();
  return Response.json(await getAll());
}
