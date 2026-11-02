const $=id=>document.getElementById(id);
const CODES='AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR HR CU CW CY CZ CI DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RO RU RW RE BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TM TC TV TR UG UA AE GB US UM UY UZ VU VE VN VG VI WF EH YE ZM ZW AX'.split(' ');
const languages={he:'עברית',en:'English',pt:'Português',hi:'हिन्दी',ga:'Gaeilge',ar:'العربية',es:'Español',fr:'Français',de:'Deutsch',ru:'Русский',zh:'中文',ja:'日本語'};
const dictionary={
 he:{checking:'בודק עדכונים...',live:'מקורות חדשות זמינים',offline:'תקלה בחיבור לחדשות',global:'מהדורה עולמית',motto:'חדשות מעניינות. דיווח אחראי.',nextgen:'A BETTER WAY TO STAY INFORMED',heroTitle:'העולם שלך.\nהחדשות שלך.',heroDesc:'בחר מדינה, שפה ותחומי עניין. קבל כותרות ממקורות עיתונאיים, עם שליטה בחוויית הקריאה שלך.',artNote:'איור דיגיטלי להמחשה • לא תיעוד חדשותי',startReading:'לקריאת החדשות ←',setPrefs:'התאמה אישית ⚙',yourEdition:'YOUR EDITION',country:'מדינה / אזור',language:'שפת הממשק',topic:'נושא',search:'חיפוש בכותרות',searchPlaceholder:'מה מעניין אותך?',allTopics:'כל הנושאים',world:'חדשות העולם',business:'עסקים וכלכלה',technology:'טכנולוגיה',science:'מדע',health:'בריאות',sports:'ספורט',latest:'THE LATEST',refresh:'רענון',sourcelabel:'הכותרות מתעדכנות במהלך היום.',community:'COMMUNITY JOURNALISM',storyTitle:'יש לך ידיעה לספר?',storyDesc:'העבר דיווח לעורך. בשלב זה אפשר להכין טיוטה במכשיר; פרסום ציבורי כפוף לאימות ולמערכת עריכה שטרם חוברה.',shareStory:'הכן ידיעה ↗',footer:'עיתונות מכובדת · בחירה אישית · מקורות שקופים',prefsTitle:'העדפות אישיות',prefsIntro:'ההעדפות נשמרות בדפדפן שלך בלבד. אין מעקב שרת אחר היסטוריית הקריאה.',history:'שמור מקומית ידיעות שקראתי לצורך התאמה',styleLabel:'סגנון התוכן',save:'שמירה',deleteData:'מחק את המידע המקומי שלי',reportTitle:'הכן ידיעה',reportIntro:'טיוטות אינן נשלחות לשרת או מתפרסמות. אין לפרסם פרטים אישיים של אחרים ללא רשות.',headline:'כותרת',details:'פרטי הידיעה',sourceUrl:'קישור למקור (רשות)',saveDraft:'שמור טיוטה במכשיר',source:'מקור',readOriginal:'לקריאת הידיעה במקור ↗',saving:'נשמר במכשיר',noNews:'אין חדשות זמינות כעת עבור בחירה זו. נסה מדינה או נושא אחר.',failed:'חיבור מקור החדשות לא הצליח. נסה שוב בהמשך.',updating:'מתעדכן כל דקה כל עוד האתר פתוח',from:'חדשות',saved:'שמור',unsave:'הסר סימון',savedMsg:'נשמרו ההעדפות',localDraft:'הטיוטה נשמרה בדפדפן ולא פורסמה',draftRequired:'יש למלא כותרת ופרטי ידיעה',preferredNote:'עדיפות הסגנון נשמרת, אך סינון תוכן קהילתי עדיין אינו פעיל.'},
 en:{checking:'Checking sources...',live:'News sources available',offline:'News feed unavailable',global:'BRITISH EDITION · GLOBAL OUTLOOK',motto:'A British perspective. A global outlook.',nextgen:'A BETTER WAY TO STAY INFORMED',heroTitle:'Your world.\nYour news.',heroDesc:'Start with the United Kingdom. Explore the world. Discover sourced headlines, local perspectives and illustrated coverage, refreshed throughout the day.',artNote:'Editorial artwork · not an event photograph',startReading:'Explore the headlines →',setPrefs:'Personalize ⚙',yourEdition:'YOUR EDITION',country:'Country / region',language:'Interface language',topic:'Topic',search:'Search headlines',searchPlaceholder:'What interests you?',allTopics:'All topics',world:'World news',business:'Business',technology:'Technology',science:'Science',health:'Health',sports:'Sports',latest:'THE LATEST',refresh:'Refresh',sourcelabel:'Headlines are updated throughout the day.',community:'COMMUNITY JOURNALISM',storyTitle:'Have a story to share?',storyDesc:'Prepare a story tip on this device. Public submissions and editorial verification are not connected yet.',shareStory:'Prepare a tip ↗',footer:'Dignified reporting · Personal choice · Transparent sources',prefsTitle:'Your preferences',prefsIntro:'Your settings stay in this browser. No server-side reading history tracking.',history:'Store reading history locally for personalization',styleLabel:'Content style',save:'Save',deleteData:'Delete my local data',reportTitle:'Prepare a news tip',reportIntro:'Drafts stay on your device and are not published. Do not disclose other people’s personal information without permission.',headline:'Headline',details:'Story details',sourceUrl:'Source link (optional)',saveDraft:'Save draft locally',source:'Publisher',readOriginal:'Read original report ↗',saving:'Saved locally',noNews:'No stories are available for this selection right now. Try another topic or country.',failed:'Could not connect to the news provider. Try again later.',updating:'Checking for new headlines every minute · Sourced reports',from:'News from',saved:'Bookmark',unsave:'Remove bookmark',savedMsg:'Preferences saved',localDraft:'Draft saved in your browser. It was not published.',draftRequired:'Please enter a headline and details.',preferredNote:'Your chosen style is saved; community-specific editorial filtering is not active yet.'},
 pt:{heroTitle:'Seu mundo.\nSuas notícias.',heroDesc:'Escolha país, idioma e assuntos. Leia manchetes de fontes identificadas.',country:'País / região',language:'Idioma da interface',topic:'Assunto',search:'Buscar manchetes',latest:'ÚLTIMAS NOTÍCIAS',refresh:'Atualizar',startReading:'Ler notícias →',from:'Notícias de',readOriginal:'Leia na fonte ↗',noNews:'Nenhuma notícia disponível para esta seleção.',failed:'Não foi possível carregar as notícias.'},
 hi:{heroTitle:'आपकी दुनिया।\nआपकी खबरें।',heroDesc:'देश, भाषा और विषय चुनें। विश्वसनीय स्रोतों से शीर्षक पढ़ें।',country:'देश / क्षेत्र',language:'भाषा',topic:'विषय',search:'समाचार खोजें',latest:'ताज़ा खबरें',refresh:'रिफ्रेश',startReading:'खबरें पढ़ें →',from:'समाचार',readOriginal:'मूल स्रोत पढ़ें ↗',noNews:'इस चयन के लिए अभी खबरें नहीं हैं।'},
 ga:{heroTitle:'Do dhomhan.\nDo nuacht.',heroDesc:'Roghnaigh tír, teanga agus ábhair. Léigh ceannlínte ó fhoinsí ainmnithe.',country:'Tír / réigiún',language:'Teanga',topic:'Ábhar',search:'Cuardaigh ceannlínte',latest:'AN NUACHT IS DÉANAÍ',refresh:'Athnuaigh',startReading:'Léigh an nuacht →',from:'Nuacht ó',readOriginal:'Léigh ag an bhfoinse ↗',noNews:'Níl nuacht ar fáil don rogha seo faoi láthair.'}};
