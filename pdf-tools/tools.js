(() => {
  const groups={
    'Organize PDF':[['Merge PDF','/merge-pdf/','Combine documents'],['Split PDF','/split-pdf/','Extract selected pages'],['Remove pages','/pdf-workbench/?task=remove','Keep the remaining pages'],['Extract pages','/pdf-workbench/?task=organize','Choose page ranges'],['Organize PDF','/pdf-workbench/?task=organize','Set output page order'],['Scan / images to PDF','/images-to-pdf/','Combine photos or scans']],
    'Optimize PDF':[['Compress PDF','/compress-pdf/','Image-based compression'],['OCR PDF','/ocr-scanned-pdf/','Recognize scanned text']],
    'Convert to PDF':[['JPG / PNG / WebP to PDF','/images-to-pdf/','Direct PDF download'],['Word / Excel / PowerPoint to PDF','/convert-to-pdf/','Browser content preview; print to PDF'],['HTML / text to PDF','/convert-to-pdf/','Text-based preview']],
    'Convert from PDF':[['PDF to JPG','/pdf-to-jpg/','Render pages as images'],['PDF to Word','/pdf-to-word/','Extract text into a Word-compatible file']],
    'Edit PDF':[['Rotate PDF','/pdf-workbench/?task=rotate','Rotate selected pages'],['Add page numbers','/pdf-workbench/?task=numbers','Number selected pages'],['Add watermark','/pdf-workbench/?task=watermark','Add a visible text mark'],['Crop PDF','/pdf-workbench/?task=crop','Hide page margins; not redaction'],['Add text','/pdf-workbench/?task=text','Add a text overlay'],['PDF Forms','/pdf-workbench/?task=forms','Fill text fields and checkboxes']],
    'PDF Security':[['Sign PDF','/pdf-workbench/?task=sign','Typed signature stamp; not a certificate']],
    'Online processing':[['Office to PDF','office-to-pdf','LibreOffice conversion'],['Repair PDF','repair','Attempt to rewrite a damaged PDF'],['PDF to Excel','pdf-to-excel','Extract text rows'],['PDF to PowerPoint','pdf-to-powerpoint','Create text slides'],['PDF to PDF/A','pdfa','Archive-oriented conversion; validate output'],['Protect PDF','protect','AES-256 password encryption'],['Unlock PDF','unlock','Requires the correct password'],['Redact PDF','redact','Rasterize and remove a rectangular region'],['Compare PDF','compare','Compare extracted text'],['PDF to Markdown','markdown','Export page text']]
  };
  const catalogue=document.getElementById('pdf-catalogue'),search=document.getElementById('pdf-search');
  for(const [group,tools] of Object.entries(groups)){
    const section=document.createElement('section');section.className='pdf-tool-group';const h=document.createElement('h2');h.textContent=group;section.append(h);const grid=document.createElement('div');grid.className='pdf-tool-grid';
    for(const [name,href,scope] of tools){const a=document.createElement('a');a.href=href.startsWith('/')?href:'#online-tools';if(!href.startsWith('/'))a.addEventListener('click',()=>{document.getElementById('server-task').value=href;syncTask();});const strong=document.createElement('strong');strong.textContent=name;const small=document.createElement('small');small.textContent=scope;a.append(strong,small);grid.append(a);}section.append(grid);catalogue.append(section);
  }
  function filter(){let count=0;for(const group of catalogue.children){for(const link of group.querySelectorAll('a')){link.hidden=!link.textContent.toLowerCase().includes(search.value.trim().toLowerCase());if(!link.hidden)count++;}group.hidden=![...group.querySelectorAll('a')].some(a=>!a.hidden);}document.getElementById('pdf-search-status').textContent=count?count+' tools found':'No matching tools. Try another word.';}
  search.addEventListener('input',filter);filter();
  const $=id=>document.getElementById(id),task=$('server-task'),button=$('server-process');let available=[],resultUrl,busy=false;
  const endpoint=(window.PDFServiceConfig?.endpoint||'').replace(/\/$/,'');
  const scope={ 'office-to-pdf':'Upload an Office document. Review fonts and page layout after conversion.', 'pdf-to-word':'Extracted text only; original layout is not recreated.', 'pdf-to-excel':'Each PDF page becomes a sheet of text rows. Table structure is not inferred.', 'pdf-to-powerpoint':'Each PDF page becomes a slide of extracted text. Graphics are not recreated.', repair:'Recovery is attempted; some damaged documents cannot be repaired.', pdfa:'PDF/A-2b conversion requires independent validation before archival use.', protect:'Use a strong new password and keep it somewhere safe.', unlock:'Enter the correct existing password. This does not bypass access controls.',redact:'The same rectangle is removed from every page. Output contains page images only; review all pages.',compare:'Extracted text comparison only. Graphic or layout differences are not detected.',markdown:'Selectable text becomes a Markdown file, grouped by page.'};
  function clearOutput(){if(resultUrl)URL.revokeObjectURL(resultUrl);resultUrl=null;$('server-download').hidden=true;}
  function syncTask(){clearOutput();$('new-password-options').hidden=task.value!=='protect';$('second-file-options').hidden=task.value!=='compare';$('redaction-options').hidden=task.value!=='redact';$('server-scope').textContent=scope[task.value]||'';button.disabled=busy||!available.includes(task.value);}
  task.addEventListener('change',syncTask);syncTask();
  if(!endpoint){$('service-status').textContent='Online processing is not connected yet. The browser tools above are available now.';}
  else fetch(endpoint+'/health',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{available=Array.isArray(data.tools)?data.tools:[];$('service-status').textContent='Online processing is available. Upload only after checking the task scope.';syncTask();}).catch(()=>{$('service-status').textContent='Online processing is unavailable. Try the browser tools above.';});
  function encoded(file){if(!file||!file.size||file.size>20*1024*1024)throw Error('Choose a non-empty file smaller than 20 MB.');return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({name:file.name,data:String(reader.result).split(',')[1]});reader.onerror=()=>reject(Error('Cannot read the selected file.'));reader.readAsDataURL(file);});}
  button.addEventListener('click',async()=>{
    if(busy||!available.includes(task.value))return;
    clearOutput();busy=true;syncTask();$('server-progress').textContent='Processing…';task.disabled=true;
    let submitted=false;
    try{if(!$('upload-consent').checked)throw Error('Confirm upload permission before processing.');const payload={tool:task.value,file:await encoded($('server-file').files[0]),options:{password:$('server-password').value,newPassword:$('server-new-password').value}};
      if(task.value==='compare')payload.second=await encoded($('server-second').files[0]);
      if(task.value==='redact')payload.options.box=['redact-x','redact-y','redact-w','redact-h'].map(id=>{if(!$(id).value.trim())throw Error('Enter all rectangle dimensions.');return Number($(id).value);});
      submitted=true;
      const response=await fetch(endpoint+'/process',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(120000)});
      if(!response.ok){const error=await response.json();throw Error(error.error||'Processing failed.');}
      const blob=await response.blob();resultUrl=URL.createObjectURL(blob);const link=$('server-download');link.href=resultUrl;link.download=response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1]||'result.pdf';link.hidden=false;$('server-progress').textContent='Result ready. Download and review it before sharing.';
    }catch(error){$('server-progress').textContent=error.name==='TimeoutError'?'Processing timed out. Try a smaller document.':error.message;}
    finally{busy=false;task.disabled=false;button.disabled=!available.includes(task.value);if(submitted){$('server-password').value='';$('server-new-password').value='';}}
  });
  $('server-clear').addEventListener('click',()=>{if(busy)return;clearOutput();['server-file','server-second','server-password','server-new-password'].forEach(id=>$(id).value='');$('upload-consent').checked=false;$('server-progress').textContent='Cleared.';});
})();
