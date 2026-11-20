"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { RebrndLogo } from "./Logos";
import { login } from "@/lib/store";

export default function LoginScreen({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(password);
      onSuccess();
    } catch {
      setError("Contraseña incorrecta");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1C1E24] px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl bg-white p-7 shadow-xl">
        <div className="bg-[#1C1E24] rounded-md px-3 py-2.5 inline-block"><RebrndLogo height={18} /></div>
        <h1 className="text-lg font-bold mt-5">Reportes de pauta</h1>
        <p className="text-sm text-neutral-500 mt-1">Ingresa la contraseña del equipo para ver y editar reportes.</p>
        <label className="kpi-label block mt-5 mb-1.5">Contraseña</label>
        <input type="password" autoFocus className="input" value={password}
          onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <button className="btn-dark w-full justify-center mt-5" disabled={busy || !password}>
          <Lock size={15} /> {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
