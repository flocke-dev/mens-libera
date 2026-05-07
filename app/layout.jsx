import './globals.css'

export const metadata = {
  title: 'Mens Libera · Der freie Verstand',
  description:
    'KI-gestützte Analyse von 20 deutschen Nachrichtenquellen — politischer Bias, Qualität und fehlende Perspektiven im Überblick.',
  keywords: 'Medienkritik, Bias, Nachrichten, Deutschland, KI-Analyse, Journalismus',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230b0b12'/><text y='.9em' font-size='80' x='10'>⚖</text></svg>"/>
        <meta name="description" content="Mens Libera analysiert Nachrichten auf Bias, Framing und Panikniveau. 20 deutsche Quellen im Vergleich – von Links bis Rechts." />
        <meta property="og:title" content="Mens Libera · Der freie Verstand" />
        <meta property="og:description" content="KI-gestützte Medienanalyse für den DACH-Raum." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#0b0b12" />
      </head>
      <body>{children}</body>
    </html>
  )
}
