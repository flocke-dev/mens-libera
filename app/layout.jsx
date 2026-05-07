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
      </head>
      <body>{children}</body>
    </html>
  )
}
