// Standalone page content for electricity widgets that live in tools.html.
// Worked examples recalculated independently; keep in sync with script.js.
const hub = { hub: 'electricity-calculators.html', hubName: 'Electricity calculators', kicker: 'Electricity Calculator', appCategory: 'UtilitiesApplication' };
const billPage = ['/electricity-bill-calculator-india/', 'Electricity Bill Calculator (India)'];

module.exports = [
  {
    ...hub,
    id: 'calc-power',
    slug: 'power-calculator',
    title: 'Power Calculator | Watts from Volts and Amps',
    description: 'Calculate electrical power in watts from voltage and current, with notes on when the simple P = V × I rule applies and when power factor matters.',
    h1: 'Power Calculator (Watts from Volts and Amps)',
    lede: 'Multiply voltage by current to get power in watts, and learn when that simple rule gives the right answer for household and DC circuits.',
    method: 'P = V × I',
    labels: { 'power-voltage': 'Voltage (V)', 'power-current': 'Current (A)' },
    sections: [
      ['What this calculator does', `<p>Enter a voltage in volts and a current in amperes. The calculator multiplies them to give power in watts. It is useful for reading appliance labels, sizing a fuse or MCB, checking whether a socket or extension board can take a load, and for DC circuits such as batteries, solar panels and LED strips.</p>`, 'intro-card'],
      ['Formula used', `<p>Power (W) = Voltage (V) &times; Current (A)</p><p>This is exact for DC circuits, and for AC loads that are purely resistive, such as heaters, geysers, irons, kettles and incandescent bulbs.</p>`, 'formula-box'],
      ['Worked example', `<p>A water heater draws 5 A from a 230 V household supply.</p><ul><li>Power = 230 &times; 5 = <strong>1,150 W</strong>, or about 1.15 kW</li></ul><p>Run for one hour, it uses 1.15 units (kWh) of electricity.</p>`, 'example-box'],
      ['When power factor matters', `<p>Motors, compressors, fans, pumps and many electronic power supplies do not draw current exactly in step with the voltage. For these AC loads the real power is lower than V &times; I:</p><p>Real power (W) = V &times; I &times; power factor</p><p>A fan motor drawing 5 A at 230 V with a power factor of 0.8 uses 920 W of real power, even though V &times; I is 1,150. The 1,150 figure is the <em>apparent</em> power in volt-amperes (VA), which is what wiring, inverters and generators must be able to carry. Three-phase supplies need a different formula again (&radic;3 &times; V<sub>line</sub> &times; I &times; PF), which this tool does not cover.</p>`],
      ['Practical uses', `<ul><li><strong>Socket and extension limits</strong>: a 6 A socket at 230 V supports about 1,380 W; a 16 A power socket about 3,680 W.</li><li><strong>Battery systems</strong>: a 12 V system feeding 10 A delivers 120 W.</li><li><strong>Checking labels</strong>: if a charger says 5 V and 3 A, it can deliver up to 15 W.</li></ul>`],
      ['Limitations and safety', `<p>This is an arithmetic aid, not a wiring design tool. Cable sizing, breaker selection and earthing depend on standards, installation method and cable length. For any work on mains wiring, use a licensed electrician.</p>`],
      ['Common mistakes', `<ul><li>Using V &times; I for motors and compressors and overestimating real consumption.</li><li>Mixing milliamps and amps: 500 mA is 0.5 A.</li><li>Applying single-phase arithmetic to a three-phase supply.</li></ul>`]
    ],
    faqs: [
      ['How many watts is 1 amp at 230 volts?', '230 W for a resistive load. With a power factor below 1, the real power is lower.'],
      ['What is the difference between W and VA?', 'Watts measure real power that does work. Volt-amperes are V &times; I. They are equal only when the power factor is 1.'],
      ['Can I use this for DC?', 'Yes. For DC circuits P = V &times; I is exact.'],
      ['How do I find current from watts?', 'Divide watts by volts. A 2,000 W heater on 230 V draws about 8.7 A. The Ohm&rsquo;s law calculator does this for you.'],
      ['Does this work for three-phase?', 'No. Three-phase power needs the &radic;3 factor and line voltage.']
    ],
    related: ['calc-ohm', 'calc-kwh', 'calc-generator']
  },
  {
    ...hub,
    id: 'calc-kwh',
    slug: 'kwh-calculator',
    title: 'kWh Calculator | Appliance Energy Use from Watts and Hours',
    description: 'Calculate how many kilowatt-hours (electricity units) an appliance uses from its wattage and running time, and what that costs on your bill.',
    h1: 'kWh Calculator',
    lede: 'Find out how much energy an appliance uses in kilowatt-hours, the same &ldquo;units&rdquo; your electricity bill charges for.',
    method: 'kWh = watts × hours ÷ 1,000',
    labels: { 'kwh-watts': 'Appliance power (W)', 'kwh-hours': 'Hours used' },
    sections: [
      ['What this calculator does', `<p>Enter the appliance&rsquo;s power rating in watts and how many hours it runs. The calculator returns the energy used in kilowatt-hours (kWh). One kWh is one &ldquo;unit&rdquo; on an Indian electricity bill.</p>`, 'intro-card'],
      ['Formula used', `<p>Energy (kWh) = Power (W) &times; Hours &divide; 1,000</p><p>Dividing by 1,000 converts watt-hours into kilowatt-hours.</p>`, 'formula-box'],
      ['Worked example', `<p>A 1,500 W air conditioner running for 8 hours at its full rating:</p><ul><li>Energy = 1,500 &times; 8 &divide; 1,000 = <strong>12 kWh</strong> (12 units)</li></ul><p>At 7 per unit, that night costs about 84. Over a 30-night month it would be 360 units, which is why AC use often pushes households into a higher tariff slab.</p>`, 'example-box'],
      ['Rated watts vs real use', `<p>The label wattage is the maximum, not the average. Appliances with thermostats or compressors switch on and off:</p><ul><li>An inverter AC at a moderate setting may average 40&ndash;70% of its rated power once the room is cool.</li><li>A refrigerator&rsquo;s compressor runs only part of each hour; its yearly energy figure on the BEE star label is a better guide than watts &times; 24.</li><li>Fans, lights, TVs and chargers run close to their rating while on.</li></ul><p>For a more realistic number, reduce the hours to the time the appliance actually draws full power, or use the BEE label&rsquo;s kWh per year.</p>`],
      ['Understanding each input', `<ul><li><strong>Appliance power</strong> &mdash; in watts, from the label or manual. For kW ratings multiply by 1,000; 1.5 kW is 1,500 W.</li><li><strong>Hours used</strong> &mdash; total running time. Use decimals for minutes: 30 minutes is 0.5.</li></ul>`],
      ['Limitations', `<p>The result is energy, not cost. Indian tariffs are usually slab-based, so the cost of a unit depends on your total monthly consumption, plus fixed charges and duties. Use the electricity bill calculator for a full bill estimate.</p>`],
      ['Common mistakes', `<ul><li>Forgetting to divide by 1,000 and reading watt-hours as units.</li><li>Using the rated power for appliances that cycle on and off.</li><li>Multiplying by a flat rate when the tariff is slab-based.</li></ul>`]
    ],
    faqs: [
      ['What is 1 unit of electricity?', 'One kilowatt-hour: 1,000 watts used for one hour, such as a 100 W bulb for 10 hours.'],
      ['How many units does a 1.5 ton AC use?', 'It depends on its star rating, inverter technology and settings. At a full 1,500 W it uses 1.5 units an hour; real averages are usually lower.'],
      ['How do I convert kWh to cost?', 'Multiply by your per-unit rate, remembering slab tariffs. The electricity bill calculator handles slabs.'],
      ['Is kWh the same as kW?', 'No. kW is power (how fast energy is used); kWh is energy (power over time).'],
      ['How do I estimate monthly use?', 'Use the watt to unit calculator, which multiplies by hours per day and days in the month.']
    ],
    related: ['calc-watt-unit', 'calc-power', billPage]
  },
  {
    ...hub,
    id: 'calc-watt-unit',
    slug: 'watt-to-unit-calculator',
    title: 'Watt to Unit Calculator | Monthly Electricity Units per Appliance',
    description: 'Convert an appliance’s watts and daily running hours into the electricity units (kWh) it adds to your monthly bill.',
    h1: 'Watt to Unit Calculator',
    lede: 'Work out how many electricity units an appliance adds to your monthly bill from its wattage and how long it runs each day.',
    method: 'units = watts × hours per day × days ÷ 1,000',
    labels: { 'wattunit-watts': 'Appliance power (W)', 'wattunit-hours': 'Hours per day', 'wattunit-days': 'Days' },
    sections: [
      ['What this calculator does', `<p>Enter the appliance&rsquo;s wattage, how many hours a day it runs, and the number of days (30 by default for a month). The result is the number of units, or kWh, it consumes over that period. Do this for each major appliance to see where your bill is going.</p>`, 'intro-card'],
      ['Formula used', `<p>Units (kWh) = Watts &times; Hours per day &times; Days &divide; 1,000</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>A 75 W ceiling fan running 12 hours a day for 30 days uses 75 &times; 12 &times; 30 &divide; 1,000 = <strong>27 units</strong>.</li><li>A 2,000 W geyser used for 1 hour a day uses 2,000 &times; 1 &times; 30 &divide; 1,000 = <strong>60 units</strong>.</li></ul><p>The geyser runs for a twelfth of the time but uses more than twice the energy, which is a typical finding when you list appliances one by one.</p>`, 'example-box'],
      ['Making a household energy list', `<ol><li>Write down each appliance and its wattage from the label.</li><li>Estimate hours per day honestly; for ACs and fridges, use the time the compressor actually runs, or the BEE star label figure.</li><li>Run each through this calculator and add the units.</li><li>Compare the total with your last bill. If your list is far lower, something is running more than you think, or there is a fault.</li></ol>`],
      ['Understanding each input', `<ul><li><strong>Watts</strong> &mdash; the appliance&rsquo;s power rating.</li><li><strong>Hours per day</strong> &mdash; decimals allowed; 20 minutes is about 0.33.</li><li><strong>Days</strong> &mdash; 30 for a typical month, or your billing cycle. Many Indian discoms bill every two months, so use about 60 to match a bimonthly bill.</li></ul>`],
      ['Limitations', `<p>The result assumes the appliance draws its rated power whenever it is on. Thermostatic appliances use less. Standby power from TVs, set-top boxes and chargers is small per device but adds up; include it as a few watts for 24 hours if you want a complete picture.</p>`],
      ['Common mistakes', `<ul><li>Using 30 days when your discom bills every two months.</li><li>Counting a fridge as running at full power 24 hours a day.</li><li>Forgetting appliances used seasonally, such as heaters or coolers.</li></ul>`]
    ],
    faqs: [
      ['How many units does a fan use per month?', 'A 75 W fan used 12 hours a day uses about 27 units a month. A BLDC fan of around 30 W uses roughly 11.'],
      ['What is the difference between this and the kWh calculator?', 'This one multiplies by days for a monthly or billing-cycle total; the kWh calculator works on a single run time.'],
      ['How do I turn units into a bill amount?', 'Use the electricity bill calculator, which applies slab rates and fixed charges.'],
      ['Why does my bill show more units than my list?', 'Appliances may run longer than estimated, older appliances use more than their label, and wiring faults or leakage add consumption.'],
      ['Should I count standby power?', 'For accuracy, yes. A few watts left on all day becomes a few units a month per device.']
    ],
    related: ['calc-kwh', 'calc-power', billPage]
  },
  {
    ...hub,
    id: 'calc-solar',
    slug: 'solar-panel-size-calculator',
    title: 'Solar Panel Size Calculator | System kW from Daily Units',
    description: 'Estimate the rooftop solar system size in kW needed to cover your daily electricity use, from units per day, peak sun hours and system efficiency.',
    h1: 'Solar Panel Size Calculator',
    lede: 'Estimate how many kilowatts of solar panels it would take to cover your daily electricity use before you ask for quotes.',
    method: 'size = daily kWh ÷ (sun hours × efficiency)',
    labels: { 'solar-kwh': 'Daily usage (kWh)', 'solar-sun': 'Peak sun hours per day', 'solar-efficiency': 'System efficiency (%)' },
    sections: [
      ['What this calculator does', `<p>Enter how many units (kWh) you use per day, the average peak sun hours at your location, and the overall system efficiency. The calculator returns the panel capacity needed, in kW and watts, to generate that much energy on an average day.</p>`, 'intro-card'],
      ['Formula used', `<p>Panel capacity (W) = Daily usage (kWh) &times; 1,000 &divide; (Peak sun hours &times; Efficiency)</p><p>Peak sun hours are the equivalent number of hours of full-strength sunlight per day. Efficiency covers real-world losses from heat, dust, wiring and the inverter.</p>`, 'formula-box'],
      ['Worked example', `<p>A household uses 300 units a month, about 10 units a day. With 5 peak sun hours and 80% efficiency:</p><ul><li>Capacity = 10 &times; 1,000 &divide; (5 &times; 0.80) = <strong>2,500 W, or 2.5 kW</strong></li></ul><p>In practice that would be rounded to a standard size, such as a 3 kW system made of panels of around 540 W each.</p>`, 'example-box'],
      ['Finding your daily usage', `<p>Take the units from your last 12 bills, add them, and divide by 365. Using a year evens out summer AC use and winter months. If your discom bills every two months, divide each bill&rsquo;s units by about 60 for a daily figure.</p><p>Many Indian installers use a rule of thumb that 1 kW of rooftop solar generates about 4 units a day on average. That matches 5 sun hours at 80% efficiency, so the defaults here give similar answers.</p>`],
      ['Understanding each input', `<ul><li><strong>Daily usage</strong> &mdash; average kWh per day you want solar to cover. Enter less if you only want to offset part of your bill.</li><li><strong>Peak sun hours</strong> &mdash; usually 4.5 to 6 across most of India. Rainy or hazy regions are lower.</li><li><strong>Efficiency</strong> &mdash; 75&ndash;85% is typical for a well-installed grid-tied system. It must not exceed 100.</li></ul>`],
      ['Assumptions and limitations', `<p>This gives a yearly-average size. Generation varies by season, roof angle and direction, shading from nearby buildings and trees, and panel cleaning. It does not size batteries for off-grid systems, check whether your roof has space (roughly 6&ndash;8 square metres per kW for modern panels), or account for your discom&rsquo;s net-metering limits. A site survey by an installer is needed before buying. Government subsidy schemes for rooftop solar, such as PM Surya Ghar, have their own capacity rules; check the official portal for current terms.</p>`],
      ['Common mistakes', `<ul><li>Sizing from a single summer bill, which oversizes the system.</li><li>Entering 12 sun hours because the sun is up for 12 hours.</li><li>Ignoring shade, which can cut output far more than the efficiency figure allows for.</li></ul>`]
    ],
    faqs: [
      ['How many units does a 1 kW solar system generate in India?', 'Roughly 3.5&ndash;4.5 units a day on average, depending on location, season and installation.'],
      ['What are peak sun hours?', 'The number of hours of 1,000 W per square metre sunlight that would deliver the same energy as the day&rsquo;s actual sunlight.'],
      ['Does this include batteries?', 'No. It sizes panels for a grid-tied system. Battery sizing depends on how many hours of backup you need.'],
      ['How much roof space do I need?', 'As a rough guide, 6&ndash;8 square metres of shade-free roof per kW of modern panels.'],
      ['Should I size for 100% of my use?', 'Not necessarily. Net-metering rules, roof space and budget often make a smaller system sensible.']
    ],
    related: ['calc-inverter', 'calc-watt-unit', billPage]
  },
  {
    ...hub,
    id: 'calc-inverter',
    slug: 'inverter-battery-backup-calculator',
    title: 'Inverter Battery Backup Calculator | Hours of Backup from Ah and Load',
    description: 'Estimate how long a home inverter battery will run your load, from battery Ah, voltage, load in watts and inverter efficiency.',
    h1: 'Inverter Battery Backup Calculator',
    lede: 'Estimate how many hours of power cut your inverter battery can cover for the fans, lights and appliances you plan to run.',
    method: 'hours = Ah × V × efficiency ÷ load',
    labels: { 'inv-ah': 'Battery capacity (Ah)', 'inv-voltage': 'Battery voltage (V)', 'inv-load': 'Load (W)', 'inv-efficiency': 'Inverter efficiency (%)' },
    sections: [
      ['What this calculator does', `<p>Enter the battery&rsquo;s capacity in ampere-hours (Ah), its voltage, the total load you want to run in watts, and the inverter&rsquo;s efficiency. The calculator estimates the backup time in hours and minutes.</p>`, 'intro-card'],
      ['Formula used', `<p>Backup (hours) = Battery Ah &times; Battery voltage &times; Efficiency &divide; Load (W)</p><p>Ah &times; V gives the battery&rsquo;s stored energy in watt-hours. Efficiency accounts for energy lost in the inverter as it converts battery DC to household AC.</p>`, 'formula-box'],
      ['Worked example', `<p>A 150 Ah, 12 V tubular battery running 300 W of load (three fans, four LED lights and a Wi-Fi router) through an inverter that is 85% efficient:</p><ul><li>Backup = 150 &times; 12 &times; 0.85 &divide; 300 = <strong>5.1 hours</strong> on paper</li></ul>`, 'example-box'],
      ['Why real backup is usually shorter', `<p>The formula assumes you can use the battery&rsquo;s full rated capacity. You usually cannot, and should not:</p><ul><li><strong>Depth of discharge</strong>: lead-acid batteries last much longer if they are not drained below about 50%. Using half the capacity, the example above gives about 2.5 hours of healthy backup.</li><li><strong>Discharge rate</strong>: a battery&rsquo;s Ah rating is measured over a long discharge (often 20 hours). Heavy loads drain it faster than the simple formula predicts.</li><li><strong>Age and temperature</strong>: capacity falls as batteries age and in very hot rooms.</li></ul><p>Lithium batteries tolerate deeper discharge, often 80&ndash;90%, so they come closer to the calculated figure.</p>`],
      ['Understanding each input', `<ul><li><strong>Battery capacity</strong> &mdash; the Ah rating on the battery, such as 100, 150 or 200.</li><li><strong>Battery voltage</strong> &mdash; 12 V for a single battery. Two 12 V batteries in series make a 24 V system with the same Ah.</li><li><strong>Load</strong> &mdash; the sum of the wattages you will run together. Ceiling fan about 75 W (BLDC about 30 W), LED tube about 20 W, TV 60&ndash;120 W, Wi-Fi router about 10 W.</li><li><strong>Efficiency</strong> &mdash; 80&ndash;90% for most home inverters.</li></ul>`],
      ['What to keep off the inverter', `<p>Most home inverters of 700&ndash;1,100 VA cannot run geysers, irons, induction cooktops or ACs. Even when a high-wattage appliance runs, it empties the battery very quickly. Check the inverter&rsquo;s VA rating as well as the battery.</p>`],
      ['Common mistakes', `<ul><li>Expecting the full calculated backup from a lead-acid battery.</li><li>Adding batteries in series and also doubling the Ah.</li><li>Using the inverter&rsquo;s VA rating as the load.</li></ul>`]
    ],
    faqs: [
      ['How long will a 150Ah battery last?', 'On paper, about 5 hours at 300 W with 85% efficiency. For long battery life with lead-acid, plan for around half of that.'],
      ['Which battery is better for long power cuts?', 'Tall tubular lead-acid batteries handle deep cycling better than flat-plate ones. Lithium batteries handle it best but cost more.'],
      ['How do I calculate my load?', 'Add the wattage of everything that runs at the same time during a power cut.'],
      ['What is the difference between this and the UPS calculator?', 'The maths is the same. The UPS page shows minutes and focuses on computer loads.'],
      ['Does inverter VA rating affect backup?', 'Not directly. VA limits how much load you can connect; battery Ah decides how long it lasts.']
    ],
    related: ['calc-ups', 'calc-solar', 'calc-power']
  },
  {
    ...hub,
    id: 'calc-ups',
    slug: 'ups-backup-time-calculator',
    title: 'UPS Backup Time Calculator | Runtime in Minutes for PC and Server Loads',
    description: 'Estimate UPS runtime in minutes for a computer, NAS or small server from battery Ah, voltage, load in watts and UPS efficiency.',
    h1: 'UPS Backup Time Calculator',
    lede: 'Estimate how many minutes a UPS can keep a computer, router or small server running, so you know whether there is time to save work and shut down safely.',
    method: 'minutes = Ah × V × efficiency ÷ load × 60',
    labels: { 'ups-ah': 'Battery capacity (Ah)', 'ups-voltage': 'Battery voltage (V)', 'ups-load': 'PC or server load (W)', 'ups-efficiency': 'UPS efficiency (%)' },
    sections: [
      ['What this calculator does', `<p>Enter the UPS battery capacity, the battery voltage, the load you connect, and the UPS efficiency. The calculator estimates runtime in minutes (and hours) at that load.</p>`, 'intro-card'],
      ['Formula used', `<p>Runtime (minutes) = Battery Ah &times; Voltage &times; Efficiency &divide; Load (W) &times; 60</p>`, 'formula-box'],
      ['Worked example', `<p>A typical 600 VA desktop UPS has one 12 V, 7 Ah battery. Running a 100 W load (a desktop PC and monitor at light use) at 80% efficiency:</p><ul><li>Runtime = 7 &times; 12 &times; 0.80 &divide; 100 &times; 60 &asymp; <strong>40 minutes</strong> on paper</li></ul><p>In practice small sealed batteries deliver well under their rated capacity at this discharge rate, and an ageing battery even less. Expect closer to 10&ndash;20 minutes.</p>`, 'example-box'],
      ['What a UPS is really for', `<p>A desktop UPS is designed to ride through short outages and give you time to save work and shut down cleanly, not to run a computer for hours. If you need long runtime, look at an inverter with a larger battery, or a UPS that supports external battery packs.</p><p>For servers and NAS boxes, configure automatic shutdown through the UPS&rsquo;s USB or network port so the system closes safely before the battery is exhausted.</p>`],
      ['Measuring your load', `<p>The wattage on a PC power supply is its maximum, not what it draws. A typical office desktop with monitor draws 60&ndash;150 W; a gaming PC under load can draw 300&ndash;600 W. Many UPS units show the current load on their display or software, which is the best number to use. A plug-in energy meter also works.</p>`],
      ['Limitations', `<p>Battery runtime is not linear: higher loads drain sealed lead-acid batteries disproportionately faster, and capacity falls with age, typically needing replacement every 2&ndash;4 years. Manufacturer runtime charts for your exact model are more accurate than this formula.</p>`],
      ['Common mistakes', `<ul><li>Using the UPS VA rating as the load.</li><li>Expecting a 600 VA UPS to run a PC for an hour.</li><li>Plugging laser printers or heaters into the UPS battery outlets.</li></ul>`]
    ],
    faqs: [
      ['How long will a 600VA UPS last?', 'Usually 10&ndash;20 minutes for a typical office PC, depending on load and battery health.'],
      ['Why is my real backup shorter than the result?', 'Small batteries deliver less than their rating at high discharge rates, and capacity drops with age.'],
      ['Can I connect a laser printer to a UPS?', 'Not to the battery outlets; laser printers draw large surges when heating.'],
      ['How often should I replace the UPS battery?', 'Typically every 2&ndash;4 years, sooner in hot rooms.'],
      ['Is VA the same as watts for a UPS?', 'No. A UPS&rsquo;s watt rating is usually about 60% of its VA rating.']
    ],
    related: ['calc-inverter', 'calc-power', 'calc-kwh']
  },
  {
    ...hub,
    id: 'calc-ohm',
    slug: 'ohms-law-calculator',
    title: 'Ohm’s Law Calculator | Voltage, Current, Resistance and Power',
    description: 'Enter any two of voltage, current, resistance or power and get the other two, using Ohm’s law and the power equations.',
    h1: 'Ohm’s Law Calculator',
    lede: 'Enter any two values out of voltage, current, resistance and power, and the calculator works out the other two.',
    method: 'V = I × R and P = V × I',
    labels: { 'ohm-voltage': 'Voltage (V)', 'ohm-current': 'Current (A)', 'ohm-resistance': 'Resistance (Ω)', 'ohm-power': 'Power (W)' },
    sections: [
      ['What this calculator does', `<p>Ohm&rsquo;s law links voltage, current and resistance in a conductor. Combined with the power equation, knowing any two of the four quantities lets you find the rest. Fill in any two boxes and leave the others blank; the calculator shows all four values.</p>`, 'intro-card'],
      ['Formulas used', `<p>V = I &times; R &nbsp;&nbsp; I = V &divide; R &nbsp;&nbsp; R = V &divide; I</p><p>P = V &times; I &nbsp;&nbsp; P = I&sup2; &times; R &nbsp;&nbsp; P = V&sup2; &divide; R</p><p>If more than two values are entered, the calculator uses the first usable pair in this order: voltage and current, voltage and resistance, current and resistance, then the pairs involving power.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>12 V across a component carrying 2 A: R = 12 &divide; 2 = <strong>6 &Omega;</strong>, P = 12 &times; 2 = <strong>24 W</strong>.</li><li>A 1,000 W heater element on 230 V: I = 1,000 &divide; 230 &asymp; <strong>4.35 A</strong>, R = 230 &divide; 4.35 &asymp; <strong>52.9 &Omega;</strong>.</li><li>An LED needs 20 mA from a 5 V supply with 2 V across the LED. The resistor drops 3 V, so R = 3 &divide; 0.02 = <strong>150 &Omega;</strong>, dissipating 0.06 W.</li></ul>`, 'example-box'],
      ['Where Ohm&rsquo;s law applies', `<p>It holds for resistive components at a steady temperature: resistors, heating elements, wires. It does not describe diodes, LEDs, transistors or motors, whose current does not rise in proportion to voltage. For AC motors and other reactive loads, use impedance and power factor instead of plain resistance.</p>`],
      ['Understanding each input', `<ul><li><strong>Voltage</strong> in volts, <strong>current</strong> in amperes, <strong>resistance</strong> in ohms and <strong>power</strong> in watts.</li><li>Convert prefixes first: 20 mA = 0.02 A, 4.7 k&Omega; = 4,700 &Omega;.</li><li>All entered values must be positive.</li></ul>`],
      ['Common mistakes', `<ul><li>Entering milliamps as amps, which makes resistance 1,000 times too small.</li><li>Applying Ohm&rsquo;s law to an LED directly instead of to its series resistor.</li><li>Forgetting a resistor&rsquo;s power rating: a 0.25 W resistor dissipating 0.5 W will overheat.</li></ul>`]
    ],
    faqs: [
      ['What is Ohm&rsquo;s law?', 'Voltage equals current multiplied by resistance (V = I &times; R) for a resistive conductor.'],
      ['How many values do I need to enter?', 'Any two positive values. The calculator finds the other two.'],
      ['How do I calculate an LED resistor?', 'Subtract the LED&rsquo;s forward voltage from the supply voltage, then divide by the LED current in amps.'],
      ['Does it work for AC?', 'For purely resistive AC loads, yes, using RMS values. For motors and other reactive loads, no.'],
      ['Why is resistance shown in ohms only?', 'Enter all values in base units and convert prefixes such as kilo and milli yourself.']
    ],
    related: ['calc-power', 'calc-kwh', ['/math-calculators.html', 'Math calculators']]
  },
  {
    ...hub,
    id: 'calc-generator',
    slug: 'generator-size-calculator',
    title: 'Generator Size Calculator | kVA from Load, Power Factor and Margin',
    description: 'Estimate the generator size in kVA for a total load in watts, using power factor and a safety margin, with guidance on motor starting loads.',
    h1: 'Generator Size Calculator (kVA)',
    lede: 'Convert the total load you need to run into a generator rating in kVA, with a margin so the generator is not running flat out.',
    method: 'kVA = watts ÷ (PF × 1,000) × (1 + margin)',
    labels: { 'gen-load': 'Total running load (W)', 'gen-pf': 'Power factor (0–1)', 'gen-margin': 'Safety margin (%)' },
    sections: [
      ['What this calculator does', `<p>Generators are rated in kVA (apparent power), while appliances are usually rated in watts (real power). Enter the total wattage you need to run at once, the load&rsquo;s power factor, and a safety margin. The calculator returns the generator size in kVA.</p>`, 'intro-card'],
      ['Formula used', `<p>kVA = Load (W) &divide; (Power factor &times; 1,000) &times; (1 + Margin &divide; 100)</p><p>Most generators in India are rated at a power factor of 0.8, which is why 0.8 is the default.</p>`, 'formula-box'],
      ['Worked example', `<p>A small shop needs 5,000 W of running load. With a power factor of 0.8 and a 25% safety margin:</p><ul><li>kVA = 5,000 &divide; (0.8 &times; 1,000) &times; 1.25 = <strong>7.81 kVA</strong></li></ul><p>You would choose the next standard size up, such as a 10 kVA set, especially if any motors are on the list.</p>`, 'example-box'],
      ['Starting load: the part people miss', `<p>Motors draw several times their running current for a moment when they start. AC compressors, water pumps, refrigerators, lifts and air compressors can need 3&ndash;7 times their running watts at start-up. If the generator cannot supply this surge, the motor stalls or the generator trips.</p><p>A practical approach: add up the running watts of everything, then add the extra starting watts of the single largest motor (since motors rarely start at the same instant). Enter that total as the load, or increase the safety margin.</p>`],
      ['Understanding each input', `<ul><li><strong>Total load</strong> &mdash; the sum of the watts that will run together.</li><li><strong>Power factor</strong> &mdash; 0.8 is the standard rating assumption; it must be between 0 and 1.</li><li><strong>Safety margin</strong> &mdash; 20&ndash;25% is common so the generator runs at about 75&ndash;80% of capacity, which is better for fuel use and engine life.</li></ul>`],
      ['Limitations', `<p>This gives a first estimate. Three-phase balancing, altitude and temperature derating, cable runs and changeover switch sizing all affect the final choice. For a building or commercial installation, have an electrician or the generator supplier do a load study.</p>`],
      ['Common mistakes', `<ul><li>Treating kVA and kW as the same: a 10 kVA generator at 0.8 PF supplies 8 kW.</li><li>Ignoring motor starting surges.</li><li>Sizing for the whole connected load when only part of it runs during an outage.</li></ul>`]
    ],
    faqs: [
      ['What is the difference between kVA and kW?', 'kW is real power; kVA is apparent power. kW = kVA &times; power factor.'],
      ['Why is power factor 0.8?', 'It is the standard rating point for most generator sets.'],
      ['How much safety margin should I use?', '20&ndash;25% is common. Use more if you expect to add load later or have large motors.'],
      ['Can a 5 kVA generator run a 1.5 ton AC?', 'Usually yes for running load, but check its starting current; inverter ACs start more gently than fixed-speed ones.'],
      ['Does this work for three-phase generators?', 'It gives the total kVA, but the load must also be balanced across phases.']
    ],
    related: ['calc-power', 'calc-inverter', 'calc-kwh']
  },
  {
    ...hub,
    id: 'calc-ev',
    slug: 'ev-charging-cost-calculator',
    title: 'EV Charging Cost Calculator | Cost to Charge an Electric Car or Scooter',
    description: 'Estimate the cost of charging an electric car, scooter or bike from battery capacity, how much charge you need and your electricity rate.',
    h1: 'EV Charging Cost Calculator',
    lede: 'Work out what it costs to charge your electric car, scooter or bike at home or at a public charger.',
    method: 'cost = battery kWh × charge needed × rate',
    labels: { 'ev-capacity': 'Battery capacity (kWh)', 'ev-rate': 'Electricity rate per kWh', 'ev-percent': 'Charge needed (%)' },
    sections: [
      ['What this calculator does', `<p>Enter the battery&rsquo;s usable capacity in kWh, your electricity rate per unit, and how much charge you need as a percentage. The calculator estimates the cost of that charge.</p>`, 'intro-card'],
      ['Formula used', `<p>Cost = Battery capacity (kWh) &times; Charge needed % &divide; 100 &times; Rate per kWh</p>`, 'formula-box'],
      ['Worked example', `<p>An electric car with a 30 kWh battery charged from 20% to 100% (80% needed) at home, where electricity costs 8 per unit:</p><ul><li>Energy = 30 &times; 0.80 = 24 kWh</li><li>Cost = 24 &times; 8 = <strong>192</strong></li></ul>`, 'example-box'],
      ['Include charging losses', `<p>Some energy is lost as heat in the charger and battery. AC home charging typically loses 10&ndash;15%, so the meter records more units than the battery stores. With about 12% loss, the example above costs closer to <strong>218</strong>. To include losses, divide the result by 0.88, or raise the charge-needed figure.</p>`],
      ['Home vs public charging', `<p>At home you pay your normal tariff, which in India is often 5&ndash;10 per unit depending on your state and slab. Charging can push you into a higher slab, so look at your marginal rate. Some states offer a separate EV tariff or time-of-day rates. Public DC fast chargers usually charge a higher rate per kWh plus GST, and sometimes a session or parking fee.</p>`],
      ['Cost per kilometre', `<p>Divide the charging cost by the range you get from that charge. If 24 kWh gives about 200 km of real-world driving, the 218 charge works out to roughly 1.1 per km. Compare that with your petrol or diesel cost using the fuel and trip cost calculator.</p>`],
      ['Common mistakes', `<ul><li>Using total battery capacity when the car only lets you use part of it. Use the usable capacity from the specifications.</li><li>Ignoring charging losses.</li><li>Comparing a home charging cost with a petrol price without converting both to cost per kilometre.</li></ul>`]
    ],
    faqs: [
      ['How much does it cost to charge an EV at home in India?', 'Battery kWh &times; your per-unit rate, plus about 10&ndash;15% for losses. For a 30 kWh car fully charged at 8 per unit, roughly 240&ndash;275.'],
      ['How much does an electric scooter charge cost?', 'A 3 kWh scooter battery charged fully at 7 per unit costs about 21, plus losses.'],
      ['Should I charge to 100%?', 'Many manufacturers suggest 80% for daily use to extend battery life; follow your vehicle&rsquo;s guidance.'],
      ['Are public chargers more expensive?', 'Usually yes, especially DC fast chargers, which add GST and sometimes session fees.'],
      ['Does this include charging losses?', 'No. Divide the result by about 0.88 to include typical AC charging losses.']
    ],
    related: ['calc-mileage', 'calc-kwh', billPage]
  }
];
