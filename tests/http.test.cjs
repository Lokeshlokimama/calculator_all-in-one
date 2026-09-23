const test = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const path = require('node:path');
const files = require('../scripts/site-files.json');
const aliases = require('../scripts/consolidated-routes.json');

test('built public routes return actual HTTP responses; aliases and 404s are distinct', {timeout:30000}, async t => {
  const server = spawn(process.execPath, ['scripts/serve-site.cjs'], {cwd:path.resolve(__dirname,'..'),env:{...process.env,SITE_PORT:'0'},stdio:['ignore','pipe','pipe']});
  t.after(()=>server.kill());
  const base = await new Promise((resolve,reject)=>{
    let output='';const timer=setTimeout(()=>reject(new Error('Test server failed to start')),10000);
    server.once('error',reject);
    server.stdout.on('data', chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});
    server.stderr.on('data',chunk=>{clearTimeout(timer);reject(new Error(String(chunk)));});
  });
  for(const file of files){
    const route='/'+file.replace(/index\.html$/,'');
    const response=await fetch(base+route);
    assert.equal(response.status,200,route);
    if(file.endsWith('.html'))assert.match(response.headers.get('content-type'),/text\/html/);
    const size=(await response.arrayBuffer()).byteLength;
    assert.ok(size>0 || file==='.nojekyll',route);
  }
  for(const [route,target] of Object.entries(aliases)){
    const html=await (await fetch(base+route)).text();
    assert.ok(html.includes(`content="0; url=${target}"`),route);
    assert.match(html,/noindex, follow/);assert.doesNotMatch(html,/adsbygoogle/);
  }
  assert.equal((await fetch(base+'/not-a-real-tool-qa')).status,404);
  assert.equal((await fetch(base+'/.git/config')).status,404);
  assert.equal((await fetch(base+'/tests/calculations.test.cjs')).status,404);
  const redirect=await fetch(base+'/pdf-converter',{redirect:'manual'});
  assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/pdf-converter/');
});
