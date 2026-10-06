(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const input=$('edit-file'),mode=$('edit-mode'),save=$('edit-save'),status=$('edit-status'),download=$('edit-download');
  let file,bytes,pageCount=0,url,loading=false,loadPromise;
  const modeParam=new URLSearchParams(location.search).get('task');
  if([...mode.options].some(o=>o.value===modeParam)) mode.value=modeParam;
  function ranges(value,count,required=false){
    if(!value.trim()){if(required)throw Error('Enter the pages to remove.');return Array.from({length:count},(_,i)=>i);}
    const result=[];
    for(const part of value.split(',')){
      const match=part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!match)throw Error('Use page numbers or ranges such as 1,3-5.');
      const start=Number(match[1]),end=Number(match[2]||match[1]);
      if(start<1||end>count||end<start)throw Error('Page range is outside this document.');
      for(let n=start;n<=end;n++)if(!result.includes(n-1))result.push(n-1);
    }return result;
  }
  function library(){if(!loadPromise)loadPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';s.onload=()=>resolve(window.PDFLib);s.onerror=()=>reject(Error('Unable to load the PDF editor. Check your connection.'));document.head.append(s);}).catch(e=>{loadPromise=null;throw e;});return loadPromise;}
  function clearOutput(){download.hidden=true;if(url)URL.revokeObjectURL(url);url=null;}
  function controls(){['rotation','text','crop','form'].forEach(name=>$(name+'-options').hidden=true);$('rotation-options').hidden=mode.value!=='rotate';$('text-options').hidden=!['watermark','text','sign'].includes(mode.value);$('crop-options').hidden=mode.value!=='crop';$('form-options').hidden=mode.value!=='forms';$('page-options').hidden=mode.value==='forms';clearOutput();}
  mode.addEventListener('change',controls);controls();
  input.addEventListener('change',async()=>{
    clearOutput();save.disabled=true;file=null;bytes=null;$('form-fields').replaceChildren();
    const candidate=input.files[0];if(!candidate){status.textContent='Choose a PDF to begin.';return;}
    if(!/\.pdf$/i.test(candidate.name)||!candidate.size||candidate.size>30*1024*1024){status.textContent='Choose a non-empty PDF smaller than 30 MB.';return;}
    loading=true;input.disabled=true;$('edit-clear').disabled=true;status.textContent='Reading PDF…';
    try{const lib=await library();bytes=await candidate.arrayBuffer();const doc=await lib.PDFDocument.load(bytes);pageCount=doc.getPageCount();if(!pageCount||pageCount>300)throw Error('Choose a PDF with 1–300 pages.');file=candidate;
      for(const field of doc.getForm().getFields()){
        if(!(field instanceof lib.PDFTextField)&&!(field instanceof lib.PDFCheckBox))continue;
        const label=document.createElement('label');label.textContent=field.getName();const control=document.createElement('input');control.dataset.field=field.getName();
        if(field instanceof lib.PDFCheckBox){control.type='checkbox';control.checked=field.isChecked();}else{control.type='text';control.value=field.getText()||'';}
        label.append(control);$('form-fields').append(label);
      }
      if(!$('form-fields').children.length)$('form-fields').textContent='No supported form fields in this PDF.';
      status.textContent=pageCount+' pages loaded. Choose your task.';save.disabled=false;
    }catch{bytes=null;status.textContent='Cannot read this PDF. It may be encrypted, damaged or exceed the page limit.';}
    finally{loading=false;input.disabled=false;$('edit-clear').disabled=false;}
  });
  save.addEventListener('click',async()=>{
    if(!file||!bytes||loading)return;
    clearOutput();save.disabled=true;input.disabled=true;mode.disabled=true;$('edit-clear').disabled=true;status.textContent='Creating PDF…';
    try{const lib=await library();let doc=await lib.PDFDocument.load(bytes);const selected=mode.value==='forms'?[]:ranges($('edit-pages').value,pageCount,mode.value==='remove');
      if(['organize','remove'].includes(mode.value)){
        const order=mode.value==='remove'?Array.from({length:pageCount},(_,i)=>i).filter(i=>!selected.includes(i)):selected;
        if(!order.length)throw Error('At least one page must remain.');const output=await lib.PDFDocument.create();(await output.copyPages(doc,order)).forEach(p=>output.addPage(p));doc=output;
      }else if(mode.value==='forms'){
        for(const control of $('form-fields').querySelectorAll('input')){const field=doc.getForm().getField(control.dataset.field);if(control.type==='checkbox'){control.checked?field.check():field.uncheck();}else field.setText(control.value);}
      }else{
        const text=$('edit-text').value.trim();if(['watermark','text','sign'].includes(mode.value)&&!text)throw Error('Enter the text or name to add.');
        const font=await doc.embedFont(lib.StandardFonts.Helvetica);
        const margin=Number($('edit-margin').value);if(mode.value==='crop'&&(!$('edit-margin').value.trim()||!Number.isFinite(margin)||margin<0||margin>40))throw Error('Crop margin must be between 0 and 40%.');
        for(const index of selected){const page=doc.getPage(index),{width,height}=page.getSize();
          if(mode.value==='rotate'){page.setRotation(lib.degrees((page.getRotation().angle+Number($('edit-angle').value))%360));continue;}
          if(mode.value==='crop'){page.setCropBox(width*margin/100,height*margin/100,width*(1-margin/50),height*(1-margin/50));continue;}
          const label=mode.value==='numbers'?`${index+1} / ${pageCount}`:text;
          let size=mode.value==='watermark'?30:14;const w=font.widthOfTextAtSize(label,size);if(w>width-40)size*=Math.max(.1,(width-40)/w);
          const position=mode.value==='watermark'?'center':$('edit-position').value;const y=position==='top'?height-35:position==='center'?height/2:20;
          page.drawText(label,{x:Math.max(10,(width-font.widthOfTextAtSize(label,size))/2),y,size,font,color:lib.rgb(.2,.2,.2),opacity:mode.value==='watermark'?.25:1});
        }
      }
      const result=await doc.save();url=URL.createObjectURL(new Blob([result],{type:'application/pdf'}));download.href=url;download.download=file.name.replace(/\.pdf$/i,'')+'-'+mode.value+'.pdf';download.hidden=false;status.textContent='PDF ready. Download and review the result.';
    }catch(error){status.textContent='Unable to create PDF: '+(/WinAnsi/.test(error.message)?'This font cannot render those characters. Use standard Latin text.':error.message);}
    finally{save.disabled=!file;input.disabled=false;mode.disabled=false;$('edit-clear').disabled=false;}
  });
  $('edit-clear').addEventListener('click',()=>{clearOutput();input.value='';file=null;bytes=null;pageCount=0;save.disabled=true;$('form-fields').replaceChildren();status.textContent='Choose a PDF to begin.';});
})();
