import Parser from 'rss-parser'
import { NextResponse } from 'next/server'

const SOURCES = [
  {
    name: 'Tagesschau',
    url: 'https://www.tagesschau.de/xml/rss2/',
    bias: 'Mitte',
    biasScore: -0.5,
    credibility: 5,
    category: 'Öffentlich-rechtlich',
  },
  {
    name: 'ZDF heute',
    url: 'https://www.zdf.de/rss/zdf/nachrichten',
    bias: 'Mitte',
    biasScore: -0.5,
    credibility: 5,
    category: 'Öffentlich-rechtlich',
  },
  {
    name: 'Deutschlandfunk',
    url: 'https://www.deutschlandfunk.de/nachrichten-100.rss',
    bias: 'Mitte-Links',
    biasScore: -1,
    credibility: 5,
    category: 'Öffentlich-rechtlich',
  },
  {
    name: 'Süddeutsche Zeitung',
    url: 'https://rss.sueddeutsche.de/rss/Topthemen',
    bias: 'Mitte-Links',
    biasScore: -2,
    credibility: 5,
    category: 'Qualitätspresse',
  },
  {
    name: 'Die Zeit',
    url: 'https://newsfeed.zeit.de/index',
    bias: 'Mitte-Links',
    biasScore: -1.5,
    credibility: 5,
    category: 'Qualitätspresse',
  },
  {
    name: 'Der Spiegel',
    url: 'https://www.spiegel.de/schlagzeilen/tops/index.rss',
    bias: 'Mitte-Links',
    biasScore: -2,
    credibility: 4,
    category: 'Qualitätspresse',
  },
  {
    name: 'FAZ',
    url: 'https://www.faz.net/rss/aktuell/',
    bias: 'Mitte-Rechts',
    biasScore: 2,
    credibility: 5,
    category: 'Qualitätspresse',
  },
  {
    name: 'NZZ',
    url: 'https://www.nzz.ch/recent.rss',
    bias: 'Mitte-Rechts',
    biasScore: 2,
    credibility: 5,
    category: 'Qualitätspresse',
  },
  {
    name: 'Handelsblatt',
    url: 'https://www.handelsblatt.com/contentexport/feed/schlagzeilen',
    bias: 'Mitte',
    biasScore: 1,
    credibility: 5,
    category: 'Wirtschaft',
  },
  {
    name: 'WirtschaftsWoche',
    url: 'https://www.wiwo.de/contentexport/feed/schlagzeilen',
    bias: 'Mitte-Rechts',
    biasScore: 1.5,
    credibility: 5,
    category: 'Wirtschaft',
  },
  {
    name: 'n-tv',
    url: 'https://www.n-tv.de/rss',
    bias: 'Mitte',
    biasScore: 0,
    credibility: 4,
    category: 'TV-Nachrichten',
  },
  {
    name: 'Stern',
    url: 'https://www.stern.de/feed/standard/all/',
    bias: 'Mitte-Links',
    biasScore: -1.5,
    credibility: 3,
    category: 'Boulevard',
  },
  {
    name: 'Focus Online',
    url: 'https://rss.focus.de/fol/xml/rss_folnews.xml',
    bias: 'Mitte-Rechts',
    biasScore: 2,
    credibility: 3,
    category: 'Boulevard',
  },
  {
    name: 'Bild',
    url: 'https://www.bild.de/feed/rss-news.xml',
    bias: 'Rechts',
    biasScore: 3.5,
    credibility: 2,
    category: 'Boulevard',
  },
  {
    name: 'Welt',
    url: 'https://www.welt.de/feeds/latest.rss',
    bias: 'Rechts',
    biasScore: 3,
    credibility: 4,
    category: 'Rechts-konservativ',
  },
  {
    name: 'taz',
    url: 'https://taz.de/!p4608/',
    bias: 'Links',
    biasScore: -4,
    credibility: 3,
    category: 'Alternativ-links',
  },
  {
    name: 'Freitag',
    url: 'https://www.freitag.de/@@rss',
    bias: 'Links',
    biasScore: -3.5,
    credibility: 3,
    category: 'Alternativ-links',
  },
  {
    name: 'Cicero',
    url: 'https://www.cicero.de/feed',
    bias: 'Mitte-Rechts',
    biasScore: 2,
    credibility: 4,
    category: 'Alternativ-rechts',
  },
  {
    name: 'Junge Freiheit',
    url: 'https://jungefreiheit.de/feed/',
    bias: 'Rechts-Außen',
    biasScore: 4.5,
    credibility: 2,
    category: 'Alternativ-rechts',
  },
  {
    name: 'NachDenkSeiten',
    url: 'https://www.nachdenkseiten.de/?feed=rss2',
    bias: 'Links-Außen',
    biasScore: -4.5,
    credibility: 2,
    category: 'Alternativ-links',
  },
  {
    name: 'Epoch Times',
    url: 'https://www.epochtimes.de/api/rss/feed',
    bias: 'Rechts-Außen',
    biasScore: 4.5,
    credibility: 1,
    category: 'Alternativ-rechts',
  },
]

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim()
}

export async function GET() {
  const parser = new Parser({
    timeout: 6000,
    headers: {
      'User-Agent': 'MensLibera/1.0 RSS Aggregator (+https://mens-libera.vercel.app)',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
    customFields: {
      item: [['media:content', 'mediaContent'], ['content:encoded', 'contentEncoded']],
    },
  })

  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const feed = await parser.parseURL(source.url)
      return feed.items.slice(0, 12).map((item) => ({
        id: item.guid || item.link || `${source.name}-${Math.random()}`,
        title: stripHtml(item.title || ''),
        description: stripHtml(
          item.contentSnippet || item.summary || item.contentEncoded || item.content || ''
        ).slice(0, 300),
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || null,
        sourceName: source.name,
        bias: source.bias,
        biasScore: source.biasScore,
        credibility: source.credibility,
        category: source.category,
      }))
    })
  )

  const articles = []
  const sourceStats = SOURCES.map((source, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      articles.push(...result.value)
      return { ...source, articleCount: result.value.length, status: 'ok' }
    }
    return {
      ...source,
      articleCount: 0,
      status: 'error',
      error: result.reason?.message || 'Unbekannter Fehler',
    }
  })

  articles.sort((a, b) => {
    if (!a.pubDate) return 1
    if (!b.pubDate) return -1
    return new Date(b.pubDate) - new Date(a.pubDate)
  })

  return NextResponse.json(
    {
      articles,
      sources: sourceStats,
      total: articles.length,
      loaded: sourceStats.filter((s) => s.status === 'ok').length,
      failed: sourceStats.filter((s) => s.status === 'error').length,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  )
}
