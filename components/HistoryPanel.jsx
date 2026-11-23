"use client";

import { computeKpis, sumPlatforms, fmtInt, fmtMoney, fmtPct } from "@/lib/kpi";
import { TrendLine, HistoryGrouped, ReferralHistory, ReferralCostTrend } from "./Charts";
import { REF_SOURCES, refCounts, refCosts, hasReferrals } from "@/lib/referrals";

export default function HistoryPanel({ reports, clientName, onOpen }) {
  // Acumulados de todos los reportes del cliente
  const acc = reports.reduce(
    (a, r) => {
      const t = sumPlatforms(r.google, r.meta);
      return {
        impressions: a.impressions + t.impressions,
        clicks: a.clicks + t.clicks,
        spend: a.spend + t.spend,
        leads: a.leads + t.leads,
        reach: a.reach + t.reach,
      };
    },
    { impressions: 0, clicks: 0, spend: 0, leads: 0, reach: 0 }
  );
  const accK = computeKpis(acc);

  // Citas pagadas acumuladas (solo reportes que las tienen capturadas)
  const withRefs = reports.filter(hasReferrals);
  const refAcc = withRefs.reduce((a, r) => {
    const c = refCounts(r);
    REF_SOURCES.forEach((s) => (a[s.key] += c[s.key]));
    a.total += c.total;
    a.ads += c.ads;
    a.spend += computeKpis(r.google).spend + computeKpis(r.meta).spend;
    a.gSpend += computeKpis(r.google).spend;
    a.mSpend += computeKpis(r.meta).spend;
    return a;
  }, { google: 0, facebook: 0, ai: 0, other: 0, total: 0, ads: 0, spend: 0, gSpend: 0, mSpend: 0 });

  const cards = [
    { label: "Reportes", value: fmtInt(reports.length) },
    { label: "Spend acumulado", value: fmtMoney(accK.spend) },
    { label: "Leads acumulados", value: fmtInt(accK.leads), hide: !accK.leads },
    { label: "CPL acumulado", value: fmtMoney(accK.cpl), hide: !accK.leads },
    { label: "Impresiones acumuladas", value: fmtInt(accK.impressions) },
    { label: "Reach acumulado", value: fmtInt(accK.reach), hide: !accK.reach },
    { label: "Clics acumulados", value: fmtInt(accK.clicks) },
    { label: "CTR global", value: fmtPct(accK.ctr) },
    { label: "Avg. CPC global", value: fmtMoney(accK.avgCpc) },
    { label: "CPA global", value: fmtMoney(refAcc.spend / refAcc.ads), hide: !refAcc.ads, dark: true,
      sub: `Inversión / ${fmtInt(refAcc.ads)} citas por pauta · ${withRefs.length} reporte(s)` },
    { label: "CPA Google global", value: fmtMoney(refAcc.gSpend / refAcc.google), hide: !refAcc.google,
      sub: `${fmtInt(refAcc.google)} citas de Google` },
    { label: "CPA Meta global", value: fmtMoney(refAcc.mSpend / refAcc.facebook), hide: !refAcc.facebook,
      sub: `${fmtInt(refAcc.facebook)} citas de Facebook` },
    { label: "Citas pagadas acumuladas", value: fmtInt(refAcc.total), hide: !withRefs.length,
      sub: REF_SOURCES.filter((s) => refAcc[s.key]).map((s) => `${s.label} ${refAcc[s.key]}`).join(" · ") },
  ].filter((c) => !c.hide);

  return (
    <div className="space-y-5">
      <div>
        <p className="kpi-label">Histórico · {clientName}</p>
        <h2 className="text-2xl font-bold">Todos los reportes</h2>
        <p className="text-sm text-neutral-500 mt-1">Datos acumulados y evolución en el tiempo, reporte tras reporte.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((c) => (
          <div key={c.label} className={c.dark ? "rounded-lg bg-[#1C1E24] text-white px-4 py-3" : "kpi-card"}>
            <p className={`kpi-label ${c.dark ? "!text-neutral-400" : ""}`}>{c.label}</p>
            <p className="kpi-value">{c.value}</p>
            {c.sub && <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{c.sub}</p>}
          </div>
        ))}
      </div>

      {reports.length >= 2 ? (
        <div className="grid md:grid-cols-2 gap-4">
          <TrendLine reports={reports} platform="total" metric="spend" title="Spend total en el tiempo" money />
          <TrendLine reports={reports} platform="total" metric="clicks" title="Clics totales en el tiempo" />
          <HistoryGrouped reports={reports} metric="spend" title="Spend · Google vs Meta por reporte" money />
          <HistoryGrouped reports={reports} metric="clicks" title="Clics · Google vs Meta por reporte" />
          {withRefs.length >= 2 && (
            <>
              <div className="md:col-span-2">
                <ReferralCostTrend reports={withRefs} height={260} />
              </div>
              <div className="md:col-span-2">
                <ReferralHistory reports={withRefs} title="Citas pagadas por reporte · por fuente" height={280} />
              </div>
              <div className="md:col-span-2">
                <TrendLine reports={reports} platform="total" metric="leads" title="Leads (Meta) en el tiempo"
                  subtitle="Para comparar contra las citas: leads del formulario vs citas que sí pagaron." />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          Las gráficas de evolución aparecen a partir del segundo reporte. Captura el siguiente y aquí verás la tendencia completa.
        </div>
      )}

      {/* Tabla de reportes */}
      <div className="rounded-lg bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left">
              <th className="px-4 py-3 kpi-label">Reporte</th>
              <th className="px-4 py-3 kpi-label">Periodo</th>
              <th className="px-4 py-3 kpi-label">Spend</th>
              <th className="px-4 py-3 kpi-label">Clics</th>
              <th className="px-4 py-3 kpi-label">CTR</th>
              <th className="px-4 py-3 kpi-label">Leads</th>
              <th className="px-4 py-3 kpi-label">Citas</th>
              <th className="px-4 py-3 kpi-label">CPA</th>
            </tr>
          </thead>
          <tbody>
            {[...reports].reverse().map((r) => {
              const t = sumPlatforms(r.google, r.meta);
              return (
                <tr key={r.id} onClick={() => onOpen(r.id)}
                  className="border-t border-neutral-100 hover:bg-neutral-50 cursor-pointer">
                  <td className="px-4 py-3 font-bold">{r.title}</td>
                  <td className="px-4 py-3 text-neutral-500">{r.period}</td>
                  <td className="px-4 py-3">{fmtMoney(t.spend)}</td>
                  <td className="px-4 py-3">{fmtInt(t.clicks)}</td>
                  <td className="px-4 py-3">{fmtPct(t.ctr)}</td>
                  <td className="px-4 py-3">{t.leads ? fmtInt(t.leads) : "—"}</td>
                  <td className="px-4 py-3">{hasReferrals(r) ? fmtInt(refCounts(r).total) : "—"}</td>
                  <td className="px-4 py-3 font-bold">{refCosts(r).total ? fmtMoney(refCosts(r).total) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
