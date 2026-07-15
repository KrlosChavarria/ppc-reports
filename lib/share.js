"use client";

// ── Link de solo lectura para el cliente ────────────────────────
// El paquete {clientName, reports, activeId} se comprime (deflate) y
// se codifica en base64url dentro del hash de la URL: /share#<datos>.
// El cliente solo ve; no hay forma de modificar nada desde esa vista.

async function streamToBase64url(stream) {
  const buf = await new Response(stream).arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function encodeShare(payload) {
  const json = JSON.stringify(payload);
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate"));
  return streamToBase64url(stream);
}

export async function decodeShare(hash) {
  const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
  const json = await new Response(stream).text();
  return JSON.parse(json);
}

// ── Compresión de artes al subirlas ─────────────────────────────
// Reduce a máx. 900px por lado y JPEG 0.82 para que quepan en
// localStorage y en el link compartido sin perder calidad visual.

export function compressImage(file, maxSide = 900, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", quality),
        w: img.width,
        h: img.height,
      });
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Detecta el formato del arte por proporción
export function detectFormat(w, h) {
  const r = w / h;
  if (Math.abs(r - 1) < 0.05) return "1080 × 1080 · Feed";
  if (Math.abs(r - 16 / 9) < 0.08) return "1920 × 1080 · Horizontal";
  if (Math.abs(r - 9 / 16) < 0.08) return "1080 × 1920 · Story / Reel";
  if (Math.abs(r - 4 / 5) < 0.05) return "1080 × 1350 · Vertical";
  return `${w} × ${h}`;
}