// A one-time edition migration makes the first impression British/English, without preventing later changes.
if(localStorage.getItem('yn_edition')!=='british-v1'){
 localStorage.setItem('yn_edition','british-v1');
 localStorage.setItem('yn_country','GB');
 localStorage.setItem('yn_language','en');
 localStorage.removeItem('yn_place');
 sessionStorage.clear();
}
const state={country:localStorage.getItem('yn_country')||'GB',language:localStorage.getItem('yn_language')||'en',topic:localStorage.getItem('yn_topic')||'all',place:localStorage.getItem('yn_place')||'',stories:[],notice:'',fetchedAt:null};
function tr(key){return dictionary[state.language]?.[key]||dictionary.en[key]||key}
function setLanguage(l){state.language=l;document.documentElement.lang=l==='en'?'en-GB':l;document.documentElement.dir=['he','ar'].includes(l)?'rtl':'ltr';localStorage.setItem('yn_language',l);document.querySelectorAll('[data-i18n]').forEach(el=>{const v=tr(el.dataset.i18n);el.textContent=v; if(el.dataset.i18n==='heroTitle')el.style.whiteSpace='pre-line'});$('search').placeholder=tr('searchPlaceholder');render();updateStatus(Boolean(state.stories.length))}
function displayCountry(code){if(code==='WORLD')return state.language==='he'?'העולם':'World';try{return new Intl.DisplayNames([state.language,'en'],{type:'region'}).of(code)||code}catch{return code}}
function populateCountries(){const sel=$('country');const frag=document.createDocumentFragment();for(const c of CODES){const opt=document.createElement('option');opt.value=c;opt.textContent=(c==='IN'?'🇮🇳 ':c==='BR'?'🇧🇷 ':c==='IE'?'🇮🇪 ':c==='IL'?'🇮🇱 ':'')+displayCountry(c);frag.appendChild(opt)}sel.appendChild(frag);sel.value=state.country; if(sel.value!==state.country){state.country='WORLD';sel.value='WORLD'}}
function timeLabel(iso){if(!iso)return '—';try{return new Intl.DateTimeFormat(state.language,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(iso))}catch{return iso}}
function updateStatus(isLive){const node=$('status');node.classList.toggle('ready',isLive);node.querySelector('span').textContent=isLive?tr('live'):tr('offline')}
function showWarning(msg){const box=$('warning');box.hidden=!msg;box.textContent=msg||''}
function makeStory(story,edition=state.country){
 const card=document.createElement('article');card.className='news';
 const visual=window.YourNewsIllustration?window.YourNewsIllustration(story,state.topic):null;
 if(visual){
  const figure=document.createElement('figure');figure.className='newsvisual';
  const image=document.createElement('img');image.src=visual.url;image.alt=visual.alt;image.loading='lazy';image.decoding='async';image.width=800;image.height=450;
  const figcaption=document.createElement('figcaption');figcaption.textContent='Editorial illustration · Not a photograph of this event';
  let licensedReady=false;
  const editorialCaption=state.language==='he'?'איור מערכתי · אינו צילום מהאירוע':'Editorial illustration · Not a photograph of this event';
  figcaption.textContent=editorialCaption;
  image.addEventListener('error',()=>{image.src=visual.url;image.alt=visual.alt;figcaption.textContent=editorialCaption;figure.querySelector('.photo-credit')?.remove();},{once:true});
  figure.append(image,figcaption);card.append(figure);
  // Licensed archive photos take precedence when metadata supports reuse and relevance.
  if(story.id){
   fetch('/api/photo?id='+encodeURIComponent(story.id)).then(r=>r.ok?r.json():null).then(result=>{
    const p=result?.photo;
    if(!p||!/^https:\/\/upload\.wikimedia\.org\//.test(p.url))return;
    const licensed=new Image();licensed.referrerPolicy='no-referrer';
    licensed.onload=()=>{
      licensedReady=true;image.src=p.url;image.alt=p.alt;figcaption.textContent=state.language==='he'?'תצלום ארכיון להמחשה · לא אומת כתיעוד האירוע':p.caption;
      figure.querySelector('.photo-credit')?.remove();
      const credit=document.createElement('a');credit.href=p.sourceURL;credit.target='_blank';credit.rel='noopener noreferrer';credit.className='photo-credit';credit.textContent=p.attribution;
      figure.append(credit);
    };
    licensed.src=p.url;
   }).catch(()=>{});
  }
  // Replace the contextual vector with a source-grounded AI illustration only if generated.
  if(story.imageId&&story.imageUrl){
   const ai=new Image();ai.onload=()=>{if(licensedReady)return;image.src=ai.src;image.alt=state.language==='he'?'איור AI בנושא הידיעה, אינו צילום תיעודי':'AI-generated editorial illustration of the reported subject; not a documentary photograph';figcaption.textContent=state.language==='he'?'איור שנוצר ב־AI · אינו צילום מהאירוע':'AI-generated editorial illustration · Not a photograph of this event';};
   ai.onerror=()=>{};ai.src=story.imageUrl;
  }
 }
 const body=document.createElement('div');body.className='newsbody';
 const meta=document.createElement('div');meta.className='meta';
 const kind=document.createElement('span');kind.className='newstag';kind.textContent=edition==='GB'?'UK EDITION':tr('from')+' '+displayCountry(story.country);
 const published=document.createElement('time');published.textContent=timeLabel(story.published);
 meta.append(kind,published);
 const headline=document.createElement('h3');headline.textContent=state.language==='he'&&story.displayTitleHe?story.displayTitleHe:(story.displayTitle||story.title);
 body.append(meta,headline);
 const summary=state.language==='he'&&story.summaryHe?story.summaryHe:story.summary;
 if(summary){const paragraph=document.createElement('p');paragraph.className='story-summary';paragraph.textContent=summary;body.append(paragraph);}
 const provenance=document.createElement('details');provenance.className='editorial-details';
 const disclosure=document.createElement('summary');disclosure.textContent=state.language==='he'?'פרטי הדיווח':'Editorial details';
 const source=document.createElement('a');source.href=story.link;source.target='_blank';source.rel='noopener noreferrer';source.textContent=story.source+' · '+story.title;
 provenance.append(disclosure,source);body.append(provenance);
 const foot=document.createElement('div');foot.className='newsfoot';
 const link=document.createElement('a');link.href=story.link;link.rel='noopener noreferrer';link.target='_blank';link.textContent=state.language==='he'?'מידע נוסף ↗':'Further reading ↗';link.addEventListener('click',()=>recordRead(story));
 const bookmark=document.createElement('button');bookmark.className='bookmark';bookmark.type='button';
 const favs=new Set(loadArray('yn_bookmarks'));bookmark.classList.toggle('saved',favs.has(story.id));bookmark.textContent=favs.has(story.id)?'★ '+tr('unsave'):'☆ '+tr('saved');
 bookmark.onclick=()=>{const s=new Set(loadArray('yn_bookmarks'));if(s.has(story.id))s.delete(story.id);else s.add(story.id);localStorage.setItem('yn_bookmarks',JSON.stringify([...s].slice(-250)));render()};
 foot.append(link,bookmark);card.append(body,foot);return card;
}
let illustratedStories=[];
async function loadIllustratedStories(){
 try{
  const response=await fetch('/api/images/pilot',{cache:'no-store'});
  if(!response.ok)return;
  const data=await response.json();illustratedStories=Array.isArray(data.items)?data.items:[];
  renderIllustratedStories();
 }catch{}
}
function renderIllustratedStories(){
 const section=$('illustratedStories');if(!section)return;
 section.hidden=illustratedStories.length===0;
 $('illustratedTitle').textContent=state.language==='he'?'ידיעות בתמונה':'Stories in focus';
 $('illustratedNote').textContent=state.language==='he'?'הידיעות הבולטות, עם איורי AI מסומנים להמחשה.':'A closer look at current stories. AI illustrations are clearly labelled.';
 $('illustratedGrid').replaceChildren(...illustratedStories.map(s=>makeStory({...s,country:'WORLD',imageId:s.id},'WORLD')));
}
function loadArray(k){try{const r=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(r)?r:[]}catch{return []}}
function recordRead(story){if(localStorage.getItem('yn_track')!=='yes')return;const history=loadArray('yn_history');history.push({id:story.id,country:story.country,at:new Date().toISOString()});localStorage.setItem('yn_history',JSON.stringify(history.slice(-120)))}
function render(){renderIllustratedStories();const feed=$('newsgrid');feed.replaceChildren();const q=$('search').value.trim().toLocaleLowerCase();const stories=state.stories.filter(s=>(s.title+' '+s.source).toLocaleLowerCase().includes(q));const title=$('feedtitle');title.textContent=state.country==='WORLD'?(state.language==='he'?'חדשות מכל העולם':'Around the world'):(state.country==='GB'&&state.language==='en'?'Latest from Britain':tr('from')+' '+displayCountry(state.country));
 $('feedsubtitle').textContent=tr('updating');$('updateTime').textContent=state.fetchedAt?'Source check: '+timeLabel(new Date(state.fetchedAt).toISOString()):'';
 if(!stories.length){const node=document.createElement('div');node.className='loading';node.textContent=tr('noNews');feed.append(node);return}
 for(const story of stories)feed.append(makeStory(story));
}
let fetchSequence=0;
async function loadNews(force=false){
 const seq=++fetchSequence;const key='yn_feed_'+state.country+'_'+state.topic+'_'+state.place+'_'+state.language;
 if(!force){try{const saved=JSON.parse(sessionStorage.getItem(key)||'null');if(saved&&Date.now()-saved.fetchedAt<55000){state.stories=saved.items;state.fetchedAt=saved.fetchedAt;render();updateStatus(true);return}}catch{}}
 $('refresh').disabled=true;
 try{
 const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),18000);
 const res=await fetch('/api/news?country='+encodeURIComponent(state.country)+'&topic='+encodeURIComponent(state.topic)+'&place='+encodeURIComponent(state.place)+'&language='+encodeURIComponent(state.language),{signal:ctrl.signal,cache:'no-store'});
 clearTimeout(timeout);if(!res.ok)throw new Error('HTTP '+res.status);
 const data=await res.json();if(seq!==fetchSequence)return;
 state.stories=Array.isArray(data.items)?data.items:[];state.fetchedAt=data.fetchedAt;
 if(data.fetchedAt)sessionStorage.setItem(key,JSON.stringify({items:state.stories,fetchedAt:data.fetchedAt}));
 updateStatus(Boolean(data.isLive||data.fromCache)&&state.stories.length>0);
 showWarning(data.warning?tr('failed')+' '+data.warning:'');
 }catch(error){if(seq!==fetchSequence)return;updateStatus(false);showWarning(tr('failed')+' ('+String(error.message).slice(0,80)+')')}
 finally{if(seq===fetchSequence){$('refresh').disabled=false;render()}}
}
function setCountry(c){state.country=c;localStorage.setItem('yn_country',c);$('country').value=c;document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active',b.dataset.country===c));loadNews(true)}

// Near Me: opt-in one-shot location only. Do not store or track raw GPS coordinates.
function initNearMe(){
 const mode=$('nearMode'),manual=$('nearManual'),radius=$('nearRadius'),status=$('nearStatus');
 let oneShotLocation=null;
 mode.value='manual';radius.value='2';
 manual.value=localStorage.getItem('yn_near_manual')||'';
 function message(m){status.textContent=m}
 mode.addEventListener('change',()=>{oneShotLocation=null;if(mode.value==='precise'){message('Select Allow location once to request browser permission. There is no continuous tracking.')}else message('Manual mode: enter a town or neighbourhood.');});
 $('nearLocate').addEventListener('click',()=>{
  if(mode.value!=='precise'){message('Select one-off location permission first.');return}
  if(!navigator.geolocation){message('Browser location is unavailable. Please enter a town manually.');return}
  message('Requesting one-off location permission…');
  navigator.geolocation.getCurrentPosition(pos=>{
   // Coarsen to ~1.1km lat and longitude adjusted by latitude; exact GPS never sent.
   const lat=Math.round(pos.coords.latitude*100)/100;
   const lonStep=Math.max(.01,.01/Math.max(.25,Math.cos(lat*Math.PI/180)));
   const lon=Math.round(pos.coords.longitude/lonStep)*lonStep;
   oneShotLocation={lat,lon};
   message('Approximate location received. Nearby results are indicative, not verified within the selected radius.');
  },err=>{oneShotLocation=null;message(err.code===1?'Location permission denied. Manual selection is available.':'Could not obtain location. Try again or enter a town.')},{enableHighAccuracy:false,timeout:12000,maximumAge:0});
 });
 $('nearApply').addEventListener('click',()=>{
  const manualText=manual.value.trim();
  if(mode.value==='manual'){
   if(!manualText){message('Please enter a town or neighbourhood.');return}
   localStorage.setItem('yn_near_manual',manualText);
   state.place=manualText;
  }else{
   if(!oneShotLocation){message('Allow one-off location access before searching.');return}
   state.place=oneShotLocation.lat.toFixed(2)+', '+oneShotLocation.lon.toFixed(2);
  }
  localStorage.setItem('yn_place',state.place);
  $('place').value=state.place;
  message('Searching for reports mentioning this area. The '+radius.value+' km preference is not a verified distance filter.');
  loadNews(true);$('stories').scrollIntoView({behavior:'smooth'});
 });
 $('nearClear').addEventListener('click',()=>{
  oneShotLocation=null;manual.value='';mode.value='manual';state.place='';
  localStorage.removeItem('yn_place');localStorage.removeItem('yn_near_manual');
  $('place').value='';message('Location cleared. Manual mode is active.');loadNews(true);
 });
}

let worldStories=[];
async function loadWorld(){try{const r=await fetch('/api/news?country=WORLD&topic=all&language='+encodeURIComponent(state.language),{cache:'no-store'});if(!r.ok)throw Error('World news unavailable');const data=await r.json();worldStories=(data.items||[]).slice(0,12);$('worldgrid').replaceChildren(...(worldStories.length?worldStories.map(x=>makeStory(x,'WORLD')):[Object.assign(document.createElement('div'),{className:'loading',textContent:'No global headlines are available at the moment. Please try again.'})]));$('worldUpdateTime').textContent=data.fetchedAt?'Source check: '+timeLabel(new Date(data.fetchedAt).toISOString()):'';}catch(e){$('worldgrid').textContent='Global feed temporarily unavailable. Please try again.'}}
function initDrawer(){const drawer=$('settingsDrawer'),backdrop=$('drawerBackdrop'),toggle=$('menuButton');let previous=null;function open(){previous=document.activeElement;drawer.inert=false;drawer.setAttribute('aria-hidden','false');backdrop.hidden=false;document.body.classList.add('drawer-open');toggle.setAttribute('aria-expanded','true');$('menuClose').focus()}function close(){drawer.inert=true;drawer.setAttribute('aria-hidden','true');backdrop.hidden=true;document.body.classList.remove('drawer-open');toggle.setAttribute('aria-expanded','false');previous?.focus?.()}toggle.addEventListener('click',open);$('editionMenuButton').addEventListener('click',open);$('menuClose').addEventListener('click',close);backdrop.addEventListener('click',close);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.inert)close();if(e.key==='Tab'&&!drawer.inert){const focusable=[...drawer.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled);const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});return close}
function setup(){
 initDrawer();
 $('worldRefresh').addEventListener('click',()=>loadWorld());
 populateCountries();
 initNearMe();
 $('language').value=state.language in languages?state.language:'en';
 $('topic').value=state.topic;
 $('country').addEventListener('change',e=>setCountry(e.target.value));
 $('language').addEventListener('change',e=>{setLanguage(e.target.value);populateSort();loadNews(true);loadWorld()});
 $('topic').addEventListener('change',e=>{state.topic=e.target.value;localStorage.setItem('yn_topic',state.topic);loadNews(true)});
 $('search').addEventListener('input',render);
 $('place').value=state.place;
 let placeDelay; $('place').addEventListener('input',e=>{clearTimeout(placeDelay);placeDelay=setTimeout(()=>{state.place=e.target.value.trim();localStorage.setItem('yn_place',state.place);loadNews(true)},600)});
 $('refresh').addEventListener('click',()=>loadNews(true));
 document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>setCountry(b.dataset.country)));
 $('preferences').onclick=()=>{$('localHistory').checked=localStorage.getItem('yn_track')==='yes';$('audience').value=localStorage.getItem('yn_audience')||'general';$('prefsDialog').showModal()};
 $('reportButton').onclick=()=>$('reportDialog').showModal();
 $('savePrefs').onclick=()=>{localStorage.setItem('yn_track',$('localHistory').checked?'yes':'no');localStorage.setItem('yn_audience',$('audience').value);if(!$('localHistory').checked)localStorage.removeItem('yn_history');};
 $('clearData').onclick=()=>{for(const key of Object.keys(localStorage))if(key.startsWith('yn_'))localStorage.removeItem(key);sessionStorage.clear();$('prefsDialog').close();location.reload()};
 $('saveDraft').onclick=()=>{const title=$('reportHeadline').value.trim(),details=$('reportDetails').value.trim();if(!title||!details){$('draftStatus').textContent=tr('draftRequired');return}const drafts=loadArray('yn_drafts');drafts.push({title,details,source:$('reportSource').value.trim(),createdAt:new Date().toISOString(),status:'LOCAL DRAFT — NOT PUBLISHED'});localStorage.setItem('yn_drafts',JSON.stringify(drafts.slice(-20)));$('draftStatus').textContent=tr('localDraft')};
 $('theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('yn_dark',document.body.classList.contains('dark')?'yes':'no')};
 if(localStorage.getItem('yn_dark')==='yes')document.body.classList.add('dark');
 setLanguage($('language').value);
 $('clock').textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London'}).format(new Date());
 document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('active',b.dataset.country===state.country));
 // Populate both UK and world editions immediately on first page load.
 loadIllustratedStories();
 loadNews(true);
 loadWorld();
 setInterval(()=>{loadNews(true);loadWorld()},60000);
}
function populateSort(){const sel=$('country'),country=state.country;for(const opt of sel.options){if(opt.value!=='WORLD')opt.textContent=(opt.value==='IN'?'🇮🇳 ':opt.value==='BR'?'🇧🇷 ':opt.value==='IE'?'🇮🇪 ':opt.value==='IL'?'🇮🇱 ':'')+displayCountry(opt.value)}sel.value=country}
setup();