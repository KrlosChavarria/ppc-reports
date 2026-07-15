"use client";

// Logo "G" de Google (multicolor oficial)
export function GoogleLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Google">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  );
}

// Logo "f" de Facebook (círculo azul)
export function FacebookLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-label="Facebook">
      <circle cx="18" cy="18" r="18" fill="#0866FF" />
      <path
        fill="#FFFFFF"
        d="M25 23.5l.8-5.2h-5v-3.4c0-1.4.7-2.8 2.9-2.8h2.3V7.7s-2-.35-4-.35c-4.1 0-6.7 2.5-6.7 6.9v3.9h-4.5v5.2h4.5V36c.9.14 1.8.22 2.75.22.95 0 1.85-.08 2.75-.22V23.5H25z"
      />
    </svg>
  );
}

// Wordmark REBRND® para el sidebar dark
export function RebrndLogo({ height = 22, color = "#FFFFFF", accent = "#FF3B30" }) {
  return (
    <svg height={height} viewBox="0 0 176 30" aria-label="REBRND">
      <rect x="0" y="4" width="7" height="22" rx="1.5" fill={accent} />
      <text
        x="15" y="24"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="900"
        fontSize="24"
        letterSpacing="1.5"
        fill={color}
      >
        REBRND
      </text>
      <text x="152" y="12" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="9" fill={color}>®</text>
    </svg>
  );
}
