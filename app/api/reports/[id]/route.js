import { upsertReport, deleteReport } from "@/lib/server/storage";
import { isAuthed, unauthorized } from "@/lib/server/auth";

export async function PUT(req, { params }) {
  if (!isAuthed()) return unauthorized();
  const report = await req.json();
  if (report.id !== params.id) return Response.json({ error: "id no coincide" }, { status: 400 });
  return Response.json(await upsertReport(report));
}

export async function DELETE(_req, { params }) {
  if (!isAuthed()) return unauthorized();
  await deleteReport(params.id);
  return Response.json({ ok: true });
}
