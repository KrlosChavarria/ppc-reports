// ── Persistencia en servidor (API + PostgreSQL) ──────────────────────
// Antes todo vivía en localStorage (solo en un navegador). Ahora cada
// cambio se manda a /api y cualquiera con acceso ve los mismos datos.
// Estructura: { clients: [{id, name, shareToken}], reports: [{id, clientId, ...}] }

export const LEGACY_KEY = "rebrnd_ads_reports_v1";

export class AuthError extends Error {}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    cache: "no-store",
  });
  if (res.status === 401) throw new AuthError("No autorizado");
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Error ${res.status}`);
  return body;
}

export const loadDB = () => api("/api/db");

export const login = (password) => api("/api/login", { method: "POST", body: JSON.stringify({ password }) });
export const logout = () => api("/api/logout", { method: "POST" });

export const saveReport = (report) =>
  api(`/api/reports/${encodeURIComponent(report.id)}`, { method: "PUT", body: JSON.stringify(report) });

export const removeReport = (id) => api(`/api/reports/${encodeURIComponent(id)}`, { method: "DELETE" });

export const saveClient = (client) =>
  api(`/api/clients/${encodeURIComponent(client.id)}`, { method: "PUT", body: JSON.stringify(client) });

export const importBackup = (data) => api("/api/import", { method: "POST", body: JSON.stringify(data) });

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

// Datos que quedaron en el localStorage de la versión anterior (para migrarlos)
export function readLegacyLocal() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.reports?.length ? data : null;
  } catch {
    return null;
  }
}
