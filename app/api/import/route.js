// Importa un respaldo JSON ({clients, reports}) — agrega o actualiza por id, no borra nada.
import { upsertClient, upsertReport, getAll } from "@/lib/server/storage";
import { isAuthed, unauthorized } from "@/lib/server/auth";

export async function POST(req) {
  if (!isAuthed()) return unauthorized();
  const data = await req.json().catch(() => null);
  if (!data || !Array.isArray(data.clients) || !Array.isArray(data.reports)) {
    return Response.json({ error: "El archivo no tiene el formato de respaldo (clients / reports)." }, { status: 400 });
  }
  const clientIds = new Set(data.clients.map((c) => c.id));
  for (const c of data.clients) await upsertClient({ id: c.id, name: c.name, color: c.color });
  let skipped = 0;
  for (const r of data.reports) {
    if (!r.id || !clientIds.has(r.clientId)) { skipped++; continue; }
    await upsertReport(r);
  }
  return Response.json({
    ok: true,
    clients: data.clients.length,
    reports: data.reports.length - skipped,
    skipped,
    db: await getAll(),
  });
}
