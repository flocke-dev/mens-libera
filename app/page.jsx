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
  const [result,      setResult]      = useState(null);
  const [step,        setStep]        = useState(0);
  const [tab,         setTab]         = useState("headlines");
  const [showOriginal,setShowOriginal]= useState(false);
  const [history,   setHistory]   = useState([]);
  const [manual,      setManual]      = useState(false);
  const [manualTxt,   setManualTxt]   = useState("");
  const [manualTab,   setManualTab]   = useState("text");
  const [urlInput,    setUrlInput]    = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlPreview,  setUrlPreview]  = useState(null);
  const [urlError,    setUrlError]    = useState(null);
  const [copied,    setCopied]    = useState(false);
  const [dark,      setDark]      = useState(false);
  const [cache,          setCache]          = useState({});
  const [read,            setRead]            = useState(new Set());
  const [displayScore,    setDisplayScore]    = useState(0);
  const [showShareModal,  setShowShareModal]  = useState(false);
  const [showOnboarding,  setShowOnboarding]  = useState(false);
  const [onboardingStep,  setOnboardingStep]  = useState(0);
  const [onboardingSkip,  setOnboardingSkip]  = useState(false);
  const panelRef = useRef(null);

  const T = dark ? DARK : LIGHT;

  useEffect(()=>{
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    setDark(saved === 'dark');
    load();
  },[]);

  useEffect(()=>{
    const seen = localStorage.getItem('ml-onboarding');
    if(!seen) setShowOnboarding(true);
  },[]);

  useEffect(()=>{
    if(!result?.scores?.panik) return;
    let current=0;
    const target=result.scores.panik;
    const iv=setInterval(()=>{current+=1;setDisplayScore(current);if(current>=target)clearInterval(iv);},80);
    return()=>clearInterval(iv);
  },[result]);

  function closeOnboarding(){
    if(onboardingSkip) localStorage.setItem('ml-onboarding','true');
    setShowOnboarding(false);
  }

  useEffect(()=>{
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },[dark]);

  function handleShare(){
    setShowShareModal(true);
  }

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
    setAnalysing(true);setResult(null);setShowOriginal(false);let s=0;setStep(0);
    const iv=setInterval(()=>{s=Math.min(s+1,3);setStep(s);},1000);
    try{
      const promptText=`Analysiere diesen Nachrichtenartikel objektiv.\n\nSCHRITT 1 – SPRACHE: Erkenne die Originalsprache.\nSCHRITT 2 – ÜBERSETZUNG: Falls der Artikel NICHT auf Deutsch ist, übersetze ihn vollständig ins Deutsche und analysiere dann den übersetzten Text.\n\nARTIKEL:\n${txt.slice(0,3000)}\n\nAntworte NUR als JSON ohne Backticks:\n{"sprache":"<erkannte Sprache, z.B. Deutsch, Englisch, Französisch, Arabisch>","uebersetzung":<null falls Deutsch, sonst vollständige deutsche Übersetzung als String>,"titel":"<max 70 Zeichen>","scores":{"panik":<1-10>,"einseitigkeit":<1-10>,"faktendichte":<1-10>,"emotionalisierung":<1-10>},"fakten":[<3-4 belegbare Fakten>],"meinungen":[<3-4 verkleidete Meinungen>],"fehlt":[<3-4 fehlende Perspektiven>],"reisser":[<2-3 reißerische Zitate>],"urteil":"<2 Sätze>","sachTitel":"<sachlicher Titel>","sach":"<180-220 Wörter sachlicher Bericht, Absätze durch \\n\\n>"}`;
      const res=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:promptText}]})});
      const d=await res.json();
      const raw=d.content?.[0]?.text||d.content?.map(i=>i.text||"").join("")||"";
      const match=raw.match(/\{[\s\S]*\}/);
      if(!match)throw new Error("Kein JSON");
      const p=JSON.parse(match[0]);
      clearInterval(iv);setResult(p);setTab("analyse");
      if(g){setCache(prev=>({...prev,[g[0].title]:p}));setRead(prev=>new Set([...prev,g[0].title]));}
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
          .ml-panel p{font-size:15px !important;line-height:1.8 !important;word-break:break-word !important;}
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
              style={{width:"100%",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,color:"var(--text)",padding:"7px 32px 7px 32px",fontSize:13,fontFamily:"'Inter',sans-serif",borderRadius:4}}/>
            {q.length>0&&(
              <button onClick={()=>setQ("")}
                style={{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#c8a96e",fontSize:18,lineHeight:1,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",minWidth:44,minHeight:44,padding:0}}>
                ×
              </button>
            )}
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
            {dark ? "☀️" : "🌙"}
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
          {read.size>0&&<span style={{fontSize:11,color:"var(--accent)",fontFamily:"'Inter',sans-serif",marginRight:8}}>{read.size} von {filtered.length} analysiert</span>}
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
            const isRead=read.has(g[0].title);
            const scores=srcs.map(s=>s.biasScore);
            const isBlindspot=srcs.length>=2&&(scores.every(x=>x<0)||scores.every(x=>x>0));
            return (
              <div key={i} onClick={()=>pick(g)} className="row" style={{padding:"18px 0",borderBottom:"1px solid var(--border)",cursor:"pointer",background:isSelected?"var(--accent-subtle)":"transparent",transition:"background 0.15s",paddingLeft:isSelected?10:0,borderLeft:isSelected?"2px solid var(--accent)":"2px solid transparent",marginLeft:-2,opacity:isRead&&!isSelected?0.7:1}}>
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
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
                  <p className="row-title" style={{fontSize:17,lineHeight:1.6,color:isSelected?T.textHigh:isRead?"var(--text-sub)":T.rowTitle,fontFamily:"'EB Garamond',Georgia,serif",fontWeight:600,margin:0,transition:"color 0.15s"}}>
                    {g[0].title}
                  </p>
                  {isRead&&<span style={{color:"#4ade80",fontSize:11,fontFamily:"'Inter',sans-serif",flexShrink:0}}>✓ Analysiert</span>}
                </div>
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
        <div ref={panelRef} className="ml-panel" style={{padding:28,borderLeft:"1px solid var(--border)"}}>

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

                {/* Tabs */}
                <div style={{display:"flex",gap:4,marginBottom:16,borderBottom:`1px solid ${T.border2}`}}>
                  {[{id:"text",label:"Text einfügen"},{id:"url",label:"URL eingeben"}].map(t=>(
                    <button key={t.id} onClick={()=>{setManualTab(t.id);setUrlPreview(null);setUrlError(null);}}
                      style={{background:"none",border:"none",borderBottom:manualTab===t.id?"2px solid var(--accent)":"2px solid transparent",color:manualTab===t.id?"var(--accent)":T.textMid,padding:"8px 14px",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:500,cursor:"pointer",marginBottom:-1,transition:"color 0.15s"}}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Text tab */}
                {manualTab==="text"&&(
                  <>
                    <textarea value={manualTxt} onChange={e=>setManualTxt(e.target.value)} rows={8}
                      style={{width:"100%",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,color:"var(--text)",padding:"14px 16px",fontSize:14,lineHeight:1.8,fontFamily:"'EB Garamond',Georgia,serif",resize:"vertical",outline:"none",borderRadius:4}}
                      placeholder="Artikel hier einfügen…"/>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                      <button onClick={()=>analyse(manualTxt,null)} disabled={analysing||manualTxt.length<80}
                        style={{background:analysing||manualTxt.length<80?"var(--bg-panel)":"var(--accent)",color:analysing||manualTxt.length<80?"var(--text-sub)":"var(--bg)",border:"none",padding:"9px 20px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:"pointer"}}>
                        {analysing?"Analysiere…":"Analysieren →"}
                      </button>
                    </div>
                  </>
                )}

                {/* URL tab */}
                {manualTab==="url"&&(
                  <>
                    <div style={{display:"flex",gap:8,marginBottom:12}}>
                      <input value={urlInput} onChange={e=>{setUrlInput(e.target.value);setUrlPreview(null);setUrlError(null);}}
                        onKeyDown={e=>{if(e.key==="Enter"&&urlInput.trim()&&!urlFetching){setUrlFetching(true);setUrlPreview(null);setUrlError(null);fetch("/api/fetch-article",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:urlInput.trim()})}).then(r=>r.json()).then(d=>{if(d.error)setUrlError(d.error);else setUrlPreview(d);}).catch(e=>setUrlError(e.message)).finally(()=>setUrlFetching(false));}}}
                        style={{flex:1,background:"var(--bg-panel)",border:`1px solid ${T.border2}`,color:"var(--text)",padding:"10px 14px",fontSize:14,fontFamily:"'Inter',sans-serif",borderRadius:4,outline:"none"}}
                        placeholder="https://…"/>
                      <button onClick={async()=>{
                          setUrlFetching(true);setUrlPreview(null);setUrlError(null);
                          try{
                            const r=await fetch("/api/fetch-article",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:urlInput.trim()})});
                            const d=await r.json();
                            if(d.error)setUrlError(d.error);
                            else setUrlPreview(d);
                          }catch(e){setUrlError(e.message);}
                          finally{setUrlFetching(false);}
                        }}
                        disabled={urlFetching||!urlInput.trim()}
                        style={{background:urlFetching||!urlInput.trim()?"var(--bg-panel)":"var(--accent)",color:urlFetching||!urlInput.trim()?"var(--text-sub)":"var(--bg)",border:"none",padding:"10px 18px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:"pointer",whiteSpace:"nowrap"}}>
                        {urlFetching?(
                          <><span style={{width:10,height:10,border:"1.5px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite",marginRight:6}}/> Lädt…</>
                        ):"Artikel laden"}
                      </button>
                    </div>

                    {urlError&&(
                      <div style={{color:"#f87171",fontSize:13,fontFamily:"'Inter',sans-serif",marginBottom:12}}>Fehler: {urlError}</div>
                    )}

                    {urlPreview&&(
                      <div style={{background:"var(--bg-panel)",border:`1px solid ${T.border2}`,borderRadius:4,padding:"14px 16px",marginBottom:12}}>
                        <div style={{fontSize:15,fontWeight:600,color:T.textHigh,fontFamily:"'EB Garamond',Georgia,serif",marginBottom:8,lineHeight:1.4}}>{urlPreview.title}</div>
                        <div style={{fontSize:13,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",lineHeight:1.7}}>
                          {urlPreview.text.slice(0,200)}{urlPreview.text.length>200?"…":""}
                        </div>
                        <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
                          <button onClick={()=>analyse((urlPreview.title+"\n\n"+urlPreview.text),null)} disabled={analysing||urlPreview.text.length<80}
                            style={{background:analysing||urlPreview.text.length<80?"var(--bg-panel)":"var(--accent)",color:analysing||urlPreview.text.length<80?"var(--text-sub)":"var(--bg)",border:"none",padding:"9px 20px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:"pointer"}}>
                            {analysing?"Analysiere…":"Analysieren →"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
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

              {/* Language banner */}
              {result&&result.sprache&&result.sprache!=="Deutsch"&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",marginBottom:16,background:"rgba(200,169,110,0.08)",border:"1px solid rgba(200,169,110,0.3)",borderRadius:4,fontSize:13,color:"#c8a96e",fontFamily:"'Inter',sans-serif"}}>
                  <span>🌍</span>
                  <span>Originalsprache: <strong>{result.sprache}</strong> · Automatisch übersetzt</span>
                </div>
              )}

              {/* Tabs */}
              <div className="ml-tabs" style={{display:"flex",gap:0,borderBottom:`1px solid ${T.border2}`,marginBottom:24}}>
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:tab===t.id?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1,padding:"8px 16px",fontSize:12,fontFamily:"'Inter',sans-serif",color:tab===t.id?T.textHigh:"var(--text-sub)",cursor:"pointer",fontWeight:tab===t.id?500:400,transition:"all 0.15s",whiteSpace:"nowrap"}}>
                    {t.label}
                  </button>
                ))}
                {result&&(
                  <button onClick={handleShare}
                    style={{marginLeft:"auto",background:"none",border:"none",color:copied?"var(--accent)":"var(--text-sub)",fontSize:11,fontFamily:"'Inter',sans-serif",cursor:"pointer",padding:"8px 12px",display:"flex",alignItems:"center",gap:4}}>
                    {copied?"Kopiert ✓":"⎙ Teilen"}
                  </button>
                )}
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
                                <p style={{fontSize:15,lineHeight:1.8,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>
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
                        <span style={{fontSize:36,fontWeight:700,color:panikColor(result.scores?.panik),fontFamily:"'Inter',sans-serif",lineHeight:1}}>{displayScore}</span>
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
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>KI-SACHBERICHT · NUR FAKTEN · OHNE WERTUNG</div>
                    {result.uebersetzung&&(
                      <button onClick={()=>setShowOriginal(o=>!o)}
                        style={{background:"none",border:`1px solid rgba(200,169,110,0.4)`,color:"#c8a96e",fontSize:11,fontFamily:"'Inter',sans-serif",padding:"4px 10px",borderRadius:3,cursor:"pointer",whiteSpace:"nowrap"}}>
                        {showOriginal?"Sachbericht anzeigen":"Original anzeigen"}
                      </button>
                    )}
                  </div>
                  {showOriginal&&result.uebersetzung?(
                    <>
                      <div style={{fontSize:9,letterSpacing:2,color:"#c8a96e",fontFamily:"'Inter',sans-serif",marginBottom:12}}>DEUTSCHE ÜBERSETZUNG · ORIGINALTEXT</div>
                      <div style={{borderLeft:`2px solid rgba(200,169,110,0.3)`,paddingLeft:16}}>
                        {result.uebersetzung.split("\n\n").map((p,i)=>(
                          <p key={i} style={{fontSize:17,lineHeight:1.9,color:T.textBody,margin:"0 0 14px",fontFamily:"'EB Garamond',Georgia,serif"}}>{p}</p>
                        ))}
                      </div>
                    </>
                  ):(
                    <>
                      <h3 style={{fontSize:20,fontWeight:500,color:T.textHigh,fontFamily:"'EB Garamond',Georgia,serif",lineHeight:1.3,marginBottom:16}}>{result.sachTitel}</h3>
                      <div style={{borderLeft:`2px solid ${T.border2}`,paddingLeft:16}}>
                        {result.sach?.split("\n\n").map((p,i)=>(
                          <p key={i} style={{fontSize:17,lineHeight:1.9,color:T.textBody,margin:"0 0 14px",fontFamily:"'EB Garamond',Georgia,serif"}}>{p}</p>
                        ))}
                      </div>
                    </>
                  )}
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

      {/* ── SHARE MODAL ── */}
      {showShareModal&&result&&(()=>{
        const sc=result.scores||{};
        const bar=(v=0)=>`${'█'.repeat(v)}${'░'.repeat(10-v)}`;
        const shareText=`⚖️ MENS LIBERA · Der freie Verstand\n\n📰 ${result.titel}\n\n📊 ANALYSE:\n- Panik-Niveau: ${bar(sc.panik)} ${sc.panik}/10\n- Einseitigkeit: ${bar(sc.einseitigkeit)} ${sc.einseitigkeit}/10\n- Emotionalisierung: ${bar(sc.emotionalisierung)} ${sc.emotionalisierung}/10\n- Faktendichte: ${bar(sc.faktendichte)} ${sc.faktendichte}/10\n\n✅ FAKTEN:\n${result.fakten?.slice(0,3).map(f=>`• ${f}`).join('\n')}\n\n⚠️ MEINUNGEN ALS FAKTEN:\n${result.meinungen?.slice(0,2).map(m=>`• ${m}`).join('\n')}\n\n❓ WAS FEHLT:\n${result.fehlt?.slice(0,2).map(f=>`• ${f}`).join('\n')}\n\n📝 FAZIT:\n${result.urteil}\n\n🔍 Analysiert mit Mens Libera – Der freie Verstand\n🌐 mens-libera.vercel.app`;
        const enc=encodeURIComponent(shareText);
        const iconWa=(
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.121 1.533 5.849L.057 23.535a.75.75 0 00.906.919l5.803-1.522A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.713 9.713 0 01-4.953-1.355l-.355-.211-3.683.966.982-3.588-.231-.369A9.713 9.713 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
          </svg>
        );
        const iconTg=(
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#229ED9">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.16 13.67l-2.948-.924c-.64-.203-.653-.64.136-.954l11.498-4.43c.534-.194 1.001.131.048.859z"/>
          </svg>
        );
        const iconCopy=(
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        );
        const iconShare=(
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        );
        const rowStyle={display:"flex",alignItems:"center",gap:16,padding:"14px 8px",color:"var(--text)",textDecoration:"none",background:"none",border:"none",cursor:"pointer",width:"100%",borderRadius:4,transition:"background 0.15s"};
        const logoBox={width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0};
        return (
          <div onClick={()=>setShowShareModal(false)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:"var(--bg-panel)",border:"1px solid var(--border)",borderTop:"3px solid var(--accent)",padding:28,width:320,borderRadius:4}}>
              <p style={{fontSize:13,fontWeight:600,marginBottom:16,color:"var(--text)",fontFamily:"Inter, sans-serif"}}>Analyse teilen</p>

              <a href={`https://wa.me/?text=${enc}`} target="_blank" rel="noreferrer"
                style={rowStyle}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <div style={logoBox}>{iconWa}</div>
                <span style={{fontSize:14,fontFamily:"Inter"}}>WhatsApp</span>
              </a>

              <a href={`https://t.me/share/url?url=https://mens-libera.vercel.app&text=${enc}`} target="_blank" rel="noreferrer"
                style={rowStyle}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <div style={logoBox}>{iconTg}</div>
                <span style={{fontSize:14,fontFamily:"Inter"}}>Telegram</span>
              </a>

              <button onClick={()=>{navigator.clipboard.writeText(shareText);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                style={rowStyle}
                onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <div style={logoBox}>{iconCopy}</div>
                <span style={{fontSize:14,fontFamily:"Inter"}}>{copied?"Kopiert ✓":"Text kopieren"}</span>
              </button>

              {typeof navigator!=="undefined"&&navigator.share&&(
                <button onClick={()=>navigator.share({title:"Mens Libera Analyse",text:shareText,url:"https://mens-libera.vercel.app"})}
                  style={rowStyle}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <div style={logoBox}>{iconShare}</div>
                  <span style={{fontSize:14,fontFamily:"Inter"}}>Mehr Optionen</span>
                </button>
              )}

              <button onClick={()=>setShowShareModal(false)}
                style={{marginTop:16,width:"100%",background:"var(--accent)",color:"#0b0b12",border:"none",padding:"10px 0",fontSize:13,fontFamily:"Inter",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                Schließen
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── ONBOARDING MODAL ── */}
      {showOnboarding&&(()=>{
        const steps=[
          {icon:"⚖️",title:"Bias erkennen",text:"Jede Story zeigt farbige Punkte – von Blau (Links) bis Rot (Rechts). So siehst du sofort welche Seite berichtet."},
          {icon:"🔴",title:"Blindspot entdecken",text:"Wenn nur eine politische Seite über eine Story berichtet, warnen wir dich. Die andere Seite schweigt bewusst."},
          {icon:"🔍",title:"KI-Analyse",text:"Klicke auf eine Story – die KI analysiert sofort Panikniveau, Framing und was im Artikel fehlt."},
        ];
        const s=steps[onboardingStep];
        const isLast=onboardingStep===steps.length-1;
        return (
          <div onClick={closeOnboarding}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:"var(--bg-panel)",border:"1px solid var(--border)",borderTop:"3px solid var(--accent)",padding:32,width:"100%",maxWidth:420,borderRadius:4}}>

              {/* Progress dots */}
              <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:28}}>
                {steps.map((_,i)=>(
                  <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i===onboardingStep?"var(--accent)":"var(--border)",transition:"background 0.2s"}}/>
                ))}
              </div>

              {/* Content */}
              <div style={{textAlign:"center",marginBottom:32}}>
                <div style={{fontSize:48,marginBottom:16,lineHeight:1}}>{s.icon}</div>
                <div style={{fontSize:18,fontWeight:600,color:"var(--text)",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:12}}>{s.title}</div>
                <p style={{fontSize:15,lineHeight:1.8,color:"var(--text-sub)",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{s.text}</p>
              </div>

              {/* Navigation */}
              <div style={{display:"flex",gap:8,marginBottom:20}}>
                {onboardingStep>0&&(
                  <button onClick={()=>setOnboardingStep(s=>s-1)}
                    style={{flex:1,background:"none",border:"1px solid var(--border)",color:"var(--text-sub)",padding:"10px 0",fontSize:13,fontFamily:"Inter",cursor:"pointer",borderRadius:3}}>
                    ← Zurück
                  </button>
                )}
                {!isLast?(
                  <button onClick={()=>setOnboardingStep(s=>s+1)}
                    style={{flex:1,background:"var(--accent)",border:"none",color:"#0b0b12",padding:"10px 0",fontSize:13,fontFamily:"Inter",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                    Weiter →
                  </button>
                ):(
                  <button onClick={closeOnboarding}
                    style={{flex:1,background:"var(--accent)",border:"none",color:"#0b0b12",padding:"10px 0",fontSize:13,fontFamily:"Inter",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                    Loslegen →
                  </button>
                )}
              </div>

              {/* "Nicht mehr anzeigen" */}
              <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",fontSize:12,color:"var(--text-sub)",fontFamily:"Inter"}}>
                <input type="checkbox" checked={onboardingSkip} onChange={e=>setOnboardingSkip(e.target.checked)}
                  style={{accentColor:"var(--accent)",cursor:"pointer"}}/>
                Nicht mehr anzeigen
              </label>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
