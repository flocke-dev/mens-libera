'use client'
import { useState, useEffect, useRef } from "react";

const SOURCES = [
  { id:"tagesschau",    label:"Tagesschau",      bias:"mitte",            biasScore:0,  credibility:"hoch",    url:"https://www.tagesschau.de/xml/rss2" },
  { id:"zeit",          label:"Zeit",            bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://newsfeed.zeit.de/index" },
  { id:"spiegel",       label:"Spiegel",         bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://www.spiegel.de/schlagzeilen/index.rss" },
  { id:"sz",            label:"SZ",              bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://rss.sueddeutsche.de/alles" },
  { id:"faz",           label:"FAZ",             bias:"mitte-rechts",     biasScore:1,  credibility:"hoch",    url:"https://www.faz.net/rss/aktuell/" },
  { id:"welt",          label:"Welt",            bias:"rechts",           biasScore:2,  credibility:"hoch",    url:"https://www.welt.de/feeds/latest.rss" },
  { id:"focus",         label:"Focus",           bias:"mitte-rechts",     biasScore:1,  credibility:"hoch",    url:"https://rss.focus.de/fol/XML/rss_folnews.xml" },
  { id:"ntv",           label:"ntv",             bias:"mitte",            biasScore:0,  credibility:"hoch",    url:"https://www.n-tv.de/rss" },
  { id:"standard",      label:"Standard",        bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://www.derstandard.at/rss" },
  { id:"nzz",           label:"NZZ",             bias:"mitte-rechts",     biasScore:1,  credibility:"hoch",    url:"https://www.nzz.ch/recent.rss" },
  { id:"taz",           label:"taz",             bias:"links",            biasScore:-2, credibility:"hoch",    url:"https://taz.de/!p4608;rss/" },
  { id:"bild",          label:"Bild",            bias:"rechts",           biasScore:2,  credibility:"mittel",  url:"https://www.bild.de/rssfeeds/rss3-20745882,feed=alles.bild.html" },
  { id:"nachdenkseiten",label:"NachDenkSeiten",  bias:"links-alternativ", biasScore:-3, credibility:"niedrig", url:"https://www.nachdenkseiten.de/?feed=rss2" },
  { id:"telepolis",     label:"Telepolis",       bias:"links-alternativ", biasScore:-3, credibility:"mittel",  url:"https://www.telepolis.de/rss.xml" },
  { id:"reitschuster",  label:"Reitschuster",    bias:"rechts-alternativ",biasScore:3,  credibility:"niedrig", url:"https://reitschuster.de/feed/" },
  { id:"tichys",        label:"Tichys Einblick", bias:"rechts-alternativ",biasScore:3,  credibility:"niedrig", url:"https://www.tichyseinblick.de/feed/" },
  { id:"jf",            label:"Junge Freiheit",  bias:"rechts-alternativ",biasScore:3,  credibility:"niedrig", url:"https://jungefreiheit.de/feed/" },
  { id:"epochtimes",    label:"Epoch Times",     bias:"rechts-alternativ",biasScore:3,  credibility:"niedrig", url:"https://www.epochtimes.de/feed/" },

  // Österreich
  { id:"orf",       label:"ORF",          bias:"mitte",            biasScore:0,  credibility:"hoch",    url:"https://rss.orf.at/news.xml" },
  { id:"diepresse", label:"Die Presse",   bias:"mitte-rechts",     biasScore:1,  credibility:"hoch",    url:"https://www.diepresse.com/rss" },
  { id:"krone",     label:"Krone",        bias:"rechts",           biasScore:2,  credibility:"mittel",  url:"https://www.krone.at/rss" },
  { id:"kurier",    label:"Kurier",       bias:"mitte",            biasScore:0,  credibility:"hoch",    url:"https://kurier.at/xml/rssd" },

  // Schweiz
  { id:"srf",       label:"SRF",          bias:"mitte",            biasScore:0,  credibility:"hoch",    url:"https://www.srf.ch/news/rss" },
  { id:"20min",     label:"20 Minuten",   bias:"mitte",            biasScore:0,  credibility:"mittel",  url:"https://www.20min.ch/rss/rss.tmpl" },

  // International
  { id:"bbc",       label:"BBC",          bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://feeds.bbci.co.uk/news/rss.xml" },
  { id:"guardian",  label:"Guardian",     bias:"links",            biasScore:-2, credibility:"hoch",    url:"https://www.theguardian.com/world/rss" },
  { id:"reuters",   label:"Reuters",      bias:"mitte",            biasScore:0,  credibility:"hoch",    url:"https://feeds.reuters.com/reuters/topNews" },
  { id:"aljazeera", label:"Al Jazeera",   bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://www.aljazeera.com/xml/rss/all.xml" },
  { id:"foxnews",   label:"Fox News",     bias:"rechts",           biasScore:2,  credibility:"mittel",  url:"https://feeds.foxnews.com/foxnews/latest" },
  { id:"nyt",       label:"NY Times",     bias:"mitte-links",      biasScore:-1, credibility:"hoch",    url:"https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { id:"rt",        label:"RT Deutsch",   bias:"rechts-alternativ",biasScore:3,  credibility:"niedrig", url:"https://deutsch.rt.com/feeds/rt-deutsch-news.xml" },
];

const BIAS = {
  "links-alternativ":  { label:"Links-Alt.",   dot:"#818cf8" },
  "links":             { label:"Links",         dot:"#3b82f6" },
  "mitte-links":       { label:"Mitte-Links",   dot:"#60a5fa" },
  "mitte":             { label:"Mitte",         dot:"#94a3b8" },
  "mitte-rechts":      { label:"Mitte-Rechts",  dot:"#fb923c" },
  "rechts":            { label:"Rechts",        dot:"#f87171" },
  "rechts-alternativ": { label:"Rechts-Alt.",   dot:"#fbbf24" },
};

const CRED = { hoch:"#4ade80", mittel:"#fbbf24", niedrig:"#f87171" };

const RSS = "https://api.rss2json.com/v1/api.json?rss_url=";
const STOP = new Set(["die","der","das","ein","eine","einer","und","oder","in","im","ist","sind","hat","mit","für","von","zu","auf","nach","aus","bei","vor","an","am","es","er","sie","wir","ich","den","dem","des","sich","nicht","auch","wird","werden","über","zum","zur","als","war","noch","aber","wenn","wie","so","bis","seit","mehr","neue","neuen","gegen","durch","bereits","wieder","keine","alle","beim","unter","ohne","dann","kann","soll","muss","doch","weil","damit","jedoch","dabei","dazu","laut","rund","etwa"]);

function strip(h=""){return h.replace(/<[^>]*>/g," ").replace(/&[a-z]+;/g," ").replace(/\s+/g," ").trim();}
function ago(d){const m=Math.floor((Date.now()-new Date(d))/60000);if(m<2)return"gerade";if(m<60)return`${m} Min.`;if(m<1440)return`${Math.floor(m/60)} Std.`;return`${Math.floor(m/1440)} Tage`;}
function kw(t){return t.toLowerCase().replace(/[^\wäöüß\s]/g," ").split(/\s+/).filter(w=>w.length>3&&!STOP.has(w));}
function sim(a,b){const ka=new Set(kw(a)),kb=new Set(kw(b));if(!ka.size||!kb.size)return 0;let c=0;ka.forEach(k=>{if(kb.has(k))c++;});return c/Math.min(ka.size,kb.size);}
function group(arts){const g=[],u=new Set();arts.forEach((a,i)=>{if(u.has(i))return;const gr=[a];u.add(i);arts.forEach((b,j)=>{if(!u.has(j)&&sim(a.title,b.title)>=0.3){gr.push(b);u.add(j);}});g.push(gr);});return g.sort((a,b)=>b.length-a.length);}

const STEPS = ["Quellen abgleichen","Fakten identifizieren","Framing erkennen","Sachbericht verfassen"];
const CATS = [{id:"alle",label:"Alles"},{id:"politik",label:"Politik"},{id:"wirtschaft",label:"Wirtschaft"},{id:"international",label:"Welt"},{id:"technologie",label:"Tech"},{id:"gesellschaft",label:"Gesellschaft"},{id:"blindspot",label:"Blindspot"}];
const CAT_KW = {politik:["bundestag","regierung","minister","kanzler","partei","wahl","spd","cdu","grüne","koalition","gesetz","parlament"],wirtschaft:["wirtschaft","aktie","börse","dax","unternehmen","bank","inflation","euro","konjunktur","steuer","haushalt","wachstum","rezession"],international:["usa","china","russland","ukraine","eu","nato","israel","iran","krieg","konflikt","außenpolitik","europa"],technologie:["ki","künstliche intelligenz","tech","digital","software","chip","energie","innovation","startup","openai","google","apple","meta"]};
function detectCat(t,d=""){const txt=(t+" "+d).toLowerCase();for(const[c,ks]of Object.entries(CAT_KW))if(ks.some(k=>txt.includes(k)))return c;return"gesellschaft";}

// Colors without CSS variables — switched via JS for dynamic/conditional usage
const DARK = {
  border2:"#2a2535",
  accentAlt:"#d97706",
  textHigh:"#f0ece0", textMid:"#6b7280",
  textLow:"#52525b",  textBody:"#c8c4b9",
  rowTitle:"#b8b4a8", hoverBg:"#18181b",
  titleColor:"#ffffff", arrowColor:"#3f3f46",
  uniqueWord:"#f0f0f0", commonWord:"#52525b",
};
const LIGHT = {
  border2:"#c8c3b8",
  accentAlt:"#b45309",
  textHigh:"#111111", textMid:"#4b5563",
  textLow:"#6b7280",  textBody:"#374151",
  rowTitle:"#374151", hoverBg:"#e5e0d6",
  titleColor:"#111111", arrowColor:"#9ca3af",
  uniqueWord:"#111111", commonWord:"#6b7280",
};

export default function App() {
  const [articles,  setArticles]  = useState([]);
  const [groups,    setGroups]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loaded,    setLoaded]    = useState(0);
  const [cat,       setCat]       = useState("alle");
  const [bias,      setBias]      = useState("alle");
  const [q,         setQ]         = useState("");
  const [sel,       setSel]       = useState(null);
  const [analysing, setAnalysing] = useState(false);
  const [result,    setResult]    = useState(null);
  const [step,      setStep]      = useState(0);
  const [tab,       setTab]       = useState("headlines");
  const [history,   setHistory]   = useState([]);
  const [manual,    setManual]    = useState(false);
  const [manualTxt, setManualTxt] = useState("");
  const [copied,    setCopied]    = useState(false);
  const [dark,      setDark]      = useState(true);
  const [cache,     setCache]     = useState({});
  const [shareOpen, setShareOpen] = useState(false);
  const panelRef = useRef(null);
  const shareRef = useRef(null);

  const T = dark ? DARK : LIGHT;

  useEffect(()=>{
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    setDark(saved === 'dark');
    load();
  },[]);

  useEffect(()=>{
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },[dark]);

  useEffect(()=>{
    if(!shareOpen) return;
    function onOutside(e){if(shareRef.current&&!shareRef.current.contains(e.target))setShareOpen(false);}
    document.addEventListener('mousedown',onOutside);
    return()=>document.removeEventListener('mousedown',onOutside);
  },[shareOpen]);

  async function load(){
    setLoading(true);setLoaded(0);const res=[];
    await Promise.all(SOURCES.map(async s=>{
      try{const r=await fetch(`${RSS}${encodeURIComponent(s.url)}`);const d=await r.json();
        if(d.status==="ok")d.items.slice(0,12).forEach(i=>{const body=strip(i.content||i.description||"");res.push({...i,body,sid:s.id,slabel:s.label,bias:s.bias,biasScore:s.biasScore,cred:s.credibility,cat:detectCat(i.title,body)});});
      }catch{}setLoaded(c=>c+1);
    }));
    setArticles(res);setGroups(group(res));setLoading(false);
  }

  function pick(g){
    setSel(g);setTab("headlines");setManual(false);
    const title=g[0].title;
    if(cache[title]){setResult(cache[title]);setTab("analyse");setTimeout(()=>panelRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);return;}
    setResult(null);
    const txt=`${title}\n\n${g[0].body}`;
    analyse(txt,g);
    setTimeout(()=>panelRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }

  async function analyse(txt,g){
    if(!txt||txt.length<60)return;
    setAnalysing(true);setResult(null);let s=0;setStep(0);
    const iv=setInterval(()=>{s=Math.min(s+1,3);setStep(s);},1000);
    try{
      const promptText=`Analysiere diesen deutschsprachigen Nachrichtenartikel objektiv.\n\nARTIKEL:\n${txt.slice(0,3000)}\n\nAntworte NUR als JSON ohne Backticks:\n{"titel":"<max 70 Zeichen>","scores":{"panik":<1-10>,"einseitigkeit":<1-10>,"faktendichte":<1-10>,"emotionalisierung":<1-10>},"fakten":[<3-4 belegbare Fakten>],"meinungen":[<3-4 verkleidete Meinungen>],"fehlt":[<3-4 fehlende Perspektiven>],"reisser":[<2-3 reißerische Zitate>],"urteil":"<2 Sätze>","sachTitel":"<sachlicher Titel>","sach":"<180-220 Wörter sachlicher Bericht, Absätze durch \\n\\n>"}`;
      const res=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:promptText}]})});
      const d=await res.json();
      const raw=d.content?.[0]?.text||d.content?.map(i=>i.text||"").join("")||"";
      const match=raw.match(/\{[\s\S]*\}/);
      if(!match)throw new Error("Kein JSON");
      const p=JSON.parse(match[0]);
      clearInterval(iv);setResult(p);setTab("analyse");
      if(g)setCache(prev=>({...prev,[g[0].title]:p}));
      setHistory(h=>[{title:p.titel,panik:p.scores?.panik,g,result:p,ts:Date.now()},...h].slice(0,15));
    }catch{clearInterval(iv);setResult({error:true});}
    finally{setAnalysing(false);}
  }

  const srcsOf=g=>SOURCES.filter(s=>g.some(a=>a.sid===s.id));
  const panikColor=v=>v<=3?"#4ade80":v<=6?"#fbbf24":"#f87171";
  const panikWord=v=>v<=3?"Niedrig":v<=6?"Mittel":"Hoch";

  const filtered=groups.filter(g=>{
    const srcs=srcsOf(g);
    if(bias==="blindspot"){const sc=srcs.map(s=>s.biasScore);if(!((sc.every(x=>x<0)||sc.every(x=>x>0))&&g.length>=2))return false;}
    else if(bias==="links"&&!srcs.some(s=>s.biasScore<-1))return false;
    else if(bias==="rechts"&&!srcs.some(s=>s.biasScore>1))return false;
    else if(bias==="alternativ"&&!srcs.some(s=>Math.abs(s.biasScore)===3))return false;
    if(cat!=="alle"&&cat!=="blindspot"&&!g.some(a=>a.cat===cat))return false;
    if(q&&!g[0].title.toLowerCase().includes(q.toLowerCase()))return false;
    return true;
  });

  const TABS=[{id:"headlines",label:"Schlagzeilen"},{id:"analyse",label:"KI-Analyse"},{id:"fakten",label:"Fakten"},{id:"fehlt",label:"Was fehlt"},{id:"sach",label:"Sachbericht"}];

  return (
    <div className="ml-root" style={{background:"var(--bg)",minHeight:"100vh",color:"var(--text)",fontFamily:"'EB Garamond', Georgia, serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${T.border2};}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .fi{animation:fadeIn 0.3s ease both}
        .row:hover .row-title{color:${T.textHigh} !important}
        .row:hover{background:${T.hoverBg} !important}
        a{text-decoration:none;color:inherit;}
        input::placeholder{color:var(--text-sub);}
        input:focus{outline:none;border-color:var(--text-sub) !important;}
        textarea:focus{outline:none;}
        .tooltip{position:relative;display:inline-flex;align-items:center;}
        .tooltip:hover .tooltip-text,.tooltip:focus-within .tooltip-text{display:block;}
        .tooltip-text{display:none;position:absolute;top:18px;left:0;background:#12101a;border:1px solid #2a2535;padding:8px 12px;font-size:11px;line-height:1.5;width:200px;z-index:100;border-radius:3px;color:#e8e4d9;font-family:'Inter',sans-serif;pointer-events:none;}
        @media (max-width:768px){
          html,body{overflow-x:hidden !important;}
          .ml-root{overflow-x:hidden !important;max-width:100vw !important;width:100% !important;}
          .ml-nav-row{height:auto !important;flex-wrap:wrap !important;padding:8px 16px !important;gap:6px !important;}
          .ml-nav-row button{min-height:44px !important;}
          .ml-search{order:3;flex:1 1 100% !important;max-width:100% !important;}
          .ml-nav-spacer{display:none !important;}
          .ml-text-btn{display:none !important;}
          .ml-cat-strip{height:auto !important;overflow-x:auto !important;flex-wrap:nowrap !important;padding:0 12px !important;-webkit-overflow-scrolling:touch;scrollbar-width:none;overflow-y:hidden !important;}
          .ml-cat-strip::-webkit-scrollbar{display:none;}
          .ml-cat-btn{min-height:44px !important;padding:10px 14px !important;display:inline-flex !important;align-items:center !important;}
          .ml-filter-btn{min-height:44px !important;padding:10px 12px !important;display:inline-flex !important;align-items:center !important;}
          .ml-grid{grid-template-columns:1fr !important;padding:0 16px 60px !important;gap:0 !important;overflow-x:hidden !important;}
          .ml-aside{position:static !important;max-height:none !important;overflow-y:visible !important;padding-right:0 !important;overflow-x:hidden !important;}
          .ml-panel{padding-left:0 !important;border-left:none !important;border-top:1px solid var(--border) !important;padding-top:20px !important;margin-top:16px !important;overflow-x:hidden !important;}
          .ml-2col{grid-template-columns:1fr !important;}
          .ml-tabs{overflow-x:auto !important;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
          .ml-tabs::-webkit-scrollbar{display:none;}
          .ml-tabs button{min-height:44px !important;padding:8px 12px !important;white-space:nowrap !important;}
          .row{padding:16px 0 !important;}
          .row-title{font-size:16px !important;line-height:1.5 !important;word-break:break-word !important;}
          .row span{font-size:12px !important;}
          .ml-panel p{font-size:15px !important;line-height:1.7 !important;word-break:break-word !important;}
          .ml-back-btn{display:flex !important;}
        }
        .ml-back-btn{display:none;}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{borderBottom:"1px solid var(--border)",background:"var(--nav-bg)",position:"sticky",top:0,zIndex:50}}>
        <div className="ml-nav-row" style={{maxWidth:1320,margin:"0 auto",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:20}}>
          {/* Logo */}
          <div style={{flexShrink:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:5}}>
              <span style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:22,fontWeight:600,letterSpacing:-0.5,color:T.textHigh}}>Mens</span>
              <span style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:22,fontWeight:400,letterSpacing:-0.5,color:"var(--accent)",fontStyle:"italic"}}>Libera</span>
              <span style={{width:5,height:5,borderRadius:"50%",background:"var(--accent)",display:"inline-block",marginLeft:2,marginBottom:4}}/>
            </div>
            <div style={{fontSize:8,letterSpacing:4,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:1}}>DER FREIE VERSTAND</div>
          </div>

          {/* Search */}
          <div className="ml-search" style={{flex:1,maxWidth:380,position:"relative"}}>
            <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:14,height:14,color:"var(--text-sub)"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suchen…"
              style={{width:"100%",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,color:"var(--text)",padding:"7px 12px 7px 32px",fontSize:13,fontFamily:"'Inter',sans-serif",borderRadius:4}}/>
          </div>

          <div className="ml-nav-spacer" style={{flex:1}}/>

          {/* Actions */}
          <button className="ml-text-btn" onClick={()=>{setManual(true);setSel(null);setResult(null);setManualTxt("");}} style={{background:"transparent",border:`1px solid ${T.border2}`,color:T.textMid,padding:"5px 14px",fontSize:12,fontFamily:"'Inter',sans-serif",borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:14}}>+</span> Text eingeben
          </button>
          <button onClick={load} disabled={loading} style={{background:loading?"var(--bg-panel)":"var(--accent)",border:"none",color:loading?"var(--text-sub)":"var(--bg)",padding:"5px 14px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6}}>
            {loading
              ? <><span style={{width:12,height:12,border:"1.5px solid var(--text-sub)",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>{loaded}/{SOURCES.length}</>
              : <>↻ Aktualisieren</>}
          </button>
          {history.length>0&&(
            <div style={{fontSize:11,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>{history.length} Analysen</div>
          )}
          {/* Theme toggle */}
          <button onClick={()=>setDark(d=>!d)} title={dark?"Hell-Modus":"Dunkel-Modus"}
            style={{background:"none",border:`1px solid ${T.border2}`,color:"var(--text-sub)",width:32,height:32,borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {dark
              ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>}
          </button>
        </div>

        {/* Category + Bias strip */}
        <div className="ml-cat-strip" style={{borderTop:"1px solid var(--border)",maxWidth:1320,margin:"0 auto",padding:"0 24px",height:38,display:"flex",alignItems:"center",gap:2}}>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} className="ml-cat-btn" style={{background:"none",border:"none",color:cat===c.id?T.textHigh:"var(--text-sub)",padding:"4px 12px",fontSize:14,fontFamily:"'Inter',sans-serif",fontWeight:cat===c.id?600:400,cursor:"pointer",borderBottom:cat===c.id?"2px solid var(--accent)":"2px solid transparent",transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {c.label}
            </button>
          ))}
          <div style={{width:1,height:16,background:T.border2,margin:"0 8px"}}/>
          {[{id:"alle",label:"Alle Quellen"},{id:"links",label:"Links"},{id:"rechts",label:"Rechts"},{id:"alternativ",label:"Alternativ"},{id:"blindspot",label:"⚠ Blindspot"}].map(f=>(
            <button key={f.id} onClick={()=>setBias(f.id)} className="ml-filter-btn" style={{background:"none",border:"none",color:bias===f.id?"var(--accent)":"var(--text-sub)",padding:"4px 10px",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:bias===f.id?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {f.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <span style={{fontSize:11,color:T.border2,fontFamily:"'Inter',sans-serif"}}>{filtered.length} Storys</span>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div className="ml-grid" style={{maxWidth:1320,margin:"0 auto",padding:"24px 24px 80px",display:"grid",gridTemplateColumns:"380px 1fr",gap:6}}>

        {/* ── FEED ── */}
        <aside className="ml-aside" style={{position:"sticky",top:94,maxHeight:"calc(100vh - 114px)",overflowY:"auto",paddingRight:6}}>

          {/* Loading state */}
          {loading&&(
            <div>
              <div style={{height:2,background:"var(--border)",borderRadius:1,marginBottom:16,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(loaded/SOURCES.length)*100}%`,background:"var(--accent)",transition:"width 0.3s",borderRadius:1}}/>
              </div>
              {[...Array(7)].map((_,i)=>(
                <div key={i} style={{padding:"14px 0",borderBottom:"1px solid var(--border)",animation:"pulse 1.8s infinite",animationDelay:`${i*0.1}s`}}>
                  <div style={{height:11,background:"var(--border)",borderRadius:2,marginBottom:8,width:"90%"}}/>
                  <div style={{height:11,background:"var(--border)",borderRadius:2,marginBottom:10,width:"70%"}}/>
                  <div style={{height:5,background:"var(--border)",borderRadius:1,width:"40%"}}/>
                </div>
              ))}
            </div>
          )}

          {/* Story list */}
          {!loading&&filtered.slice(0,80).map((g,i)=>{
            const srcs=srcsOf(g);
            const isSelected=sel&&sel[0].title===g[0].title;
            const scores=srcs.map(s=>s.biasScore);
            const isBlindspot=srcs.length>=2&&(scores.every(x=>x<0)||scores.every(x=>x>0));
            return (
              <div key={i} onClick={()=>pick(g)} className="row" style={{padding:"18px 0",borderBottom:"1px solid var(--border)",cursor:"pointer",background:isSelected?"var(--accent-subtle)":"transparent",transition:"background 0.15s",paddingLeft:isSelected?10:0,borderLeft:isSelected?"2px solid var(--accent)":"2px solid transparent",marginLeft:-2}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                  <div style={{display:"flex",gap:3}}>
                    {srcs.map(s=>(
                      <div key={s.id} title={`${s.label} · ${BIAS[s.bias].label}`} style={{width:6,height:6,borderRadius:"50%",background:BIAS[s.bias].dot,opacity:0.8}}/>
                    ))}
                  </div>
                  {isBlindspot&&(
                    <span className="tooltip" style={{fontSize:9,color:"#f87171",fontFamily:"'Inter',sans-serif",letterSpacing:0.5,gap:3}}>
                      BLINDSPOT
                      <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:11,height:11,borderRadius:"50%",border:"1px solid #f8717166",fontSize:8,lineHeight:1,cursor:"default",marginLeft:2}}>?</span>
                      <span className="tooltip-text">Diese Story wird nur von einer politischen Seite berichtet – die andere Seite schweigt.</span>
                    </span>
                  )}
                  <span style={{fontSize:12,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginLeft:"auto"}}>{g[0].pubDate?ago(g[0].pubDate):""}</span>
                </div>
                <p className="row-title" style={{fontSize:17,lineHeight:1.6,color:isSelected?T.textHigh:T.rowTitle,fontFamily:"'EB Garamond',Georgia,serif",fontWeight:600,marginBottom:6,transition:"color 0.15s"}}>
                  {g[0].title}
                </p>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                  {srcs.slice(0,4).map(s=>(
                    <span key={s.id} style={{fontSize:13,color:BIAS[s.bias].dot,fontFamily:"'Inter',sans-serif",opacity:0.7}}>
                      {s.label}{s.credibility!=="hoch"&&<span style={{color:CRED[s.credibility],marginLeft:2}}>·</span>}
                    </span>
                  ))}
                  {srcs.length>4&&<span style={{fontSize:13,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>+{srcs.length-4}</span>}
                </div>
              </div>
            );
          })}
        </aside>

        {/* ── PANEL ── */}
        <div ref={panelRef} className="ml-panel" style={{paddingLeft:28,borderLeft:"1px solid var(--border)"}}>

          {/* Mobile back button */}
          {(sel||manual)&&(
            <button className="ml-back-btn" onClick={()=>{setSel(null);setResult(null);setManual(false);window.scrollTo({top:0,behavior:"smooth"});}}
              style={{alignItems:"center",gap:6,marginBottom:16,background:"none",border:"none",color:"var(--accent)",fontFamily:"'Inter',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer",minHeight:44,padding:"0 4px"}}>
              ← Zurück zum Feed
            </button>
          )}

          {/* Manual input */}
          {manual&&(
            <div className="fi">
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,letterSpacing:2,color:T.textLow,fontFamily:"'Inter',sans-serif",marginBottom:12}}>EIGENEN TEXT ANALYSIEREN</div>
                <textarea value={manualTxt} onChange={e=>setManualTxt(e.target.value)} rows={8}
                  style={{width:"100%",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,color:"var(--text)",padding:"14px 16px",fontSize:14,lineHeight:1.8,fontFamily:"'EB Garamond',Georgia,serif",resize:"vertical",outline:"none",borderRadius:4}}
                  placeholder="Artikel hier einfügen…"/>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                  <button onClick={()=>analyse(manualTxt,null)} disabled={analysing||manualTxt.length<80}
                    style={{background:analysing||manualTxt.length<80?"var(--bg-panel)":"var(--accent)",color:analysing||manualTxt.length<80?"var(--text-sub)":"var(--bg)",border:"none",padding:"9px 20px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:"pointer"}}>
                    {analysing?"Analysiere…":"Analysieren →"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Story meta + Headline comparison is always shown when selected */}
          {sel&&!manual&&(
            <div className="fi">
              {/* Story header */}
              <div style={{marginBottom:24}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,marginBottom:12}}>
                  <h2 style={{fontSize:26,lineHeight:1.35,fontWeight:500,color:T.titleColor,fontFamily:"'EB Garamond',Georgia,serif",flex:1}}>
                    {sel[0].title}
                  </h2>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:28,fontWeight:600,color:T.accentAlt,fontFamily:"'Inter',sans-serif",lineHeight:1}}>{sel.length}</div>
                    <div style={{fontSize:9,color:T.textLow,fontFamily:"'Inter',sans-serif",letterSpacing:1}}>QUELLEN</div>
                  </div>
                </div>
                {/* Source links */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {sel.map((a,i)=>(
                    <a key={i} href={a.link} target="_blank" rel="noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",border:`1px solid ${BIAS[a.bias].dot}33`,borderRadius:20,fontSize:11,color:BIAS[a.bias].dot,fontFamily:"'Inter',sans-serif",background:`${BIAS[a.bias].dot}08`}}>
                      {a.slabel}
                      <span style={{opacity:0.4,fontSize:9}}>↗</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="ml-tabs" style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border2}`,marginBottom:24}}>
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:tab===t.id?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,padding:"8px 16px",fontSize:12,fontFamily:"'Inter',sans-serif",color:tab===t.id?T.textHigh:"var(--text-sub)",cursor:"pointer",fontWeight:tab===t.id?500:400,transition:"all 0.15s",whiteSpace:"nowrap"}}>
                    {t.label}
                  </button>
                ))}
                {result&&(()=>{
                  const shareText=`📰 Mens Libera Analyse\n\n${result.titel}\n\nPanik-Niveau: ${result.scores?.panik}/10\nEinseitigkeit: ${result.scores?.einseitigkeit}/10\n\n${result.urteil}\n\n🔍 Analysiert mit Mens Libera – Der freie Verstand\nmens-libera.vercel.app`;
                  const shareUrl="https://mens-libera.vercel.app";
                  const enc=encodeURIComponent(shareText);
                  const options=[
                    {label:"WhatsApp", icon:"💬", action:()=>window.open(`https://wa.me/?text=${enc}`,"_blank")},
                    {label:"Telegram", icon:"✈️",  action:()=>window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${enc}`,"_blank")},
                    {label:"Link kopieren", icon:"📋", action:()=>{navigator.clipboard.writeText(shareText);setCopied(true);setTimeout(()=>setCopied(false),2000);setShareOpen(false);}},
                    ...(typeof navigator!=="undefined"&&navigator.share?[{label:"Teilen…", icon:"📤", action:()=>{navigator.share({title:"Mens Libera Analyse",text:shareText,url:shareUrl});setShareOpen(false);}}]:[]),
                  ];
                  return (
                    <div ref={shareRef} style={{marginLeft:"auto",position:"relative"}}>
                      <button onClick={()=>setShareOpen(o=>!o)}
                        style={{background:"none",border:"none",color:shareOpen||copied?"var(--accent)":"var(--text-sub)",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",padding:"8px 12px",display:"flex",alignItems:"center",gap:4}}>
                        {copied?"Kopiert ✓":"⎙ Teilen"}
                      </button>
                      {shareOpen&&(
                        <div style={{position:"absolute",top:"calc(100% + 4px)",right:0,background:"var(--bg-panel)",border:`1px solid ${T.border2}`,borderRadius:6,overflow:"hidden",zIndex:200,minWidth:160,boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                          {options.map(o=>(
                            <button key={o.label} onClick={o.action}
                              style={{display:"flex",alignItems:"center",gap:10,width:"100%",background:"none",border:"none",padding:"10px 16px",fontSize:12,fontFamily:"'Inter',sans-serif",color:"var(--text)",cursor:"pointer",textAlign:"left",minHeight:44}}
                              onMouseEnter={e=>e.currentTarget.style.background=T.hoverBg}
                              onMouseLeave={e=>e.currentTarget.style.background="none"}>
                              <span style={{fontSize:16}}>{o.icon}</span>{o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* ── SCHLAGZEILEN ── */}
              {tab==="headlines"&&(
                <div>
                  {sel.length<2
                    ? <p style={{color:T.textLow,fontFamily:"'Inter',sans-serif",fontSize:13}}>Nur eine Quelle – kein Vergleich möglich.</p>
                    : <>
                        <p style={{fontSize:12,color:T.textLow,fontFamily:"'Inter',sans-serif",marginBottom:20,letterSpacing:0.5}}>GLEICHE STORY · VERSCHIEDENE PERSPEKTIVEN · <span style={{color:T.textMid}}>Fett</span> = einzigartige Formulierung</p>
                        {sel.map((a,i)=>{
                          const others=sel.filter((_,j)=>j!==i).map(x=>x.title.toLowerCase());
                          const words=a.title.split(" ");
                          return (
                            <a key={i} href={a.link} target="_blank" rel="noreferrer"
                              style={{display:"flex",gap:0,marginBottom:2,borderRadius:4,overflow:"hidden"}}
                              onMouseEnter={e=>e.currentTarget.style.background=T.hoverBg}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              {/* Bias stripe */}
                              <div style={{width:3,background:BIAS[a.bias].dot,flexShrink:0,borderRadius:"2px 0 0 2px"}}/>
                              {/* Source */}
                              <div style={{width:110,flexShrink:0,padding:"12px 14px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:`1px solid ${T.hoverBg}`}}>
                                <span style={{fontSize:11,fontWeight:600,color:BIAS[a.bias].dot,fontFamily:"'Inter',sans-serif"}}>{a.slabel}</span>
                                <span style={{fontSize:9,color:T.textLow,fontFamily:"'Inter',sans-serif",marginTop:2}}>{BIAS[a.bias].label}</span>
                                {a.cred!=="hoch"&&<span style={{fontSize:9,color:CRED[a.cred],fontFamily:"'Inter',sans-serif",marginTop:1}}>{a.cred==="mittel"?"●●○":"●○○"}</span>}
                              </div>
                              {/* Headline */}
                              <div style={{flex:1,padding:"12px 16px",display:"flex",alignItems:"center"}}>
                                <p style={{fontSize:14,lineHeight:1.5,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>
                                  {words.map((w,wi)=>{
                                    const clean=w.replace(/[^\wäöüß]/g,"").toLowerCase();
                                    const unique=clean.length>4&&!others.some(t=>t.includes(clean));
                                    return <span key={wi} style={{color:unique?T.uniqueWord:T.commonWord,fontWeight:unique?600:400}}>{w}{wi<words.length-1?" ":""}</span>;
                                  })}
                                </p>
                              </div>
                              <div style={{padding:"12px",display:"flex",alignItems:"center",color:T.arrowColor,fontSize:10}}>↗</div>
                            </a>
                          );
                        })}
                      </>
                  }
                </div>
              )}

              {/* ── ANALYSE ── */}
              {tab==="analyse"&&(
                analysing
                  ? <div style={{padding:"48px 0",textAlign:"center"}}>
                      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
                        {STEPS.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=step?"var(--accent)":T.border2,transition:"background 0.3s",animation:i===step?"pulse 1s infinite":"none"}}/>)}
                      </div>
                      <p style={{fontSize:12,color:T.textLow,fontFamily:"'Inter',sans-serif",letterSpacing:1}}>{STEPS[step].toUpperCase()}</p>
                    </div>
                  : result&&!result.error&&(
                    <div className="fi">
                      {/* Scores */}
                      <div className="ml-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:20}}>
                        {[["Panik-Niveau",result.scores?.panik],["Einseitigkeit",result.scores?.einseitigkeit],["Emotionalisierung",result.scores?.emotionalisierung],["Faktendichte",11-(result.scores?.faktendichte||5)]].map(([l,v])=>(
                          <div key={l} style={{background:"var(--bg-panel)",padding:"16px 18px",border:`1px solid ${T.border2}`,borderRadius:2}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                              <span style={{fontSize:13,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>{l}</span>
                              <span style={{fontSize:16,fontWeight:600,color:panikColor(v),fontFamily:"'Inter',sans-serif"}}>{v}/10</span>
                            </div>
                            <div style={{height:3,background:T.border2,borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${(v/10)*100}%`,background:panikColor(v),borderRadius:2,transition:"width 1s ease"}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,borderRadius:2,marginBottom:20,borderLeft:`3px solid ${panikColor(result.scores?.panik)}`}}>
                        <span style={{fontSize:36,fontWeight:700,color:panikColor(result.scores?.panik),fontFamily:"'Inter',sans-serif",lineHeight:1}}>{result.scores?.panik}</span>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:panikColor(result.scores?.panik),fontFamily:"'Inter',sans-serif"}}>{panikWord(result.scores?.panik)} Panikniveau</div>
                          <div style={{fontSize:13,color:T.textMid,fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic",marginTop:2}}>{result.urteil}</div>
                        </div>
                      </div>
                      {result.reisser?.length>0&&(
                        <div>
                          <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:10}}>REISSERISCHE FORMULIERUNGEN</div>
                          {result.reisser.map((r,i)=>(
                            <div key={i} style={{padding:"8px 14px",background:"var(--bg-panel)",borderLeft:"2px solid #f8717133",marginBottom:6,border:`1px solid ${T.border2}`,borderRadius:2}}>
                              <span style={{fontSize:13,color:"#f87171",fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic"}}>„{r}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
              )}

              {/* ── FAKTEN ── */}
              {tab==="fakten"&&result&&!result.error&&(
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="fi ml-2col">
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:12}}>BELEGBARE FAKTEN</div>
                    {result.fakten?.map((f,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:8,padding:"10px 12px",background:"var(--bg-panel)",borderLeft:"2px solid #4ade8044",border:"1px solid var(--border)",borderRadius:2}}>
                        <span style={{color:"#4ade80",flexShrink:0,fontSize:12,marginTop:1}}>✓</span>
                        <p style={{fontSize:15,lineHeight:1.7,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{f}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:12}}>MEINUNGEN ALS FAKTEN</div>
                    {result.meinungen?.map((m,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:8,padding:"10px 12px",background:"var(--bg-panel)",borderLeft:"2px solid #fbbf2444",border:"1px solid var(--border)",borderRadius:2}}>
                        <span style={{color:"#fbbf24",flexShrink:0,fontSize:12,marginTop:1}}>⚠</span>
                        <p style={{fontSize:15,lineHeight:1.7,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{m}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FEHLT ── */}
              {tab==="fehlt"&&result&&!result.error&&(
                <div className="fi">
                  <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:16}}>FEHLENDE PERSPEKTIVEN & OFFENE FRAGEN</div>
                  {result.fehlt?.map((f,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:8,padding:"12px 14px",background:"var(--bg-panel)",alignItems:"flex-start",border:"1px solid var(--border)",borderRadius:2}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:"#1e3a8a",color:"#93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"'Inter',sans-serif",fontWeight:700,flexShrink:0,marginTop:1}}>?</div>
                      <p style={{fontSize:15,lineHeight:1.7,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{f}</p>
                    </div>
                  ))}
                  <p style={{fontSize:11,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:14,lineHeight:1.6}}>Suche nach diesen Aspekten in weiteren Quellen, um dir ein vollständiges Bild zu machen.</p>
                </div>
              )}

              {/* ── SACHBERICHT ── */}
              {tab==="sach"&&result&&!result.error&&(
                <div className="fi">
                  <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:14}}>KI-SACHBERICHT · NUR FAKTEN · OHNE WERTUNG</div>
                  <h3 style={{fontSize:20,fontWeight:500,color:T.textHigh,fontFamily:"'EB Garamond',Georgia,serif",lineHeight:1.3,marginBottom:16}}>{result.sachTitel}</h3>
                  <div style={{borderLeft:`2px solid ${T.border2}`,paddingLeft:16}}>
                    {result.sach?.split("\n\n").map((p,i)=>(
                      <p key={i} style={{fontSize:17,lineHeight:1.9,color:T.textBody,margin:"0 0 14px",fontFamily:"'EB Garamond',Georgia,serif"}}>{p}</p>
                    ))}
                  </div>
                  <p style={{fontSize:10,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:16}}>KI-generiert auf Basis des eingegebenen Artikels. Ersetzt keine eigenständige Recherche.</p>
                </div>
              )}

              {result?.error&&<p style={{color:"#f87171",fontFamily:"'Inter',sans-serif",fontSize:13}}>Analyse fehlgeschlagen. Bitte erneut versuchen.</p>}

              {/* Show placeholder in analyse tab while not yet analysed */}
              {tab==="analyse"&&!result&&!analysing&&(
                <div style={{padding:"48px 0",textAlign:"center"}}>
                  <p style={{fontSize:12,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",letterSpacing:1}}>ANALYSE WIRD GELADEN…</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!sel&&!manual&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",border:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-sub)",fontSize:18}}>◎</div>
              <p style={{fontSize:13,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",textAlign:"center",lineHeight:1.6}}>Story links auswählen<br/><span style={{fontSize:11,color:T.border2}}>KI-Analyse startet automatisch</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:"1px solid var(--border)",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,background:"var(--nav-bg)"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {Object.entries(BIAS).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:v.dot}}/>
              <span style={{fontSize:12,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>{v.label}</span>
            </div>
          ))}
        </div>
        <span style={{fontSize:12,color:T.border2,fontFamily:"'Inter',sans-serif"}}>Mens Libera · Der freie Verstand · Nur Prototyp</span>
      </div>
    </div>
  );
}
