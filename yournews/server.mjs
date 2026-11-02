import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const MAX_ITEMS=30, TTL=60000, FETCH_TIMEOUT=12000;
const cache=new Map(), pending=new Map();
const feedHealth=new Map();
const MAX_CACHE_ENTRIES=240;
const HOT=['GB','WORLD','IE','FR','DE','US','IN','BR','IL','CA','AU','JP','ZA','NG','SG','AE','ES','IT','NL','SE','CH','PL','KR','MX','AR','KE'];
let hotCursor=0;const HOT_PER_MINUTE=8;
const TOPICS={all:'',world:'world',business:'economy business',technology:'technology',science:'science',health:'health',sports:'sports'};
const LOCALES={IN:['en-IN','IN','IN:en'],BR:['pt-BR','BR','BR:pt-419'],IE:['en-IE','IE','IE:en'],IL:['he','IL','IL:he'],GB:['en-GB','GB','GB:en'],US:['en-US','US','US:en'],FR:['fr','FR','FR:fr'],DE:['de','DE','DE:de'],ES:['es','ES','ES:es'],CA:['en-CA','CA','CA:en'],AU:['en-AU','AU','AU:en'],JP:['ja','JP','JP:ja']};
// Independent, source-attributed RSS feeds used when aggregators are slow or unavailable.
// All headlines remain linked to their publishers; we do not copy article bodies or photos.
const EDITORIAL_FEEDS={
 GB:[
  {name:'BBC News · UK',url:'https://feeds.bbci.co.uk/news/uk/rss.xml'},
  {name:'The Guardian · UK',url:'https://www.theguardian.com/uk/rss'}
 ],
 WORLD:[
  {name:'BBC News · World',url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
  {name:'The Guardian · World',url:'https://www.theguardian.com/world/rss'}
 ]
};
const BBC_TOPICS={
 business:'https://feeds.bbci.co.uk/news/business/rss.xml',
 technology:'https://feeds.bbci.co.uk/news/technology/rss.xml',
 science:'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
 health:'https://feeds.bbci.co.uk/news/health/rss.xml',
 sports:'https://feeds.bbci.co.uk/sport/rss.xml'
};
const LANGUAGE_LOCALES={en:['en-GB','GB','GB:en'],he:['he','IL','IL:he'],pt:['pt-BR','BR','BR:pt-419'],hi:['hi','IN','IN:hi'],ga:['en-IE','IE','IE:en'],ar:['ar','AE','AE:ar'],es:['es-ES','ES','ES:es'],fr:['fr','FR','FR:fr'],de:['de','DE','DE:de'],ru:['ru','RU','RU:ru'],zh:['zh-CN','CN','CN:zh-Hans'],ja:['ja','JP','JP:ja']};
let requestCounter=0, successCounter=0, lastBackground=null;

function clean(str=''){
  return String(str).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1')
    .replace(/<[^>]*>/g,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"')
    .replace(/&apos;|&#39;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi,(_,n)=>{try{return String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n))}catch{return ''}})
    .replace(/\s+/g,' ').trim().slice(0,500);
}
function tag(block,name){return (block.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i'))||[])[1]||''}
function parseRSS(xml,origin){
  const rows=xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi)||[];
  return rows.slice(0,65).map(row=>{
    const title=clean(tag(row,'title'));
    const link=clean(tag(row,'link'));
    const source=clean(tag(row,'source'))||new URL(link||'https://news.google.com').hostname;
    const dateRaw=tag(row,'pubDate');
    const time=Date.parse(clean(dateRaw));
    return {id:Buffer.from(link||title).toString('base64url').slice(0,55),
      title,source,link: /^https:\/\//i.test(link)?link:'',
      published:Number.isFinite(time)?new Date(time).toISOString():null,
      country:origin,kind:'Sourced headline',imageType:'editorial-illustration'};
  }).filter(x=>x.title&&x.link);
}
function feedURL(country,topic,place='',language='en'){
  const requested=LANGUAGE_LOCALES[language]||LANGUAGE_LOCALES.en;
  const native=LOCALES[country];
  const locale=(native&&native[0].split('-')[0]===language)?native:requested;
  const params=new URLSearchParams({hl:locale[0],gl:locale[1],ceid:locale[2]});
  if(country==='WORLD'&&topic==='all'&&!place)return 'https://news.google.com/rss?'+params;
  if(country==='GB'&&topic==='all'&&!place&&language==='en')return 'https://news.google.com/rss?'+params;
  let countryName='';
  if(country!=='WORLD'){
    try{countryName=new Intl.DisplayNames(['en'],{type:'region'}).of(country)||country}catch{countryName=country}
  }
  const keywords=[place,countryName,TOPICS[topic]||'', 'when:2d'].filter(Boolean).join(' ');
  params.set('q',keywords);
  return 'https://news.google.com/rss/search?'+params;
}
function selectFeeds(country,topic,place,language){
  const feeds=[{name:'Google News RSS',url:feedURL(country,topic,place,language)}];
  // Publisher feeds are not geographical filters. Use them only when their coverage
  // and language match the selected edition, never for a narrow location search.
  if(!place && language==='en' && (country==='GB'||country==='WORLD')){
    if(topic==='all'||topic==='world')feeds.push(...EDITORIAL_FEEDS[country]);
    else if(BBC_TOPICS[topic])feeds.push({name:'BBC News · '+topic,url:BBC_TOPICS[topic]});
  }
  return feeds;
}
async function fetchFeed(feed,country){
  const response=await fetch(feed.url,{
    signal:AbortSignal.timeout(FETCH_TIMEOUT),
    headers:{'user-agent':'Mozilla/5.0 (compatible; YourNews/1.0; editorial news index)','accept':'application/rss+xml,application/xml,text/xml;q=0.9,*/*;q=0.1'}
  });
  if(!response.ok)throw Error(feed.name+': HTTP '+response.status);
  const body=await response.text();
  if(body.length>3000000)throw Error(feed.name+': oversized response');
  const items=parseRSS(body,country).map(x=>({...x,source:x.source==='news.google.com'?feed.name:x.source||feed.name}));
  if(!items.length)throw Error(feed.name+': no RSS items');
  return items;
}
function pruneCache(){
  const now=Date.now();
  for(const [k,v] of cache)if(now-v.fetchedAt>15*60*1000)cache.delete(k);
  while(cache.size>MAX_CACHE_ENTRIES)cache.delete(cache.keys().next().value);
}
function dedupeItems(items){
  const seen=new Set();
  return items.filter(item=>{
    const key=(item.title||'').toLocaleLowerCase().replace(/\s*[-|]\s*[^-|]+$/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
    if(!key||seen.has(key)||!item.link)return false;
    seen.add(key);return true;
  }).sort((a,b)=>Date.parse(b.published||0)-Date.parse(a.published||0)).slice(0,MAX_ITEMS);
}
async function query(country,topic,place='',language='en'){
  const key=[country,topic,place.toLocaleLowerCase(),language].join('/'),previous=cache.get(key);
  if(previous&&Date.now()-previous.fetchedAt<TTL)return {...previous,fromCache:true};
  if(pending.has(key))return pending.get(key);
  const promise=(async()=>{
    requestCounter++;
    const feeds=selectFeeds(country,topic,place,language);
    const attempts=await Promise.allSettled(feeds.map(f=>fetchFeed(f,country)));
    const successes=attempts.flatMap((x,i)=>x.status==='fulfilled'?[{name:feeds[i].name,items:x.value}]:[]);
    const failures=attempts.flatMap((x,i)=>x.status==='rejected'?[feeds[i].name+': '+String(x.reason?.message||x.reason).slice(0,80)]:[]);
    const items=dedupeItems(successes.flatMap(x=>x.items));
    if(items.length){
      successCounter++;
      const result={country,topic,language,items,fetchedAt:Date.now(),isLive:true,
        provider:successes.map(x=>x.name).join(' + '),fromCache:false,warning:null,
        sources:successes.map(x=>({name:x.name,count:x.items.length})),
        // Source failures remain in diagnostics rather than confusing readers
        partialSourceFailures:failures.length};
      cache.delete(key);cache.set(key,result);
      feedHealth.set(country,{ok:true,checkedAt:new Date().toISOString(),count:items.length,providers:result.provider,failedSources:failures});
      pruneCache();return result;
    }
    const note=failures.join('; ').slice(0,240)||'No recent stories were available';
    feedHealth.set(country,{ok:false,checkedAt:new Date().toISOString(),error:note});
    if(previous)return {...previous,isLive:false,fromCache:true,warning:'Showing previously checked headlines; latest source check failed.'};
    return {country,topic,language,items:[],fetchedAt:null,isLive:false,provider:null,fromCache:false,
      warning:'Live sources temporarily unavailable. Please retry or choose another edition.'};
  })().finally(()=>pending.delete(key));
  pending.set(key,promise);return promise;
}
function headers(type='application/json; charset=utf-8',maxAge='no-store'){
  return {'content-type':type,'cache-control':maxAge,'x-content-type-options':'nosniff',
  'referrer-policy':'no-referrer','x-frame-options':'DENY','permissions-policy':'camera=(), microphone=(), geolocation=(self)',
  'content-security-policy':"default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'"};
}
function send(res,status,payload){res.writeHead(status,headers());res.end(JSON.stringify(payload))}
function validateCountry(raw){const c=String(raw||'WORLD').toUpperCase();return c==='WORLD'||/^[A-Z]{2}$/.test(c)?c:null}
const rate=new Map();
function allowed(ip){
 const now=Date.now(), v=rate.get(ip)||{t:now,n:0};
 if(now-v.t>60000){v.t=now;v.n=0}v.n++;rate.set(ip,v);return v.n<=90;
}
const app=await readFile(path.join(ROOT,'public','index.html'));
const script=await readFile(path.join(ROOT,'public','app.js'));
const stylesheet=await readFile(path.join(ROOT,'public','style.css'));
const visuals=await readFile(path.join(ROOT,'public','visuals.js'));
const fileMap={'/visuals.js':[visuals,'text/javascript; charset=utf-8'], '/': [app,'text/html; charset=utf-8'], '/index.html':[app,'text/html; charset=utf-8'],
'/app.js':[script,'text/javascript; charset=utf-8'],'/style.css':[stylesheet,'text/css; charset=utf-8']};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/', 'http://localhost');
  if(req.method!=='GET'){res.writeHead(405,headers());res.end();return}
  if(!allowed(req.socket.remoteAddress||'unknown'))return send(res,429,{error:'Rate limited'});
  if(url.pathname==='/api/health')return send(res,200,{ok:true,time:new Date().toISOString(),requestCounter,successCounter,lastBackground,cacheEntries:cache.size,sourceChecks:Object.fromEntries([...feedHealth].slice(-30)),feedCountries:HOT.length,backgroundBatchSize:HOT_PER_MINUTE,visualPolicy:'Topic-specific symbolic editorial SVG illustrations; not AI-generated event photos',policy:'Rotating 60-second batch checks; 60-second cache per feed; no guarantee of complete worldwide coverage; free hosting may pause when inactive'});
  if(url.pathname==='/api/news'){
    const country=validateCountry(url.searchParams.get('country'));
    const topic=String(url.searchParams.get('topic')||'all');
    if(!country||!(topic in TOPICS))return send(res,400,{error:'Invalid country or topic'});
    const language=String(url.searchParams.get('language')||'en').toLowerCase();
    if(!Object.hasOwn(LANGUAGE_LOCALES,language))return send(res,400,{error:'Unsupported feed language'});
    const place=String(url.searchParams.get('place')||'').trim();
    if(place.length>80||/[<>\u0000-\u001f]/.test(place))return send(res,400,{error:'Invalid place'});
    const result=await query(country,topic,place,language);
    return send(res,200,{...result,serverTime:new Date().toISOString()});
  }
  if(fileMap[url.pathname]){
    const [data,type]=fileMap[url.pathname];res.writeHead(200,headers(type,'public, max-age=120'));res.end(data);return;
  }
  send(res,404,{error:'Not found'});
 }catch(e){send(res,500,{error:'Internal server error'})}
});
server.listen(PORT,'0.0.0.0',()=>console.log('YourNews listening on '+PORT));
async function warm(){
 lastBackground=new Date().toISOString();
 const next=Array.from({length:HOT_PER_MINUTE},(_,i)=>HOT[(hotCursor+i)%HOT.length]);
 hotCursor=(hotCursor+HOT_PER_MINUTE)%HOT.length;
 await Promise.allSettled(next.map(c=>query(c,'all')));
}
setTimeout(warm,1500);
setInterval(warm,60000).unref();
setInterval(()=>{if(rate.size>500){rate.clear()}pruneCache()},600000).unref();
