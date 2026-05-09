import * as cheerio from 'cheerio';

export async function POST(req) {
  try {
    const { url } = await req.json();
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    $('nav, footer, header, aside, script, style, .ad, .advertisement').remove();

    const title = $('h1').first().text().trim() || $('title').text().trim();

    const text = $('article p, .article-body p, main p, .content p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(t => t.length > 50)
      .join('\n\n');

    return Response.json({ title, text });
  } catch(e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
