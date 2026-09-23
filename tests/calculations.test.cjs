const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const root = require('node:path').resolve(__dirname, '..');
const read = file => fs.readFileSync(require('node:path').join(root, file), 'utf8');

function dedicated(values = {}, fetch = async () => { throw new Error('Network unavailable'); }) {
  const nodes = Object.fromEntries(Object.entries(values).map(([id, value]) => [id, {value:String(value), dataset:{}, style:{}}]));
  const context = vm.createContext({ window: {}, Intl, AbortSignal, fetch, document: {
    addEventListener() {}, getElementById: id => nodes[id] ||= {dataset:{}, style:{}}
  }});
  vm.runInContext(read('calculator-pages.js').replace('return { init };', 'return { init, calculateEmi, calculateBmi, calculateLoan, calculatePercentage, calculateGst, calculateSip, convertCurrency, fetchCurrencyRates };') + '\nglobalThis.api = calculatorPage;', context);
  return {api:context.api, nodes};
}

test('dedicated EMI and loan worked examples agree with independently discounted cashflows', () => {
  for (const [principal, rate, months] of [[500000,10,60], [300000,9,48], [120000,0,12]]) {
    const expected = principal / Array.from({length:months}, (_,i)=>1/(1+rate/1200)**(i+1)).reduce((a,b)=>a+b,0);
    const {api,nodes} = dedicated({'emi-amount':principal,'emi-rate':rate,'emi-tenure':months,'loan-amount':principal,'loan-rate':rate,'loan-years':months/12});
    api.calculateEmi(); api.calculateLoan();
    for (const id of ['emi-result','loan-payment']) assert.ok(Math.abs(Number(nodes[id].dataset.moneyValue)-expected)<1e-6);
    assert.ok(Math.abs(Number(nodes['emi-total'].dataset.moneyValue)-expected*months)<1e-5);
  }
  for (const tenure of ['',0,-1,12.5,1201,'Infinity']) {
    const {api,nodes} = dedicated({'emi-amount':100000,'emi-rate':10,'emi-tenure':tenure});
    api.calculateEmi(); assert.match(nodes['calculator-error'].textContent,/valid/);
  }
});

test('dedicated arithmetic handles zero, signed values, tax reversal and overflow', () => {
  const {api,nodes} = dedicated({'percentage-value':-10,'percentage-base':200,'gst-amount':1180,'gst-rate':18,'gst-mode':'remove'});
  api.calculatePercentage(); assert.equal(nodes['percentage-result'].textContent,'-20.00');
  api.calculateGst(); assert.equal(Number(nodes['gst-base'].dataset.moneyValue),1000); assert.equal(Number(nodes['gst-tax'].dataset.moneyValue),180);
  nodes['gst-amount'].value='0'; api.calculateGst(); assert.equal(Number(nodes['gst-total'].dataset.moneyValue),0);
  nodes['gst-amount'].value='1e308'; nodes['gst-rate'].value='100'; nodes['gst-mode'].value='add'; api.calculateGst(); assert.match(nodes['calculator-error'].textContent,/range/);
});

test('dedicated SIP matches independent monthly ledger and rejects fractional deposits', () => {
  const {api,nodes} = dedicated({'sip-monthly':5000,'sip-rate':12,'sip-years':10});
  let ledger=0; for(let m=0;m<120;m++) ledger=(ledger+5000)*1.01;
  api.calculateSip(); assert.ok(Math.abs(Number(nodes['sip-total'].dataset.moneyValue)-ledger)<1e-6);
  nodes['sip-years'].value='0.11'; api.calculateSip(); assert.match(nodes['calculator-error'].textContent,/whole monthly/);
});

test('dedicated currency rejects outage, bad rates, missing timestamps, stale data and overflow', async () => {
  for(const payload of [null,{result:'error'}, {result:'success',rates:{EUR:0.9}}, {result:'success',rates:{EUR:0.9},time_last_update_unix:1}, {result:'success',rates:{EUR:-1},time_last_update_unix:Date.now()/1000}]) {
    const {api,nodes}=dedicated({'currency-amount':100,'currency-from':'USD','currency-to':'EUR'},async()=>{if(!payload) throw new Error('Offline');return {ok:true,json:async()=>payload};});
    await api.convertCurrency(); assert.equal(nodes['currency-result'].textContent,'Unable to fetch live rate'); assert.equal(nodes['currency-submit'].disabled,false);
  }
  let calls=0;
  const {api,nodes}=dedicated({'currency-amount':100,'currency-from':'USD','currency-to':'EUR'}, async(url,options)=>{calls++;assert.ok(options.signal);return {ok:true,json:async()=>({result:'success',rates:{EUR:0.92},time_last_update_unix:Date.now()/1000,time_next_update_unix:Date.now()/1000+3600})};});
  await api.convertCurrency(); assert.match(nodes['currency-result'].textContent,/92/); await api.convertCurrency(); assert.equal(calls,1);
  nodes['currency-amount'].value='-1'; await api.convertCurrency(); assert.match(nodes['calculator-error'].textContent,/valid amount/);
});

