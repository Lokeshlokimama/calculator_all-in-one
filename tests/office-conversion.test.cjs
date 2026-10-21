const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function page(respond){
 const elements=new Map();const requests=[];const downloads=[];
 const element=id=>{if(!elements.has(id))elements.set(id,{disabled:false,hidden:false,checked:false,files:[],events:{},addEventListener(n,f){this.events[n]=f},removeAttribute(n){delete this[n]},append(){},click(){downloads.push({href:this.href,name:this.download})},remove(){}});return elements.get(id)};
 const document={getElementById:element,createElement:()=>element('download'),body:{append(){}}};
 class Reader{readAsDataURL(){this.result='data:application/octet-stream;base64,UEs=';this.onload()}}
 const context={document,window:{PDFServiceConfig:{endpoint:'https://service.example'},addEventListener(){}},URL:{createObjectURL:()=> 'blob:result',revokeObjectURL(){}},FileReader:Reader,AbortSignal,AbortController,Blob,fetch:async(url,options)=>{requests.push({url,options});return respond(url,options)}};
 vm.runInNewContext(fs.readFileSync('convert-to-pdf/converter.js','utf8'),context);
 element('source-file').files=[{name:'original.docx',size:100}];element('source-file').events.change();
 return {element,requests,downloads,convert:()=>element('prepare-file').events.click()};
}
const health={ok:true,json:async()=>({tools:['office-to-pdf']})};
test('Office conversion requires consent before any request',async()=>{
 const p=page(()=>{throw Error('Unexpected upload')});await p.convert();
 assert.equal(p.requests.length,0);assert.match(p.element('conversion-status').textContent,/Confirm upload/);assert.equal(p.element('save-pdf').disabled,true);
});
test('Office conversion sends original file to backend and downloads actual PDF without printing',async()=>{
 const p=page(url=>url.endsWith('/health')?health:{ok:true,blob:async()=>new Blob(['%PDF-1.7\nexample'])});
 p.element('office-upload-consent').checked=true;await p.convert();
 const payload=JSON.parse(p.requests[1].options.body);assert.equal(payload.tool,'office-to-pdf');assert.equal(payload.file.data,'UEs=');
 assert.equal(p.element('document-preview').src,'blob:result');assert.equal(p.element('save-pdf').disabled,false);
 p.element('save-pdf').events.click();assert.deepEqual(p.downloads,[{href:'blob:result',name:'original.pdf'}]);
 p.element('clear-file').events.click();assert.equal(p.element('save-pdf').disabled,true);assert.equal(p.element('office-upload-consent').checked,false);
});
test('Service errors and non-PDF output never produce a text fallback',async()=>{
 for(const response of [{ok:false,json:async()=>({error:'Conversion failed'})},{ok:true,blob:async()=>new Blob(['<html>error</html>'])}]){
  const p=page(url=>url.endsWith('/health')?health:response);p.element('office-upload-consent').checked=true;await p.convert();
  assert.equal(p.element('save-pdf').disabled,true);assert.equal(p.element('document-preview').srcdoc,undefined);assert.match(p.element('conversion-status').textContent,/Unable to convert/);
 }
});
test('Clear during a pending Office conversion prevents a stale result',async()=>{
 let release;const pending=new Promise(resolve=>release=resolve);
 const p=page(url=>url.endsWith('/health')?health:pending);p.element('office-upload-consent').checked=true;
 const conversion=p.convert();while(p.requests.length<2)await new Promise(resolve=>setImmediate(resolve));
 p.element('clear-file').events.click();release({ok:true,blob:async()=>new Blob(['%PDF-1.7'])});await conversion;
 assert.equal(p.element('save-pdf').disabled,true);assert.equal(p.element('preview-section').hidden,true);assert.equal(p.element('conversion-status').textContent,'Choose a supported file to begin.');
});
