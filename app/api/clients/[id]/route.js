import { upsertClient } from "@/lib/server/storage";
import { isAuthed, unauthorized } from "@/lib/server/auth";

export async function PUT(req, { params }) {
  if (!isAuthed()) return unauthorized();
  const client = await req.json();
  if (client.id !== params.id || !client.name) return Response.json({ error: "Cliente inválido" }, { status: 400 });
  return Response.json(await upsertClient(client));
}
