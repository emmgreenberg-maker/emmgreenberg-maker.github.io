/* YourNews editorial artwork: deterministic, article-specific SVG illustrations.
   These are symbolic vector graphics, NOT AI-generated photographs or factual reconstructions. */
(function(){
  const THEMES={
    politics:{label:'PUBLIC AFFAIRS',top:'#19344d',bottom:'#49738b',light:'#e1c99c',accent:'#f2d8a3'},
    business:{label:'BUSINESS',top:'#122e42',bottom:'#2b6670',light:'#c5e4dc',accent:'#dfbc82'},
    technology:{label:'TECHNOLOGY',top:'#0b2940',bottom:'#286e8b',light:'#8ee1e0',accent:'#e4d4a7'},
    science:{label:'SCIENCE',top:'#1b3657',bottom:'#476a9a',light:'#c5d9f5',accent:'#b9f0d7'},
    health:{label:'HEALTH',top:'#21455c',bottom:'#5a9693',light:'#e0eee6',accent:'#a5dccc'},
    sport:{label:'SPORT',top:'#183c49',bottom:'#477f66',light:'#d7f0df',accent:'#f0d2a3'},
    climate:{label:'ENVIRONMENT',top:'#183d49',bottom:'#548b85',light:'#b4d9bc',accent:'#e7d4a0'},
    transport:{label:'TRANSPORT',top:'#243a51',bottom:'#56788a',light:'#dce8e5',accent:'#e6caa1'},
    culture:{label:'CULTURE',top:'#3b314e',bottom:'#8b6e85',light:'#ead7e0',accent:'#d8b58e'},
    world:{label:'WORLD',top:'#15374b',bottom:'#477c91',light:'#c2dcd5',accent:'#e5cb94'}
  };
  function kind(title,topic){
    const t=(title||'').toLowerCase();
    if(/\b(football|soccer|tennis|cricket|rugby|olympic|sport|match|league|goal|champion|premier league)\b/.test(t))return 'sport';
    if(/\b(hospital|nhs|medical|medicine|patient|health|vaccine|doctor|disease|virus|clinic)\b/.test(t))return 'health';
    if(/\b(climate|storm|flood|weather|wildfire|fire|earthquake|rain|temperature|emissions|environment)\b/.test(t))return 'climate';
    if(/\b(rail|train|airline|flight|airport|road|traffic|tube|bus|transport|shipping|ferry)\b/.test(t))return 'transport';
    if(/\b(technology|ai|artificial intelligence|chip|software|robot|cyber|apple|google|microsoft|digital|data centre|internet)\b/.test(t))return 'technology';
    if(/\b(scientist|research|science|space|nasa|satellite|planet|discovery|laboratory)\b/.test(t))return 'science';
    if(/\b(economy|business|bank|markets|shares|stock|inflation|interest rate|investment|trade|finance|company|earnings|jobs)\b/.test(t))return 'business';
    if(/\b(prime minister|president|parliament|government|election|minister|politics|vote|policy|diplomatic|summit|court|law)\b/.test(t))return 'politics';
    if(/\b(arts|film|cinema|music|festival|theatre|museum|culture|book)\b/.test(t))return 'culture';
    return ({business:'business',technology:'technology',science:'science',health:'health',sports:'sport',world:'world'})[topic]||'world';
  }
  function hash(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  const buildings=(n,fill,offset=0)=>Array.from({length:n},(_,i)=>{
    const x=i*72+offset-35,ht=65+((i*37+n*11)%120);
    return '<rect x="'+x+'" y="'+(360-ht)+'" width="'+(46+i%3*7)+'" height="'+ht+'" rx="2" fill="'+fill+'" opacity=".65"/>';
  }).join('');
  const shapes={
    politics:(c)=>'<g fill="'+c.light+'"><path d="M245 178L405 108L565 178Z"/><rect x="267" y="186" width="278" height="13"/><rect x="259" y="305" width="296" height="14"/><rect x="246" y="320" width="322" height="16"/></g>'+Array.from({length:7},(_,i)=>'<rect x="'+(278+i*38)+'" y="204" width="18" height="97" rx="2" fill="'+c.accent+'"/>').join('')+'<circle cx="405" cy="95" r="24" fill="'+c.accent+'" opacity=".9"/>',
    business:(c)=>'<g opacity=".9">'+buildings(13,c.light,4)+'</g><path d="M155 263L250 213L319 233L422 143L520 163L622 86" stroke="'+c.accent+'" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M590 82L622 86L615 118" stroke="'+c.accent+'" stroke-width="10" fill="none"/>',
    technology:(c)=>'<rect x="255" y="100" width="290" height="215" rx="24" fill="'+c.light+'" opacity=".2" stroke="'+c.accent+'" stroke-width="5"/><rect x="320" y="151" width="160" height="110" rx="12" fill="'+c.light+'" opacity=".88"/>'+Array.from({length:9},(_,i)=>'<path d="M'+(335+i*16)+' 150V105M'+(335+i*16)+' 261V309" stroke="'+c.accent+'" stroke-width="4"/>').join('')+'<path d="M335 196h132M401 166v78" stroke="'+c.top+'" stroke-width="5"/>',
    science:(c)=>'<circle cx="405" cy="213" r="25" fill="'+c.accent+'"/><g fill="none" stroke="'+c.light+'" stroke-width="5"><ellipse cx="405" cy="213" rx="188" ry="67" transform="rotate(25 405 213)"/><ellipse cx="405" cy="213" rx="188" ry="67" transform="rotate(-25 405 213)"/><ellipse cx="405" cy="213" rx="188" ry="67" transform="rotate(90 405 213)"/></g><circle cx="259" cy="155" r="13" fill="'+c.accent+'"/>',
    health:(c)=>'<rect x="272" y="109" width="264" height="226" rx="18" fill="'+c.light+'" opacity=".85"/><rect x="377" y="142" width="55" height="153" rx="8" fill="'+c.bottom+'"/><rect x="329" y="189" width="151" height="55" rx="8" fill="'+c.bottom+'"/><path d="M168 245h82l25-37 25 69 28-45h100l20-31 22 44h166" stroke="'+c.accent+'" stroke-width="8" fill="none" stroke-linecap="round"/>',
    sport:(c)=>'<ellipse cx="410" cy="331" rx="310" ry="91" fill="'+c.light+'" opacity=".2"/><circle cx="405" cy="205" r="125" fill="'+c.light+'" opacity=".95"/><path d="M404 140l65 43-24 75h-80l-24-75z" fill="'+c.top+'"/><path d="M405 80v60M283 175l58 8M469 183l62-8M365 258l-37 53M445 258l39 53" stroke="'+c.top+'" stroke-width="12"/>',
    climate:(c)=>'<circle cx="575" cy="118" r="59" fill="'+c.accent+'"/><path d="M0 325L150 170L279 288L407 145L588 310L708 203L800 310V450H0Z" fill="'+c.light+'" opacity=".55"/><path d="M0 375L206 259L370 347L540 242L800 358V450H0Z" fill="'+c.top+'" opacity=".6"/><path d="M105 349v-100m-31 43 31-75 32 75m510 42v-115m-38 44 38-78 38 78" stroke="'+c.accent+'" stroke-width="12" fill="none" stroke-linecap="round"/>',
    transport:(c)=>'<rect x="204" y="114" width="397" height="229" rx="56" fill="'+c.light+'"/><rect x="249" y="151" width="307" height="102" rx="14" fill="'+c.bottom+'"/><path d="M260 274h280" stroke="'+c.top+'" stroke-width="12"/><circle cx="288" cy="304" r="19" fill="'+c.top+'"/><circle cx="520" cy="304" r="19" fill="'+c.top+'"/><path d="M290 342l-64 83m294-83 65 83" stroke="'+c.accent+'" stroke-width="8"/>',
    culture:(c)=>'<path d="M269 117h272v190H269z" fill="'+c.light+'" opacity=".75"/><path d="M292 275l80-90 62 54 49-69 38 105" fill="'+c.top+'" opacity=".75"/><circle cx="361" cy="166" r="21" fill="'+c.accent+'"/><path d="M247 107h318v216H247z" fill="none" stroke="'+c.accent+'" stroke-width="18"/>',
    world:(c)=>'<circle cx="408" cy="216" r="147" fill="'+c.light+'" opacity=".85"/><g stroke="'+c.bottom+'" stroke-width="3" opacity=".65" fill="none"><ellipse cx="408" cy="216" rx="71" ry="147"/><path d="M262 216h292M280 155h255M280 278h255"/></g><path d="M329 115l57-12 19 33-32 26 9 42-43 20-37-27-17-35zm118 80 51-30 31 21-17 43-39 18-15 40-29-18 5-42z" fill="'+c.top+'" opacity=".75"/>'
  };
  function art(story,topic){
    const title=String(story?.title||'News');
    const name=kind(title,topic),theme=THEMES[name],seed=hash(title+'|'+(story?.source||'')),phase=seed%100;
    const dots=Array.from({length:20},(_,i)=>'<circle cx="'+((i*79+phase*13)%800)+'" cy="'+((i*53+phase*7)%450)+'" r="'+(2+i%3)+'" fill="#fff" opacity=".11"/>').join('');
    const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="'+theme.top+'"/><stop offset="1" stop-color="'+theme.bottom+'"/></linearGradient><radialGradient id="halo"><stop stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="800" height="450" fill="url(#bg)"/><circle cx="'+(phase*3+340)+'" cy="170" r="265" fill="url(#halo)"/><path d="M0 388L800 388" stroke="#fff" opacity=".18"/>'+dots+'<g transform="translate('+((phase%7)-3)+' 0)">'+shapes[name](theme)+'</g><rect x="27" y="26" width="150" height="29" rx="3" fill="#071e2c" opacity=".6"/><text x="42" y="46" fill="#f3f5f1" font-size="14" font-family="Arial,sans-serif" letter-spacing="2">YOURNEWS</text><rect x="0" y="406" width="800" height="44" fill="#071e2c" opacity=".82"/><text x="27" y="434" fill="#fff" font-size="16" font-family="Arial,sans-serif" letter-spacing="2">'+theme.label+'</text><text x="772" y="434" text-anchor="end" fill="#fff" opacity=".8" font-size="13" font-family="Arial,sans-serif">EDITORIAL ILLUSTRATION</text></svg>';
    return {url:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg),kind:name,alt:theme.label.toLowerCase()+' editorial illustration; not a photograph of the reported event'};
  }
  window.YourNewsIllustration=art;
})();