"use client";

import { useState } from "react";
import { FileDown, Pencil, Trash2, Link2, Check, Images } from "lucide-react";
import KpiGrid, { CustomKpiGrid } from "./KpiGrid";
import ArtesGallery from "./ArtesGallery";
import { GoogleLogo, FacebookLogo } from "./Logos";
import { PlatformBars, SpendDonut, TrendLine, GADS, META } from "./Charts";
import { computeKpis, sumPlatforms, KPI_DEFS } from "@/lib/kpi";

function ComparativeTable({ report }) {
  const g = computeKpis(report.google);
  const m = computeKpis(report.meta);
  const total = sumPlatforms(report.google, report.meta);
  const rows = KPI_DEFS.filter((d) => !(d.hideWhenZero && !g[d.key] && !m[d.key]));
  return (
    <div className="avoid-break rounded-lg bg-white border border-neutral-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-neutral-50 text-left">
            <th className="px-4 py-3 kpi-label">KPI</th>
            <th className="px-4 py-3 kpi-label">
              <span className="flex items-center gap-1.5" style={{ color: GADS }}>
                <GoogleLogo size={14} /> Google Ads
              </span>
            </th>
            <th className="px-4 py-3 kpi-label">
              <span className="flex items-center gap-1.5" style={{ color: META }}>
                <FacebookLogo size={14} /> Meta Ads
              </span>
            </th>
            <th className="px-4 py-3 kpi-label">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const isRatio = ["ctr", "avgCpc", "cpm", "cpl", "convRate", "frequency"].includes(d.key);
            return (
              <tr key={d.key} className="border-t border-neutral-100">
                <td className="px-4 py-2.5 font-bold">{d.label}</td>
                <td className="px-4 py-2.5">{d.fmt(g[d.key])}</td>
                <td className="px-4 py-2.5">{d.fmt(m[d.key])}</td>
                <td className="px-4 py-2.5 text-neutral-500">
                  {isRatio ? d.fmt(total[d.key]) : d.fmt(g[d.key] + m[d.key])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlatformTab({ report, clientReports, platform, accent, label, icon }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        {icon}
        <h3 className="text-lg font-bold">{label}</h3>
      </div>
      <KpiGrid data={report[platform]} accent={accent} />
      <div className="grid md:grid-cols-2 gap-4">
        <TrendLine reports={clientReports} platform={platform} metric="clicks"
          title={`Clics · histórico`} color={accent}
          subtitle={`Volumen de clics de ${label} en cada reporte guardado.`} />
        <TrendLine reports={clientReports} platform={platform} metric="spend"
          title={`Spend · histórico`} color={accent} money
          subtitle={`Inversión de ${label} por periodo, para vigilar el ritmo del presupuesto.`} />
        <TrendLine reports={clientReports} platform={platform} metric="ctr"
          title={`CTR · histórico`} color={accent} pct
          subtitle="Porcentaje de impresiones que se convierten en clic. Arriba es mejor." />
        <TrendLine reports={clientReports} platform={platform} metric="avgCpc"
          title={`Avg. CPC · histórico`} color={accent} money
          subtitle="Costo promedio por clic. Abajo es mejor: cada visita cuesta menos." />
      </div>
    </div>
  );
}

// ── Layout exclusivo de impresión (lo que sale en el PDF) ──────
function PrintLayout({ report, clientName }) {
  const total = sumPlatforms(report.google, report.meta);
  const Section = ({ title, color, children, breakBefore }) => (
    <section className={breakBefore ? "print-break" : ""} style={{ marginBottom: 24 }}>
      <h2 style={{
        fontSize: 22, fontWeight: 700, color: color || "#16181D",
        borderBottom: `2px solid ${color || "#16181D"}`, paddingBottom: 6, marginBottom: 16,
      }}>{title}</h2>
      {children}
    </section>
  );
  const Cards = ({ data, accent }) => {
    const k = computeKpis(data);
    const visible = KPI_DEFS.filter((d) => !(d.hideWhenZero && !k[d.key]));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {visible.map((d) => (
          <div key={d.key} style={{ background: "#F5F5F5", borderTop: `3px solid ${accent}`, padding: "10px 14px", borderRadius: 6 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#666", textTransform: "uppercase" }}>{d.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{d.fmt(k[d.key])}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="print-only" style={{ fontFamily: "Arial, sans-serif", color: "#16181D" }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "#666" }}>REPORTE DE PAUTA DIGITAL</p>
      <h1 style={{ fontSize: 34, fontWeight: 700, margin: "4px 0 2px" }}>{clientName}</h1>
      <p style={{ color: "#666", marginBottom: 18 }}>Google Ads + Meta Ads</p>
      <p style={{ fontSize: 12, margin: "2px 0" }}><b>Reporte:</b> {report.title}</p>
      <p style={{ fontSize: 12, margin: "2px 0" }}><b>Periodo:</b> {report.period}</p>
      {report.week && <p style={{ fontSize: 12, margin: "2px 0" }}><b>Semana:</b> {report.week}</p>}
      <p style={{ fontSize: 12, margin: "2px 0 22px" }}><b>Emisión:</b> {report.issued}</p>

      <Section title="Resumen general">
        <Cards data={{
          impressions: total.impressions, clicks: total.clicks, spend: total.spend,
          leads: total.leads, reach: total.reach, conversions: total.conversions,
        }} accent="#16181D" />
        {report.customKpis?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
            {report.customKpis.filter((c) => c.name).map((c, i) => (
              <div key={i} style={{ background: "#F5F5F5", borderTop: "3px solid #16181D", padding: "10px 14px", borderRadius: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "#666", textTransform: "uppercase" }}>{c.name}</div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{c.value}</div>
              </div>
            ))}
          </div>
        )}
        {report.notes && (
          <p style={{ fontSize: 12, color: "#555", fontStyle: "italic", marginTop: 14, lineHeight: 1.5 }}>{report.notes}</p>
        )}
      </Section>

      <Section title="Google Ads" color={GADS} breakBefore>
        <Cards data={report.google} accent={GADS} />
      </Section>

      <Section title="Meta Ads" color={META}>
        <Cards data={report.meta} accent={META} />
      </Section>

      <Section title="Comparativo de plataformas" breakBefore>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F5F5F5", textAlign: "left" }}>
              <th style={{ padding: "8px 10px" }}>KPI</th>
              <th style={{ padding: "8px 10px", color: GADS }}>Google Ads</th>
              <th style={{ padding: "8px 10px", color: META }}>Meta Ads</th>
              <th style={{ padding: "8px 10px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {KPI_DEFS.filter((d) => {
              const g = computeKpis(report.google), m = computeKpis(report.meta);
              return !(d.hideWhenZero && !g[d.key] && !m[d.key]);
            }).map((d) => {
              const g = computeKpis(report.google), m = computeKpis(report.meta);
              const isRatio = ["ctr", "avgCpc", "cpm", "cpl", "convRate", "frequency"].includes(d.key);
              return (
                <tr key={d.key} style={{ borderBottom: "1px solid #EEE" }}>
                  <td style={{ padding: "7px 10px", fontWeight: 700 }}>{d.label}</td>
                  <td style={{ padding: "7px 10px" }}>{d.fmt(g[d.key])}</td>
                  <td style={{ padding: "7px 10px" }}>{d.fmt(m[d.key])}</td>
                  <td style={{ padding: "7px 10px", color: "#666" }}>{isRatio ? d.fmt(total[d.key]) : d.fmt(g[d.key] + m[d.key])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {report.artes?.length > 0 && (
        <Section title="Artes activos" breakBefore>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {report.artes.map((a) => (
              <figure key={a.id} style={{ margin: 0, border: "1px solid #E5E5E5", borderRadius: 6, overflow: "hidden", breakInside: "avoid" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.dataUrl} alt={a.name} style={{ width: "100%", display: "block" }} />
                <figcaption style={{ padding: "6px 8px", fontSize: 9, fontWeight: 700, color: "#666" }}>
                  {a.platform === "meta" ? "META" : "GOOGLE"} · {a.format}
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

export default function ReportView({ report, clientName, clientReports, shareToken, onEdit, onDelete, readOnly = false }) {
  const [tab, setTab] = useState("Resumen");
  const [copied, setCopied] = useState(false);
  const total = sumPlatforms(report.google, report.meta);

  const TABS = ["Resumen", "Google Ads", "Meta Ads", "Comparativo", "Artes"];

  const handleShare = async () => {
    if (!shareToken) return alert("Este cliente aún no tiene link. Recarga la página e intenta de nuevo.");
    // Link fijo por cliente: siempre muestra los reportes más recientes del servidor.
    const url = `${window.location.origin}/share?t=${shareToken}&r=${encodeURIComponent(report.id)}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      prompt("Copia el link para el cliente:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="no-print flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <p className="kpi-label">Reporte · {clientName}</p>
          <h2 className="text-2xl font-bold">{report.title}</h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Periodo {report.period}{report.week ? ` · Semana ${report.week}` : ""} · Emisión {report.issued}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!readOnly && (
            <>
              <button className="btn-outline" onClick={handleShare}>
                {copied ? <Check size={15} className="text-green-600" /> : <Link2 size={15} />}
                {copied ? "Link copiado" : "Compartir con cliente"}
              </button>
              <button className="btn-outline" onClick={onEdit}><Pencil size={15} /> Editar</button>
              <button className="btn-ghost text-red-500" onClick={onDelete}><Trash2 size={15} /></button>
            </>
          )}
          <button className="btn-dark" onClick={() => window.print()}><FileDown size={15} /> Exportar PDF</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print flex gap-1 border-b border-neutral-200 mb-5 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              tab === t ? "border-neutral-900 text-neutral-900" : "border-transparent text-neutral-400 hover:text-neutral-700"
            }`}>
            {t === "Google Ads" && <GoogleLogo size={14} />}
            {t === "Meta Ads" && <FacebookLogo size={14} />}
            {t === "Artes" && <Images size={14} />}
            {t}
          </button>
        ))}
      </div>

      <div className="no-print">
        {tab === "Resumen" && (
          <div className="space-y-4">
            <KpiGrid data={{
              impressions: total.impressions, clicks: total.clicks, spend: total.spend,
              leads: total.leads, reach: total.reach, conversions: total.conversions,
            }} />
            <CustomKpiGrid items={report.customKpis} />
            {report.notes && (
              <div className="rounded-lg bg-white border border-neutral-200 p-5">
                <p className="kpi-label mb-2">Análisis del periodo</p>
                <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{report.notes}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <SpendDonut report={report} />
              <PlatformBars report={report} metric="clicks" title="Clics por plataforma"
                subtitle="Tráfico generado por cada plataforma en este periodo." />
            </div>
          </div>
        )}

        {tab === "Google Ads" && (
          <PlatformTab report={report} clientReports={clientReports} platform="google"
            accent={GADS} label="Google Ads" icon={<GoogleLogo size={24} />} />
        )}
        {tab === "Meta Ads" && (
          <PlatformTab report={report} clientReports={clientReports} platform="meta"
            accent={META} label="Meta Ads" icon={<FacebookLogo size={24} />} />
        )}

        {tab === "Comparativo" && (
          <div className="space-y-4">
            <ComparativeTable report={report} />
            <div className="grid md:grid-cols-2 gap-4">
              <PlatformBars report={report} metric="spend" title="Spend por plataforma" money
                subtitle="Dónde se está invirtiendo el presupuesto del periodo." />
              <PlatformBars report={report} metric="impressions" title="Impresiones por plataforma"
                subtitle="Alcance bruto: cuántas veces se mostraron los anuncios." />
              <PlatformBars report={report} metric="ctr" title="CTR por plataforma" pct
                subtitle="Qué tan atractivo es el anuncio: % de impresiones que hacen clic." />
              <PlatformBars report={report} metric="avgCpc" title="Avg. CPC por plataforma" money
                subtitle="Costo promedio de cada clic. La barra más baja es la más eficiente." />
            </div>
          </div>
        )}

        {tab === "Artes" && (
          <ArtesGallery artes={report.artes}
            emptyHint={readOnly ? "Este reporte no incluye artes." : "Sube los artes activos desde Editar → Artes activos."} />
        )}
      </div>

      {/* Lo que se imprime al exportar PDF */}
      <PrintLayout report={report} clientName={clientName} />
    </div>
  );
}
