// ── Almacenamiento en servidor ──────────────────────────────────
// Producción: PostgreSQL (DATABASE_URL). Local sin DATABASE_URL: archivo data/db.json.
// Las tablas se crean solas la primera vez (CREATE TABLE IF NOT EXISTS).
// Los reportes se guardan como JSON completo (incluye artes en base64),
// así la estructura del front no cambia.

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const useDB = !!process.env.DATABASE_URL;

// ── PostgreSQL ──────────────────────────────────────────────────
let poolPromise = null;

async function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      const { Pool } = (await import("pg")).default;
      const url = new URL(process.env.DATABASE_URL);
      const sslmode = url.searchParams.get("sslmode");
      url.searchParams.delete("sslmode"); // SSL se configura abajo (DO usa CA propia)
      const local = ["localhost", "127.0.0.1"].includes(url.hostname);
      const pool = new Pool({
        connectionString: url.toString(),
        max: 5,
        ssl: sslmode === "disable" || (local && !sslmode)
          ? false
          : process.env.DATABASE_CA
            ? { ca: process.env.DATABASE_CA }
            : { rejectUnauthorized: false },
      });
      await pool.query(`CREATE TABLE IF NOT EXISTS ppc_clients (
        id VARCHAR(64) PRIMARY KEY,
        data TEXT NOT NULL,
        share_token VARCHAR(64) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await pool.query(`CREATE TABLE IF NOT EXISTS ppc_reports (
        id VARCHAR(64) PRIMARY KEY,
        client_id VARCHAR(64) NOT NULL,
        data TEXT NOT NULL,
        created_at VARCHAR(40),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`);
      await pool.query("CREATE INDEX IF NOT EXISTS ppc_reports_client_idx ON ppc_reports (client_id)");
      return pool;
    })().catch((e) => {
      poolPromise = null;
      throw e;
    });
  }
  return poolPromise;
}

// ── Archivo local (desarrollo) ──────────────────────────────────
const FILE = path.join(process.cwd(), "data", "db.json");

async function readFile() {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return { clients: [], reports: [] };
  }
}
async function writeFile(db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(db, null, 2));
}

// ── API común ───────────────────────────────────────────────────
export const newToken = () => crypto.randomBytes(12).toString("base64url");

// ── Carga inicial automática ────────────────────────────────────
// Si la base está vacía y existe seed/reportes-ads-backup.json, lo importa
// una sola vez (la primera vez que alguien abre la app).
const SEED_FILE = path.join(process.cwd(), "seed", "reportes-ads-backup.json");
let seedPromise = null;

function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const empty = useDB
        ? (await (await getPool()).query("SELECT COUNT(*)::int AS n FROM ppc_clients")).rows[0].n === 0
        : (await readFile()).clients.length === 0;
      if (!empty) return;
      let seed;
      try {
        seed = JSON.parse(await fs.readFile(SEED_FILE, "utf8"));
      } catch {
        return; // sin archivo de carga inicial: la base arranca vacía
      }
      const ids = new Set((seed.clients || []).map((c) => c.id));
      for (const c of seed.clients || []) await upsertClient(c);
      for (const r of seed.reports || []) if (r.id && ids.has(r.clientId)) await upsertReport(r);
      console.log(`[seed] Importados ${seed.clients?.length || 0} clientes y ${seed.reports?.length || 0} reportes`);
    })().catch((e) => {
      seedPromise = null;
      throw e;
    });
  }
  return seedPromise;
}

export async function getAll() {
  await ensureSeeded();
  if (!useDB) return readFile();
  const pool = await getPool();
  const { rows: c } = await pool.query("SELECT data, share_token FROM ppc_clients ORDER BY created_at");
  const { rows: r } = await pool.query("SELECT data FROM ppc_reports ORDER BY created_at");
  return {
    clients: c.map((row) => ({ ...JSON.parse(row.data), shareToken: row.share_token })),
    reports: r.map((row) => JSON.parse(row.data)),
  };
}

export async function upsertClient(client) {
  const clean = { id: client.id, name: client.name, color: client.color };
  if (!useDB) {
    const db = await readFile();
    const i = db.clients.findIndex((c) => c.id === clean.id);
    const token = (i >= 0 && db.clients[i].shareToken) || client.shareToken || newToken();
    const rec = { ...clean, shareToken: token };
    if (i >= 0) db.clients[i] = rec;
    else db.clients.push(rec);
    await writeFile(db);
    return rec;
  }
  const pool = await getPool();
  const token = client.shareToken || newToken();
  const { rows } = await pool.query(
    `INSERT INTO ppc_clients (id, data, share_token) VALUES ($1, $2, $3)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
     RETURNING share_token`,
    [clean.id, JSON.stringify(clean), token]
  );
  return { ...clean, shareToken: rows[0].share_token };
}

export async function upsertReport(report) {
  if (!report?.id || !report?.clientId) throw new Error("Reporte inválido: falta id o clientId");
  if (!useDB) {
    const db = await readFile();
    const i = db.reports.findIndex((r) => r.id === report.id);
    if (i >= 0) db.reports[i] = report;
    else db.reports.push(report);
    await writeFile(db);
    return report;
  }
  const pool = await getPool();
  await pool.query(
    `INSERT INTO ppc_reports (id, client_id, data, created_at) VALUES ($1, $2, $3, $4)
     ON CONFLICT (id) DO UPDATE SET client_id = EXCLUDED.client_id, data = EXCLUDED.data,
       created_at = EXCLUDED.created_at, updated_at = NOW()`,
    [report.id, report.clientId, JSON.stringify(report), report.createdAt || new Date().toISOString()]
  );
  return report;
}

export async function deleteReport(id) {
  if (!useDB) {
    const db = await readFile();
    db.reports = db.reports.filter((r) => r.id !== id);
    await writeFile(db);
    return;
  }
  const pool = await getPool();
  await pool.query("DELETE FROM ppc_reports WHERE id = $1", [id]);
}

export async function getByShareToken(token) {
  const db = await getAll();
  const client = db.clients.find((c) => c.shareToken === token);
  if (!client) return null;
  return {
    clientName: client.name,
    reports: db.reports
      .filter((r) => r.clientId === client.id)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1)),
  };
}
