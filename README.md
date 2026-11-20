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
- **Persistencia en servidor**: los reportes se guardan en PostgreSQL vía `/api`, así todo el equipo ve los mismos datos desde cualquier equipo. El panel pide la contraseña del equipo (`ADMIN_PASSWORD`). Botones de **respaldar** e **importar** JSON en el sidebar.
- **Histórico**: panel con acumulados de todos los reportes y gráficas de evolución en el tiempo (aparecen a partir del 2º reporte).
- **Link para el cliente (solo lectura)**: botón "Compartir con cliente" → copia un link fijo `/share?t=<token>` por cliente. No necesita contraseña y siempre muestra los reportes más recientes: cuando subes uno nuevo, el cliente lo ve con el mismo link. Los links viejos `/share#...` siguen funcionando.
- **Artes activos**: en el formulario sube las imágenes de los ads en circulación (Meta o Google). Se comprimen automáticamente, el formato se detecta por proporción (1080×1080 Feed, 1920×1080 Horizontal, Story/Reel…) y se muestran en la pestaña "Artes" del reporte, en el link del cliente y como página final del PDF.
- **Branding**: logos SVG de Google y Facebook en sus paneles, sidebar dark con wordmark REBRND®.

## Variables de entorno

Ver `.env.example`. En local, sin `DATABASE_URL`, los datos se guardan en `data/db.json` (ignorado por git) y sin `ADMIN_PASSWORD` no se pide contraseña.

## Deploy (DigitalOcean App Platform)

1. En la app → *Settings → Environment Variables* agrega:
   - `DATABASE_URL` = la connection string de PostgreSQL (márcala como *Encrypt*)
   - `ADMIN_PASSWORD` = la contraseña del equipo (márcala como *Encrypt*)
2. En la base de datos → *Settings → Trusted Sources*, agrega la app (si no, rechaza la conexión).
3. Build: `npm run build` · Run: `npm start`.
4. Todo lo demás es automático: al primer request la app crea las tablas `ppc_clients` y `ppc_reports` si no existen. Si la base está vacía y existe `seed/reportes-ads-backup.json`, importa esos reportes una sola vez.

La carpeta `seed/` está en `.gitignore` porque contiene datos de clientes. Si el repo es privado, puedes quitarla del `.gitignore` y subirla para que la carga inicial sea automática. Si no, entra al panel y usa **Importar respaldo (JSON)** una vez.
