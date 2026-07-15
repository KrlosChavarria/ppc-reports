# REBRND® · Reportes de Pauta (Google Ads + Meta Ads)

Webapp en **Next.js (App Router, JSX, sin TypeScript)** para capturar, visualizar y exportar reportes de pauta digital por cliente.

## Correr en local

```bash
npm install
npm run dev
# abre http://localhost:3000
```

## Qué hace

- **Panel por cliente** (viene precargado "Abogado Ernesto" con la Semana 1: 644 impresiones, 41 clics, $194.97, CTR 6.37%, CPC $4.76).
- **Captura de datos base** por plataforma: impresiones, reach, clics, spend, leads y conversiones. Leads y reach son opcionales — si no se miden, el resto de KPIs se calcula igual y las tarjetas de lead simplemente no aparecen.
- **KPIs automáticos**: CTR, Avg. CPC, CPM, CPL, tasa de conversión y frecuencia se calculan solos en tiempo real mientras capturas.
- **KPIs personalizados**: agrega los que quieras (optimization score, llamadas, WhatsApp, etc.).
- **Pestañas por reporte**: Resumen · Google Ads · Meta Ads · Comparativo, con gráficas generadas en automático (recharts).
- **Exportar PDF**: botón "Exportar PDF" → usa el diálogo de impresión del navegador con un layout limpio de 3 páginas (guardar como PDF).
- **Persistencia**: todo se guarda en `localStorage` del navegador, reporte tras reporte. Botón de respaldo a JSON en el sidebar.
- **Histórico**: panel con acumulados de todos los reportes y gráficas de evolución en el tiempo (aparecen a partir del 2º reporte).
- **Link para el cliente (solo lectura)**: botón "Compartir con cliente" → copia un link `/share#...` con todo el panel del cliente embebido y comprimido en la URL. El cliente puede ver reportes, gráficas, artes y exportar PDF, pero no puede modificar nada. Funciona en cualquier navegador una vez desplegada la app (requiere navegador moderno: Chrome, Edge, Safari 16.4+).
- **Artes activos**: en el formulario sube las imágenes de los ads en circulación (Meta o Google). Se comprimen automáticamente, el formato se detecta por proporción (1080×1080 Feed, 1920×1080 Horizontal, Story/Reel…) y se muestran en la pestaña "Artes" del reporte, en el link del cliente y como página final del PDF.
- **Branding**: logos SVG de Google y Facebook en sus paneles, sidebar dark con wordmark REBRND®.

## Deploy

Funciona tal cual en Vercel o DigitalOcean App Platform (`npm run build && npm start`).

## Nota sobre persistencia

`localStorage` guarda los datos **en el navegador de quien captura**. Si más adelante quieres que Aranza y tú compartan los mismos datos desde distintos equipos, el siguiente paso natural es mover `lib/store.js` a un API route con MySQL (mismo patrón que usas en Poligrama). La estructura de datos ya está lista para ese cambio.
# ppc-reports
