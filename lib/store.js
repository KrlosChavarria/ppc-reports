// ── Persistencia local (localStorage) ───────────────────────────
// Cada reporte queda guardado y accesible reporte tras reporte.
// Estructura: { clients: [{id, name}], reports: [{id, clientId, ...}] }

const KEY = "rebrnd_ads_reports_v1";

const SEED = {
  clients: [{ id: "abogado-ernesto", name: "Abogado Ernesto", color: "#16181D" }],
  reports: [
    {
      id: "abogado-ernesto-w1",
      clientId: "abogado-ernesto",
      title: "Semana 1",
      period: "01 – 15 de julio, 2026",
      week: "13 – 19 de julio",
      issued: "2026-07-15",
      notes:
        "Primera semana en curso. Fase de análisis y evaluación general. Campaña de Search limitada por estrategia de puja (Maximize clicks) y ad strength bajo; 0 conversiones registradas esta semana. Siguientes pasos: ampliar keywords relevantes y evaluar Maximize conversions con tCPA.",
      google: {
        impressions: 644,
        clicks: 41,
        spend: 194.97,
        leads: 0,
        reach: 0,
        conversions: 0,
      },
      meta: {
        impressions: 0,
        clicks: 0,
        spend: 0,
        leads: 0,
        reach: 0,
        conversions: 0,
      },
      customKpis: [
        { name: "Optimization score (Google)", value: "48.6%" },
        { name: "Presupuesto diario (Google)", value: "$15.00/día" },
      ],
      createdAt: "2026-07-15T12:00:00.000Z",
    },
  ],
};

export function loadDB() {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return JSON.parse(JSON.stringify(SEED));
    }
    return JSON.parse(raw);
  } catch {
    return JSON.parse(JSON.stringify(SEED));
  }
}

export function saveDB(db) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function upsertReport(db, report) {
  const idx = db.reports.findIndex((r) => r.id === report.id);
  const next = { ...db, reports: [...db.reports] };
  if (idx >= 0) next.reports[idx] = report;
  else next.reports.push(report);
  saveDB(next);
  return next;
}

export function deleteReport(db, id) {
  const next = { ...db, reports: db.reports.filter((r) => r.id !== id) };
  saveDB(next);
  return next;
}

export function upsertClient(db, client) {
  const idx = db.clients.findIndex((c) => c.id === client.id);
  const next = { ...db, clients: [...db.clients] };
  if (idx >= 0) next.clients[idx] = client;
  else next.clients.push(client);
  saveDB(next);
  return next;
}

export const uid = () => Math.random().toString(36).slice(2, 9);

export function exportJSON(db) {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reportes-ads-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}
