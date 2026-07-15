"use client";

import { GoogleLogo, FacebookLogo } from "./Logos";
import { GADS, META } from "./Charts";

export default function ArtesGallery({ artes = [], emptyHint }) {
  if (!artes.length) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
        {emptyHint || "Aún no hay artes en este reporte."}
      </div>
    );
  }

  const groups = [
    { key: "meta", label: "Meta Ads", icon: <FacebookLogo size={18} />, color: META },
    { key: "google", label: "Google Ads", icon: <GoogleLogo size={18} />, color: GADS },
  ];

  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const items = artes.filter((a) => a.platform === g.key);
        if (!items.length) return null;
        return (
          <div key={g.key}>
            <div className="flex items-center gap-2 mb-3">
              {g.icon}
              <h3 className="font-bold">{g.label}</h3>
              <span className="text-xs text-neutral-400 font-semibold">
                {items.length} {items.length === 1 ? "arte activo" : "artes activos"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((a) => (
                <figure key={a.id} className="avoid-break rounded-lg bg-white border border-neutral-200 overflow-hidden">
                  <div className="bg-neutral-100 flex items-center justify-center" style={{ minHeight: 120 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.dataUrl} alt={a.name} className="w-full h-auto" />
                  </div>
                  <figcaption className="px-3 py-2.5">
                    <p className="text-xs font-bold truncate">{a.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: g.color }}>
                      {a.format}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
