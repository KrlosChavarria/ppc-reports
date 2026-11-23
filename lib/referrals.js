// ── Referidos (de dónde llegaron los clientes) ──────────────────
// Dato que reporta el cliente (tracker de referidos): cuántas personas
// dijeron venir de Google, Facebook, ChatGPT/IA u otro medio.
// Se guarda en report.referrals = { google, facebook, ai, other, trackerWeek }.

import { num, computeKpis } from "./kpi";

export const REF_SOURCES = [
  { key: "google", label: "Google", color: "#4285F4" },
  { key: "facebook", label: "Facebook", color: "#1E3A8A" },
  { key: "ai", label: "ChatGPT / IA", color: "#10A37F" },
  { key: "other", label: "Otros", color: "#B8B8B8" },
];

export const EMPTY_REFERRALS = { google: "", facebook: "", ai: "", other: "", trackerWeek: "" };

export function refCounts(report) {
  const r = report?.referrals || {};
  const counts = Object.fromEntries(REF_SOURCES.map((s) => [s.key, num(r[s.key])]));
  counts.total = REF_SOURCES.reduce((a, s) => a + counts[s.key], 0);
  return counts;
}

// ¿El reporte tiene capturados referidos? (un 0 explícito cuenta como capturado)
export function hasReferrals(report) {
  const r = report?.referrals;
  if (!r) return false;
  return REF_SOURCES.some((s) => r[s.key] !== "" && r[s.key] !== undefined && r[s.key] !== null);
}

// Costo por referido: spend del periodo / referidos.
// Google Ads ↔ referidos de Google · Meta Ads ↔ referidos de Facebook.
export function refCosts(report) {
  const c = refCounts(report);
  const gSpend = computeKpis(report.google).spend;
  const mSpend = computeKpis(report.meta).spend;
  return {
    total: c.total > 0 ? (gSpend + mSpend) / c.total : 0,
    google: c.google > 0 ? gSpend / c.google : 0,
    facebook: c.facebook > 0 ? mSpend / c.facebook : 0,
  };
}
