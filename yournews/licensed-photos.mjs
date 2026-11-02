/**
 * Wikimedia Commons archive photography discovery.
 * Only allow openly licensed media with attribution metadata; never republish
 * publisher images from RSS without explicit reuse rights.
 * These are illustrative ARCHIVE photos, not verified photos of a news event.
 */
import {createHash} from 'node:crypto';

const ENDPOINT='https://commons.wikimedia.org/w/api.php';
const MAX_CACHE=450, POSITIVE_TTL=12*3600e3, NEGATIVE_TTL=30*60e3;
const MAX_INFLIGHT=3, TIMEOUT=6500;
const cache=new Map(), pending=new Map();
let inFlight=0, attempts=0, matches=0, errors=0;
const STOP=new Set(('the a an and or of in on at by for to from as with after before over under into is are was were will would could can this that these those new latest live says said about amid during ahead of today yesterday tomorrow uk us eu world global news update report reports how why what who where when his her its their our your amid more less than now one two three four five first second third government minister ministers president prime country city people local british london england united states').split(' '));
function plain(input){
 return String(input||'').replace(/<[^>]+>/g,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim().slice(0,300);
}
function keywords(title){
 const words=plain(title).replace(/\s*[-|–—]\s*[^-|–—]+$/,'').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[];
 return [...new Set(words.filter(w=>!STOP.has(w)&&!/^\d+$/.test(w)))].slice(0,9);
}
function licence(meta){
 const name=plain(meta?.LicenseShortName?.value||meta?.UsageTerms?.value||'');
 const url=String(meta?.LicenseUrl?.value||'');
 const allowed=/^(?:CC0(?:\s|$)|Public domain(?:\s|$)|CC BY(?:\s|$|-)(?!SA|NC|ND))/i.test(name);
 if(!allowed||/NC|ND|SA|noncommercial|no.derivatives|fair use|copyrighted/i.test(name))return null;
 if(url&&!/^https:\/\/(?:creativecommons\.org|www\.creativecommons\.org)\//i.test(url))return null;
 return {name,url:url||null};
}
function trustedURL(url,hosts){
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||!hosts.some(h=>parsed.hostname===h||parsed.hostname.endsWith('.'+h)))return null;
  return parsed.toString();
 }catch{return null}
}
function pickResult(pages,terms){
 const scored=[];
 for(const page of pages){
  const info=page?.imageinfo?.[0];
  if(!info||!/\.(jpe?g|png|webp)$/i.test(page.title||''))continue;
  const license=licence(info.extmetadata);
  if(!license)continue;
  const photoURL=trustedURL(info.thumburl||info.url,['upload.wikimedia.org']);
  const sourceURL=trustedURL(info.descriptionurl,['commons.wikimedia.org']);
  if(!photoURL||!sourceURL)continue;
  if(info.width<650||info.height<350)continue;
  const author=plain(info.extmetadata?.Artist?.value||info.extmetadata?.Credit?.value||'');
  // A CC BY photo without a meaningful author/credit cannot be attributed reliably.
  if(!author&&/^CC BY\b/i.test(license.name))continue;
  const searchable=plain(page.title+' '+(info.extmetadata?.ImageDescription?.value||'')).toLowerCase();
  const found=terms.filter(t=>searchable.includes(t));
  if(found.length<2)continue;
  const score=found.length+(info.width>=1000?0.5:0);
  scored.push({score,photo:{
   url:photoURL,sourceURL,author:author||'Wikimedia Commons contributor',
   license:license.name,licenseURL:license.url,
   caption:'Archive photograph · Illustrative, not verified as showing this event',
   alt:'Openly licensed archive photograph related to the headline, not a verified image of the reported event',
   attribution:'Photo: '+(author||'Wikimedia Commons contributor')+' · '+license.name+' · Wikimedia Commons',
   modified:'Scaled for display; not an event photograph',
   verifiedEventPhoto:false
  }});
 }
 return scored.sort((a,b)=>b.score-a.score)[0]?.photo||null;
}
async function lookup(story){
 const terms=keywords(story.title);
 if(terms.length<2)return null;
 const search=terms.slice(0,4).join(' ');
 const params=new URLSearchParams({
  action:'query',generator:'search',gsrsearch:'filetype:bitmap '+search,
  gsrnamespace:'6',gsrlimit:'12',prop:'imageinfo',iiprop:'url|size|extmetadata',
  iiurlwidth:'1100',format:'json',formatversion:'2'
 });
 const response=await fetch(ENDPOINT+'?'+params,{
  signal:AbortSignal.timeout(TIMEOUT),
  headers:{'user-agent':'YourNews/1.0 (https://yournews-global-live.onrender.com; Wikimedia Commons archive image search)',
   'accept':'application/json'}
 });
 if(!response.ok)throw Error('Commons HTTP '+response.status);
 const data=await response.json();
 const pages=data?.query?.pages||[];
 return pickResult(Array.isArray(pages)?pages:[],terms);
}
function prune(){
 const now=Date.now();
 for(const [k,v] of cache)if(v.expires<now)cache.delete(k);
 while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);
}
export function photoStatus(){
 return {provider:'Wikimedia Commons',archiveOnly:true,licensedOnly:true,
  inFlight,attempts,matches,errors,cacheEntries:cache.size,
  warning:'Photos are licensed archive illustrations, not verified documentary photos of the news event.'};
}
export async function findLicensedPhoto(story){
 if(!story||!story.title||!story.link)return null;
 const id=createHash('sha256').update(story.link+'|'+story.title).digest('hex').slice(0,40);
 const old=cache.get(id);
 if(old&&old.expires>Date.now())return old.photo;
 if(pending.has(id))return pending.get(id);
 if(inFlight>=MAX_INFLIGHT)return null;
 inFlight++;attempts++;
 const promise=lookup(story).then(photo=>{
  if(photo)matches++;
  cache.set(id,{photo,expires:Date.now()+(photo?POSITIVE_TTL:NEGATIVE_TTL)});
  prune();return photo;
 }).catch(()=>{
  errors++;cache.set(id,{photo:null,expires:Date.now()+NEGATIVE_TTL});
  return null;
 }).finally(()=>{inFlight--;pending.delete(id)});
 pending.set(id,promise);
 return promise;
}
