import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const MAX_ITEMS=30, TTL=60000, FETCH_TIMEOUT=12000;
const cache=new Map(), pending=new Map();
const HOT=['WORLD','IN','BR','IE','IL','GB','US'];
const TOPICS={all:'',world:'world',business:'economy business',technology:'technology',science:'science',health:'health',sports:'sports'};
const LOCALES={IN:['en-IN','IN','IN:en'],BR:['pt-BR','BR','BR:pt-419'],IE:['en-IE','IE','IE:en'],IL:['he','IL','IL:he'],GB:['en-GB','GB','GB:en'],US:['en-US','US','US:en'],FR:['fr','FR','FR:fr'],DE:['de','DE','DE:de'],ES:['es','ES','ES:es'],CA:['en-CA','CA','CA:en'],AU:['en-AU','AU','AU:en'],JP:['ja','JP','JP:ja']};
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
function feedURL(country,topic){
  const locale=LOCALES[country]||['en-US','US','US:en'];
  const params=new URLSearchParams({hl:locale[0],gl:locale[1],ceid:locale[2]});
  if(country==='WORLD'&&topic==='all') return 'https://news.google.com/rss?'+params;
  let countryName='';
  if(country!=='WORLD'){
    try{countryName=new Intl.DisplayNames(['en'],{type:'region'}).of(country)||country}catch{countryName=country}
  }
  const keywords=[countryName,TOPICS[topic]||'', 'when:2d'].filter(Boolean).join(' ');
  params.set('q',keywords);
  return 'https://news.google.com/rss/search?'+params;
}
async function query(country,topic){
  const key=country+'/'+topic, previous=cache.get(key);
  if(previous && Date.now()-previous.fetchedAt<TTL) return {...previous,fromCache:true};
  if(pending.has(key))return pending.get(key);
  const promise=(async()=>{
    requestCounter++;
    try{
      const signal=AbortSignal.timeout(FETCH_TIMEOUT);
      const response=await fetch(feedURL(country,topic),{signal,headers:{'user-agent':'YourNewsPreview/0.2 (+news-headlines; source-attributed)','accept':'application/rss+xml,text/xml;q=0.9,*/*;q=0.1'}});
      if(!response.ok)throw new Error('RSS upstream HTTP '+response.status);
      const body=await response.text();
      if(body.length>3000000)throw new Error('Feed too large');
      let items=parseRSS(body,country);
      if(!items.length)throw new Error('No stories returned by the feed');
      items=[...new Map(items.map(x=>[x.link,x])).values()].slice(0,MAX_ITEMS);
      successCounter++;
      const result={country,topic,items,fetchedAt:Date.now(),isLive:true,provider:'Google News RSS',sourceURL:feedURL(country,topic),fromCache:false,warning:null};
      cache.set(key,result);
      return result;
    }catch(error){
      const note=String(error?.message||error).slice(0,160);
      if(previous)return {...previous,isLive:false,fromCache:true,warning:'Showing last cached results; refresh failed: '+note};
      return {country,topic,items:[],fetchedAt:null,isLive:false,provider:'Google News RSS',fromCache:false,warning:'Live feed unavailable: '+note};
    }finally{pending.delete(key)}
  })();
  pending.set(key,promise);return promise;
}
function headers(type='application/json; charset=utf-8',maxAge='no-store'){
  return {'content-type':type,'cache-control':maxAge,'x-content-type-options':'nosniff',
  'referrer-policy':'strict-origin-when-cross-origin','x-frame-options':'DENY','permissions-policy':'camera=(), microphone=(), geolocation=()',
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
const fileMap={'/': [app,'text/html; charset=utf-8'], '/index.html':[app,'text/html; charset=utf-8'],
'/app.js':[script,'text/javascript; charset=utf-8'],'/style.css':[stylesheet,'text/css; charset=utf-8']};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/', 'http://localhost');
  if(req.method!=='GET'){res.writeHead(405,headers());res.end();return}
  if(!allowed(req.socket.remoteAddress||'unknown'))return send(res,429,{error:'Rate limited'});
  if(url.pathname==='/api/health')return send(res,200,{ok:true,time:new Date().toISOString(),requestCounter,successCounter,lastBackground,cacheEntries:cache.size,policy:'60-second in-memory cache; free hosting may pause when inactive'});
  if(url.pathname==='/api/news'){
    const country=validateCountry(url.searchParams.get('country'));
    const topic=String(url.searchParams.get('topic')||'all');
    if(!country||!(topic in TOPICS))return send(res,400,{error:'Invalid country or topic'});
    const result=await query(country,topic);
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
 await Promise.allSettled(HOT.map(c=>query(c,'all')));
}
setTimeout(warm,1500);
setInterval(warm,60000).unref();
setInterval(()=>{if(rate.size>500){rate.clear()}},600000).unref();
