"use client";

import { useEffect, useState } from "react";
import ReportView from "@/components/ReportView";
import { RebrndLogo } from "@/components/Logos";
import { decodeShare } from "@/lib/share";

export default function SharePage() {
  const [data, setData] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) { setError(true); return; }
    decodeShare(hash)
      .then((payload) => {
        setData(payload);
        setReportId(payload.activeId || payload.reports[0]?.id);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-bold text-lg">Link inválido o incompleto</p>
          <p className="text-sm text-neutral-500 mt-1">Pide a tu agencia que te comparta el link de nuevo.</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const report = data.reports.find((r) => r.id === reportId);

  return (
    <div className="min-h-screen">
      {/* Barra superior del cliente */}
      <header className="no-print sticky top-0 z-10 bg-[#1C1E24] text-white">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <RebrndLogo height={18} />
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider hidden sm:block">
              Reporte de pauta · {data.clientName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded px-2 py-1">
              Vista de solo lectura
            </span>
            {data.reports.length > 1 && (
              <select
                className="bg-white/10 text-white text-xs font-semibold rounded-md px-2 py-1.5 outline-none"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
              >
                {data.reports.map((r) => (
                  <option key={r.id} value={r.id} className="text-black">{r.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {report && (
          <ReportView
            report={report}
            clientName={data.clientName}
            clientReports={data.reports}
            readOnly
          />
        )}
      </main>
    </div>
  );
}
