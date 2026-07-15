import "./globals.css";

export const metadata = {
  title: "REBRND® · Reportes de Pauta",
  description: "Panel de reportes Google Ads + Meta Ads",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
