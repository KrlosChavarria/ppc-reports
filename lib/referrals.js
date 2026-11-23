// ── Citas pagadas y CPA ─────────────────────────────────────────
// Dato que reporta el cliente: citas presenciales pagadas (o separaciones)
// y de dónde dijo venir cada persona: Google, Facebook, ChatGPT/IA u otro.
// Se guarda en report.referrals = { google, facebook, ai, other, trackerWeek }
// (el nombre interno se conserva para no migrar datos).
//
// CPA (costo por adquisición) = inversión en pauta / citas que llegaron por pauta.
// Solo Google y Facebook vienen de anuncios; ChatGPT/IA y Otros son orgánicas
// y no entran al CPA (sí cuentan en citas totales).

import { num, computeKpis } from "./kpi";

export const REF_SOURCES = [
  { key: "google", label: "Google", color: "#4285F4", paid: true },
  { key: "facebook", label: "Facebook", color: "#1E3A8A", paid: true },
  { key: "ai", label: "ChatGPT / IA", color: "#10A37F", paid: false },
  { key: "other", label: "Otros", color: "#B8B8B8", paid: false },
];

export const CPA_COLOR = "#16181D";

export const EMPTY_REFERRALS = { google: "", facebook: "", ai: "", other: "", trackerWeek: "" };

export function refCounts(report) {
  const r = report?.referrals || {};
  const counts = Object.fromEntries(REF_SOURCES.map((s) => [s.key, num(r[s.key])]));
  counts.total = REF_SOURCES.reduce((a, s) => a + counts[s.key], 0);
  counts.ads = counts.google + counts.facebook; // citas que llegaron por pauta
  counts.organic = counts.total - counts.ads;
  return counts;
}

// ¿El reporte tiene capturadas citas? (un 0 explícito cuenta como capturado)
export function hasReferrals(report) {
  const r = report?.referrals;
  if (!r) return false;
  return REF_SOURCES.some((s) => r[s.key] !== "" && r[s.key] !== undefined && r[s.key] !== null);
}

// CPA: Google Ads ↔ citas de Google · Meta Ads ↔ citas de Facebook ·
// General = inversión total / citas por pauta (Google + Facebook).
export function refCosts(report) {
  const c = refCounts(report);
  const gSpend = computeKpis(report.google).spend;
  const mSpend = computeKpis(report.meta).spend;
  return {
    total: c.ads > 0 ? (gSpend + mSpend) / c.ads : 0,
    google: c.google > 0 ? gSpend / c.google : 0,
    facebook: c.facebook > 0 ? mSpend / c.facebook : 0,
  };
}
