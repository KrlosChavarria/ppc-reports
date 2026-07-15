"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import ReportForm from "@/components/ReportForm";
import ReportView from "@/components/ReportView";
import HistoryPanel from "@/components/HistoryPanel";
import { loadDB, upsertReport, deleteReport, upsertClient, exportJSON } from "@/lib/store";

export default function Page() {
  const [db, setDb] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [view, setView] = useState("history"); // history | new | report | edit
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    const data = loadDB();
    setDb(data);
    setClientId(data.clients[0]?.id || null);
    const first = data.reports.find((r) => r.clientId === data.clients[0]?.id);
    if (first) {
      setView("report");
      setReportId(first.id);
    }
  }, []);

  if (!db) return null;

  const client = db.clients.find((c) => c.id === clientId);
  const clientReports = db.reports
    .filter((r) => r.clientId === clientId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  const report = db.reports.find((r) => r.id === reportId);

  const navigate = (v, id = null) => {
    setView(v);
    setReportId(id);
  };

  const handleSave = (form) => {
    const record = {
      ...form,
      clientId,
      createdAt: form.createdAt || new Date().toISOString(),
    };
    setDb(upsertReport(db, record));
    setView("report");
    setReportId(record.id);
  };

  const handleDelete = () => {
    if (!report) return;
    if (!confirm(`¿Eliminar el reporte "${report.title}"? Esta acción no se puede deshacer.`)) return;
    setDb(deleteReport(db, report.id));
    navigate("history");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        clients={db.clients}
        reports={db.reports}
        activeClientId={clientId}
        view={view}
        activeReportId={reportId}
        onSelectClient={(id) => {
          setClientId(id);
          const first = db.reports.filter((r) => r.clientId === id).slice(-1)[0];
          if (first) navigate("report", first.id);
          else navigate("history");
        }}
        onNavigate={navigate}
        onAddClient={(c) => {
          setDb(upsertClient(db, c));
          setClientId(c.id);
          navigate("new");
        }}
        onExportBackup={() => exportJSON(db)}
      />

      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl">
        {view === "history" && (
          <HistoryPanel reports={clientReports} clientName={client?.name} onOpen={(id) => navigate("report", id)} />
        )}

        {view === "new" && (
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
            onEdit={() => navigate("edit", report.id)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