test('published health examples use actual code coefficients and unrounded measurements', () => {
  const cases=[['calcBMR',{'bmr-gender':'m','bmr-age':30,'bmr-weight':70,'bmr-height':175},'bmr-result',`${Math.round(10*70+6.25*175-5*30+5)} kcal/day`],['calcWater',{'water-weight':70,'water-activity':1.2},'water-result','2.9 Liters'],['calcIdealWeight',{'iw-gender':'m','iw-height':175,'iw-height-unit':'cm'},'iw-result','70.5 kg'],['calcProtein',{'protein-weight':70,'protein-goal':1.2},'protein-result','84.0 g/day'],['calcBodyFat',{'bf-gender':'m','bf-height':175,'bf-neck':38,'bf-waist':88},'bf-result','19.2 %']];
  for(const [fn,values,id,expected] of cases){const {context,nodes}=homepageFunctions([fn],values);context[fn]();assert.equal(nodes[id].innerText,expected,fn);}
});

test('calendar helpers reject impossible dates and count daylight-saving boundaries as calendar days', () => {
  const {context}=homepageFunctions(['parseLocalDateInput','diffCalendarDays','addCalendarDays']);
  assert.equal(context.parseLocalDateInput('2026-02-30'),null);
  assert.equal(context.diffCalendarDays(new Date(2026,2,7),new Date(2026,2,9)),2);
  const due=context.addCalendarDays(context.parseLocalDateInput('2026-01-01'),280);
  assert.equal(due.getFullYear(),2026); assert.equal(due.getMonth(),9); assert.equal(due.getDate(),8);
});

test('published deposit, discount and leave examples match independent arithmetic', () => {
  const cases=[['calcFD',{'fd-principal':100000,'fd-rate':7,'fd-citizen':0,'fd-years':5},'fd-total',141477.81957558], ['calcRD',{'rd-monthly':5000,'rd-rate':6.5,'rd-months':24},'rd-total',128425.30187477], ['calcLeave',{'leave-basic':60000,'leave-days':15},'leave-result',30000], ['calcDiscountTax',{'dt-price':1000,'dt-discount':10,'dt-tax':5},'dt-total',945]];
  for(const [fn,values,id,expected] of cases){const {context,results}=homepageFunctions(fn==='calcRD'?['recurringDepositMaturity',fn]:[fn],values);context[fn]();assert.ok(Math.abs(results[id]-expected)<0.00001,fn);}
});

test('published electricity examples use units, not assumed tariffs', () => {
  const cases=[['calcPower',{'power-voltage':230,'power-current':5},'power-result','1,150 W'],['calcKwh',{'kwh-watts':2000,'kwh-hours':8},'kwh-result','16 kWh'],['calcWattToUnit',{'wattunit-watts':500,'wattunit-hours':12,'wattunit-days':30},'wattunit-result','180 units'],['calcSolarPanel',{'solar-kwh':15,'solar-sun':5,'solar-efficiency':80},'solar-result','3.75 kW (3,750 W)'],['calcInverterBackup',{'inv-ah':150,'inv-voltage':12,'inv-load':300,'inv-efficiency':85},'inv-result','5.1 hours (306 min)'],['calcUpsBackup',{'ups-ah':7,'ups-voltage':12,'ups-load':100,'ups-efficiency':80},'ups-result','40 minutes (0.67 hr)'],['calcGeneratorSize',{'gen-load':5000,'gen-pf':0.8,'gen-margin':25},'gen-result','7.81 kVA']];
  for(const [fn,values,id,expected] of cases){const {context,nodes}=homepageFunctions(['readCalcNumber','formatCalcNumber','requirePositiveInputs','setResultText','calcBackupHours',fn],values);context[fn]();assert.equal(nodes[id].innerText,expected,fn);}
});

test('published fraction, quadratic, IPv4 and aspect ratio examples', () => {
  const a=homepageFunctions(['getFractionGcd','simplifyFraction','calcFraction'],{'frac-a-num':1,'frac-a-den':2,'frac-b-num':1,'frac-b-den':4,'frac-op':'add'}); a.context.calcFraction();assert.equal(a.nodes['frac-result'].innerText,'Result: 3/4');
  const b=homepageFunctions(['formatMathNumber','calcQuadratic'],{'quad-a':1,'quad-b':-5,'quad-c':6});b.context.calcQuadratic();assert.equal(b.nodes['quad-result'].innerText,'Roots: 3 and 2');
  const c=homepageFunctions(['parseIPv4Address','ipv4IntToString','calcSubnet'],{'subnet-ip':'192.168.1.10','subnet-cidr':24});c.context.calcSubnet();assert.match(c.nodes['subnet-result'].innerHTML,/192\.168\.1\.0/);assert.match(c.nodes['subnet-result'].innerHTML,/192\.168\.1\.255/);assert.equal(c.context.parseIPv4Address('256.0.0.1'),null);
  const d=homepageFunctions(['formatMathNumber','getFractionGcd','reduceAspectRatio','calcAspectRatio'],{'aspect-width':1920,'aspect-height':1080,'aspect-target-width':1280,'aspect-target-height':''});d.context.calcAspectRatio();assert.equal(d.nodes['aspect-result'].innerText,'Scaled size: 1280 x 720');assert.equal(d.nodes['aspect-ratio'].innerText,'16:9');
});

