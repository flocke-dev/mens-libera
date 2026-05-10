import './globals.css'

export const metadata = {
  title: 'Mens Libera | Medienanalyse-Portal',
  description:
    'KI-gestützte Analyse von 20 deutschen Nachrichtenquellen — politischer Bias, Qualität und fehlende Perspektiven im Überblick.',
  keywords: 'Medienkritik, Bias, Nachrichten, Deutschland, KI-Analyse, Journalismus',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230b0b12'/><text y='.9em' font-size='80' x='10'>⚖</text></svg>"/>
        <link rel="canonical" href="https://mens-libera.vercel.app" />
        <meta name="description" content="Mens Libera analysiert Nachrichten auf Bias, Framing und Panikniveau. 30 Quellen aus DACH und International – informiert bleiben ohne manipuliert zu werden." />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#0b0b12" />
        <meta property="og:title" content="Mens Libera | Medienanalyse-Portal" />
        <meta property="og:description" content="KI-gestützte Analyse von 30 Nachrichtenquellen aus DACH und International – politischer Bias, Panikniveau und fehlende Perspektiven im Überblick." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mens-libera.vercel.app" />
        <meta property="og:site_name" content="Mens Libera" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Mens Libera | Medienanalyse-Portal" />
        <meta name="twitter:description" content="KI-gestützte Medienanalyse für den DACH-Raum." />
      </head>
      <body>{children}</body>
    </html>
  )
}
