"use client";

import { computeKpis, KPI_DEFS } from "@/lib/kpi";

export default function KpiGrid({ data, accent = "#16181D", cols = "grid-cols-2 md:grid-cols-4" }) {
  const k = computeKpis(data);
  const visible = KPI_DEFS.filter((d) => !(d.hideWhenZero && !k[d.key]));
  return (
    <div className={`grid ${cols} gap-3`}>
      {visible.map((d) => (
        <div key={d.key} className="kpi-card avoid-break" style={{ borderTop: `3px solid ${accent}` }}>
          <p className="kpi-label">{d.label}</p>
          <p className="kpi-value">{d.fmt(k[d.key])}</p>
        </div>
      ))}
    </div>
  );
}

export function CustomKpiGrid({ items = [], accent = "#16181D" }) {
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.filter((i) => i.name).map((i, idx) => (
        <div key={idx} className="kpi-card avoid-break" style={{ borderTop: `3px solid ${accent}` }}>
          <p className="kpi-label">{i.name}</p>
          <p className="kpi-value">{i.value}</p>
        </div>
      ))}
    </div>
  );
}
