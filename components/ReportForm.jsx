"use client";

import { useState } from "react";
import { Plus, Trash2, Save, ImagePlus, X } from "lucide-react";
import { computeKpis, fmtPct, fmtMoney, num } from "@/lib/kpi";
import { uid } from "@/lib/store";
import { compressImage, detectFormat } from "@/lib/share";
import { GoogleLogo, FacebookLogo } from "./Logos";
import { GADS, META } from "./Charts";
import { REF_SOURCES, EMPTY_REFERRALS, refCounts, refCosts } from "@/lib/referrals";

const EMPTY_PLATFORM = { impressions: "", clicks: "", spend: "", leads: "", reach: "", conversions: "" };

const FIELDS = [
  { key: "impressions", label: "Impresiones" },
  { key: "reach", label: "Reach", hint: "opcional" },
  { key: "clicks", label: "Clics" },
  { key: "spend", label: "Spend ($)" },
  { key: "leads", label: "Leads", hint: "opcional — si no se mide, déjalo vacío" },
  { key: "conversions", label: "Conversiones", hint: "opcional" },
];

function PlatformInputs({ label, accent, icon, value, onChange }) {
  const k = computeKpis(value);
  return (
    <div className="rounded-lg bg-white border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-bold">{label}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="kpi-label">{f.label}</span>
            <input
              className="input mt-1"
              inputMode="decimal"
              placeholder={f.hint || "0"}
              value={value[f.key]}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
        <span>Se calculan solos:</span>
        <span><b className="text-neutral-800">CTR</b> {fmtPct(k.ctr)}</span>
        <span><b className="text-neutral-800">Avg. CPC</b> {fmtMoney(k.avgCpc)}</span>
        <span><b className="text-neutral-800">CPM</b> {fmtMoney(k.cpm)}</span>
        {num(value.leads) > 0 && <span><b className="text-neutral-800">CPL</b> {fmtMoney(k.cpl)}</span>}
        {num(value.reach) > 0 && <span><b className="text-neutral-800">Frecuencia</b> {k.frequency.toFixed(2)}</span>}
      </div>
    </div>
  );
}