function homepageFunctions(names, values = {}, crypto = webcrypto) {
  const nodes = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, typeof value === 'object' ? value : { value: String(value) }]));
  const messages = [], results = {};
  const context = vm.createContext({
    window: { crypto }, document: { getElementById: id => nodes[id] ||= {dataset:{},style:{}} },
    showToast: (...args) => messages.push(args),
    showFieldError: (id, message) => messages.push([message, id]),
    setTimeout: callback => callback(), formatLoanPreview() {}, formatReadableAmount: String,
    setMoneyText: (id, value) => { results[id] = value; }
  });
  const source = read('script.js');
  for (const name of names) {
    let start = source.indexOf('function ' + name + '(');
    assert.ok(start >= 0, 'Function exists: ' + name);
    if (source.slice(start - 6, start) === 'async ') start -= 6;
    const nextFunction = source.indexOf('\nfunction ', start + 1);
    const assignment = source.indexOf('\nwindow.', start + 1);
    const end = assignment >= 0 && (nextFunction < 0 || assignment < nextFunction) ? assignment : nextFunction;
    vm.runInContext(source.slice(start, end), context);
  }
  return { context, nodes, messages, results };
}

function traffic() {
  const context = vm.createContext({ window: {}, document: { addEventListener() {} } });
  const source = read('traffic-calculators.js').replace(/\}\)\(\);\s*$/, 'globalThis.testApi = { payment, remainingBalance, repaymentSchedule, validCalculatorInputs };})();');
  vm.runInContext(source, context);
  return context.testApi;
}

test('standard and scientific arithmetic, factorial and overflow cases', () => {
  const {context,nodes,messages}=homepageFunctions(['calculateResult','calculateSci','factorialSci']);
  context.calcExpression='5*4+3';context.calculateResult();assert.equal(nodes['calc-display'].innerText,'23');
  context.calcExpression='1/0';context.calculateResult();assert.equal(nodes['calc-display'].innerText,'Error');
  context.sciExpression='sin(Math.PI/2)';context.calculateSci();assert.equal(nodes['sci-display'].innerText,'1');
  context.sciExpression='2^3';context.calculateSci();assert.equal(nodes['sci-display'].innerText,'8');
  context.sciExpression='5';context.factorialSci();assert.equal(nodes['sci-display'].innerText,'120');
  context.sciExpression='0';context.factorialSci();assert.equal(nodes['sci-display'].innerText,'1');
  for(const value of ['171','2.5','-1','1e308','5+3']){context.sciExpression=value;context.factorialSci();assert.match(messages.at(-1)[0],/0 to 170/);}
});

test('text, color, base conversion and stopwatch formatting examples', () => {
  const {context,nodes}=homepageFunctions(['updateCounts','convertCase','hexToRgb','rgbToHsl','parseBigIntBase','updateStopwatchDisplay'],{'text-counter-input':'Hello world','case-input':'hello world'});
  context.updateCounts();assert.equal(nodes['count-words'].innerText,2);assert.equal(nodes['count-chars'].innerText,11);
  context.convertCase('upper');assert.equal(nodes['case-output'].value,'HELLO WORLD');
  assert.equal(context.parseBigIntBase('1010',2),10n);
  assert.throws(()=>context.parseBigIntBase('102',2));
  assert.deepEqual(JSON.parse(JSON.stringify(context.hexToRgb('#FFFFFF'))),{r:255,g:255,b:255});
  const hsl=context.rgbToHsl(255,255,255);assert.ok(JSON.stringify(hsl).includes('100'));
  context.swTime=8345;context.updateStopwatchDisplay();assert.equal(nodes['stopwatch-display'].innerText,'00:01:23.45');
});

