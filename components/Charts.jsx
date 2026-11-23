"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Legend, PieChart, Pie, Cell, LabelList, ReferenceLine,
} from "recharts";
import { computeKpis, fmtMoney, fmtInt, fmtPct, fmtDec } from "@/lib/kpi";
import { REF_SOURCES, refCounts, refCosts, hasReferrals } from "@/lib/referrals";

export const GADS = "#4285F4";
export const META = "#0866FF";
const INK = "#16181D";

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #E5E5E5",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  fontSize: 12,
  fontFamily: "Arial, sans-serif",
};

const axisTick = { fontSize: 11, fill: "#777" };

function ChartBox({ title, subtitle, children, height = 250 }) {
  return (
    <div className="avoid-break rounded-lg bg-white border border-neutral-200 p-4">
      <p className="kpi-label">{title}</p>
      {subtitle && <p className="text-xs text-neutral-400 mt-0.5 mb-3 leading-snug">{subtitle}</p>}
      <div style={{ width: "100%", height }}>{children}</div>
    </div>
  );
}

// ── Comparativo de un KPI entre plataformas (dentro del reporte) ──
export function PlatformBars({ report, metric, title, subtitle, money = false, pct = false }) {
  const g = computeKpis(report.google);
  const m = computeKpis(report.meta);
  const data = [
    { name: "Google Ads", value: g[metric], fill: GADS },
    { name: "Meta Ads", value: m[metric], fill: META },
  ];
  const fmt = money ? fmtMoney : pct ? fmtPct : fmtInt;
  const avg = (g[metric] + m[metric]) / 2;
  return (
    <ChartBox title={title} subtitle={subtitle} height={230}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 24, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-g-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GADS} stopOpacity={1} />
              <stop offset="100%" stopColor={GADS} stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id={`grad-m-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={META} stopOpacity={1} />
              <stop offset="100%" stopColor={META} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#555", fontWeight: 700 }}
            axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52}
            tickFormatter={(v) => (money ? "$" + fmtDec(v) : pct ? v + "%" : fmtInt(v))} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), title]} cursor={{ fill: "#FAFAFA" }} />
          {avg > 0 && (
            <ReferenceLine y={avg} stroke="#C4C4C4" strokeDasharray="4 4"
              label={{ value: `prom. ${fmt(avg)}`, position: "right", fontSize: 10, fill: "#999" }} />
          )}
          <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={70}>
            <Cell fill={`url(#grad-g-${metric})`} />
            <Cell fill={`url(#grad-m-${metric})`} />
            <LabelList dataKey="value" position="top" formatter={(v) => fmt(v)}
              style={{ fontSize: 13, fontWeight: 700, fill: INK }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ── Distribución del spend ──────────────────────────────────────
export function SpendDonut({ report }) {
  const g = computeKpis(report.google).spend;
  const m = computeKpis(report.meta).spend;
  const totalSpend = g + m;
  const data = [
    { name: "Google Ads", value: g },
    { name: "Meta Ads", value: m },
  ].filter((d) => d.value > 0);
  if (data.length === 0) data.push({ name: "Sin datos", value: 1 });
  const colors = { "Google Ads": GADS, "Meta Ads": META, "Sin datos": "#E5E5E5" };
  return (
    <ChartBox
      title="Distribución del spend"
      subtitle={`Cómo se repartió la inversión total (${fmtMoney(totalSpend)}) entre plataformas en este periodo.`}
      height={230}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88}
            paddingAngle={3} strokeWidth={0}
            label={({ value }) => (totalSpend > 0 ? fmtPct((value / totalSpend) * 100) : "")}
            labelLine={false} fontSize={12} fontWeight={700}>
            {data.map((d) => <Cell key={d.name} fill={colors[d.name]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtMoney(v)} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ── Tendencia (área con gradiente) a través de los reportes ─────
export function TrendLine({ reports, platform, metric, title, subtitle, money = false, pct = false, color = INK }) {
  const data = reports.map((r) => {
    const src = platform === "total"
      ? {
          impressions: computeKpis(r.google).impressions + computeKpis(r.meta).impressions,
          clicks: computeKpis(r.google).clicks + computeKpis(r.meta).clicks,
          spend: computeKpis(r.google).spend + computeKpis(r.meta).spend,
          leads: computeKpis(r.google).leads + computeKpis(r.meta).leads,
          reach: computeKpis(r.google).reach + computeKpis(r.meta).reach,
        }
      : r[platform];
    return { name: r.title, value: computeKpis(src)[metric] };
  });
  const fmt = money ? fmtMoney : pct ? fmtPct : fmtInt;
  const gid = `area-${platform}-${metric}`;
  const defaultSub = data.length < 2
    ? "La tendencia se dibuja a partir del segundo reporte guardado."
    : "Evolución reporte tras reporte. Pasa el cursor para ver el dato exacto.";
  return (
    <ChartBox title={title} subtitle={subtitle || defaultSub} height={220}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 16, right: 20, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52} domain={["auto", "auto"]}
            tickFormatter={(v) => (money ? "$" + fmtDec(v) : pct ? v + "%" : fmtInt(v))} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(v), title]} />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
            fill={`url(#${gid})`}
            dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ── Histórico agrupado: Google vs Meta por reporte ──────────────
export function HistoryGrouped({ reports, metric, title, subtitle, money = false }) {
  const data = reports.map((r) => ({
    name: r.title,
    Google: computeKpis(r.google)[metric],
    Meta: computeKpis(r.meta)[metric],
  }));
  const fmt = money ? fmtMoney : fmtInt;
  return (
    <ChartBox title={title}
      subtitle={subtitle || "Comparación lado a lado de cada plataforma en cada reporte del histórico."}
      height={250}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={`hg-g-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GADS} stopOpacity={1} />
              <stop offset="100%" stopColor={GADS} stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id={`hg-m-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={META} stopOpacity={1} />
              <stop offset="100%" stopColor={META} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52}
            tickFormatter={(v) => (money ? "$" + fmtDec(v) : fmtInt(v))} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} cursor={{ fill: "#FAFAFA" }} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Google" fill={`url(#hg-g-${metric})`} radius={[5, 5, 0, 0]} barSize={24} />
          <Bar dataKey="Meta" fill={`url(#hg-m-${metric})`} radius={[5, 5, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ── Referidos: distribución por fuente (dona) ───────────────────
export function ReferralDonut({ report, title = "Referidos por fuente", subtitle }) {
  const c = refCounts(report);
  const data = REF_SOURCES.filter((s) => c[s.key] > 0).map((s) => ({
    name: `${s.label} · ${fmtInt(c[s.key])} (${fmtPct((c[s.key] / c.total) * 100)})`,
    value: c[s.key], color: s.color,
  }));
  const empty = data.length === 0;
  if (empty) data.push({ name: "Sin referidos", value: 1, color: "#E5E5E5" });
  return (
    <ChartBox title={title}
      subtitle={subtitle || `De dónde dijeron venir los ${fmtInt(c.total)} referidos del periodo.`} height={230}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="38%" innerRadius={56} outerRadius={88}
            paddingAngle={3} strokeWidth={0}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => (empty ? "0" : fmtInt(v))} />
          <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={9}
            wrapperStyle={{ fontSize: 12, lineHeight: "22px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ── Referidos: histórico apilado por fuente ─────────────────────
export function ReferralHistory({ reports, title = "Referidos por reporte", subtitle, height = 260 }) {
  const data = reports.filter(hasReferrals).map((r) => {
    const c = refCounts(r);
    return { name: r.title, ...Object.fromEntries(REF_SOURCES.map((s) => [s.label, c[s.key]])), total: c.total };
  });
  return (
    <ChartBox title={title}
      subtitle={subtitle || "Cuántos referidos llegaron en cada reporte y de qué fuente. Solo incluye reportes con referidos capturados."}
      height={height}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#FAFAFA" }} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />
          {REF_SOURCES.map((s, i) => (
            <Bar key={s.key} dataKey={s.label} stackId="ref" fill={s.color} maxBarSize={36}
              radius={i === REF_SOURCES.length - 1 ? [5, 5, 0, 0] : [0, 0, 0, 0]}>
              {i === REF_SOURCES.length - 1 && (
                <LabelList dataKey="total" position="top" style={{ fontSize: 11, fontWeight: 700, fill: INK }} />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ── Referidos: costo por referido en el tiempo ──────────────────
export function ReferralCostTrend({ reports, title = "Costo por referido · histórico", subtitle }) {
  const data = reports.filter(hasReferrals).map((r) => ({ name: r.title, value: refCosts(r).total }))
    .filter((d) => d.value > 0);
  return (
    <ChartBox title={title}
      subtitle={subtitle || "Inversión total del periodo entre referidos totales. Abajo es mejor."} height={220}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 16, right: 20, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="area-refcost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10A37F" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#10A37F" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F0F0F0" />
          <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "#E5E5E5" }} tickLine={false} />
          <YAxis tick={axisTick} axisLine={false} tickLine={false} width={52}
            tickFormatter={(v) => "$" + fmtDec(v)} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmtMoney(v), "Costo por referido"]} />
          <Area type="monotone" dataKey="value" stroke="#10A37F" strokeWidth={2.5} fill="url(#area-refcost)"
            dot={{ r: 4, fill: "#10A37F", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}
