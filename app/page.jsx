"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ReportForm from "@/components/ReportForm";
import ReportView from "@/components/ReportView";
import HistoryPanel from "@/components/HistoryPanel";
import LoginScreen from "@/components/LoginScreen";
import {
  loadDB, saveReport, removeReport, saveClient, importBackup, exportJSON,
  readLegacyLocal, logout, AuthError, LEGACY_KEY,
} from "@/lib/store";

export default function Page() {
  const [db, setDb] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | login | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [view, setView] = useState("history"); // history | new | report | edit
  const [reportId, setReportId] = useState(null);
  const [legacy, setLegacy] = useState(null);

  const openDB = useCallback((data, preferClientId) => {
    setDb(data);
    const cid = preferClientId && data.clients.some((c) => c.id === preferClientId)
      ? preferClientId
      : data.clients[0]?.id || null;
    setClientId(cid);
    const last = data.reports
      .filter((r) => r.clientId === cid)
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
      .slice(-1)[0];
    if (last) { setView("report"); setReportId(last.id); }
    else { setView("history"); setReportId(null); }
    setStatus("ready");
  }, []);

  const fetchDB = useCallback(async () => {
    setStatus("loading");
    try {
      openDB(await loadDB());
      setLegacy(readLegacyLocal());
    } catch (e) {
      if (e instanceof AuthError) setStatus("login");
      else { setErrorMsg(e.message); setStatus("error"); }
    }
  }, [openDB]);

  useEffect(() => { fetchDB(); }, [fetchDB]);

  // Ejecuta una escritura en servidor; si la sesión expiró, regresa al login.
  const persist = async (fn) => {
    setSaving(true);
    try {
      return await fn();
    } catch (e) {
      if (e instanceof AuthError) { setStatus("login"); return null; }
      alert("No se pudo guardar en el servidor: " + e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleImport = async (data) => {
    const res = await persist(() => importBackup(data));
    if (!res) return false;
    openDB(res.db, data.clients?.[0]?.id);
    alert(`Importado: ${res.added} reporte(s) nuevo(s) y ${res.updated} actualizado(s).` +
      (res.skipped ? ` Se omitieron ${res.skipped} que no coincidían con ningún reporte o cliente.` : ""));
    return true;
  };

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">Cargando…</div>;
  }
  if (status === "login") return <LoginScreen onSuccess={fetchDB} />;
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-bold text-lg">No se pudo conectar con la base de datos</p>
          <p className="text-sm text-neutral-500 mt-1">{errorMsg}</p>
          <button className="btn-dark mt-4" onClick={fetchDB}>Reintentar</button>
        </div>
      </div>
    );
  }

  const client = db.clients.find((c) => c.id === clientId);
  const clientReports = db.reports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const report = db.reports.find((r) => r.id === reportId);

  const navigate = (v, id = null) => { setView(v); setReportId(id); };

  const handleSave = async (form) => {
    const record = { ...form, clientId, createdAt: form.createdAt || new Date().toISOString() };
    const saved = await persist(() => saveReport(record));
    if (!saved) return;
    setDb((prev) => {
      const reports = prev.reports.filter((r) => r.id !== saved.id);
      return { ...prev, reports: [...reports, saved] };
    });
    navigate("report", saved.id);
  };

  const handleDelete = async () => {
    if (!report) return;
    if (!confirm(`¿Eliminar el reporte "${report.title}"? Esta acción no se puede deshacer.`)) return;
    await persist(() => removeReport(report.id));
    setDb((prev) => ({ ...prev, reports: prev.reports.filter((r) => r.id !== report.id) }));
    navigate("history");
  };

  const handleAddClient = async (c) => {
    const saved = await persist(() => saveClient(c));
    if (!saved) return;
    setDb((prev) => ({ ...prev, clients: [...prev.clients.filter((x) => x.id !== saved.id), saved] }));
    setClientId(saved.id);
    navigate("new");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        clients={db.clients}
        reports={db.reports}
        activeClientId={clientId}
        view={view}
        activeReportId={reportId}
        saving={saving}
        onSelectClient={(id) => {
          setClientId(id);
          const last = db.reports
            .filter((r) => r.clientId === id)
            .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
            .slice(-1)[0];
          if (last) navigate("report", last.id);
          else navigate("history");
        }}
        onNavigate={navigate}
        onAddClient={handleAddClient}
        onExportBackup={() => exportJSON({ clients: db.clients.map(({ shareToken, ...c }) => c), reports: db.reports })}
        onImportBackup={handleImport}
        onLogout={async () => { await logout().catch(() => {}); setStatus("login"); }}
      />

      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl">
        {legacy && (
          <div className="no-print mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>
              Este navegador tiene <b>{legacy.reports.length} reporte(s)</b> guardados de la versión anterior (solo locales).
              ¿Subirlos al servidor para que todos los vean?
            </span>
            <span className="flex gap-2">
              <button className="btn-dark" onClick={async () => {
                if (await handleImport(legacy)) { localStorage.removeItem(LEGACY_KEY); setLegacy(null); }
              }}>Subir al servidor</button>
              <button className="btn-ghost" onClick={() => setLegacy(null)}>Ahora no</button>
            </span>
          </div>
        )}

        {db.clients.length === 0 && view !== "new" && (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
            <p className="font-bold">La base de datos está vacía</p>
            <p className="text-sm text-neutral-500 mt-1">
              Usa <b>Importar respaldo (JSON)</b> en la barra lateral para subir tus reportes, o agrega un cliente.
            </p>
          </div>
        )}

        {view === "history" && client && (
          <HistoryPanel reports={clientReports} clientName={client?.name} onOpen={(id) => navigate("report", id)} />
        )}

        {view === "new" && client && (
          <ReportForm clientName={client?.name} onSave={handleSave} onCancel={() => navigate("history")} />
        )}

        {view === "edit" && report && (
          <ReportForm initial={report} clientName={client?.name} onSave={handleSave}
            onCancel={() => navigate("report", report.id)} />
        )}

        {view === "report" && report && (
          <ReportView
            report={report}
            clientName={client?.name}
            clientReports={clientReports}
            shareToken={client?.shareToken}
            onEdit={() => navigate("edit", report.id)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