test('fraction, subnet and quadratic reject truncated or overflowing inputs', () => {
  const a=homepageFunctions(['getFractionGcd','simplifyFraction','calcFraction'],{'frac-a-num':'1.5','frac-a-den':2,'frac-b-num':1,'frac-b-den':4,'frac-op':'add'});
  a.context.calcFraction();assert.match(a.messages.at(-1)[0],/whole/);
  a.nodes['frac-a-num'].value='';a.context.calcFraction();assert.match(a.messages.at(-1)[0],/whole/);
  const b=homepageFunctions(['parseIPv4Address','ipv4IntToString','calcSubnet'],{'subnet-ip':'192.168.1.10','subnet-cidr':'24.5'});b.context.calcSubnet();assert.match(b.messages.at(-1)[0],/CIDR/);
  const c=homepageFunctions(['formatMathNumber','calcQuadratic'],{'quad-a':1,'quad-b':'1e308','quad-c':6});c.context.calcQuadratic();assert.match(c.messages.at(-1)[0],/range/);
});

test('invoice applies discount before tax and refuses invalid export totals', () => {
  const {context,nodes,results}=homepageFunctions(['calculateInvoice'],{'invoice-tax':18,'invoice-discount':10,'inv-from':'QA','inv-to':'QA','inv-number':'QA-001','inv-date':'2026-09-22','inv-due-date':'','inv-notes':''});
  const fields={'.inv-item-desc':{value:'Test item'},'.inv-item-qty':{value:'2'},'.inv-item-price':{value:'500'}};
  context.document.querySelectorAll=selector=>selector==='.invoice-item-row'?[{querySelector:s=>fields[s]}]:[nodes['invoice-tax'],nodes['invoice-discount'],fields['.inv-item-qty'],fields['.inv-item-price']];
  context.document.createElement=()=>({style:{},append(){}});
  nodes['inv-preview-items']={appendChild(){}};
  assert.equal(context.calculateInvoice(),true);assert.equal(results['inv-preview-total'],1062);assert.equal(results['inv-preview-tax'],162);
  nodes['invoice-tax'].value='101';assert.equal(context.calculateInvoice(),false);assert.match(nodes['invoice-error'].textContent,/between 0 and 100/);
});

test('unit conversion and mileage examples agree with stated units', () => {
  const {context,nodes}=homepageFunctions(['convertUnit','getMileageEfficiency'],{'unit-type':'length','unit-val-1':10,'unit-sel-1':'m','unit-sel-2':'ft'});
  vm.runInContext(read('script.js').match(/const units = \{[\s\S]*?\n\};/)[0],context);
  context.convertUnit(1);assert.equal(nodes['unit-val-2'].value,'32.8084');
  assert.equal(context.getMileageEfficiency(5,'l100').efficiency,20);
  assert.ok(Math.abs(context.getMileageEfficiency(47.04291666,'mpg-us').efficiency-20)<1e-8);
  assert.equal(100/context.getMileageEfficiency(20,'kml').efficiency*100,500);
});

test('toolbox currency rejects stale cached timestamps instead of presenting them as live', () => {
  const {context}=homepageFunctions(['getCurrencyCache']);
  context.localStorage={getItem:()=>JSON.stringify({rates:{EUR:.92},expiresAt:Date.now()+999999,updatedTimestamp:1})};
  vm.runInContext('const currencyRateMemoryCache = new Map(); const CURRENCY_CACHE_PREFIX = "qa";',context);
  assert.equal(context.getCurrencyCache('USD'),null);
  context.localStorage.getItem=()=>JSON.stringify({rates:{EUR:.92},expiresAt:Date.now()+999999,updatedTimestamp:Date.now()});
  assert.equal(context.getCurrencyCache('USD').rates.EUR,.92);
});

