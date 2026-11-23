// Importa un respaldo JSON ({clients, reports}). No borra nada:
//  · Reporte nuevo (con título) → se agrega.
//  · Reporte que ya existe → se combinan campos: lo que trae el archivo
//    reemplaza solo esos campos (ej. un archivo con solo {id, clientId, referrals}
//    agrega los referidos sin tocar spend, artes, notas, etc.).
import { upsertClient, upsertReport, getAll } from "@/lib/server/storage";
import { isAuthed, unauthorized } from "@/lib/server/auth";

export async function POST(req) {
  if (!isAuthed()) return unauthorized();
  const data = await req.json().catch(() => null);
  if (!data || !Array.isArray(data.clients) || !Array.isArray(data.reports)) {
    return Response.json({ error: "El archivo no tiene el formato de respaldo (clients / reports)." }, { status: 400 });
  }

  const current = await getAll();
  const existingClients = new Map(current.clients.map((c) => [c.id, c]));
  const existingReports = new Map(current.reports.map((r) => [r.id, r]));

  for (const c of data.clients) {
    if (!c.id) continue;
    const prev = existingClients.get(c.id);
    await upsertClient({ id: c.id, name: c.name || prev?.name || c.id, color: c.color ?? prev?.color });
  }
  const clientIds = new Set([...existingClients.keys(), ...data.clients.map((c) => c.id)]);

  let added = 0, updated = 0, skipped = 0;
  for (const r of data.reports) {
    const prev = r.id && existingReports.get(r.id);
    if (prev) {
      await upsertReport({ ...prev, ...r, clientId: r.clientId || prev.clientId });
      updated++;
    } else if (r.id && r.title && clientIds.has(r.clientId)) {
      await upsertReport(r);
      added++;
    } else {
      skipped++;
    }
  }

  return Response.json({
    ok: true,
    clients: data.clients.length,
    reports: added + updated,
    added,
    updated,
    skipped,
    db: await getAll(),
  });
}
