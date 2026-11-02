import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import vm from 'node:vm';
const moduleURL=new URL('../image-service.mjs',import.meta.url).href;
const story={title:'A research library opens',link:'https://example.test/library'};
const id=createHash('sha256').update(story.link+'|'+story.title).digest('hex').slice(0,40);
const image=Buffer.alloc(120);image.write('RIFF');image.write('WEBP',8);
async function isolated(body,prepare=async()=>{},extra={}){
 const dir=await mkdtemp(path.join(tmpdir(),'yn-test-'));
 try{
  await prepare(dir);
  const result=spawnSync(process.execPath,['--input-type=module','-e',`const mod=await import(${JSON.stringify(moduleURL)});${body}`],{
   env:{...process.env,OPENAI_API_KEY:'',YN_AI_IMAGES_ENABLED:'false',YN_AI_IMAGE_DIR:dir,...extra},encoding:'utf8',timeout:5000
  });
  assert.equal(result.status,0,result.stderr);return JSON.parse(result.stdout);
 }finally{await rm(dir,{recursive:true,force:true})}
}
test('zero and invalid quotas fail closed',async()=>{
 const values=await isolated("console.log(JSON.stringify(['0','-4','invalid','2.9',undefined].map(x=>mod.requestLimit(x,1,2))));");
 assert.deepEqual(values,[0,0,0,2,1]);
});
test('ungenerated images are not advertised to readers',async()=>{
 const meta=await isolated(`console.log(JSON.stringify(mod.imageMeta(${JSON.stringify(story)})));`);
 assert.equal(meta.imageUrl,undefined);
});
test('completed images survive generation being disabled and restart',async()=>{
 const meta=await isolated(`console.log(JSON.stringify(mod.imageMeta(${JSON.stringify(story)})));`,dir=>writeFile(path.join(dir,id+'.webp'),image));
 assert.equal(meta.imageUrl,`/api/illustrations/${id}.webp`);
});
test('invalid cached files are not presented as images',async()=>{
 const meta=await isolated(`console.log(JSON.stringify(mod.imageMeta(${JSON.stringify(story)})));`,dir=>writeFile(path.join(dir,id+'.webp'),Buffer.alloc(120)));
 assert.equal(meta.imageUrl,undefined);
});
test('corrupt accounting blocks paid calls even when flags are enabled',async()=>{
 const result=await isolated(`let calls=0;globalThis.fetch=()=>{calls++;throw Error('must not call')};mod.queueImages('GB',[${JSON.stringify(story)}]);await new Promise(r=>setTimeout(r,20));console.log(JSON.stringify({calls,status:mod.imageStatus()}));`,dir=>writeFile(path.join(dir,'usage.json'),'{broken'),{OPENAI_API_KEY:'dummy-test-key-never-used',YN_AI_IMAGES_ENABLED:'true',YN_AI_IMAGES_SPEND_APPROVED:'true',YN_AI_IMAGES_HARD_LIMIT_CONFIRMED:'true'});
 assert.equal(result.calls,0);assert.match(result.status.lastError,/ledger|cache/);
});
const app=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const makeStorySource=app.slice(app.indexOf('function makeStory('),app.indexOf('function loadArray('));
for(const order of ['photo-first','ai-first'])test(`licensed photos win the loading race: ${order}`,async()=>{
 const images=[];let resolvePhoto;
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.classList={toggle(){}};}
  append(...nodes){this.children.push(...nodes)}
  addEventListener(){}
  querySelector(selector){return this.children.find(n=>selector==='.photo-credit'&&n.className==='photo-credit')||null}
 }
 const context=vm.createContext({document:{createElement:t=>new Element(t)},state:{country:'GB',topic:'all',language:'en'},window:{YourNewsIllustration:()=>({url:'data:image/svg+xml,fallback',alt:'fallback'})},Image:class{constructor(){images.push(this)}},fetch:()=>new Promise(r=>{resolvePhoto=r}),tr:x=>x,timeLabel:x=>x,displayCountry:x=>x,loadArray:()=>[],recordRead:()=>{},Set});
 vm.runInContext(makeStorySource+';this.makeStory=makeStory;',context);
 const card=context.makeStory({id:'123',imageId:'abc',imageUrl:'/api/illustrations/abc.webp',title:'Title',link:'https://example.test',source:'Example'});
 const figure=card.children[0],visible=figure.children[0];
 const ai=images[0];
 if(order==='ai-first')ai.onload();
 resolvePhoto({ok:true,json:async()=>({photo:{url:'https://upload.wikimedia.org/example.jpg',alt:'Archive',caption:'Archive illustration',sourceURL:'https://commons.wikimedia.org/example',attribution:'Credit'}})});
 await new Promise(r=>setImmediate(r));images[1].onload();
 if(order==='photo-first')ai.onload();
 assert.equal(visible.src,'https://upload.wikimedia.org/example.jpg');
 assert.equal(figure.children[2].textContent,'Credit');
});
