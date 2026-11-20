"use client";

import { useRef, useState } from "react";
import { Plus, History, FileText, ChevronDown, Download, Upload, Briefcase, LogOut, Loader2 } from "lucide-react";
import { uid } from "@/lib/store";
import { RebrndLogo } from "./Logos";

export default function Sidebar({
  clients, reports, activeClientId, view, activeReportId,
  onSelectClient, onNavigate, onAddClient, onExportBackup, onImportBackup, onLogout, saving,
}) {
  const fileRef = useRef(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const clientReports = reports
    .filter((r) => r.clientId === activeClientId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

  const itemBase = "w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-semibold transition";
  const itemIdle = "text-neutral-400 hover:bg-white/5 hover:text-white";
  const itemActive = "bg-white/10 text-white";

  return (
    <aside className="no-print w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[#1C1E24] text-white">
      {/* Marca */}
      <div className="px-4 py-5 border-b border-white/10">
        <RebrndLogo height={20} />
        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.18em] mt-2">
          Reportes de pauta
        </p>
      </div>

      {/* Clientes */}
      <div className="px-3 pt-4">
        <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Clientes</p>
        {clients.map((c) => (
          <button key={c.id} onClick={() => onSelectClient(c.id)}
            className={`${itemBase} ${c.id === activeClientId ? "bg-white text-neutral-900" : itemIdle}`}>
            <Briefcase size={15} className={c.id === activeClientId ? "text-neutral-900" : "text-neutral-500"} />
            <span className="truncate">{c.name}</span>
          </button>
        ))}
        {adding ? (
          <form className="mt-1 flex gap-1" onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onAddClient({ id: uid(), name: name.trim() });
            setName(""); setAdding(false);
          }}>
            <input autoFocus
              className="w-full rounded-md bg-white/10 border border-white/15 px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-white/40"
              placeholder="Nombre del cliente"
              value={name} onChange={(e) => setName(e.target.value)} />
            <button className="rounded-md bg-white text-neutral-900 px-2.5 py-1.5 text-xs font-bold" type="submit">OK</button>
          </form>
        ) : (
          <button className={`${itemBase} mt-1 text-neutral-500 hover:bg-white/5 hover:text-white`}
            onClick={() => setAdding(true)}>
            <Plus size={15} /> Agregar cliente
          </button>
        )}
      </div>

      {/* Navegación */}
      <div className="px-3 pt-5">
        <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Panel</p>
        <button onClick={() => onNavigate("history")}
          className={`${itemBase} ${view === "history" ? itemActive : itemIdle}`}>
          <History size={15} /> Histórico y acumulados
        </button>
        <button onClick={() => onNavigate("new")}
          className={`${itemBase} ${view === "new" ? itemActive : itemIdle}`}>
          <Plus size={15} /> Nuevo reporte
        </button>
      </div>

      {/* Reportes */}
      <div className="px-3 pt-5 flex-1 overflow-y-auto">
        <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
          Reportes <ChevronDown size={12} />
        </p>
        {clientReports.length === 0 && (
          <p className="px-1 text-xs text-neutral-500">Aún no hay reportes para este cliente.</p>
        )}
        {[...clientReports].reverse().map((r) => (
          <button key={r.id} onClick={() => onNavigate("report", r.id)}
            className={`${itemBase} ${view === "report" && activeReportId === r.id ? itemActive : itemIdle} font-normal`}>
            <FileText size={14} className="text-neutral-500 shrink-0" />
            <span className="truncate text-left">{r.title}</span>
          </button>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-white/10">
        {saving && (
          <p className="px-2.5 pb-1 text-[11px] text-neutral-400 flex items-center gap-1.5">
            <Loader2 size={12} className="animate-spin" /> Guardando…
          </p>
        )}
        <button className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-neutral-500 hover:bg-white/5 hover:text-white transition"
          onClick={onExportBackup}>
          <Download size={13} /> Respaldar datos (JSON)
        </button>
        <button className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-neutral-500 hover:bg-white/5 hover:text-white transition"
          onClick={() => fileRef.current?.click()}>
          <Upload size={13} /> Importar respaldo (JSON)
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              const data = JSON.parse(await file.text());
              if (!confirm(`¿Importar ${data.reports?.length || 0} reporte(s) y ${data.clients?.length || 0} cliente(s)? Los que tengan el mismo id se actualizarán.`)) return;
              await onImportBackup(data);
            } catch (err) {
              if (err instanceof SyntaxError) alert("El archivo no es un JSON válido.");
            }
          }} />
        <button className="w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-xs text-neutral-500 hover:bg-white/5 hover:text-white transition"
          onClick={onLogout}>
          <LogOut size={13} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