test('QR engine creates a real SVG matrix and rejects oversized input', () => {
  const qr=require('../qr-code-engine.js');const result=qr.toSvg('https://example.com/menu');
  assert.equal(result.meta.size,25);assert.equal(result.meta.bytes,24);
  assert.match(result.svg,/viewBox="0 0 33 33"/);assert.match(result.svg,/<path d="M/);
  assert.throws(()=>qr.encode('x'.repeat(5000)));
});

test('live chart-enhanced SIP, FD and RD handlers match the underlying examples', async () => {
  for(const [name,values,id,expected] of [
    ['calcSIP',{'sip-monthly':5000,'sip-rate':12,'sip-years':10},'sip-total',1161695.3817597],
    ['calcFD',{'fd-principal':100000,'fd-rate':7,'fd-citizen':0,'fd-years':5},'fd-total',141477.81957558],
    ['calcRD',{'rd-monthly':5000,'rd-rate':6.5,'rd-months':24},'rd-total',128425.30187477]
  ]){
    const {context,nodes,results,messages}=homepageFunctions(['recurringDepositMaturity'],values);
    const get=context.document.getElementById;context.document.getElementById=id=>id.includes('chart')?null:get(id);
    const handler=read('script.js').match(new RegExp('window\\.'+name+' = async function\\(\\) \\{[\\s\\S]*?\\n\\};'))[0];
    vm.runInContext(handler,context);await context.window[name]();assert.ok(Math.abs(results[id]-expected)<0.00001,name);
    nodes[Object.keys(values)[0]].value='1.79e308';await context.window[name]();assert.match(messages.at(-1)[0],/range/,name);
  }
});

test('generated finance forms produce consistent SIP, electricity and prepayment outputs', () => {
  const source=read('traffic-calculators.js').replace(/\}\)\(\);\s*$/, 'globalThis.api={initFinanceCalculators,qrPayload};})();');
  function run(type,values){
    const output={innerHTML:'',hidden:true}, error={textContent:''};let submit;
    const card={querySelector:selector=>selector==='[data-traffic-result]'?output:error};
    const form={dataset:{trafficCalc:type},closest:()=>card,addEventListener:(event,fn)=>submit=fn};
    const context=vm.createContext({window:{},URLSearchParams,FormData:class {entries(){return Object.entries(values);}},document:{addEventListener(){},querySelectorAll:()=>[form]}});
    vm.runInContext(source,context);context.api.initFinanceCalculators();submit({preventDefault(){}});return {output,error,api:context.api};
  }
  const step=run('sip-step-up',{monthly:'1000',rate:'0',step:'10',years:'2'});assert.match(step.output.innerHTML,/25,200\.00/);assert.match(step.output.innerHTML,/1,100\.00/);
  const regular=run('sip-step-up',{monthly:'5000',rate:'12',step:'0',years:'10'});assert.match(regular.output.innerHTML.replaceAll(',',''),/1161695\.38/);
  const bill=run('electricity-bill',{units:'250',unitRate:'7.5',fixed:'100',tax:'5'});assert.match(bill.output.innerHTML,/2,073\.75/);
  const zero=run('electricity-bill',{units:'0',unitRate:'7.5',fixed:'100',tax:'0'});assert.match(zero.output.innerHTML,/100\.00/);
  const prepay=run('emi-prepayment',{principal:'120000',rate:'0',years:'1',paidMonths:'2',prepay:'20000'});assert.match(prepay.output.innerHTML,/80,000\.00/);assert.match(prepay.output.innerHTML,/2 months/);
  const bad=run('sip-step-up',{monthly:'1000',rate:'12',step:'10',years:'0.11'});assert.match(bad.error.textContent,/whole number/);
  assert.equal(step.api.qrPayload('whatsapp',{phone:'+91 9876543210',message:'Hi'}),'https://wa.me/919876543210?text=Hi');
  assert.match(step.api.qrPayload('wifi',{ssid:'QA;Guest',password:'test',encryption:'WPA'}),/QA\\;Guest/);
});
test('loan payments include zero rate and tiny positive rates without cancellation', () => {
  const api = traffic();
  assert.equal(api.payment(120000, 0, 12), 10000);
  assert.ok(Math.abs(api.payment(100000, 10, 12) - 8791.588723) < 0.00001);
  assert.ok(Math.abs(api.payment(120000, 1e-10, 12) - 10000) < 0.000001);
  assert.ok(Number.isFinite(api.payment(100000, 100, 1200)));
});
test('prepayment includes a smaller final installment and caps an extinguished balance', () => {
  const api = traffic();
  const schedule = api.repaymentSchedule(250, 0, 100);
  assert.equal(schedule.months, 3);
  assert.equal(schedule.total, 250);
  assert.equal(api.remainingBalance(1000, 0, 15, 100), 0);
  assert.equal(api.repaymentSchedule(0, 10, 100).total, 0);
});
test('calculation validation rejects missing, non-finite and negative inputs, allows zero usage', () => {
  const api = traffic();
  const good = { units: '0', unitRate: '7.5', fixed: '100', tax: '0' };
  assert.equal(api.validCalculatorInputs('electricity-bill', good), true);
  for (const units of ['', 'Infinity', 'NaN', '-1']) {
    assert.equal(api.validCalculatorInputs('electricity-bill', { ...good, units }), false);
  }
  assert.equal(api.validCalculatorInputs('electricity-bill', { ...good, tax: '101' }), false);
});
test('RD projection compounds an entered quarterly nominal rate and handles zero rate', () => {
  const { context } = homepageFunctions(['recurringDepositMaturity']);
  assert.equal(context.recurringDepositMaturity(5000, 0, 24), 120000);
  let expected = 0;
  for (let month = 1; month <= 24; month++) expected += 5000 * Math.pow(1 + 0.065 / 4, month / 3);
  assert.ok(Math.abs(context.recurringDepositMaturity(5000, 6.5, 24) - expected) < 1e-7);
});
test('salary uses the entered tax and deductions, without invented tax slabs', () => {
  const { context, results, messages, nodes } = homepageFunctions(['calcSalary'], {
    'sal-ctc': 1200000, 'sal-basic-pct': 50, 'sal-monthly-tax': 8000, 'sal-other-deductions': 1000
  });
  context.calcSalary();
  assert.equal(results['sal-pf'], 6000);
  assert.equal(results['sal-result'], 85000);
  nodes['sal-monthly-tax'].value = '200000';
  context.calcSalary();
  assert.match(messages.at(-1)[0], /deductions exceed/i);
});
test('passwords contain the requested groups at each supported length', () => {
  const { context, nodes } = homepageFunctions(['generatePassword'], {
    'pwd-length': 8, 'pwd-upper': { checked: true }, 'pwd-numbers': { checked: true }, 'pwd-symbols': { checked: true }
  });
  for (const length of [8, 12, 32, 64]) {
    nodes['pwd-length'].value = String(length);
    for (let n = 0; n < 20; n++) {
      context.generatePassword();
      const value = nodes['pwd-result'].innerText;
      assert.equal(value.length, length);
      for (const pattern of [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/]) assert.match(value, pattern);
    }
  }
});
test('password generation fails clearly if secure random support is unavailable', () => {
  const { context, nodes, messages } = homepageFunctions(['generatePassword'], {
    'pwd-length': 12, 'pwd-upper': { checked: true }, 'pwd-numbers': { checked: true }, 'pwd-symbols': { checked: false }
  }, {});
  context.generatePassword();
  assert.equal(nodes['pwd-result'].innerText, '');
  assert.match(messages.at(-1)[0], /secure random/);
});
test('UUID output has version 4 and RFC variant bits; unsupported versions fail', () => {
  const { context, nodes, messages } = homepageFunctions(['generateUUIDs'], { 'uuid-version': 4, 'uuid-count': 100 });
  context.generateUUIDs();
  const values = nodes['uuid-output'].value.split('\n');
  assert.equal(values.length, 100);
  assert.equal(new Set(values).size, 100);
  values.forEach(value => assert.match(value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  nodes['uuid-version'].value = '1';
  context.generateUUIDs();
  assert.equal(nodes['uuid-output'].value, '');
  assert.match(messages.at(-1)[0], /UUID v4/);
});

test('percentage accepts zero and signed values without treating them as missing', () => {
  for (const [a, b, expected] of [[0, 100, '0.00'], [20, 0, '0.00'], [-10, 200, '-20.00']]) {
    const { context, nodes } = homepageFunctions(['calcPct'], { 'pct-a': a, 'pct-b': b });
    context.calcPct();
    assert.equal(nodes['pct-result'].innerText, expected);
  }
});

test('health tools reject negative and non-finite measurements', () => {
  for (const [fn, values, result] of [
    ['calcBMR', { 'bmr-gender': 'm', 'bmr-age': -20, 'bmr-weight': 70, 'bmr-height': 175 }, 'bmr-result'],
    ['calcWater', { 'water-weight': -70, 'water-activity': 1 }, 'water-result'],
    ['calcProtein', { 'protein-weight': -70, 'protein-goal': 1.2 }, 'protein-result'],
    ['calcIdealWeight', { 'iw-gender': 'm', 'iw-height': 'Infinity', 'iw-height-unit': 'cm' }, 'iw-result']
  ]) {
    const { context, nodes, messages } = homepageFunctions([fn], values);
    context[fn]();
    assert.equal(nodes[result]?.innerText, undefined, fn + ' must not publish a result');
    assert.ok(messages.length, fn + ' explains invalid input');
  }
});

test('GST accepts a zero amount but rejects negative amounts', () => {
  const { context, nodes, results, messages } = homepageFunctions(['calcGST'], { 'gst-amount': 0, 'gst-rate': 18, 'gst-action': 'add' });
  context.calcGST();
  assert.equal(results['gst-total'], 0);
  nodes['gst-amount'].value = '-100';
  context.calcGST();
  assert.equal(results['gst-total'], 0);
  assert.match(messages.at(-1)[0], /valid|non-negative/i);
});

test('calendar age handles month ends, leap days, invalid and future dates', () => {
  const { context } = homepageFunctions(['calendarAgeParts']);
  const age = context.calendarAgeParts('2025-01-31', new Date(2025, 2, 1));
  assert.equal(age.years, 0); assert.equal(age.months, 1); assert.equal(age.days, 1);
  assert.equal(age.totalDays, 29);
  const leap = context.calendarAgeParts('2024-02-29', new Date(2025, 1, 28));
  assert.equal(leap.years, 1); assert.equal(leap.months, 0); assert.equal(leap.days, 0);
  for (const value of ['2099-01-01', '2025-02-30', '', 'not-a-date']) {
    assert.equal(context.calendarAgeParts(value, new Date(2025, 2, 1)), null);
  }
});

test('SIP and FD reject unbounded durations and calculation overflow', () => {
  for (const years of ['Infinity', 1000000, -1]) {
    for (const [name, inputs] of [
      ['calcSIP', { 'sip-monthly': 1000, 'sip-rate': 8, 'sip-years': years }],
      ['calcFD', { 'fd-principal': 1000, 'fd-rate': 8, 'fd-citizen': 0, 'fd-years': years }]
    ]) {
      const { context, results, messages } = homepageFunctions([name], inputs);
      context[name]();
      assert.equal(Object.keys(results).length, 0);
      assert.ok(messages.length);
    }
  }
  const { context, results } = homepageFunctions(['calcSIP'], { 'sip-monthly': 1000, 'sip-rate': 1e-12, 'sip-years': 1 });
  context.calcSIP();
  assert.ok(Math.abs(results['sip-total'] - 12000) < 0.000001);
});

test('attendance handles impossible targets without loops and computes exact class counts', () => {
  const { context, nodes, messages } = homepageFunctions(['calcAttendance'], { 'att-total': 100, 'att-present': 70, 'att-target': 75 });
  context.calcAttendance();
  assert.match(nodes['att-result'].innerHTML, /attend 20 more/);
  nodes['att-target'].value = '100';
  context.calcAttendance();
  assert.match(nodes['att-result'].innerText, /cannot be reached/);
  for (const target of ['0', '101', 'Infinity', '-1']) {
    nodes['att-target'].value = target;
    context.calcAttendance();
    assert.match(messages.at(-1)[0], /target/);
  }
  nodes['att-target'].value = '75'; nodes['att-present'].value = '80';
  context.calcAttendance();
  assert.match(nodes['att-result'].innerHTML, /bunk 6 more/);
});

test('tip splitting rejects fractional people and permits a zero bill', () => {
  const { context, nodes, messages, results } = homepageFunctions(['calcTip'], { 'tip-bill': 100, 'tip-rate': 10, 'tip-people': 1.5 });
  context.calcTip();
  assert.equal(Object.keys(results).length, 0);
  assert.match(messages.at(-1)[0], /whole number/);
  nodes['tip-people'].value = '2'; context.calcTip();
  assert.equal(results['tip-person'], 55);
  nodes['tip-bill'].value = '0'; context.calcTip();
  assert.equal(results['tip-person'], 0);
});

test('CGPA includes zero grades and rejects partial or out-of-range rows', () => {
  const { context, nodes, messages } = homepageFunctions(['calcCGPA']);
  const credits = [{ value: '3' }, { value: '3' }];
  const grades = [{ value: '0' }, { value: '10' }];
  context.document.querySelectorAll = selector => selector === '.cgpa-credit' ? credits : grades;
  context.calcCGPA();
  assert.equal(nodes['cgpa-result'].innerText, '5.00 GPA');
  for (const grade of ['', '-1', '11', 'Infinity']) {
    grades[0].value = grade; context.calcCGPA();
    assert.match(messages.at(-1)[0], /Subject 1/);
  }
});

test('homepage EMI rejects fractional terms and remains stable near zero interest', () => {
  const { context, nodes, results, messages } = homepageFunctions(['calcEMI'], {
    'emi-amount': 120000, 'emi-rate': 1e-12, 'emi-tenure': 12,
    'emi-principal': { style: {} }, 'emi-interest': { style: {} }
  });
  context.calcEMI();
  assert.ok(Math.abs(results['emi-monthly-result'] - 10000) < 0.000001);
  nodes['emi-tenure'].value = '1.5'; context.calcEMI();
  assert.match(messages.at(-1)[0], /whole months/);
});

test('time arithmetic validates minutes and preserves subtraction sign', () => {
  const { context, nodes, messages } = homepageFunctions(['calcTime'], { 'time-h1': 0, 'time-m1': 10, 'time-h2': 1, 'time-m2': 15, 'time-op': '-' });
  context.calcTime(); assert.equal(nodes['time-result'].innerText, '-1h 5m');
  for (const value of ['60', '-1', '1.5', 'Infinity']) {
    nodes['time-m1'].value = value; context.calcTime();
    assert.match(messages.at(-1)[0], /minutes from 0 to 59/);
  }
});

test('geometry rejects non-finite or overflowing inputs', () => {
  for (const [fn, values] of [
    ['calcCircle', { 'circle-radius': '1e308' }],
    ['calcTriangle', { 'tri-base': '1e308', 'tri-height': '1e308' }],
    ['calcPythagorean', { 'pyth-a': 'Infinity', 'pyth-b': '4' }],
    ['calcVolume', { 'volume-shape': 'cube', 'volume-a': 'Infinity' }]
  ]) {
    const { context, messages } = homepageFunctions([fn], values);
    context[fn](); assert.ok(messages.length, fn + ' must show an error');
  }
});

test('standalone age agrees with month-end calendar convention', () => {
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [2025, 2, 1])); } }
  const nodes = { 'age-dob': { value: '2025-01-31' } };
  const context = vm.createContext({ Date: FixedDate, window: {}, document: { addEventListener() {}, getElementById: id => nodes[id] ||= {} } });
  vm.runInContext(read('calculator-pages.js').replace('return { init };', 'return { init, calculateAge };') + '\ncalculatorPage.calculateAge();', context);
  assert.equal(nodes['age-result'].textContent, '0 years, 1 months, 1 days');
  assert.equal(nodes['age-days'].textContent, '29 total days');
});