function ArtesUploader({ artes, onChange }) {
  const [platform, setPlatform] = useState("meta");
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files) => {
    setBusy(true);
    const added = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const { dataUrl, w, h } = await compressImage(file);
        added.push({ id: uid(), name: file.name.replace(/\.[^.]+$/, ""), platform, w, h, format: detectFormat(w, h), dataUrl });
      } catch { /* archivo ilegible: se omite */ }
    }
    onChange([...artes, ...added]);
    setBusy(false);
  };

  return (
    <div className="rounded-lg bg-white border border-neutral-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold">Artes activos</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Sube las imágenes de los ads en circulación (1080×1080, 1920×1080, stories…). El formato se detecta solo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-neutral-300 overflow-hidden text-xs font-semibold">
            <button type="button" onClick={() => setPlatform("meta")}
              className={`px-3 py-1.5 flex items-center gap-1.5 ${platform === "meta" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500"}`}>
              <FacebookLogo size={13} /> Meta
            </button>
            <button type="button" onClick={() => setPlatform("google")}
              className={`px-3 py-1.5 flex items-center gap-1.5 ${platform === "google" ? "bg-neutral-900 text-white" : "bg-white text-neutral-500"}`}>
              <GoogleLogo size={13} /> Google
            </button>
          </div>
          <label className="btn-outline text-xs cursor-pointer">
            <ImagePlus size={14} /> {busy ? "Procesando…" : "Subir imágenes"}
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </div>
      {artes.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {artes.map((a) => (
            <div key={a.id} className="relative group rounded-md overflow-hidden border border-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.dataUrl} alt={a.name} className="w-full h-24 object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/55 text-white text-[9px] font-bold px-1.5 py-0.5 truncate">
                {a.platform === "meta" ? "Meta" : "Google"} · {a.format}
              </span>
              <button type="button"
                className="absolute top-1 right-1 bg-black/60 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition"
                onClick={() => onChange(artes.filter((x) => x.id !== a.id))}>
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReferralInputs({ form, onChange }) {
  const value = { ...EMPTY_REFERRALS, ...(form.referrals || {}) };
  const c = refCounts({ referrals: value });
  const cost = refCosts({ ...form, referrals: value });
  return (
    <div className="rounded-lg bg-white border border-neutral-200 p-5">
      <div className="mb-4">
        <h3 className="font-bold">Citas pagadas (CPA)</h3>
        <p className="text-xs text-neutral-400 mt-0.5">
          Citas presenciales pagadas o separaciones, según de dónde dijo venir cada persona. Con esto se calcula el CPA. Opcional: si no hay dato, déjalo vacío.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {REF_SOURCES.map((s) => (
          <label key={s.key} className="block">
            <span className="kpi-label flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </span>
            <input className="input mt-1" inputMode="numeric" placeholder="0" value={value[s.key]}
              onChange={(e) => onChange({ ...value, [s.key]: e.target.value })} />
          </label>
        ))}
      </div>
      <label className="block mt-3">
        <span className="kpi-label">Semana del tracker</span>
        <input className="input mt-1" placeholder="Ej. Semana del 3 de agosto (si las fechas no cuadran con el reporte)"
          value={value.trackerWeek} onChange={(e) => onChange({ ...value, trackerWeek: e.target.value })} />
      </label>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
        <span>Se calculan solos:</span>
        <span><b className="text-neutral-800">Citas</b> {c.total}{c.organic ? ` (${c.ads} por pauta)` : ""}</span>
        {cost.total > 0 && <span><b className="text-neutral-800">CPA general</b> {fmtMoney(cost.total)}</span>}
        {cost.google > 0 && <span><b className="text-neutral-800">CPA Google</b> {fmtMoney(cost.google)}</span>}
        {cost.facebook > 0 && <span><b className="text-neutral-800">CPA Meta</b> {fmtMoney(cost.facebook)}</span>}
      </div>
    </div>
  );
}

export default function ReportForm({ initial, clientName, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      id: uid(),
      title: "",
      period: "",
      week: "",
      issued: new Date().toISOString().slice(0, 10),
      notes: "",
      google: { ...EMPTY_PLATFORM },
      meta: { ...EMPTY_PLATFORM },
      customKpis: [],
      artes: [],
      referrals: { ...EMPTY_REFERRALS },
    }
  );

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const setCustom = (idx, patch) => {
    const next = [...form.customKpis];
    next[idx] = { ...next[idx], ...patch };
    set({ customKpis: next });
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold">{initial ? "Editar reporte" : "Nuevo reporte"}</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Cliente: <b className="text-neutral-800">{clientName}</b>. Captura los datos base; CTR, CPC, CPM, CPL y frecuencia se calculan en automático.
        </p>
      </div>

      <div className="rounded-lg bg-white border border-neutral-200 p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="kpi-label">Título del reporte</span>
          <input className="input mt-1" placeholder="Semana 2" value={form.title}
            onChange={(e) => set({ title: e.target.value })} />
        </label>
        <label className="block">
          <span className="kpi-label">Periodo</span>
          <input className="input mt-1" placeholder="01 – 15 de julio, 2026" value={form.period}
            onChange={(e) => set({ period: e.target.value })} />
        </label>
        <label className="block">
          <span className="kpi-label">Semana del reporte</span>
          <input className="input mt-1" placeholder="13 – 19 de julio" value={form.week}
            onChange={(e) => set({ week: e.target.value })} />
        </label>
        <label className="block">
          <span className="kpi-label">Fecha de emisión</span>
          <input className="input mt-1" type="date" value={form.issued}
            onChange={(e) => set({ issued: e.target.value })} />
        </label>
      </div>

      <PlatformInputs label="Google Ads" accent={GADS} icon={<GoogleLogo size={20} />}
        value={form.google} onChange={(v) => set({ google: v })} />
      <PlatformInputs label="Meta Ads" accent={META} icon={<FacebookLogo size={20} />}
        value={form.meta} onChange={(v) => set({ meta: v })} />

      {/* Citas pagadas reportadas por el cliente (CPA) */}
      <ReferralInputs form={form} onChange={(referrals) => set({ referrals })} />

      {/* Artes / creativos activos */}
      <ArtesUploader artes={form.artes || []} onChange={(artes) => set({ artes })} />

      {/* Custom KPIs */}
      <div className="rounded-lg bg-white border border-neutral-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">KPIs personalizados</h3>
          <button className="btn-outline text-xs" onClick={() => set({ customKpis: [...form.customKpis, { name: "", value: "" }] })}>
            <Plus size={14} /> Agregar KPI
          </button>
        </div>
        {form.customKpis.length === 0 && (
          <p className="text-sm text-neutral-400">Ej. Optimization score, llamadas, mensajes de WhatsApp, visitas al perfil…</p>
        )}
        <div className="space-y-2">
          {form.customKpis.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" placeholder="Nombre (ej. Llamadas)" value={c.name}
                onChange={(e) => setCustom(i, { name: e.target.value })} />
              <input className="input" placeholder="Valor (ej. 12)" value={c.value}
                onChange={(e) => setCustom(i, { value: e.target.value })} />
              <button className="btn-ghost text-red-500 px-2"
                onClick={() => set({ customKpis: form.customKpis.filter((_, j) => j !== i) })}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="block rounded-lg bg-white border border-neutral-200 p-5">
        <span className="kpi-label">Comentarios / análisis del periodo</span>
        <textarea className="input mt-2 min-h-[110px]" placeholder="Hallazgos, ajustes realizados y siguientes pasos…"
          value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
      </label>

      <div className="flex gap-2">
        <button className="btn-dark" onClick={() => onSave(form)} disabled={!form.title.trim()}>
          <Save size={16} /> Guardar reporte
        </button>
        {onCancel && <button className="btn-ghost" onClick={onCancel}>Cancelar</button>}
      </div>
    </div>
  );
}
