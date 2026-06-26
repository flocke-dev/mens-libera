'use client'
import { useState, useEffect, useRef } from "react";

const SOURCES = [
  // CENTER
  { id:"reuters",    label:"Reuters",         bias:"center",       biasScore:0,  credibility:"high",   url:"https://feeds.reuters.com/reuters/topNews" },
  { id:"bbc",        label:"BBC News",        bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://feeds.bbci.co.uk/news/rss.xml" },
  { id:"apnews",     label:"AP News",         bias:"center",       biasScore:0,  credibility:"high",   url:"https://rsshub.app/apnews/topics/apf-topnews" },
  { id:"npr",        label:"NPR",             bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://feeds.npr.org/1001/rss.xml" },

  // CENTER-LEFT
  { id:"guardian",   label:"The Guardian",    bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://www.theguardian.com/world/rss" },
  { id:"nyt",        label:"NY Times",        bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://rss.nytimes.com/services/xml/rss/nyt/World.xml" },
  { id:"wapo",       label:"Washington Post", bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://feeds.washingtonpost.com/rss/world" },
  { id:"independent",label:"Independent",     bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://www.independent.co.uk/news/world/rss" },
  { id:"msnbc",      label:"MSNBC",           bias:"left",         biasScore:-2, credibility:"medium", url:"https://feeds.nbcnews.com/msnbc/public/news" },

  // LEFT
  { id:"huffpost",   label:"HuffPost",        bias:"left",         biasScore:-2, credibility:"medium", url:"https://www.huffpost.com/section/world-news/feed" },
  { id:"mother",     label:"Mother Jones",    bias:"far-left",     biasScore:-3, credibility:"medium", url:"https://www.motherjones.com/feed/" },

  // CENTER-RIGHT
  { id:"wsj",        label:"Wall St. Journal",bias:"center-right", biasScore:1,  credibility:"high",   url:"https://feeds.a.dj.com/rss/RSSWorldNews.xml" },
  { id:"economist",  label:"The Economist",   bias:"center-right", biasScore:1,  credibility:"high",   url:"https://www.economist.com/international/rss.xml" },
  { id:"telegraph",  label:"The Telegraph",   bias:"center-right", biasScore:1,  credibility:"high",   url:"https://www.telegraph.co.uk/rss.xml" },
  { id:"spectator",  label:"The Spectator",   bias:"center-right", biasScore:1,  credibility:"medium", url:"https://www.spectator.co.uk/feed/" },

  // RIGHT
  { id:"foxnews",    label:"Fox News",        bias:"right",        biasScore:2,  credibility:"medium", url:"https://feeds.foxnews.com/foxnews/world" },
  { id:"nypost",     label:"NY Post",         bias:"right",        biasScore:2,  credibility:"medium", url:"https://nypost.com/feed/" },
  { id:"breitbart",  label:"Breitbart",       bias:"far-right",    biasScore:3,  credibility:"low",    url:"https://feeds.feedburner.com/breitbart" },
  { id:"dailywire",  label:"Daily Wire",      bias:"far-right",    biasScore:3,  credibility:"low",    url:"https://www.dailywire.com/feeds/rss.xml" },

  // INTERNATIONAL
  { id:"aljazeera",  label:"Al Jazeera",      bias:"center-left",  biasScore:-1, credibility:"high",   url:"https://www.aljazeera.com/xml/rss/all.xml" },
  { id:"dw",         label:"DW English",      bias:"center",       biasScore:0,  credibility:"high",   url:"https://rss.dw.com/rdf/rss-en-all" },
  { id:"france24",   label:"France 24",       bias:"center",       biasScore:0,  credibility:"high",   url:"https://www.france24.com/en/rss" },
  { id:"rt",         label:"RT",              bias:"far-right",    biasScore:3,  credibility:"low",    url:"https://www.rt.com/rss/news/" },
];

const BIAS = {
  "far-left":    { label:"Far Left",     dot:"#818cf8" },
  "left":        { label:"Left",         dot:"#3b82f6" },
  "center-left": { label:"Center-Left",  dot:"#60a5fa" },
  "center":      { label:"Center",       dot:"#94a3b8" },
  "center-right":{ label:"Center-Right", dot:"#fb923c" },
  "right":       { label:"Right",        dot:"#f87171" },
  "far-right":   { label:"Far Right",    dot:"#fbbf24" },
};

const CRED = { high:"#4ade80", medium:"#fbbf24", low:"#f87171" };

const SOURCE_INFO = {
  reuters:    { desc:"Reuters is one of the world's largest news agencies, supplying unbiased news to media organizations globally since 1851. It is renowned for strict factual standards and international reach.", web:"https://www.reuters.com" },
  bbc:        { desc:"The BBC is the UK's public broadcaster, operating worldwide news services since 1922. It is widely regarded for editorial independence and comprehensive international coverage.", web:"https://www.bbc.com/news" },
  apnews:     { desc:"The Associated Press is an independent global news organization founded in 1846. It is among the most trusted sources of fast, accurate, and unbiased journalism.", web:"https://apnews.com" },
  npr:        { desc:"National Public Radio is a non-profit American media organization known for in-depth news, analysis, and cultural programming. It is funded by a mix of member stations and public donations.", web:"https://www.npr.org" },
  guardian:   { desc:"The Guardian is a British daily newspaper known for progressive investigative journalism, fully owned by a trust that protects its editorial independence. It was founded in 1821 in Manchester.", web:"https://www.theguardian.com" },
  nyt:        { desc:"The New York Times is one of the world's most influential newspapers, founded in 1851. It is known for deep investigative reporting and broad coverage of global affairs.", web:"https://www.nytimes.com" },
  wapo:       { desc:"The Washington Post is a major American daily based in Washington D.C., known for political journalism and breaking national news. It has been owned by Jeff Bezos since 2013.", web:"https://www.washingtonpost.com" },
  independent:{ desc:"The Independent is a British digital newspaper founded in 1986 with a focus on liberal politics and global news. It is known for opinionated commentary and an international outlook.", web:"https://www.independent.co.uk" },
  msnbc:      { desc:"MSNBC is an American news channel with a strongly progressive editorial lean, owned by NBCUniversal. It focuses primarily on U.S. politics and liberal commentary.", web:"https://www.msnbc.com" },
  huffpost:   { desc:"HuffPost is a progressive American news and opinion website founded in 2005. It covers politics, culture, and lifestyle from a clearly left-leaning perspective.", web:"https://www.huffpost.com" },
  mother:     { desc:"Mother Jones is a nonprofit American magazine known for investigative reporting with a clear progressive editorial stance. It has broken major stories on corporate and government accountability.", web:"https://www.motherjones.com" },
  wsj:        { desc:"The Wall Street Journal is one of the most widely read U.S. newspapers, founded in 1889. It focuses on business and financial news with a center-right editorial perspective.", web:"https://www.wsj.com" },
  economist:  { desc:"The Economist is a British weekly magazine covering politics, business, and world affairs since 1843. It advocates for free markets and liberal democracy from a center-right standpoint.", web:"https://www.economist.com" },
  telegraph:  { desc:"The Daily Telegraph is a major British daily newspaper with a traditional conservative editorial stance. It has extensive coverage of UK politics and international affairs.", web:"https://www.telegraph.co.uk" },
  spectator:  { desc:"The Spectator is the world's oldest continuously published magazine, founded in 1828. It publishes conservative and contrarian opinion alongside cultural commentary.", web:"https://www.spectator.co.uk" },
  foxnews:    { desc:"Fox News is a major American cable news network with a strong conservative editorial stance, launched in 1996. It consistently attracts the largest U.S. cable news audience.", web:"https://www.foxnews.com" },
  nypost:     { desc:"The New York Post is a right-leaning American tabloid founded in 1801, known for sensationalist headlines and conservative political coverage. It is one of the oldest U.S. newspapers.", web:"https://nypost.com" },
  breitbart:  { desc:"Breitbart News is a far-right American news and opinion website founded in 2007. It is closely aligned with nationalist and populist political movements.", web:"https://www.breitbart.com" },
  dailywire:  { desc:"The Daily Wire is a far-right American conservative media company founded by Ben Shapiro in 2015. It produces news commentary and podcasts from a strongly conservative perspective.", web:"https://www.dailywire.com" },
  aljazeera:  { desc:"Al Jazeera is a Qatari-funded international news network launched in 1996. It offers extensive Middle Eastern coverage and is known for providing a non-Western global perspective.", web:"https://www.aljazeera.com" },
  dw:         { desc:"Deutsche Welle is Germany's international public broadcaster, providing news in over 30 languages. It is funded by the German government and known for balanced factual reporting.", web:"https://www.dw.com" },
  france24:   { desc:"France 24 is a French international news channel launched in 2006, providing 24-hour coverage in French, English, and Arabic. It offers a distinctly European perspective on global events.", web:"https://www.france24.com" },
  rt:         { desc:"RT (formerly Russia Today) is a Russian state-funded international news network. It is widely considered a vehicle for Kremlin messaging and has been restricted or banned in several countries.", web:"https://www.rt.com" },
};

const RSS = "https://api.rss2json.com/v1/api.json?rss_url=";
const STOP = new Set(["the","and","that","this","with","from","have","been","will","were","they","their","there","when","what","which","about","would","could","should","more","also","than","into","over","after","before","being","some","such","even","said","says","just","like","very","only","both","then","them","these","those","other","where","while","since","still","well","does","each","most","make","many","much","your","here","come","back","news","year","time","people","first","last","made","take","want","used","need","part","days","week","months","years","world","according","including","following","during","within","without","between","through","against","around","under","until","because"]);

function strip(h=""){return h.replace(/<[^>]*>/g," ").replace(/&[a-z]+;/g," ").replace(/\s+/g," ").trim();}
function ago(d){const m=Math.floor((Date.now()-new Date(d))/60000);if(m<2)return"just now";if(m<60)return`${m}m`;if(m<1440)return`${Math.floor(m/60)}h`;return`${Math.floor(m/1440)}d`;}
function kw(t){return t.toLowerCase().replace(/[^\w\s]/g," ").split(/\s+/).filter(w=>w.length>3&&!STOP.has(w));}
function sim(a,b){const ka=new Set(kw(a)),kb=new Set(kw(b));if(!ka.size||!kb.size)return 0;let c=0;ka.forEach(k=>{if(kb.has(k))c++;});return c/Math.min(ka.size,kb.size);}
function group(arts){const g=[],u=new Set();arts.forEach((a,i)=>{if(u.has(i))return;const gr=[a];u.add(i);arts.forEach((b,j)=>{if(!u.has(j)&&sim(a.title,b.title)>=0.3){gr.push(b);u.add(j);}});g.push(gr);});return g.sort((a,b)=>b.length-a.length);}

const STEPS = ["Matching sources","Identifying facts","Detecting framing","Writing fact report"];
const CATS = [{id:"alle",label:"All"},{id:"politics",label:"Politics"},{id:"economy",label:"Economy"},{id:"world",label:"World"},{id:"technology",label:"Tech"},{id:"society",label:"Society"},{id:"blindspot",label:"Blindspot"}];
const CAT_KW = {politics:["election","president","congress","senate","parliament","government","minister","party","vote","policy","democrat","republican","legislation","political","coalition","treaty","sanctions","diplomacy"],economy:["economy","inflation","recession","gdp","stock","market","bank","interest","rate","trade","tariff","budget","debt","investment","unemployment","federal reserve","earnings","growth"],world:["war","conflict","military","nato","troops","attack","missile","ceasefire","refugee","crisis","summit","diplomacy","foreign","bilateral","un","sanctions","humanitarian"],technology:["artificial intelligence","ai","tech","software","chip","semiconductor","digital","cyber","data","startup","google","apple","meta","microsoft","openai","robot","algorithm","quantum"]};
function detectCat(t,d=""){const txt=(t+" "+d).toLowerCase();for(const[c,ks]of Object.entries(CAT_KW))if(ks.some(k=>txt.includes(k)))return c;return"society";}

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
  const [showSourceModal, setShowSourceModal] = useState(null);
  const [sourceFilter,    setSourceFilter]    = useState(null);
  const [speaking,          setSpeaking]          = useState(false);
  const [onboardingSkip,    setOnboardingSkip]    = useState(false);
  const [interests,         setInterests]         = useState([]);
  const [showPrefsModal,    setShowPrefsModal]     = useState(false);
  const [prefsDraft,        setPrefsDraft]         = useState([]);
  const [showDigestModal,   setShowDigestModal]    = useState(false);
  const [digest,            setDigest]            = useState(null);
  const [digestLoading,     setDigestLoading]     = useState(false);
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
    try{const saved=JSON.parse(localStorage.getItem('interests')||'[]');setInterests(saved);}catch{}
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

  async function generateDigest(){
    if(!groups.length)return;
    setDigestLoading(true);setShowDigestModal(true);setDigest(null);
    const titles=groups.slice(0,10).map((g,i)=>`${i+1}. ${g[0].title}`).join("\n");
    const prompt=`Here are the current top stories from the news feed:\n${titles}\n\nCreate a Weekly Digest in English. Respond ONLY as JSON without backticks:\n{"important":[<3 most important stories as strings>],"blindspot":"<biggest blindspot story: only covered by one political side>","sensational":"<most sensationalist headline>","balanced":"<most balanced story>","assessment":"<one-sentence overall media assessment this week>"}`;
    try{
      const res=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const raw=d.content?.[0]?.text||d.content?.map(i=>i.text||"").join("")||"";
      const match=raw.match(/\{[\s\S]*\}/);
      if(!match)throw new Error("No JSON");
      setDigest(JSON.parse(match[0]));
    }catch{setDigest({error:true});}
    finally{setDigestLoading(false);}
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
    if(cache[title]){setResult(cache[title]);setTab("snapshot");setTimeout(()=>panelRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),80);return;}
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
      const promptText=`Analyze this news article objectively. Respond entirely in ENGLISH.\n\nSTEP 1 – LANGUAGE: Detect the original language.\nSTEP 2 – TRANSLATION: If the article is NOT in English, translate it fully to English first, then analyze the translated text.\n\nARTICLE:\n${txt.slice(0,3000)}\n\nRespond ONLY as JSON without backticks:\n{"sprache":"<detected language, e.g. German, English, French, Arabic>","uebersetzung":<null if already English, otherwise full English translation as string>,"titel":"<max 70 chars>","scores":{"panik":<1-10>,"einseitigkeit":<1-10>,"faktendichte":<1-10>,"emotionalisierung":<1-10>},"fakten":[<3-4 verifiable facts in English>],"meinungen":[<3-4 opinions disguised as facts in English>],"fehlt":[<3-4 missing perspectives in English>],"reisser":[<2-3 sensationalist quotes in English>],"urteil":"<2 sentences verdict in English>","sachTitel":"<neutral title in English>","sach":"<180-220 word neutral fact report in English, paragraphs separated by \\n\\n>"}`;
      const res=await fetch("/api/analyse",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({messages:[{role:"user",content:promptText}]})});
      const d=await res.json();
      const raw=d.content?.[0]?.text||d.content?.map(i=>i.text||"").join("")||"";
      const match=raw.match(/\{[\s\S]*\}/);
      if(!match)throw new Error("Kein JSON");
      const p=JSON.parse(match[0]);
      clearInterval(iv);setResult(p);setTab("snapshot");
      if(g){setCache(prev=>({...prev,[g[0].title]:p}));setRead(prev=>new Set([...prev,g[0].title]));}
      setHistory(h=>[{title:p.titel,panik:p.scores?.panik,g,result:p,ts:Date.now()},...h].slice(0,15));
    }catch{clearInterval(iv);setResult({error:true});}
    finally{setAnalysing(false);}
  }

  const srcsOf=g=>SOURCES.filter(s=>g.some(a=>a.sid===s.id));
  const panikColor=v=>v<=3?"#4ade80":v<=6?"#fbbf24":"#f87171";
  const panikWord=v=>v<=3?"Low":v<=6?"Medium":"High";

  const filtered=groups.filter(g=>{
    const srcs=srcsOf(g);
    if(sourceFilter&&!g.some(a=>a.sid===sourceFilter))return false;
    if(bias==="blindspot"){const sc=srcs.map(s=>s.biasScore);if(!((sc.every(x=>x<0)||sc.every(x=>x>0))&&g.length>=2))return false;}
    else if(bias==="left"&&!srcs.some(s=>s.biasScore<-1))return false;
    else if(bias==="right"&&!srcs.some(s=>s.biasScore>1))return false;
    else if(bias==="fringe"&&!srcs.some(s=>Math.abs(s.biasScore)===3))return false;
    if(cat!=="alle"&&cat!=="blindspot"&&!g.some(a=>a.cat===cat))return false;
    if(q&&!g[0].title.toLowerCase().includes(q.toLowerCase()))return false;
    return true;
  }).sort((a,b)=>{
    if(!interests.length)return 0;
    const showBS=interests.includes("blindspot");
    const cats=interests.filter(i=>i!=="blindspot");
    const score=g=>{
      const srcs=srcsOf(g);const sc=srcs.map(s=>s.biasScore);
      const isBS=srcs.length>=2&&(sc.every(x=>x<0)||sc.every(x=>x>0));
      const matchesCat=!cats.length||g.some(a=>cats.includes(a.cat));
      return(matchesCat?2:0)+(showBS&&isBS?1:0);
    };
    return score(b)-score(a);
  });

  const TABS=[{id:"snapshot",label:"Snapshot"},{id:"headlines",label:"Headlines"},{id:"analyse",label:"AI Analysis"},{id:"fakten",label:"Facts"},{id:"fehlt",label:"What's Missing"},{id:"sach",label:"Fact Report"}];

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
        .ml-trending::-webkit-scrollbar{display:none;}
        .ml-trending>div:hover{opacity:0.85;}
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
            <div style={{fontSize:8,letterSpacing:4,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:1}}>THE FREE MIND</div>
          </div>

          {/* Search */}
          <div className="ml-search" style={{flex:1,maxWidth:380,position:"relative"}}>
            <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",width:14,height:14,color:"var(--text-sub)"}} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
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
            <span style={{fontSize:14}}>+</span> Add Text
          </button>
          <button onClick={load} disabled={loading} style={{background:loading?"var(--bg-panel)":"var(--accent)",border:"none",color:loading?"var(--text-sub)":"var(--bg)",padding:"5px 14px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6}}>
            {loading
              ? <><span style={{width:12,height:12,border:"1.5px solid var(--text-sub)",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>{loaded}/{SOURCES.length}</>
              : <>↻ Refresh</>}
          </button>
          <button className="ml-text-btn" onClick={generateDigest} disabled={loading||!groups.length} title="Weekly Digest"
            style={{background:"transparent",border:`1px solid ${T.border2}`,color:T.textMid,padding:"5px 14px",fontSize:12,fontFamily:"'Inter',sans-serif",borderRadius:4,cursor:loading||!groups.length?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,opacity:loading||!groups.length?0.4:1}}>
            📋 Digest
          </button>
          {history.length>0&&(
            <div style={{fontSize:11,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>{history.length} Analyses</div>
          )}
          {/* Preferences */}
          <button onClick={()=>{setPrefsDraft(interests);setShowPrefsModal(true);}} title="Personalize Feed"
            style={{background:"none",border:`1px solid ${interests.length?T.accentAlt:T.border2}`,color:interests.length?"var(--accent)":"var(--text-sub)",width:32,height:32,borderRadius:4,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15}}>
            ⚙
          </button>
          {/* Theme toggle */}
          <button onClick={()=>setDark(d=>!d)} title={dark?"Light Mode":"Dark Mode"}
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
          {[{id:"alle",label:"All Sources"},{id:"left",label:"Left"},{id:"right",label:"Right"},{id:"fringe",label:"Fringe"},{id:"blindspot",label:"⚠ Blindspot"}].map(f=>(
            <button key={f.id} onClick={()=>setBias(f.id)} className="ml-filter-btn" style={{background:"none",border:"none",color:bias===f.id?"var(--accent)":"var(--text-sub)",padding:"4px 10px",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:bias===f.id?600:400,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {f.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          {read.size>0&&<span style={{fontSize:11,color:"var(--accent)",fontFamily:"'Inter',sans-serif",marginRight:8}}>{read.size} of {filtered.length} analyzed</span>}
          <span style={{fontSize:11,color:T.border2,fontFamily:"'Inter',sans-serif"}}>{filtered.length} Stories</span>
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

          {/* Source filter active indicator */}
          {sourceFilter&&(()=>{
            const src=SOURCES.find(s=>s.id===sourceFilter);
            return (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",marginBottom:8,background:`${BIAS[src?.bias]?.dot||"#c8a96e"}11`,border:`1px solid ${BIAS[src?.bias]?.dot||"#c8a96e"}44`,borderRadius:4}}>
                <span style={{fontSize:11,color:BIAS[src?.bias]?.dot||"#c8a96e",fontFamily:"'Inter',sans-serif",fontWeight:600,letterSpacing:0.5}}>
                  Filtered: {src?.label}
                </span>
                <button onClick={()=>setSourceFilter(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:16,lineHeight:1,cursor:"pointer",padding:"0 4px"}}>×</button>
              </div>
            );
          })()}

          {/* Trending */}
          {!loading&&filtered.length>0&&(()=>{
            const trending=[...filtered].sort((a,b)=>srcsOf(b).length-srcsOf(a).length).slice(0,3);
            return (
              <div style={{marginBottom:2}}>
                <div style={{fontSize:9,letterSpacing:2.5,color:"var(--accent)",fontFamily:"'Inter',sans-serif",fontWeight:600,marginBottom:8,paddingTop:4}}>TRENDING NOW</div>
                <div className="ml-trending" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
                  {trending.map((g,i)=>{
                    const srcs=srcsOf(g);
                    const isSelected=sel&&sel[0].title===g[0].title;
                    const scores=srcs.map(s=>s.biasScore);
                    const isBlindspot=srcs.length>=2&&(scores.every(x=>x<0)||scores.every(x=>x>0));
                    const avg=srcs.reduce((a,s)=>a+s.biasScore,0)/Math.max(srcs.length,1);
                    const pct=((avg+3)/6)*100;
                    return (
                      <div key={i} onClick={()=>pick(g)} style={{minWidth:176,maxWidth:176,flexShrink:0,padding:"10px 12px",border:`1px solid ${isSelected?"var(--accent)":T.border2}`,borderRadius:6,cursor:"pointer",background:isSelected?"var(--accent-subtle)":"var(--bg-panel)",transition:"border-color 0.15s,background 0.15s",display:"flex",flexDirection:"column",gap:7}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:18,fontWeight:700,color:"var(--accent)",fontFamily:"'Inter',sans-serif",lineHeight:1}}>{srcs.length}</span>
                            <span style={{fontSize:9,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",letterSpacing:0.5}}>SOURCES</span>
                          </div>
                          {isBlindspot&&<span style={{fontSize:8,color:"#f87171",fontFamily:"'Inter',sans-serif",letterSpacing:0.5,border:"1px solid #f8717144",borderRadius:3,padding:"1px 4px"}}>BLINDSPOT</span>}
                        </div>
                        <p style={{fontSize:13,lineHeight:1.45,color:isSelected?T.textHigh:T.rowTitle,fontFamily:"'EB Garamond',Georgia,serif",fontWeight:600,margin:0,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{g[0].title}</p>
                        <div style={{marginTop:"auto"}}>
                          <div style={{position:"relative",height:4,background:`linear-gradient(to right,#818cf8,#3b82f6,#60a5fa,#94a3b8,#fb923c,#f87171,#fbbf24)`,borderRadius:2,marginBottom:5}}>
                            <div style={{position:"absolute",top:-2,left:`${Math.max(2,Math.min(98,pct))}%`,width:3,height:8,background:"white",borderRadius:2,transform:"translateX(-50%)",boxShadow:"0 0 4px rgba(0,0,0,0.5)"}}/>
                          </div>
                          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
                            {srcs.map(s=><div key={s.id} title={`${s.label} · ${BIAS[s.bias].label}`} style={{width:5,height:5,borderRadius:"50%",background:BIAS[s.bias].dot,opacity:0.85}}/>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{height:1,background:"var(--accent)",opacity:0.4,marginBottom:14}}/>
              </div>
            );
          })()}

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
                      <span className="tooltip-text">This story is only covered by one political side – the other side remains silent.</span>
                    </span>
                  )}
                  <span style={{fontSize:12,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginLeft:"auto"}}>{g[0].pubDate?ago(g[0].pubDate):""}</span>
                </div>
                <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:6}}>
                  <p className="row-title" style={{fontSize:17,lineHeight:1.6,color:isSelected?T.textHigh:isRead?"var(--text-sub)":T.rowTitle,fontFamily:"'EB Garamond',Georgia,serif",fontWeight:600,margin:0,transition:"color 0.15s"}}>
                    {g[0].title}
                  </p>
                  {isRead&&<span style={{color:"#4ade80",fontSize:11,fontFamily:"'Inter',sans-serif",flexShrink:0}}>✓ Analyzed</span>}
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                  {srcs.slice(0,4).map(s=>(
                    <span key={s.id} onClick={e=>{e.stopPropagation();setShowSourceModal(s);}} style={{fontSize:13,color:BIAS[s.bias].dot,fontFamily:"'Inter',sans-serif",opacity:0.7,cursor:"pointer"}}>
                      {s.label}{s.credibility!=="high"&&<span style={{color:CRED[s.credibility],marginLeft:2}}>·</span>}
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
              ← Back to Feed
            </button>
          )}

          {/* Manual input */}
          {manual&&(
            <div className="fi">
              <div style={{marginBottom:20}}>
                <div style={{fontSize:11,letterSpacing:2,color:T.textLow,fontFamily:"'Inter',sans-serif",marginBottom:12}}>ANALYZE YOUR OWN TEXT</div>

                {/* Tabs */}
                <div style={{display:"flex",gap:4,marginBottom:16,borderBottom:`1px solid ${T.border2}`}}>
                  {[{id:"text",label:"Paste Text"},{id:"url",label:"Enter URL"}].map(t=>(
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
                      placeholder="Paste article here…"/>
                    <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                      <button onClick={()=>analyse(manualTxt,null)} disabled={analysing||manualTxt.length<80}
                        style={{background:analysing||manualTxt.length<80?"var(--bg-panel)":"var(--accent)",color:analysing||manualTxt.length<80?"var(--text-sub)":"var(--bg)",border:"none",padding:"9px 20px",fontSize:12,fontFamily:"'Inter',sans-serif",fontWeight:600,borderRadius:4,cursor:"pointer"}}>
                        {analysing?"Analyzing…":"Analyze →"}
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
                          <><span style={{width:10,height:10,border:"1.5px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite",marginRight:6}}/> Loading…</>
                        ):"Load Article"}
                      </button>
                    </div>

                    {urlError&&(
                      <div style={{color:"#f87171",fontSize:13,fontFamily:"'Inter',sans-serif",marginBottom:12}}>Error: {urlError}</div>
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
                            {analysing?"Analyzing…":"Analyze →"}
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
                    <div style={{fontSize:9,color:T.textLow,fontFamily:"'Inter',sans-serif",letterSpacing:1}}>SOURCES</div>
                  </div>
                </div>
                {/* Source links */}
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {sel.map((a,i)=>{
                    const src=SOURCES.find(s=>s.id===a.sid);
                    return (
                      <div key={i} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",border:`1px solid ${BIAS[a.bias].dot}33`,borderRadius:20,fontSize:11,color:BIAS[a.bias].dot,fontFamily:"'Inter',sans-serif",background:`${BIAS[a.bias].dot}08`}}>
                        <span onClick={e=>{e.stopPropagation();if(src)setShowSourceModal(src);}} style={{cursor:"pointer"}}>{a.slabel}</span>
                        <a href={a.link} target="_blank" rel="noreferrer" style={{opacity:0.4,fontSize:9,color:BIAS[a.bias].dot}}>↗</a>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Language banner */}
              {result&&result.sprache&&result.sprache!=="Deutsch"&&(
                <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",marginBottom:16,background:"rgba(200,169,110,0.08)",border:"1px solid rgba(200,169,110,0.3)",borderRadius:4,fontSize:13,color:"#c8a96e",fontFamily:"'Inter',sans-serif"}}>
                  <span>🌍</span>
                  <span>Original language: <strong>{result.sprache}</strong> · Automatically translated</span>
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
                    {copied?"Copied ✓":"⎙ Share"}
                  </button>
                )}
              </div>

              {/* ── SNAPSHOT ── */}
              {tab==="snapshot"&&(
                analysing
                  ? <div style={{padding:"48px 0",textAlign:"center"}}>
                      <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:16}}>
                        {STEPS.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=step?"var(--accent)":T.border2,transition:"background 0.3s",animation:i===step?"pulse 1s infinite":"none"}}/>)}
                      </div>
                      <p style={{fontSize:12,color:T.textLow,fontFamily:"'Inter',sans-serif",letterSpacing:1}}>{STEPS[step].toUpperCase()}</p>
                    </div>
                  : result&&!result.error
                    ? <div className="fi" style={{display:"flex",flexDirection:"column",gap:14}}>
                        {/* Ampel + Listen Button */}
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:20,paddingTop:4}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{
                              width:72,height:72,borderRadius:"50%",margin:"0 auto 10px",
                              background:result.scores?.panik<=3?"#4ade80":result.scores?.panik<=6?"#fbbf24":"#f87171",
                              boxShadow:`0 0 30px ${result.scores?.panik<=3?"#4ade8055":result.scores?.panik<=6?"#fbbf2455":"#f8717155"}`,
                            }}/>
                            <div style={{fontSize:20,fontWeight:700,letterSpacing:3,fontFamily:"'Inter',sans-serif",color:result.scores?.panik<=3?"#4ade80":result.scores?.panik<=6?"#fbbf24":"#f87171"}}>
                              {result.scores?.panik<=3?"LOW RISK":result.scores?.panik<=6?"MODERATE":"HIGH ALERT"}
                            </div>
                          </div>
                          <button onClick={()=>{
                            if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return;}
                            const audioText=`${result.titel}. Panic level: ${result.scores?.panik} out of 10. ${result.fakten?.[0]}. ${result.urteil}. Missing perspectives: ${result.fehlt?.[0]}.`;
                            const utterance=new SpeechSynthesisUtterance(audioText);
                            utterance.lang="en-US";
                            utterance.rate=0.95;
                            utterance.onend=()=>setSpeaking(false);
                            utterance.onerror=()=>setSpeaking(false);
                            window.speechSynthesis.speak(utterance);
                            setSpeaking(true);
                          }} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:"none",border:`1px solid var(--accent)`,color:"var(--accent)",padding:"10px 16px",borderRadius:6,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:12,fontWeight:600,letterSpacing:0.5,flexShrink:0}}>
                            <span style={{fontSize:20}}>{speaking?"⏸":"▶"}</span>
                            {speaking?"Stop":"Listen"}
                          </button>
                        </div>
                        {/* Bullet points */}
                        <div style={{display:"flex",flexDirection:"column",gap:8,padding:"12px 14px",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,borderRadius:4}}>
                          {[
                            ["WHAT HAPPENED",result.fakten?.[0]||"—"],
                            ["WHO REPORTS",sel?srcsOf(sel).map(s=>s.label).join(" · "):"—"],
                            ["WHAT'S MISSING",result.fehlt?.[0]||"—"],
                          ].map(([lbl,val])=>(
                            <div key={lbl} style={{fontSize:14,lineHeight:1.6,fontFamily:"'EB Garamond',Georgia,serif",color:T.textBody}}>
                              <span style={{fontSize:9,letterSpacing:1.5,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",fontWeight:600}}>{lbl}: </span>{val}
                            </div>
                          ))}
                        </div>
                        {/* Bias-Balken */}
                        <div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:9,letterSpacing:1.5,fontFamily:"'Inter',sans-serif",marginBottom:5}}>
                            <span style={{color:"#818cf8"}}>LEFT</span>
                            <span style={{color:"var(--text-sub)"}}>POLITICAL BIAS</span>
                            <span style={{color:"#f87171"}}>RIGHT</span>
                          </div>
                          <div style={{position:"relative",height:14,background:"linear-gradient(to right,#818cf8,#3b82f6,#60a5fa,#94a3b8,#fb923c,#f87171,#fbbf24)",borderRadius:7}}>
                            {sel&&(()=>{
                              const srcs=srcsOf(sel);
                              const avg=srcs.reduce((a,s)=>a+s.biasScore,0)/Math.max(srcs.length,1);
                              const pct=((avg+3)/6)*100;
                              return <div style={{position:"absolute",top:-3,left:`${Math.max(2,Math.min(98,pct))}%`,width:5,height:20,background:"white",borderRadius:3,transform:"translateX(-50%)",boxShadow:"0 0 6px rgba(0,0,0,0.6)"}}/>;
                            })()}
                          </div>
                        </div>
                        {/* 4 Scores */}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
                          {[["PANIC",result.scores?.panik],["BIAS",result.scores?.einseitigkeit],["EMOTION",result.scores?.emotionalisierung],["FACTS",result.scores?.faktendichte]].map(([lbl,val])=>(
                            <div key={lbl} style={{textAlign:"center",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,borderRadius:4,padding:"12px 4px"}}>
                              <div style={{fontSize:32,fontWeight:700,color:panikColor(val),fontFamily:"'Inter',sans-serif",lineHeight:1}}>{val}</div>
                              <div style={{fontSize:9,letterSpacing:1.5,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:4}}>{lbl}</div>
                            </div>
                          ))}
                        </div>
                        {/* Fazit */}
                        <div style={{padding:"12px 14px",background:"var(--bg-panel)",border:`1px solid ${T.border2}`,borderLeft:`3px solid ${result.scores?.panik<=3?"#4ade80":result.scores?.panik<=6?"#fbbf24":"#f87171"}`,borderRadius:2}}>
                          <p style={{fontSize:15,lineHeight:1.7,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",margin:0,fontStyle:"italic"}}>{result.urteil}</p>
                        </div>
                      </div>
                    : <div style={{padding:"48px 0",textAlign:"center"}}>
                        <p style={{fontSize:12,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",letterSpacing:1}}>LOADING ANALYSIS…</p>
                      </div>
              )}

              {/* ── SCHLAGZEILEN ── */}
              {tab==="headlines"&&(
                <div>
                  {sel.length<2
                    ? <p style={{color:T.textLow,fontFamily:"'Inter',sans-serif",fontSize:13}}>Only one source – no comparison possible.</p>
                    : <>
                        <p style={{fontSize:12,color:T.textLow,fontFamily:"'Inter',sans-serif",marginBottom:20,letterSpacing:0.5}}>SAME STORY · DIFFERENT PERSPECTIVES · <span style={{color:T.textMid}}>Bold</span> = unique phrasing per source</p>
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
                                {a.cred!=="high"&&<span style={{fontSize:9,color:CRED[a.cred],fontFamily:"'Inter',sans-serif",marginTop:1}}>{a.cred==="medium"?"●●○":"●○○"}</span>}
                              </div>
                              {/* Headline */}
                              <div style={{flex:1,padding:"12px 16px",display:"flex",alignItems:"center"}}>
                                <p style={{fontSize:15,lineHeight:1.8,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>
                                  {words.map((w,wi)=>{
                                    const clean=w.replace(/[^\w]/g,"").toLowerCase();
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
                        {[["Panic Level",result.scores?.panik],["One-Sidedness",result.scores?.einseitigkeit],["Emotionalization",result.scores?.emotionalisierung],["Fact Density",11-(result.scores?.faktendichte||5)]].map(([l,v])=>(
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
                          <div style={{fontSize:14,fontWeight:600,color:panikColor(result.scores?.panik),fontFamily:"'Inter',sans-serif"}}>{panikWord(result.scores?.panik)} Panic Level</div>
                          <div style={{fontSize:13,color:T.textMid,fontFamily:"'EB Garamond',Georgia,serif",fontStyle:"italic",marginTop:2}}>{result.urteil}</div>
                        </div>
                      </div>
                      {result.reisser?.length>0&&(
                        <div>
                          <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:10}}>SENSATIONALIST LANGUAGE</div>
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
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:12}}>VERIFIED FACTS</div>
                    {result.fakten?.map((f,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:8,padding:"10px 12px",background:"var(--bg-panel)",borderLeft:"2px solid #4ade8044",border:"1px solid var(--border)",borderRadius:2}}>
                        <span style={{color:"#4ade80",flexShrink:0,fontSize:12,marginTop:1}}>✓</span>
                        <p style={{fontSize:15,lineHeight:1.7,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{f}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:12}}>OPINIONS AS FACTS</div>
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
                  <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginBottom:16}}>MISSING PERSPECTIVES & OPEN QUESTIONS</div>
                  {result.fehlt?.map((f,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:8,padding:"12px 14px",background:"var(--bg-panel)",alignItems:"flex-start",border:"1px solid var(--border)",borderRadius:2}}>
                      <div style={{width:18,height:18,borderRadius:"50%",background:"#1e3a8a",color:"#93c5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"'Inter',sans-serif",fontWeight:700,flexShrink:0,marginTop:1}}>?</div>
                      <p style={{fontSize:15,lineHeight:1.7,color:T.textBody,fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{f}</p>
                    </div>
                  ))}
                  <p style={{fontSize:11,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:14,lineHeight:1.6}}>Search for these aspects in other sources to get the full picture.</p>
                </div>
              )}

              {/* ── SACHBERICHT ── */}
              {tab==="sach"&&result&&!result.error&&(
                <div className="fi">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>AI FACT REPORT · FACTS ONLY · NO BIAS</div>
                    {result.uebersetzung&&(
                      <button onClick={()=>setShowOriginal(o=>!o)}
                        style={{background:"none",border:`1px solid rgba(200,169,110,0.4)`,color:"#c8a96e",fontSize:11,fontFamily:"'Inter',sans-serif",padding:"4px 10px",borderRadius:3,cursor:"pointer",whiteSpace:"nowrap"}}>
                        {showOriginal?"Show Fact Report":"Show Original"}
                      </button>
                    )}
                  </div>
                  {showOriginal&&result.uebersetzung?(
                    <>
                      <div style={{fontSize:9,letterSpacing:2,color:"#c8a96e",fontFamily:"'Inter',sans-serif",marginBottom:12}}>ENGLISH TRANSLATION · ORIGINAL TEXT</div>
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
                  <p style={{fontSize:10,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:16}}>AI-generated. Does not replace independent research.</p>
                </div>
              )}

              {result?.error&&<p style={{color:"#f87171",fontFamily:"'Inter',sans-serif",fontSize:13}}>Analysis failed. Please try again.</p>}

              {/* Show placeholder in analyse tab while not yet analysed */}
              {tab==="analyse"&&!result&&!analysing&&(
                <div style={{padding:"48px 0",textAlign:"center"}}>
                  <p style={{fontSize:12,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",letterSpacing:1}}>LOADING ANALYSIS…</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!sel&&!manual&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,gap:12}}>
              <div style={{width:40,height:40,borderRadius:"50%",border:`1px solid ${T.border2}`,display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-sub)",fontSize:18}}>◎</div>
              <p style={{fontSize:13,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",textAlign:"center",lineHeight:1.6}}>Select a story on the left<br/><span style={{fontSize:11,color:T.border2}}>AI analysis starts automatically</span></p>
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
        <span style={{fontSize:12,color:T.border2,fontFamily:"'Inter',sans-serif"}}>Mens Libera · The Free Mind · Prototype only</span>
      </div>

      {/* ── DIGEST MODAL ── */}
      {showDigestModal&&(()=>{
        const shareDigest=digest&&!digest.error?`📋 THIS WEEK IN MEDIA\n\nMENS LIBERA · The Free Mind\n\n🔥 MOST IMPORTANT STORIES:\n${digest.important?.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\n👁 BIGGEST BLINDSPOT:\n${digest.blindspot}\n\n🎭 MOST SENSATIONALIST:\n${digest.sensational}\n\n⚖️ MOST BALANCED:\n${digest.balanced}\n\n📝 MEDIA ASSESSMENT:\n${digest.assessment}\n\n🌐 mens-libera.vercel.app`:"";
        return (
          <div onClick={()=>setShowDigestModal(false)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:"#0b0b12",border:"1px solid var(--accent)",borderTop:"3px solid var(--accent)",padding:28,width:"100%",maxWidth:480,borderRadius:4,maxHeight:"90vh",overflowY:"auto"}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,letterSpacing:3,color:"var(--accent)",fontFamily:"'Inter',sans-serif",fontWeight:600}}>MENS LIBERA</div>
                  <div style={{fontSize:22,fontWeight:600,color:"#f0ece0",fontFamily:"'EB Garamond',Georgia,serif",lineHeight:1.2}}>This Week in Media</div>
                </div>
                <button onClick={()=>setShowDigestModal(false)} style={{background:"none",border:"none",color:"#6b7280",fontSize:20,lineHeight:1,cursor:"pointer",padding:"0 4px"}}>×</button>
              </div>

              {/* Loading */}
              {digestLoading&&(
                <div style={{padding:"48px 0",textAlign:"center"}}>
                  <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:14}}>
                    {[0,1,2,3].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"var(--accent)",animation:"pulse 1.4s infinite",animationDelay:`${i*0.2}s`}}/>)}
                  </div>
                  <p style={{fontSize:12,color:"#6b7280",fontFamily:"'Inter',sans-serif",letterSpacing:1}}>ANALYZING {groups.slice(0,10).length} STORIES…</p>
                </div>
              )}

              {/* Error */}
              {digest?.error&&<p style={{color:"#f87171",fontFamily:"'Inter',sans-serif",fontSize:13}}>Digest failed. Please try again.</p>}

              {/* Content */}
              {digest&&!digest.error&&!digestLoading&&(
                <div style={{display:"flex",flexDirection:"column",gap:16}}>

                  {/* Important stories */}
                  <div>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--accent)",fontFamily:"'Inter',sans-serif",marginBottom:10}}>🔥 MOST IMPORTANT STORIES</div>
                    {digest.important?.map((s,i)=>(
                      <div key={i} style={{display:"flex",gap:10,marginBottom:7,padding:"10px 12px",background:"#12101a",border:"1px solid #2a2535",borderRadius:3}}>
                        <span style={{fontSize:14,fontWeight:700,color:"var(--accent)",fontFamily:"'Inter',sans-serif",flexShrink:0,lineHeight:1.6}}>{i+1}</span>
                        <p style={{fontSize:15,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{s}</p>
                      </div>
                    ))}
                  </div>

                  {/* Blindspot */}
                  <div style={{padding:"12px 14px",background:"#1a0a0a",border:"1px solid #f8717133",borderLeft:"3px solid #f87171",borderRadius:3}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"#f87171",fontFamily:"'Inter',sans-serif",marginBottom:6}}>👁 BIGGEST BLINDSPOT</div>
                    <p style={{fontSize:15,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{digest.blindspot}</p>
                  </div>

                  {/* Sensational */}
                  <div style={{padding:"12px 14px",background:"#12101a",border:"1px solid #2a2535",borderRadius:3}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"#fbbf24",fontFamily:"'Inter',sans-serif",marginBottom:6}}>🎭 MOST SENSATIONALIST</div>
                    <p style={{fontSize:15,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0,fontStyle:"italic"}}>„{digest.sensational}"</p>
                  </div>

                  {/* Balanced */}
                  <div style={{padding:"12px 14px",background:"#0a1a0a",border:"1px solid #4ade8033",borderLeft:"3px solid #4ade80",borderRadius:3}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"#4ade80",fontFamily:"'Inter',sans-serif",marginBottom:6}}>⚖️ MOST BALANCED</div>
                    <p style={{fontSize:15,lineHeight:1.6,color:"#c8c4b9",fontFamily:"'EB Garamond',Georgia,serif",margin:0}}>{digest.balanced}</p>
                  </div>

                  {/* Assessment */}
                  <div style={{padding:"14px 16px",background:"#12101a",border:"1px solid var(--accent)",borderRadius:3}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"var(--accent)",fontFamily:"'Inter',sans-serif",marginBottom:6}}>📝 MEDIA ASSESSMENT</div>
                    <p style={{fontSize:16,lineHeight:1.7,color:"#f0ece0",fontFamily:"'EB Garamond',Georgia,serif",margin:0,fontStyle:"italic"}}>{digest.assessment}</p>
                  </div>

                  {/* Share */}
                  <div style={{display:"flex",gap:8,marginTop:4}}>
                    <button onClick={()=>{navigator.clipboard.writeText(shareDigest);}}
                      style={{flex:1,background:"none",border:"1px solid #2a2535",color:"#6b7280",padding:"10px 0",fontSize:12,fontFamily:"'Inter',sans-serif",cursor:"pointer",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                      ⎙ Copy
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareDigest)}`} target="_blank" rel="noreferrer"
                      style={{flex:1,background:"none",border:"1px solid #2a2535",color:"#25D366",padding:"10px 0",fontSize:12,fontFamily:"'Inter',sans-serif",cursor:"pointer",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",gap:6,textDecoration:"none"}}>
                      WhatsApp
                    </a>
                    <a href={`https://t.me/share/url?url=https://mens-libera.vercel.app&text=${encodeURIComponent(shareDigest)}`} target="_blank" rel="noreferrer"
                      style={{flex:1,background:"none",border:"1px solid #2a2535",color:"#229ED9",padding:"10px 0",fontSize:12,fontFamily:"'Inter',sans-serif",cursor:"pointer",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",gap:6,textDecoration:"none"}}>
                      Telegram
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── PREFERENCES MODAL ── */}
      {showPrefsModal&&(()=>{
        const OPTIONS=[
          {id:"politics",  label:"Politics"},
          {id:"economy",   label:"Economy"},
          {id:"world",     label:"World"},
          {id:"technology",label:"Technology"},
          {id:"society",   label:"Society"},
          {id:"blindspot", label:"Show Blindspots first"},
        ];
        const toggle=id=>setPrefsDraft(d=>d.includes(id)?d.filter(x=>x!==id):[...d,id]);
        const save=()=>{setInterests(prefsDraft);localStorage.setItem('interests',JSON.stringify(prefsDraft));setShowPrefsModal(false);};
        return (
          <div onClick={()=>setShowPrefsModal(false)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:"var(--bg-panel)",border:"1px solid var(--border)",borderTop:"3px solid var(--accent)",padding:28,width:"100%",maxWidth:380,borderRadius:4}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div>
                  <div style={{fontSize:16,fontWeight:600,color:"var(--text)",fontFamily:"'EB Garamond',Georgia,serif"}}>What topics interest you?</div>
                  <div style={{fontSize:11,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif",marginTop:3}}>Your feed will prioritize these categories.</div>
                </div>
                <button onClick={()=>setShowPrefsModal(false)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:20,lineHeight:1,cursor:"pointer",padding:"0 4px"}}>×</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:24}}>
                {OPTIONS.map((o,i)=>{
                  const checked=prefsDraft.includes(o.id);
                  const isBS=o.id==="blindspot";
                  return (
                    <label key={o.id} onClick={()=>toggle(o.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",borderRadius:4,cursor:"pointer",background:checked?"var(--accent-subtle)":"transparent",border:`1px solid ${checked?"var(--accent)":T.border2}`,transition:"all 0.15s",marginTop:isBS?8:0}}>
                      {isBS&&<div style={{height:1,position:"absolute",left:28,right:28,background:T.border2}}/>}
                      <div style={{width:18,height:18,borderRadius:3,border:`2px solid ${checked?"var(--accent)":T.border2}`,background:checked?"var(--accent)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                        {checked&&<span style={{color:"var(--bg)",fontSize:11,fontWeight:700,lineHeight:1}}>✓</span>}
                      </div>
                      <span style={{fontSize:14,color:checked?T.textHigh:"var(--text-sub)",fontFamily:"'Inter',sans-serif",fontWeight:checked?500:400,transition:"color 0.15s"}}>{o.label}</span>
                    </label>
                  );
                })}
              </div>
              <div style={{display:"flex",gap:8}}>
                {interests.length>0&&(
                  <button onClick={()=>{setInterests([]);setPrefsDraft([]);localStorage.removeItem('interests');setShowPrefsModal(false);}}
                    style={{flex:1,background:"none",border:`1px solid ${T.border2}`,color:"var(--text-sub)",padding:"10px 0",fontSize:13,fontFamily:"'Inter',sans-serif",cursor:"pointer",borderRadius:3}}>
                    Clear
                  </button>
                )}
                <button onClick={save}
                  style={{flex:2,background:"var(--accent)",color:"var(--bg)",border:"none",padding:"10px 0",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── SOURCE MODAL ── */}
      {showSourceModal&&(()=>{
        const s=showSourceModal;
        const info=SOURCE_INFO[s.id]||{desc:"No description available.",web:"#"};
        const biasColor=BIAS[s.bias]?.dot||"#94a3b8";
        const pct=((s.biasScore+3)/6)*100;
        const credLabel={high:"High",medium:"Medium",low:"Low"}[s.credibility];
        return (
          <div onClick={()=>setShowSourceModal(null)}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px"}}>
            <div onClick={e=>e.stopPropagation()}
              style={{background:"var(--bg-panel)",border:"1px solid var(--border)",borderTop:"3px solid var(--accent)",padding:28,width:"100%",maxWidth:400,borderRadius:4}}>

              {/* Header */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
                <div>
                  <div style={{fontSize:20,fontWeight:600,color:"var(--text)",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:4}}>{s.label}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:biasColor}}/>
                    <span style={{fontSize:11,color:biasColor,fontFamily:"'Inter',sans-serif",fontWeight:600,letterSpacing:0.5}}>{BIAS[s.bias]?.label}</span>
                    <span style={{fontSize:10,color:"var(--text-sub)",fontFamily:"'Inter',sans-serif"}}>·</span>
                    <span style={{fontSize:11,color:CRED[s.credibility],fontFamily:"'Inter',sans-serif",letterSpacing:0.5}}>Credibility: {credLabel}</span>
                  </div>
                </div>
                <button onClick={()=>setShowSourceModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:20,lineHeight:1,cursor:"pointer",padding:"0 4px",flexShrink:0}}>×</button>
              </div>

              {/* Description */}
              <p style={{fontSize:14,lineHeight:1.75,color:"var(--text-sub)",fontFamily:"'EB Garamond',Georgia,serif",marginBottom:18}}>{info.desc}</p>

              {/* Political placement */}
              <div style={{marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,letterSpacing:1.5,fontFamily:"'Inter',sans-serif",marginBottom:6}}>
                  <span style={{color:"#818cf8"}}>LEFT</span>
                  <span style={{color:"var(--text-sub)"}}>POLITICAL PLACEMENT</span>
                  <span style={{color:"#f87171"}}>RIGHT</span>
                </div>
                <div style={{position:"relative",height:14,background:"linear-gradient(to right,#818cf8,#3b82f6,#60a5fa,#94a3b8,#fb923c,#f87171,#fbbf24)",borderRadius:7}}>
                  <div style={{position:"absolute",top:-3,left:`${Math.max(2,Math.min(98,pct))}%`,width:5,height:20,background:"white",borderRadius:3,transform:"translateX(-50%)",boxShadow:"0 0 6px rgba(0,0,0,0.5)"}}/>
                </div>
                <div style={{textAlign:"center",marginTop:6,fontSize:11,color:biasColor,fontFamily:"'Inter',sans-serif",fontWeight:600}}>{BIAS[s.bias]?.label} · Score {s.biasScore > 0 ? "+":""}{s.biasScore}</div>
              </div>

              {/* Actions */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <button onClick={()=>{setSourceFilter(s.id);setShowSourceModal(null);}}
                  style={{width:"100%",background:"var(--accent)",color:"var(--bg)",border:"none",padding:"10px 0",fontSize:13,fontFamily:"'Inter',sans-serif",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                  See all articles from {s.label}
                </button>
                <a href={info.web} target="_blank" rel="noreferrer"
                  style={{display:"block",textAlign:"center",width:"100%",background:"none",color:"var(--text-sub)",border:"1px solid var(--border)",padding:"9px 0",fontSize:13,fontFamily:"'Inter',sans-serif",cursor:"pointer",borderRadius:3,boxSizing:"border-box"}}>
                  Visit official website ↗
                </a>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── SHARE MODAL ── */}
      {showShareModal&&result&&(()=>{
        const sc=result.scores||{};
        const bar=(v=0)=>`${'█'.repeat(v)}${'░'.repeat(10-v)}`;
        const shareText=`⚖️ MENS LIBERA · The Free Mind\n\n📰 ${result.titel}\n\n📊 ANALYSIS:\n- Panic Level: ${bar(sc.panik)} ${sc.panik}/10\n- One-Sidedness: ${bar(sc.einseitigkeit)} ${sc.einseitigkeit}/10\n- Emotionalization: ${bar(sc.emotionalisierung)} ${sc.emotionalisierung}/10\n- Fact Density: ${bar(sc.faktendichte)} ${sc.faktendichte}/10\n\n✅ FACTS:\n${result.fakten?.slice(0,3).map(f=>`• ${f}`).join('\n')}\n\n⚠️ OPINIONS AS FACTS:\n${result.meinungen?.slice(0,2).map(m=>`• ${m}`).join('\n')}\n\n❓ WHAT'S MISSING:\n${result.fehlt?.slice(0,2).map(f=>`• ${f}`).join('\n')}\n\n📝 CONCLUSION:\n${result.urteil}\n\n🔍 Analyzed with Mens Libera – The Free Mind\n🌐 mens-libera.vercel.app`;
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
              <p style={{fontSize:13,fontWeight:600,marginBottom:16,color:"var(--text)",fontFamily:"Inter, sans-serif"}}>Share Analysis</p>

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
                <span style={{fontSize:14,fontFamily:"Inter"}}>{copied?"Copied ✓":"Copy Text"}</span>
              </button>

              {typeof navigator!=="undefined"&&navigator.share&&(
                <button onClick={()=>navigator.share({title:"Mens Libera Analyse",text:shareText,url:"https://mens-libera.vercel.app"})}
                  style={rowStyle}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg)"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <div style={logoBox}>{iconShare}</div>
                  <span style={{fontSize:14,fontFamily:"Inter"}}>More Options</span>
                </button>
              )}

              <button onClick={()=>setShowShareModal(false)}
                style={{marginTop:16,width:"100%",background:"var(--accent)",color:"#0b0b12",border:"none",padding:"10px 0",fontSize:13,fontFamily:"Inter",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                Close
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── ONBOARDING MODAL ── */}
      {showOnboarding&&(()=>{
        const steps=[
          {icon:"⚖️",title:"Spot the Bias",text:"Every story shows colored dots – from Blue (Left) to Red (Right). See at a glance which side is reporting."},
          {icon:"🔴",title:"Find Blind Spots",text:"When only one political side covers a story, we warn you. The other side is deliberately silent."},
          {icon:"🔍",title:"AI Analysis",text:"Click on a story – the AI instantly analyzes panic level, framing, and what's missing from the article."},
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
                    ← Back
                  </button>
                )}
                {!isLast?(
                  <button onClick={()=>setOnboardingStep(s=>s+1)}
                    style={{flex:1,background:"var(--accent)",border:"none",color:"#0b0b12",padding:"10px 0",fontSize:13,fontFamily:"Inter",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                    Next →
                  </button>
                ):(
                  <button onClick={closeOnboarding}
                    style={{flex:1,background:"var(--accent)",border:"none",color:"#0b0b12",padding:"10px 0",fontSize:13,fontFamily:"Inter",fontWeight:600,cursor:"pointer",borderRadius:3}}>
                    Get Started →
                  </button>
                )}
              </div>

              {/* "Nicht mehr anzeigen" */}
              <label style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",fontSize:12,color:"var(--text-sub)",fontFamily:"Inter"}}>
                <input type="checkbox" checked={onboardingSkip} onChange={e=>setOnboardingSkip(e.target.checked)}
                  style={{accentColor:"var(--accent)",cursor:"pointer"}}/>
                Don't show again
              </label>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
