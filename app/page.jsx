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
  const panelRef = useRef(null);

  useEffect(()=>{load();},[]);

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
    setSel(g);setResult(null);setTab("headlines");setManual(false);
    const txt=`${g[0].title}\n\n${g[0].body}`;
    analyse(txt,g);
    setTimeout(()=>panelRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);
  }

  async function analyse(txt,g){
    if(!txt||txt.length<60)return;
    setAnalysing(true);setResult(null);let s=0;setStep(0);
    const iv=setInterval(()=>{s=Math.min(s+1,3);setStep(s);},1000);
    try{
      const res=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Analysiere diesen deutschsprachigen Nachrichtenartikel objektiv.\n\nARTIKEL:\n${txt.slice(0,3000)}\n\nAntworte NUR als JSON ohne Backticks:\n{"titel":"<max 70 Zeichen>","scores":{"panik":<1-10>,"einseitigkeit":<1-10>,"faktendichte":<1-10>,"emotionalisierung":<1-10>},"fakten":[<3-4 belegbare Fakten>],"meinungen":[<3-4 verkleidete Meinungen>],"fehlt":[<3-4 fehlende Perspektiven>],"reisser":[<2-3 reißerische Zitate>],"urteil":"<2 Sätze>","sachTitel":"<sachlicher Titel>","sach":"<180-220 Wörter sachlicher Bericht, Absätze durch \\n\\n>"}`}]})});
      const d=await res.json();const raw=d.content.map(i=>i.text||"").join("");
      const p=JSON.parse(raw.replace(/```json|```/g,"").trim());
      clearInterval(iv);setResult(p);setTab("analyse");
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
    <div style={{background:"#0b0b12",minHeight:"100vh",color:"#e8e4d9",fontFamily:"'EB Garamond', Georgia, serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:#2a2535;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        .fi{animation:fadeIn 0.3s ease both}
        .row:hover .row-title{color:#f0ece0 !important}
        .row:hover{background:rgba(200,169,110,0.04) !important}
        a{text-decoration:none;color:inherit;}
        input::placeholder{color:#4a4560;}
        input:focus{outline:none;border-color:#4a4560 !important;}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{borderBottom:"1px solid #1e1c2a",background:"#080810",position:"sticky",top:0,zIndex:50}}>
        <div style={{maxWidth:1320,margin:"0 auto",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:20}}>
          {/* Logo */}
          <div style={{flexShrink:0}}>
            <div style={{display:"flex",alignItems:"baseline",gap:5}}>
              <span style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:22,fontWeight:600,letterSpacing:-0.5,color:"#f0ece0"}}>Mens</span>
              <span style={{fontFamily:"'EB Garamond',Georgia,serif",fontSize:22,fontWeight:400,letterSpacing:-0.5,color:"#c8a96e",fontStyle:"italic"}}>Libera</span>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#c8a96e",display:"inline-block",marginLeft:2,marginBottom:4}}/>
            </div>
            <div style={{fontSize:8,letterSpacing:4,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginTop:1}}>DER FREIE VERSTAND</div>
          </div>

          {/* Search */}
          <div style={{flex:1,maxWidth:380,position:"relative"}}>
            <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:14,height:14,color:"#4a4560"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Suchen…"
              style={{width:"100%",background:"#12101a",border:"1px solid #2a2535",color:"#e8e4d9",padding:"7px 12px 7px 32px",fontSize:13,fontFamily:"'DM Sans',sans-serif",borderRadius:4}}/>
          </div>

          <div style={{flex:1}}/>

          {/* Actions */}
          <button onClick={()=>{setManual(true);setSel(null);setResult(null);setManualTxt("");}} style={{background:"transparent",border:"1px solid #2a2535",color:"#6b7280",padding:"5px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:14}}>+</span> Text eingeben
          </button>
          <button onClick={load} disabled={loading} style={{background:loading?"#12101a":"#c8a96e",border:"none",color:loading?"#4a4560":"#0b0b12",padding:"5px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,borderRadius:4,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6}}>
            {loading
              ? <><span style={{width:12,height:12,border:"1.5px solid #4a4560",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>{loaded}/{SOURCES.length}</>
              : <>↻ Aktualisieren</>}
          </button>
          {history.length>0&&(
            <div style={{fontSize:11,color:"#4a4560",fontFamily:"'DM Sans',sans-serif"}}>{history.length} Analysen</div>
          )}
        </div>

        {/* Category + Bias strip */}
        <div style={{borderTop:"1px solid #1e1c2a",maxWidth:1320,margin:"0 auto",padding:"0 24px",height:38,display:"flex",alignItems:"center",gap:2}}>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} style={{background:"none",border:"none",color:cat===c.id?"#f0ece0":"#4a4560",padding:"4px 12px",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:cat===c.id?600:400,cursor:"pointer",borderBottom:`2px solid ${cat===c.id?"#c8a96e":"transparent"}`,transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {c.label}
            </button>
          ))}
          <div style={{width:1,height:16,background:"#2a2535",margin:"0 8px"}}/>
          {[{id:"alle",label:"Alle Quellen"},{id:"links",label:"Links"},{id:"rechts",label:"Rechts"},{id:"alternativ",label:"Alternativ"},{id:"blindspot",label:"⚠ Blindspot"}].map(f=>(
            <button key={f.id} onClick={()=>setBias(f.id)} style={{background:"none",border:"none",color:bias===f.id?"#c8a96e":"#4a4560",padding:"4px 10px",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:bias===f.id?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {f.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <span style={{fontSize:11,color:"#2a2535",fontFamily:"'DM Sans',sans-serif"}}>{filtered.length} Storys</span>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{maxWidth:1320,margin:"0 auto",padding:"24px 24px 80px",display:"grid",gridTemplateColumns:"380px 1fr",gap:6}}>

        {/* ── FEED ── */}
        <aside style={{position:"sticky",top:94,maxHeight:"calc(100vh - 114px)",overflowY:"auto",paddingRight:6}}>

          {/* Loading state */}
          {loading&&(
            <div>
              <div style={{height:2,background:"#1e1c2a",borderRadius:1,marginBottom:16,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(loaded/SOURCES.length)*100}%`,background:"#c8a96e",transition:"width 0.3s",borderRadius:1}}/>
              </div>
              {[...Array(7)].map((_,i)=>(
                <div key={i} style={{padding:"14px 0",borderBottom:"1px solid #1e1c2a",animation:"pulse 1.8s infinite",animationDelay:`${i*0.1}s`}}>
                  <div style={{height:11,background:"#1e1c2a",borderRadius:2,marginBottom:8,width:"90%"}}/>
                  <div style={{height:11,background:"#1e1c2a",borderRadius:2,marginBottom:10,width:"70%"}}/>
                  <div style={{height:5,background:"#1e1c2a",borderRadius:1,width:"40%"}}/>
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
              <div key={i} onClick={()=>pick(g)} className="row" style={{padding:"14px 0",borderBottom:"1px solid #1e1c2a",cursor:"pointer",background:isSelected?"rgba(200,169,110,0.05)":"transparent",transition:"background 0.15s",paddingLeft:isSelected?10:0,borderLeft:isSelected?"2px solid #c8a96e":"2px solid transparent",marginLeft:-2}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
                  <div style={{display:"flex",gap:3}}>
                    {srcs.map(s=>(
                      <div key={s.id} title={`${s.label} · ${BIAS[s.bias].label}`} style={{width:6,height:6,borderRadius:"50%",background:BIAS[s.bias].dot,opacity:0.8}}/>
                    ))}
                  </div>
                  {isBlindspot&&<span style={{fontSize:9,color:"#f87171",fontFamily:"'DM Sans',sans-serif",letterSpacing:0.5}}>BLINDSPOT</span>}
                  <span style={{fontSize:10,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginLeft:"auto"}}>{g[0].pubDate?ago(g[0].pubDate):""}</span>
                </div>
                <p className="row-title" style={{fontSize:14,lineHeight:1.5,color:isSelected?"#f0ece0":"#b8b4a8",fontFamily:"'EB Garamond',Georgia,serif",fontWeight:500,marginBottom:6,transition:"color 0.15s"}}>
                  {g[0].title}
                </p>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                  {srcs.slice(0,4).map(s=>(
                    <span key={s.id} style={{fontSize:10,color:BIAS[s.bias].dot,fontFamily:"'DM Sans',sans-serif",opacity:0.7}}>
                      {s.label}{s.credibility!=="hoch"&&<span style={{color:CRED[s.credibility],marginLeft:2}}>·</span>}
                    </span>
                  ))}
                  {srcs.length>4&&<span style={{fontSize:10,color:"#4a4560",fontFamily:"'DM Sans',sans-serif"}}>+{srcs.length-4}</span>}
                </div>
              </div>
            );
          })}
        </aside>

        {/* ── PANEL ── */}
        <div ref={panelRef} style={{paddingLeft:24,borderLeft:"1px solid #1e1c2a"}}>

          {/* Manual input */}
          {manual&&(
            <div className="fi">
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,letterSpacing:2,color:"#52525b",fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>EIGENEN TEXT ANALYSIEREN</div>
                <textarea value={manualTxt} onChange={e=>setManualTxt(e.target.value)} rows={8}
                  style={{width:"100%",background:"#12101a",border:"1px solid #2a2535",color:"#e8e4d9",padding:"14px 16px",fontSize:14,lineHeight:1.8,fontFamily:"'EB Garamond',Georgia,serif",resize:"vertical",outline:"none",borderRadius:4}}
                  placeholder="Artikel hier einfügen…"/>
                <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                  <button onClick={()=>analyse(manualTxt,null)} disabled={analysing||manualTxt.length<80}
                    style={{background:analysing||manualTxt.length<80?"#12101a":"#c8a96e",color:analysing||manualTxt.length<80?"#4a4560":"#0b0b12",border:"none",padding:"9px 20px",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:600,borderRadius:4,cursor:"pointer"}}>
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
                  <h2 style={{fontSize:22,lineHeight:1.35,fontWeight:500,color:"#fff",fontFamily:"'EB Garamond',Georgia,serif",flex:1}}>
                    {sel[0].title}
                  </h2>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:28,fontWeight:600,color:"#d97706",fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{sel.length}</div>
                    <div style={{fontSize:9,color:"#52525b",fontFamily:"'DM Sans',sans-serif",letterSpacing:1}}>QUELLEN</div>
                  </div>
                </div>
                {/* Source links */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {sel.map((a,i)=>(
                    <a key={i} href={a.link} target="_blank" rel="noreferrer"
                      style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",border:`1px solid ${BIAS[a.bias].dot}33`,borderRadius:20,fontSize:11,color:BIAS[a.bias].dot,fontFamily:"'DM Sans',sans-serif",background:`${BIAS[a.bias].dot}08`}}>
                      {a.slabel}
                      <span style={{opacity:0.4,fontSize:9}}>↗</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",gap:0,borderBottom:"1px solid #2a2535",marginBottom:24}}>
                {TABS.map(t=>(
                  <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"#c8a96e":"transparent"}`,marginBottom:-1,padding:"8px 16px",fontSize:12,fontFamily:"'DM Sans',sans-serif",color:tab===t.id?"#f0ece0":"#4a4560",cursor:"pointer",fontWeight:tab===t.id?500:400,transition:"all 0.15s",whiteSpace:"nowrap"}}>
                    {t.label}
                  </button>
                ))}
                {result&&(
                  <button onClick={()=>{navigator.clipboard.writeText(`Mens Libera Analyse\n\n${result.titel}\n\nPanik: ${result.scores?.panik}/10 · Einseitigkeit: ${result.scores?.einseitigkeit}/10\n\n${result.urteil}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                    style={{marginLeft:"auto",background:"none",border:"none",color:copied?"#4ade80":"#4a4560",fontSize:11,fontFamily:"'DM Sans',sans-serif",cursor:"pointer",padding:"8px 12px"}}>
                    {copied?"Kopiert ✓":"⎙ Teilen"}
                  </button>
                )}
              </div>

              {/* ── SCHLAGZEILEN ── */}
              {tab==="headlines"&&(
                <div>
                  {sel.length<2
                    ? <p style={{color:"#52525b",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Nur eine Quelle – kein Vergleich möglich.</p>
                    : <>
                        <p style={{fontSize:12,color:"#52525b",fontFamily:"'DM Sans',sans-serif",marginBottom:20,letterSpacing:0.5}}>GLEICHE STORY · VERSCHIEDENE PERSPEKTIVEN · <span style={{color:"#d4d4d8"}}>Fett</span> = einzigartige Formulierung</p>
                        {sel.map((a,i)=>{
                          const others=sel.filter((_,j)=>j!==i).map(x=>x.title.toLowerCase());
                          const words=a.title.split(" ");
                          return (
                            <a key={i} href={a.link} target="_blank" rel="noreferrer"
                              style={{display:"flex",gap:0,marginBottom:2,borderRadius:4,overflow:"hidden"}}
                              onMouseEnter={e=>e.currentTarget.style.background="#18181b"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              {/* Bias stripe */}
                              <div style={{width:3,background:BIAS[a.bias].dot,flexShrink:0,borderRadius:"2px 0 0 2px"}}/>
                              {/* Source */}
                              <div style={{width:110,flexShrink:0,padding:"12px 14px",display:"flex",flexDirection:"column",justifyContent:"center",borderRight:"1px solid #18181b"}}>
                                <span style={{fontSize:11,fontWeight:600,color:BIAS[a.bias].dot,fontFamily:"'DM Sans',sans-serif"}}>{a.slabel}</span>
                                <span style={{fontSize:9,color:"#52525b",fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{BIAS[a.bias].label}</span>
                                {a.cred!=="hoch"&&<span style={{fontSize:9,color:CRED[a.cred],fontFamily:"'DM Sans',sans-serif",marginTop:1}}>{a.cred==="mittel"?"●●○":"●○○"}</span>}
                              </div>
                              {/* Headline */}
                              <div style={{flex:1,padding:"12px 16px",display:"flex",alignItems:"center"}}>
                                <p style={{fontSize:14,lineHeight:1.5,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>
                                  {words.map((w,wi)=>{
                                    const clean=w.replace(/[^\wäöüß]/g,"").toLowerCase();
                                    const unique=clean.length>4&&!others.some(t=>t.includes(clean));
                                    return <span key={wi} style={{color:unique?"#f0f0f0":"#52525b",fontWeight:unique?600:400}}>{w}{wi<words.length-1?" ":""}</span>;
                                  })}
                                </p>
                              </div>
                              <div style={{padding:"12px",display:"flex",alignItems:"center",color:"#3f3f46",fontSize:10}}>↗</div>
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
                        {STEPS.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=step?"#c8a96e":"#2a2535",transition:"background 0.3s",animation:i===step?"pulse 1s infinite":"none"}}/>)}
                      </div>
                      <p style={{fontSize:12,color:"#52525b",fontFamily:"'DM Sans',sans-serif",letterSpacing:1}}>{STEPS[step].toUpperCase()}</p>
                    </div>
                  : result&&!result.error&&(
                    <div className="fi">
                      {/* Scores */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:20}}>
                        {[["Panik-Niveau",result.scores?.panik],["Einseitigkeit",result.scores?.einseitigkeit],["Emotionalisierung",result.scores?.emotionalisierung],["Faktendichte",11-(result.scores?.faktendichte||5)]].map(([l,v])=>(
                          <div key={l} style={{background:"#12101a",padding:"14px 16px",border:"1px solid #2a2535",borderRadius:2}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                              <span style={{fontSize:11,color:"#4a4560",fontFamily:"'DM Sans',sans-serif"}}>{l}</span>
                              <span style={{fontSize:16,fontWeight:600,color:panikColor(v),fontFamily:"'DM Sans',sans-serif"}}>{v}/10</span>
                            </div>
                            <div style={{height:3,background:"#2a2535",borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${(v/10)*100}%`,background:panikColor(v),borderRadius:2,transition:"width 1s ease"}}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:"#12101a",border:"1px solid #2a2535",borderRadius:2,marginBottom:20,borderLeft:`3px solid ${panikColor(result.scores?.panik)}`}}>
                        <span style={{fontSize:36,fontWeight:700,color:panikColor(result.scores?.panik),fontFamily:"'DM Sans',sans-serif",lineHeight:1}}>{result.scores?.panik}</span>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:panikColor(result.scores?.panik),fontFamily:"'DM Sans',sans-serif"}}>{panikWord(result.scores?.panik)} Panikniveau</div>
                          <div style={{fontSize:13,color:"#6b7280",fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic",marginTop:2}}>{result.urteil}</div>
                        </div>
                      </div>
                      {result.reisser?.length>0&&(
                        <div>
                          <div style={{fontSize:9,letterSpacing:2,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>REISSERISCHE FORMULIERUNGEN</div>
                          {result.reisser.map((r,i)=>(
                            <div key={i} style={{padding:"8px 14px",background:"#12101a",borderLeft:"2px solid #f8717133",marginBottom:6,border:"1px solid #2a2535",borderRadius:2}}>
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
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}} className="fi">
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>BELEGBARE FAKTEN</div>
                    {result.fakten?.map((f,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:8,padding:"10px 12px",background:"#12101a",borderLeft:"2px solid #4ade8044",border:"1px solid #1e1c2a",borderRadius:2}}>
                        <span style={{color:"#4ade80",flexShrink:0,fontSize:12,marginTop:1}}>✓</span>
                        <p style={{fontSize:13,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{f}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>MEINUNGEN ALS FAKTEN</div>
                    {result.meinungen?.map((m,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:8,padding:"10px 12px",background:"#12101a",borderLeft:"2px solid #fbbf2444",border:"1px solid #1e1c2a",borderRadius:2}}>
                        <span style={{color:"#fbbf24",flexShrink:0,fontSize:12,marginTop:1}}>⚠</span>
                        <p style={{fontSize:13,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{m}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── FEHLT ── */}
              {tab==="fehlt"&&result&&!result.error&&(
                <div className="fi">
                  <div style={{fontSize:9,letterSpacing:2,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>FEHLENDE PERSPEKTIVEN & OFFENE FRAGEN</div>
                  {result.fehlt?.map((f,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:8,padding:"12px 14px",background:"#12101a",alignItems:"flex-start",border:"1px solid #1e1c2a",borderRadius:2}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:"#1e3a8a",color:"#93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:700,flexShrink:0,marginTop:1}}>?</div>
                      <p style={{fontSize:13,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{f}</p>
                    </div>
                  ))}
                  <p style={{fontSize:11,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginTop:14,lineHeight:1.6}}>Suche nach diesen Aspekten in weiteren Quellen, um dir ein vollständiges Bild zu machen.</p>
                </div>
              )}

              {/* ── SACHBERICHT ── */}
              {tab==="sach"&&result&&!result.error&&(
                <div className="fi">
                  <div style={{fontSize:9,letterSpacing:2,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>KI-SACHBERICHT · NUR FAKTEN · OHNE WERTUNG</div>
                  <h3 style={{fontSize:20,fontWeight:500,color:"#f0ece0",fontFamily:"'EB Garamond',Georgia,serif",lineHeight:1.3,marginBottom:16}}>{result.sachTitel}</h3>
                  <div style={{borderLeft:"2px solid #2a2535",paddingLeft:16}}>
                    {result.sach?.split("\n\n").map((p,i)=>(
                      <p key={i} style={{fontSize:15,lineHeight:1.9,color:"#c8c4b9",margin:"0 0 14px",fontFamily:"'EB Garamond',Georgia,serif"}}>{p}</p>
                    ))}
                  </div>
                  <p style={{fontSize:10,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",marginTop:16}}>KI-generiert auf Basis des eingegebenen Artikels. Ersetzt keine eigenständige Recherche.</p>
                </div>
              )}

              {result?.error&&<p style={{color:"#f87171",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Analyse fehlgeschlagen. Bitte erneut versuchen.</p>}

              {/* Show placeholder in analyse tab while not yet analysed */}
              {tab==="analyse"&&!result&&!analysing&&(
                <div style={{padding:"48px 0",textAlign:"center"}}>
                  <p style={{fontSize:12,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",letterSpacing:1}}>ANALYSE WIRD GELADEN…</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!sel&&!manual&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",border:"1px solid #2a2535",display:"flex",alignItems:"center",justifyContent:"center",color:"#4a4560",fontSize:18}}>◎</div>
              <p style={{fontSize:13,color:"#4a4560",fontFamily:"'DM Sans',sans-serif",textAlign:"center",lineHeight:1.6}}>Story links auswählen<br/><span style={{fontSize:11,color:"#2a2535"}}>KI-Analyse startet automatisch</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{borderTop:"1px solid #1e1c2a",padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,background:"#080810"}}>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {Object.entries(BIAS).map(([k,v])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:v.dot}}/>
              <span style={{fontSize:10,color:"#4a4560",fontFamily:"'DM Sans',sans-serif"}}>{v.label}</span>
            </div>
          ))}
        </div>
        <span style={{fontSize:10,color:"#2a2535",fontFamily:"'DM Sans',sans-serif"}}>Mens Libera · Der freie Verstand · Nur Prototyp</span>
      </div>
    </div>
  );
}
