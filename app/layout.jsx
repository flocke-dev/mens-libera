import './globals.css'

export const metadata = {
  title: 'Mens Libera | Media Analysis Portal',
  description:
    'Mens Libera analyzes news for bias, framing and panic level. 30+ sources from across the political spectrum – stay informed without being manipulated.',
  keywords: 'media bias, news analysis, AI, framing, political spectrum, journalism, fact check',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230b0b12'/><text y='.9em' font-size='80' x='10'>⚖</text></svg>"/>
        <link rel="canonical" href="https://mens-libera.vercel.app" />
        <meta name="description" content="Mens Libera analyzes news for bias, framing and panic level. 30+ sources from across the political spectrum – stay informed without being manipulated." />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#0b0b12" />
        <meta property="og:title" content="Mens Libera | Media Analysis Portal" />
        <meta property="og:description" content="AI-powered media analysis. Detect political bias, missing perspectives and sensationalism in the news." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mens-libera.vercel.app" />
        <meta property="og:site_name" content="Mens Libera" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Mens Libera | Media Analysis Portal" />
        <meta name="twitter:description" content="AI-powered media analysis for the politically aware reader." />
      </head>
      <body>{children}</body>
    </html>
  )
}
