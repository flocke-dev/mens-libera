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
      <body>{children}</body>
    </html>
  )
}