test('category deep links include Math and Geometry and reject unknown categories', () => {
  // This helper precedes startup event registration; evaluate only its declaration.
  const source = read('script.js').match(/function isToolCategory\(category\) \{[\s\S]*?\n\}/)[0];
  const context = vm.createContext({});
  vm.runInContext(source, context);
  for (const category of ['all', 'basic', 'finance', 'electricity', 'health', 'math', 'geometry', 'education', 'web']) {
    assert.equal(context.isToolCategory(category), true);
  }
  assert.equal(context.isToolCategory('unknown'), false);
  assert.equal(context.isToolCategory(null), false);
});

test('password matrix: all 57 lengths and all 8 option combinations', () => {
  const { context, nodes } = homepageFunctions(['generatePassword'], {
    'pwd-length': 8, 'pwd-upper': { checked: false }, 'pwd-numbers': { checked: false }, 'pwd-symbols': { checked: false }
  });
  for (let length = 8; length <= 64; length++) for (let mask = 0; mask < 8; mask++) {
    nodes['pwd-length'].value = String(length);
    nodes['pwd-upper'].checked = Boolean(mask & 1);
    nodes['pwd-numbers'].checked = Boolean(mask & 2);
    nodes['pwd-symbols'].checked = Boolean(mask & 4);
    context.generatePassword();
    const value = nodes['pwd-result'].innerText;
    assert.equal(value.length, length);
    assert.match(value, /[a-z]/);
    assert.equal(/[A-Z]/.test(value), Boolean(mask & 1));
    assert.equal(/[0-9]/.test(value), Boolean(mask & 2));
    assert.equal(/[^a-zA-Z0-9]/.test(value), Boolean(mask & 4));
  }
});

