export const metadata = {
  title: 'About · Mens Libera',
  description: 'About Mens Libera – an AI-powered media analysis tool that helps you detect bias, framing and missing perspectives in the news.',
}

export default function AboutPage() {
  return (
    <div style={{maxWidth:720,margin:"0 auto",padding:"60px 24px 80px",fontFamily:"'EB Garamond', Georgia, serif",color:"var(--text)",background:"var(--bg)",minHeight:"100vh"}}>
      <a href="/" style={{display:"inline-block",marginBottom:40,fontSize:13,fontFamily:"Inter, sans-serif",color:"var(--accent)",textDecoration:"none"}}>← Back to Feed</a>

      <h1 style={{fontSize:36,fontWeight:500,lineHeight:1.2,marginBottom:8}}>About Mens Libera</h1>
      <p style={{fontSize:14,color:"var(--text-sub)",fontFamily:"Inter, sans-serif",marginBottom:40,letterSpacing:1}}>THE FREE MIND · MEDIA ANALYSIS PORTAL</p>

      <section style={{marginBottom:40}}>
        <h2 style={{fontSize:22,fontWeight:500,marginBottom:12}}>What is Mens Libera?</h2>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)",marginBottom:14}}>
          Mens Libera is an AI-powered media analysis tool that aggregates news from 30+ sources across the political spectrum — from far-left to far-right — and analyzes them for bias, framing, panic level, and missing perspectives.
        </p>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)"}}>
          The goal is to help readers stay informed without being manipulated — by making political framing and editorial choices visible at a glance.
        </p>
      </section>

      <section style={{marginBottom:40}}>
        <h2 style={{fontSize:22,fontWeight:500,marginBottom:12}}>How it works</h2>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            ["⚖️ Bias Detection","Every story is tagged by political lean using color-coded source dots — blue for left, red for right, gray for center. Multiple sources covering the same story are grouped automatically."],
            ["🔴 Blindspot Alerts","When a story is only covered by one side of the political spectrum, we flag it as a Blindspot. The silence of the other side is itself a signal."],
            ["🔍 AI Analysis","Click any story to trigger a full AI analysis: panic level, one-sidedness, emotionalization, verified facts, opinions disguised as facts, missing perspectives, and a neutral fact report."],
            ["🌍 Auto-Translation","Articles in any language are automatically translated to English before analysis, with the original text available for comparison."],
          ].map(([title, text]) => (
            <div key={title} style={{padding:"16px 20px",background:"var(--bg-panel)",border:"1px solid var(--border)",borderRadius:4}}>
              <div style={{fontSize:15,fontWeight:600,marginBottom:6,fontFamily:"Inter, sans-serif"}}>{title}</div>
              <p style={{fontSize:15,lineHeight:1.8,color:"var(--text-sub)",margin:0}}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{marginBottom:40}}>
        <h2 style={{fontSize:22,fontWeight:500,marginBottom:12}}>Sources</h2>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)",marginBottom:14}}>
          We currently aggregate 30+ sources including German-language outlets (Tagesschau, Spiegel, FAZ, Bild, NachDenkSeiten, Junge Freiheit), Austrian sources (ORF, Die Presse, Krone), Swiss sources (SRF, NZZ), and international outlets (BBC, Guardian, Reuters, Al Jazeera, Fox News, NY Times, RT Deutsch).
        </p>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)"}}>
          Each source is assigned a political lean score and credibility rating based on established media research.
        </p>
      </section>

      <section style={{marginBottom:40}}>
        <h2 style={{fontSize:22,fontWeight:500,marginBottom:12}}>Disclaimer</h2>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)",marginBottom:14}}>
          Mens Libera is a prototype and an independent, non-commercial project. AI-generated analyses are imperfect and should not replace your own critical thinking and research.
        </p>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)"}}>
          All article content is fetched directly from the original sources via their public RSS feeds. Mens Libera does not store or republish article content.
        </p>
      </section>

      <section>
        <h2 style={{fontSize:22,fontWeight:500,marginBottom:12}}>Contact</h2>
        <p style={{fontSize:17,lineHeight:1.9,color:"var(--text-sub)"}}>
          Built with Next.js and Claude (Anthropic). For feedback or inquiries, open an issue on GitHub or reach out via the project repository.
        </p>
      </section>

      <div style={{marginTop:60,paddingTop:24,borderTop:"1px solid var(--border)",fontSize:12,color:"var(--text-sub)",fontFamily:"Inter, sans-serif"}}>
        Mens Libera · The Free Mind · Prototype only
      </div>
    </div>
  )
}
