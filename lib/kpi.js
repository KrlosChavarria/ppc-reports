// ── Cálculo automático de KPIs ──────────────────────────────────
// Entradas base por plataforma: impressions, clicks, spend, leads, reach, conversions
// Todo lo demás se deriva. Si leads = null/0, los KPIs de lead simplemente no se muestran.

export const num = (v) => {
  const n = parseFloat(String(v).replace(/[$,%\s,]/g, ""));
  return isNaN(n) ? 0 : n;
};

export function computeKpis(d = {}) {
  const impressions = num(d.impressions);
  const clicks = num(d.clicks);
  const spend = num(d.spend);
  const leads = num(d.leads);
  const reach = num(d.reach);
  const conversions = num(d.conversions);

  return {
    impressions,
    clicks,
    spend,
    leads,
    reach,
    conversions,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    avgCpc: clicks > 0 ? spend / clicks : 0,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
    cpl: leads > 0 ? spend / leads : 0,
    convRate: clicks > 0 ? (leads / clicks) * 100 : 0,
    frequency: reach > 0 ? impressions / reach : 0,
  };
}

export function sumPlatforms(a = {}, b = {}) {
  const ka = computeKpis(a);
  const kb = computeKpis(b);
  return computeKpis({
    impressions: ka.impressions + kb.impressions,
    clicks: ka.clicks + kb.clicks,
    spend: ka.spend + kb.spend,
    leads: ka.leads + kb.leads,
    reach: ka.reach + kb.reach,
    conversions: ka.conversions + kb.conversions,
  });
}

// ── Formateadores ───────────────────────────────────────────────
export const fmtInt = (n) => (n || 0).toLocaleString("es-MX", { maximumFractionDigits: 0 });
export const fmtMoney = (n) =>
  "$" + (n || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtPct = (n) => (n || 0).toLocaleString("es-MX", { maximumFractionDigits: 2 }) + "%";
export const fmtDec = (n) => (n || 0).toLocaleString("es-MX", { maximumFractionDigits: 2 });

// ── Definición de KPIs para tarjetas ────────────────────────────
// hideWhenZero: si no hay dato (ej. sin leads medibles) la tarjeta no aparece.
export const KPI_DEFS = [
  { key: "leads", label: "Leads", fmt: fmtInt, hideWhenZero: true },
  { key: "spend", label: "Spend", fmt: fmtMoney },
  { key: "cpl", label: "Costo por lead", fmt: fmtMoney, hideWhenZero: true },
  { key: "impressions", label: "Impresiones", fmt: fmtInt },
  { key: "reach", label: "Reach", fmt: fmtInt, hideWhenZero: true },
  { key: "clicks", label: "Clics", fmt: fmtInt },
  { key: "ctr", label: "CTR", fmt: fmtPct },
  { key: "avgCpc", label: "Avg. CPC", fmt: fmtMoney },
  { key: "cpm", label: "CPM", fmt: fmtMoney },
  { key: "convRate", label: "Tasa de conversión", fmt: fmtPct, hideWhenZero: true },
  { key: "frequency", label: "Frecuencia", fmt: fmtDec, hideWhenZero: true },
];