test('attendance matrix: 6,625 combinations agree with bounded brute-force arithmetic', () => {
  const { context, nodes } = homepageFunctions(['calcAttendance'], { 'att-total': 1, 'att-present': 0, 'att-target': 75 });
  for (let total = 1; total <= 50; total++) for (let present = 0; present <= total; present++) for (const target of [25, 50, 75, 90, 100]) {
    nodes['att-total'].value = String(total); nodes['att-present'].value = String(present); nodes['att-target'].value = String(target);
    context.calcAttendance();
    if (target === 100 && present < total) { assert.match(nodes['att-result'].innerText, /cannot be reached/); continue; }
    if (present / total * 100 >= target) {
      let allowed = 0;
      while (present / (total + allowed + 1) * 100 >= target) allowed++;
      assert.match(nodes['att-result'].innerHTML, new RegExp(`bunk ${allowed} more`));
    } else {
      let needed = 0;
      while ((present + needed) / (total + needed) * 100 < target) needed++;
      assert.match(nodes['att-result'].innerHTML, new RegExp(`attend ${needed} more`));
    }
  }
});

test('loan matrix: 60 combinations reproduce principal from discounted payments', () => {
  const api = traffic();
  for (const principal of [1, 1000, 1000000]) for (const rate of [0, 1e-10, 5, 20, 100]) for (const months of [1, 12, 120, 1200]) {
    const payment = api.payment(principal, rate, months);
    assert.ok(Number.isFinite(payment) && payment > 0);
    let presentValue = 0;
    for (let month = 1; month <= months; month++) presentValue += payment / Math.pow(1 + rate / 1200, month);
    assert.ok(Math.abs(presentValue - principal) <= principal * 1e-8, `${principal}/${rate}/${months}`);
  }
});

test('calendar matrix: valid birth dates always yield non-negative calendar components', () => {
  const { context } = homepageFunctions(['calendarAgeParts']);
  let checked = 0;
  for (let year = 1900; year <= 2025; year += 5) for (let month = 1; month <= 12; month++) for (const day of [1, 28, 29, 30, 31]) {
    const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const birth = new Date(`${value}T00:00:00Z`);
    const age = context.calendarAgeParts(value, new Date(2026, 8, 9));
    if (birth.toISOString().slice(0, 10) !== value) { assert.equal(age, null); continue; }
    assert.ok(age.years >= 0 && age.months >= 0 && age.months < 12 && age.days >= 0 && age.days <= 31);
    assert.equal(age.totalDays, Math.round((Date.UTC(2026, 8, 9) - birth.getTime()) / 86400000));
    checked++;
  }
  // 1,560 candidate dates minus 176 impossible month/day combinations.
  assert.equal(checked, 1384);
});
