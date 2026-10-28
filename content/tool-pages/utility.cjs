// Standalone page content for everyday and web utility widgets that live in tools.html.
// Worked examples recalculated independently or produced by the site's own functions.
const util = { hub: 'utility-tools.html', hubName: 'Utility tools', kicker: 'Utility Tool', appCategory: 'UtilitiesApplication' };
const dev = { hub: 'utility-tools.html', hubName: 'Utility tools', kicker: 'Developer Tool', appCategory: 'DeveloperApplication' };
const math = { hub: 'math-calculators.html', hubName: 'Math calculators', kicker: 'Math Calculator', appCategory: 'UtilitiesApplication' };

module.exports = [
  {
    ...math,
    id: 'calc-standard',
    slug: 'basic-calculator',
    title: 'Basic Calculator Online | Add, Subtract, Multiply and Divide',
    description: 'A simple on-screen calculator for everyday arithmetic, with operator precedence explained and tips for percentages and repeated sums.',
    h1: 'Basic Calculator',
    lede: 'A simple calculator for everyday sums: add, subtract, multiply and divide, with the order of operations handled for you.',
    method: 'standard arithmetic with operator precedence',
    toolHeading: 'Calculator',
    sections: [
      ['What this calculator does', `<p>Tap the number and operator buttons to build a calculation, then press = for the answer. C clears everything. The calculator follows the normal order of operations and shows results to up to four decimal places.</p>`, 'intro-card'],
      ['Order of operations', `<p>Multiplication and division are done before addition and subtraction, working left to right, as taught in school (BODMAS or PEMDAS). So 5 &times; 4 + 3 = 23, and 3 + 5 &times; 4 is also 23, not 32. A basic pocket calculator that works strictly left to right would give 32 for the second one; this calculator does not.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>12 + 8 &times; 3 = 12 + 24 = <strong>36</strong></li><li>100 &divide; 8 = <strong>12.5</strong></li><li>2 &divide; 3 = <strong>0.6667</strong> (rounded to four decimal places)</li></ul>`, 'example-box'],
      ['Everyday shortcuts', `<ul><li><strong>Percentages</strong>: 18% of 2,500 is 2500 &times; 0.18 = 450. For more percentage tasks, use the percentage calculator.</li><li><strong>Adding GST</strong>: multiply by 1.18 for 18%.</li><li><strong>Splitting a bill</strong>: total &divide; people.</li><li><strong>Unit price</strong>: price &divide; quantity to compare pack sizes, such as 450 &divide; 5 kg = 90 per kg.</li></ul>`],
      ['Limitations', `<p>There are no brackets or memory keys on this simple calculator. For brackets, powers, roots, trigonometry or logarithms, use the scientific calculator. Results are rounded to four decimal places.</p>`]
    ],
    faqs: [
      ['Does it follow BODMAS?', 'Yes. Multiplication and division are done before addition and subtraction.'],
      ['How many decimal places does it show?', 'Up to four.'],
      ['Can I use brackets?', 'Not on this calculator. The scientific calculator supports brackets.'],
      ['How do I calculate a percentage?', 'Multiply by the percentage as a decimal, for example &times; 0.18 for 18%, or use the percentage calculator.'],
      ['Does it work offline?', 'Once the page has loaded, calculations run in your browser.']
    ],
    related: ['calc-scientific', ['/percentage-calculator.html', 'Percentage Calculator'], 'calc-fraction']
  },
  {
    ...math,
    id: 'calc-scientific',
    slug: 'scientific-calculator',
    title: 'Scientific Calculator Online | Trigonometry, Logs, Powers and Roots',
    description: 'Free online scientific calculator with sin, cos, tan, log, ln, powers, square roots, factorials, pi and e, with notes on radians and precedence.',
    h1: 'Scientific Calculator',
    lede: 'Work with brackets, powers, roots, trigonometry, logarithms and factorials in your browser.',
    method: 'JavaScript Math functions; angles in radians',
    toolHeading: 'Calculator',
    sections: [
      ['What this calculator does', `<p>Build an expression with the buttons, including brackets, and press = to evaluate it. It supports sine, cosine and tangent, base-10 and natural logarithms, square roots, powers (^), factorials (n!), and the constants &pi; and e. The previous expression is shown above the result; &#9003; deletes the last character.</p>`, 'intro-card'],
      ['Important: angles are in radians', `<p>The trigonometric functions use radians, not degrees. sin(&pi;/2) = 1, but sin(90) is about 0.894, because 90 radians is a different angle. To use degrees, multiply by &pi;/180 inside the function: for sin 30&deg;, enter sin(30 &times; &pi; &divide; 180), which gives 0.5.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>sin(&pi;/2) = <strong>1</strong></li><li>2^10 = <strong>1,024</strong></li><li>log(1000) = <strong>3</strong> (base 10); ln(e) = <strong>1</strong></li><li>sqrt(2) = <strong>1.414214</strong></li><li>5! = <strong>120</strong> (factorial works on the whole number currently shown, up to 170)</li><li>Compound growth: 100000 &times; (1 + 0.08/4)^20 &asymp; <strong>148,594.74</strong></li></ul>`, 'example-box'],
      ['Keys that behave differently', `<ul><li><strong>%</strong> is the remainder (modulo) operator, not percent. 17 % 5 = 2. For percentages, multiply by the decimal instead (&times; 0.18 for 18%).</li><li><strong>^</strong> means &ldquo;to the power of&rdquo;. Close brackets around negative bases: (&minus;2)^2 = 4.</li><li><strong>log</strong> is base 10 and <strong>ln</strong> is base e.</li></ul>`],
      ['Precision', `<p>Results are shown to up to six decimal places. Computers store numbers in binary floating point, so a result such as sin(&pi;) may display as a tiny number like 1.2e-16 before rounding instead of exactly 0. After rounding to six places it shows 0.</p>`],
      ['Common mistakes', `<ul><li>Entering degrees into sin, cos or tan.</li><li>Using % for percent.</li><li>Forgetting a closing bracket, which gives an error.</li></ul>`]
    ],
    faqs: [
      ['Is the calculator in degrees or radians?', 'Radians. Convert degrees by multiplying by &pi;/180.'],
      ['What does the % key do?', 'It gives the remainder after division (modulo), for example 17 % 5 = 2.'],
      ['What is the difference between log and ln?', 'log is base 10; ln is the natural log, base e (about 2.71828).'],
      ['How large a factorial can it calculate?', 'Up to 170!, the largest that fits in standard floating-point numbers.'],
      ['Can I use it for exam practice?', 'Yes, but check which calculators your exam allows.']
    ],
    related: ['calc-standard', 'calc-quadratic', 'calc-formula-explainer']
  },
  {
    ...util,
    id: 'calc-wa',
    slug: 'whatsapp-link-generator',
    title: 'WhatsApp Link Generator | Create a wa.me Click-to-Chat Link',
    description: 'Create a WhatsApp click-to-chat link with a country code, phone number and optional pre-filled message, ready for a website, bio or QR code.',
    h1: 'WhatsApp Link Generator',
    lede: 'Create a wa.me link that opens a WhatsApp chat with your number, optionally with a message already typed, without the customer saving your number.',
    method: 'official wa.me click-to-chat URL format',
    labels: { 'wa-country': 'Country code', 'wa-phone': 'Phone number', 'wa-msg': 'Pre-filled message (optional)' },
    sections: [
      ['What this tool does', `<p>Choose the country code, type the phone number and, optionally, a message. The tool builds a WhatsApp click-to-chat link. Anyone who taps it on a phone or computer with WhatsApp opens a chat with that number, with your message ready to send.</p>`, 'intro-card'],
      ['Link format', `<p>https://wa.me/&lt;country code&gt;&lt;number&gt;?text=&lt;message&gt;</p><p>The number is written in full international format with no plus sign, spaces, dashes or leading zero. The message is URL-encoded, so spaces become %20.</p>`, 'formula-box'],
      ['Worked example', `<p>Country code +91, number 98765 43210, message &ldquo;Hi, I would like to book a table&rdquo; produces:</p><p><code>https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20book%20a%20table</code></p>`, 'example-box'],
      ['Where to use it', `<ul><li>A &ldquo;Chat on WhatsApp&rdquo; button on your website or Google Business Profile.</li><li>Instagram or YouTube bio links.</li><li>Printed on menus, flyers and visiting cards as a QR code; the WhatsApp QR generator page can do this directly.</li><li>Pre-filled messages for specific products, so you know what a customer is asking about.</li></ul>`],
      ['Things to check', `<ul><li>Do not include a leading 0 or the + sign; the tool strips anything that is not a digit from the phone number.</li><li>Test the link on your own phone before sharing it.</li><li>The number must be registered on WhatsApp. A WhatsApp Business account is a good idea for shops.</li><li>Country codes in the menu are limited to India, US, UK, Australia and UAE. For others, use any option and edit the digits in the generated link.</li></ul>`],
      ['Privacy', `<p>The link is built in your browser. Remember that anyone you share the link with can see the phone number inside it.</p>`]
    ],
    faqs: [
      ['Do I need to save the number to use the link?', 'No. That is the point of a click-to-chat link.'],
      ['Why does my link say the number is invalid?', 'Check that you did not add a leading 0, and that the number has WhatsApp.'],
      ['Can I add emojis to the message?', 'Yes. They are URL-encoded automatically.'],
      ['Is this an official WhatsApp tool?', 'No, but it uses WhatsApp&rsquo;s published wa.me link format.'],
      ['Can I make a QR code from the link?', 'Yes, with the WhatsApp QR code generator.']
    ],
    related: [['/whatsapp-qr-code-generator/', 'WhatsApp QR Code Generator'], ['/qr-code-generator.html', 'QR Code Generator'], 'calc-invoice']
  },
  {
    ...util,
    id: 'calc-unit',
    slug: 'unit-converter',
    title: 'Length and Weight Unit Converter | Metres, Feet, Miles, kg, Pounds',
    description: 'Convert length between metres, kilometres, feet and miles, and weight between kilograms, grams, pounds and ounces, with the conversion factors shown.',
    h1: 'Length and Weight Unit Converter',
    lede: 'Convert between metric and imperial units of length and weight as you type.',
    method: 'conversion through a base unit (metres or kilograms)',
    labels: { 'unit-type': 'Measurement', 'unit-val-1': 'Value', 'unit-sel-1': 'From unit', 'unit-val-2': 'Converted value', 'unit-sel-2': 'To unit' },
    sections: [
      ['What this tool does', `<p>Choose length or weight, type a value, and pick the units to convert from and to. The result updates immediately and is shown to up to five decimal places.</p>`, 'intro-card'],
      ['Conversion factors used', `<p>Length, per metre: 0.001 km, 3.28084 ft, 0.000621371 mi.</p><p>Weight, per kilogram: 1,000 g, 2.20462 lb, 35.274 oz.</p><p>Values are converted into the base unit first, then into the target unit.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>10 m = <strong>32.8084 ft</strong></li><li>5 mi = <strong>8.04672 km</strong></li><li>70 kg = <strong>154.3234 lb</strong></li></ul>`, 'example-box'],
      ['Handy conversions to remember', `<ul><li>1 inch = 2.54 cm exactly; 1 foot = 30.48 cm.</li><li>A height of 5 ft 7 in is 67 &times; 2.54 = 170.18 cm.</li><li>1 mile &asymp; 1.609 km; 1 km &asymp; 0.621 mi.</li><li>1 kg &asymp; 2.2 lb; 1 lb &asymp; 454 g.</li></ul><p>Indian property is often measured in square feet; this tool converts lengths, not areas. Square the length factor for areas: 1 m&sup2; = 10.764 ft&sup2;.</p>`],
      ['Limitations', `<p>Only length (m, km, ft, mi) and weight (kg, g, lb, oz) are supported. For inches, convert to feet by dividing by 12. For temperature, volume or area, convert by hand with the factors above or another tool.</p>`],
      ['Common mistakes', `<ul><li>Converting area with a length factor.</li><li>Treating 5.7 ft as 5 ft 7 in; 5.7 ft is 5 ft 8.4 in.</li></ul>`]
    ],
    faqs: [
      ['How many feet are in a metre?', 'About 3.28084.'],
      ['How do I convert feet and inches to cm?', 'Total inches &times; 2.54. For 5 ft 7 in: 67 &times; 2.54 = 170.18 cm.'],
      ['Does it convert temperature?', 'No. Only length and weight.'],
      ['How precise are the results?', 'Shown to up to five decimal places.'],
      ['How many pounds is a kilogram?', 'About 2.20462.']
    ],
    related: ['calc-volume', 'calc-aspect-ratio', 'calc-mileage']
  },
  {
    ...util,
    id: 'calc-date-diff',
    slug: 'date-difference-calculator',
    title: 'Date Difference Calculator | Days Between Two Dates',
    description: 'Count the number of calendar days between two dates, with notes on inclusive counting, weeks and business days for notice periods and deadlines.',
    h1: 'Date Difference Calculator',
    lede: 'Count the number of days between two dates for deadlines, notice periods, travel plans and countdowns.',
    method: 'calendar-day difference in local time',
    labels: { 'date-start': 'Start date', 'date-end': 'End date' },
    sections: [
      ['What this calculator does', `<p>Pick a start date and an end date. The calculator returns the number of calendar days between them. The order does not matter; the result is always positive. It counts calendar days in your local time zone, so daylight-saving changes do not create an off-by-one error.</p>`, 'intro-card'],
      ['How days are counted', `<p>The result is the number of days you would step forward from the start date to reach the end date. From 1 May to 15 May is <strong>14 days</strong>. If you need to count both the first and last day, as in &ldquo;from 1 May to 15 May inclusive&rdquo;, add 1, giving 15.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>1 May 2026 to 15 May 2026: <strong>14 days</strong> (15 inclusive)</li><li>1 January 2026 to 1 January 2027: <strong>365 days</strong></li><li>1 January 2028 to 1 January 2029: <strong>366 days</strong>, because 2028 is a leap year</li></ul><p>To turn days into weeks, divide by 7: 100 days is 14 weeks and 2 days.</p>`, 'example-box'],
      ['Notice periods and working days', `<p>This tool counts every calendar day, including weekends and holidays. Employment notice periods are usually stated in calendar days or months, so calendar counting is often right, but check your contract. For working days, roughly multiply by 5/7 and then subtract public holidays, or count on a calendar. Legal and tax deadlines have their own rules on whether the first day counts and what happens when the last day is a holiday.</p>`],
      ['Common mistakes', `<ul><li>Forgetting to add 1 for inclusive ranges, such as hotel nights versus days of a trip.</li><li>Assuming every year has 365 days.</li><li>Counting months as 30 days when the exact date matters.</li></ul>`]
    ],
    faqs: [
      ['Does it include the end date?', 'No. Add 1 if you need both the start and end dates counted.'],
      ['Does it count weekends?', 'Yes. It counts all calendar days.'],
      ['Does it handle leap years?', 'Yes.'],
      ['Can I find a date a number of days in the future?', 'Not with this tool; it counts the days between two dates you choose.'],
      ['How do I find my age in days?', 'Use your date of birth and today, or the age calculator.']
    ],
    related: [['/age-calculator.html', 'Age Calculator'], 'calc-time', 'calc-timezone']
  },
  {
    ...util,
    id: 'calc-time',
    slug: 'time-calculator',
    title: 'Time Calculator | Add or Subtract Hours and Minutes',
    description: 'Add or subtract two durations in hours and minutes, for timesheets, travel time and cooking, with examples and how to convert to decimal hours.',
    h1: 'Time Calculator (Hours and Minutes)',
    lede: 'Add or subtract durations in hours and minutes, such as shift lengths, flight legs or study sessions, without converting by hand.',
    method: 'convert to minutes, add or subtract, convert back',
    labels: { 'time-h1': 'First duration: hours', 'time-m1': 'First duration: minutes', 'time-op': 'Operation', 'time-h2': 'Second duration: hours', 'time-m2': 'Second duration: minutes' },
    sections: [
      ['What this calculator does', `<p>Enter two durations as hours and minutes, choose add or subtract, and the calculator returns the result in hours and minutes. Minutes must be 0 to 59. Blank boxes count as zero. A negative result is shown with a minus sign.</p>`, 'intro-card'],
      ['How it works', `<p>Total minutes = hours &times; 60 + minutes, for each duration. The minutes are added or subtracted, then converted back: hours = total &divide; 60 (whole part), minutes = the remainder.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>2h 30m + 1h 45m = 150 + 105 = 255 minutes = <strong>4h 15m</strong></li><li>8h 00m &minus; 0h 45m (lunch) = <strong>7h 15m</strong> worked</li><li>1h 20m &minus; 2h 00m = <strong>&minus;0h 40m</strong></li></ul>`, 'example-box'],
      ['Decimal hours for timesheets and pay', `<p>Payroll often needs decimal hours. Divide the minutes by 60: 7h 15m = 7.25 hours; 7h 40m = 7.67 hours. Do not write 7h 40m as 7.40, which is only 7h 24m.</p>`],
      ['Clock times vs durations', `<p>This tool adds durations, not times of day. To find how long a shift from 9:30 to 18:15 lasted, subtract 9h 30m from 18h 15m to get 8h 45m. Shifts that cross midnight need 24 hours added to the end time first.</p>`],
      ['Common mistakes', `<ul><li>Writing 90 minutes as 1.90 hours instead of 1.5.</li><li>Entering more than 59 minutes; convert to hours first.</li></ul>`]
    ],
    faqs: [
      ['How do I convert minutes to decimal hours?', 'Divide by 60. 45 minutes is 0.75 hours.'],
      ['Can I add more than two times?', 'Add two, then use the result as the first duration and add the next.'],
      ['Can it handle days?', 'Enter days as hours: 1 day = 24 hours.'],
      ['Why is my result negative?', 'The second duration is longer than the first when subtracting.'],
      ['Does it work with seconds?', 'No, only hours and minutes.']
    ],
    related: ['calc-date-diff', 'calc-timezone', 'calc-sw']
  },
  {
    ...util,
    id: 'calc-word',
    slug: 'word-counter',
    title: 'Word and Character Counter | Count Words and Characters as You Type',
    description: 'Count words and characters in any text as you type, with notes on how words are counted and typical limits for essays, posts and forms.',
    h1: 'Word and Character Counter',
    lede: 'Paste or type text to count words and characters instantly, for essays, social posts, meta descriptions and forms with limits.',
    method: 'whitespace-separated words; JavaScript string length',
    toolHeading: 'Type or paste your text',
    labels: { 'text-counter-input': 'Text to count' },
    sections: [
      ['What this tool does', `<p>As you type or paste, the tool shows the number of words and the number of characters, including spaces and punctuation. Nothing is sent anywhere; counting happens in your browser.</p>`, 'intro-card'],
      ['How words and characters are counted', `<p><strong>Words</strong> are runs of text separated by spaces, tabs or line breaks. Several spaces in a row still count as one gap. &ldquo;Hello world&rdquo; is 2 words; &ldquo;well-known&rdquo; is 1 word.</p><p><strong>Characters</strong> include every letter, digit, space and punctuation mark. &ldquo;Hello world&rdquo; is 11 characters.</p>`, 'formula-box'],
      ['Typical limits', `<ul><li>Meta description for search results: around 150&ndash;160 characters before it may be cut off.</li><li>X (Twitter) post: 280 characters on a standard account.</li><li>SMS: 160 characters for plain English text, fewer for Unicode text such as Hindi.</li><li>College essays and assignments: usually stated in words; check whether references count.</li></ul>`],
      ['Counting non-English text', `<p>Languages that separate words with spaces, such as Hindi or Tamil, are counted correctly for words. Languages that do not use spaces between words, such as Chinese, Japanese or Thai, will show far fewer words than expected. Character counts use JavaScript string length, so some emoji and a few rare characters count as 2.</p>`],
      ['Privacy', `<p>Your text stays in the page and is not uploaded. It is cleared when you leave.</p>`]
    ],
    faqs: [
      ['Does the character count include spaces?', 'Yes.'],
      ['Is a hyphenated word one word?', 'Yes. Only spaces and line breaks separate words.'],
      ['Why does an emoji count as 2 characters?', 'Many emoji are stored as two code units in JavaScript strings.'],
      ['Is my text saved or uploaded?', 'No. It is counted in your browser only.'],
      ['Does it count sentences or paragraphs?', 'No, only words and characters.']
    ],
    related: ['calc-case', 'calc-base64', ['/pdf-converter/', 'PDF Converter']]
  },
  {
    ...util,
    id: 'calc-case',
    slug: 'case-converter',
    title: 'Case Converter | UPPERCASE, lowercase, Title Case and camelCase',
    description: 'Convert text to UPPERCASE, lowercase, Title Case or camelCase in one click, then copy it, with notes on how each style is applied.',
    h1: 'Case Converter',
    lede: 'Change text to uppercase, lowercase, title case or camelCase without retyping it.',
    method: 'browser string case conversion',
    toolHeading: 'Convert your text',
    labels: { 'case-input': 'Text to convert', 'case-output': 'Converted text' },
    sections: [
      ['What this tool does', `<p>Type or paste text, then choose UPPER, lower, Title Case or camelCase. The converted text appears below and can be copied with one click. Conversion happens in your browser.</p>`, 'intro-card'],
      ['What each option does', `<ul><li><strong>UPPER</strong>: every letter capitalised. &ldquo;hello world&rdquo; &rarr; HELLO WORLD</li><li><strong>lower</strong>: every letter small. &rarr; hello world</li><li><strong>Title Case</strong>: the first letter of every word capitalised, the rest lowercase. &rarr; Hello World</li><li><strong>camelCase</strong>: words joined with no spaces, each word after the first capitalised. &ldquo;user first name&rdquo; &rarr; userFirstName</li></ul>`, 'formula-box'],
      ['Notes on Title Case', `<p>This tool capitalises every word, including short words such as &ldquo;of&rdquo; and &ldquo;the&rdquo;. Style guides often keep those lowercase in headlines (&ldquo;The Lord of the Rings&rdquo;). It also lowercases everything else first, so acronyms like GST or NASA become Gst and Nasa; fix those by hand after converting.</p>`],
      ['Common uses', `<ul><li>Fixing text accidentally typed with Caps Lock on.</li><li>Tidying headings and product names.</li><li>Creating variable names in code with camelCase.</li><li>Making a list of names consistent before importing into a spreadsheet.</li></ul>`],
      ['Limitations', `<p>Case conversion applies to scripts with upper and lower case, such as the Latin alphabet. Scripts without case, such as Devanagari or Tamil, are unchanged. Sentence case (capitalising only the first word) is not offered.</p>`]
    ],
    faqs: [
      ['How do I undo Caps Lock text?', 'Paste it and choose lower, or Title Case for names.'],
      ['Does Title Case handle small words?', 'No. Every word is capitalised; adjust short words by hand if your style guide requires it.'],
      ['What is camelCase used for?', 'Naming variables and functions in many programming languages.'],
      ['Does it keep acronyms?', 'No. Title Case lowercases the rest of each word, so re-capitalise acronyms after converting.'],
      ['Is my text uploaded?', 'No.']
    ],
    related: ['calc-word', 'calc-base64', 'calc-uuid']
  },
  {
    ...dev,
    id: 'calc-base64',
    slug: 'base64-encoder-decoder',
    title: 'Base64 Encode and Decode Online | UTF-8 Safe',
    description: 'Encode text to Base64 or decode Base64 back to text in your browser, with full UTF-8 support for Indian languages and emoji.',
    h1: 'Base64 Encoder and Decoder',
    lede: 'Encode text to Base64 or decode Base64 back to readable text, entirely in your browser, with support for any language.',
    method: 'RFC 4648 Base64 over UTF-8 bytes',
    toolHeading: 'Encode or decode',
    labels: { 'b64-input': 'Input text or Base64', 'b64-output': 'Result' },
    sections: [
      ['What this tool does', `<p>Paste text and choose Encode to get its Base64 form, or paste Base64 and choose Decode to get the original text back. Text is first converted to UTF-8 bytes, so Hindi, Tamil, emoji and other non-English characters work correctly in both directions.</p>`, 'intro-card'],
      ['What Base64 is', `<p>Base64 represents any data using 64 safe characters: A&ndash;Z, a&ndash;z, 0&ndash;9, + and /, with = for padding. It is used to carry binary or special-character data through systems that only handle plain text, such as email attachments, data URLs, JSON fields and HTTP Basic authentication headers. Every 3 bytes become 4 characters, so encoded data is about 33% larger.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>&ldquo;Hello&rdquo; encodes to <code>SGVsbG8=</code></li><li>&ldquo;नमस्ते&rdquo; encodes to <code>4KSo4KSu4KS44KWN4KSk4KWH</code> (18 UTF-8 bytes become 24 characters)</li></ul>`, 'example-box'],
      ['Base64 is not encryption', `<p>Anyone can decode Base64 instantly. Never use it to hide passwords, API keys or personal data. If you find credentials stored as Base64, treat them as exposed. For secrecy you need real encryption, and for passwords, a hashing algorithm designed for passwords.</p>`],
      ['Troubleshooting decode errors', `<ul><li>Make sure you pasted the whole string, including any = at the end.</li><li>URL-safe Base64 uses - and _ instead of + and /; replace them before decoding.</li><li>If the original data was a file such as an image, decoding it as text will not produce readable output.</li></ul>`],
      ['Privacy', `<p>Encoding and decoding happen in your browser; nothing is uploaded.</p>`]
    ],
    faqs: [
      ['Is Base64 secure?', 'No. It is an encoding, not encryption, and can be reversed by anyone.'],
      ['Does it support Hindi and other Indian languages?', 'Yes. Text is encoded as UTF-8 first.'],
      ['Why does my decoded text show an error?', 'The input may be incomplete, URL-safe Base64, or not text at all.'],
      ['Why is Base64 longer than the original?', 'Every 3 bytes become 4 characters, about a third larger.'],
      ['Can I encode files?', 'This tool encodes text. Files need a file-to-Base64 tool.']
    ],
    related: ['calc-base-converter', 'calc-uuid', ['/password-generator.html', 'Password Generator']]
  },
  {
    ...dev,
    id: 'calc-base-converter',
    slug: 'number-base-converter',
    title: 'Number Base Converter | Binary, Decimal, Hexadecimal and Octal',
    description: 'Convert whole numbers between binary, decimal, hexadecimal and octal, including very large values, with the place-value method explained.',
    h1: 'Number Base Converter',
    lede: 'Convert whole numbers between decimal, binary, hexadecimal and octal, and see all three common forms at once.',
    method: 'exact big-integer conversion',
    labels: { 'base-value': 'Number', 'base-from': 'From base', 'base-to': 'To base' },
    sections: [
      ['What this tool does', `<p>Enter a whole number, choose the base it is written in and the base you want. The tool shows the converted value plus the decimal, binary and hexadecimal forms. It uses exact big-integer arithmetic, so very long numbers convert without rounding. Negative numbers and a 0x prefix on hexadecimal input are accepted.</p>`, 'intro-card'],
      ['How place value works', `<p>In any base, each digit is multiplied by the base raised to its position, counting from 0 on the right.</p><p>Binary 1011 = 1&times;8 + 0&times;4 + 1&times;2 + 1&times;1 = 11 in decimal.</p><p>Hexadecimal uses digits 0&ndash;9 and A&ndash;F for 10&ndash;15: FF = 15&times;16 + 15 = 255.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>Decimal 10 = binary <strong>1010</strong> = hex <strong>A</strong> = octal <strong>12</strong></li><li>Decimal 255 = binary <strong>11111111</strong> = hex <strong>FF</strong></li><li>Hex 3459EC = decimal <strong>3,430,892</strong></li></ul>`, 'example-box'],
      ['Where you meet each base', `<ul><li><strong>Binary</strong>: how computers store data; subnet masks and bit flags.</li><li><strong>Hexadecimal</strong>: colour codes (#3459EC), memory addresses, MAC addresses, hashes.</li><li><strong>Octal</strong>: Unix file permissions, such as 755 meaning rwxr-xr-x.</li></ul>`],
      ['Limitations', `<p>Whole numbers only; fractions and floating-point formats are not converted. Two&rsquo;s complement representations of negative numbers are not shown; negatives keep a minus sign.</p>`],
      ['Common mistakes', `<ul><li>Choosing the wrong source base, such as reading 10 as binary when it was decimal.</li><li>Using digits not valid for the base, such as 2 in binary or G in hex.</li></ul>`]
    ],
    faqs: [
      ['How do I convert binary to decimal?', 'Multiply each digit by 2 to the power of its position from the right, and add.'],
      ['Can it handle very large numbers?', 'Yes. It uses exact big-integer arithmetic.'],
      ['Does it accept 0x for hex?', 'Yes.'],
      ['Can it convert fractions?', 'No, whole numbers only.'],
      ['Are letters case-sensitive?', 'No. a&ndash;f and A&ndash;F both work.']
    ],
    related: ['calc-subnet', 'calc-color', 'calc-base64']
  },
  {
    ...dev,
    id: 'calc-subnet',
    slug: 'ip-subnet-calculator',
    title: 'IP Subnet Calculator | IPv4 CIDR Network, Mask, Broadcast and Hosts',
    description: 'Calculate the network address, subnet mask, broadcast address, usable host range and host count for any IPv4 address and CIDR prefix.',
    h1: 'IP Subnet Calculator (IPv4)',
    lede: 'Enter an IPv4 address and CIDR prefix to see its network, mask, broadcast address and usable host range.',
    method: 'bitwise AND of address and mask',
    labels: { 'subnet-ip': 'IPv4 address', 'subnet-cidr': 'CIDR prefix length (0–32)' },
    sections: [
      ['What this calculator does', `<p>Enter an IPv4 address and a prefix length from 0 to 32. The calculator returns the network address, subnet mask, broadcast address, number of usable hosts, and the first and last usable addresses.</p>`, 'intro-card'],
      ['How it works', `<p>The prefix length says how many leading bits identify the network. The mask has that many 1 bits.</p><p>Network = address AND mask</p><p>Broadcast = network OR (NOT mask)</p><p>Usable hosts = 2<sup>(32 &minus; prefix)</sup> &minus; 2, because the network and broadcast addresses are reserved. /31 (point-to-point links, RFC 3021) and /32 (a single host) are treated as fully usable.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>192.168.1.10/24: network <strong>192.168.1.0</strong>, mask 255.255.255.0, broadcast <strong>192.168.1.255</strong>, <strong>254</strong> usable hosts from .1 to .254.</li><li>10.0.5.77/26: network <strong>10.0.5.64</strong>, mask 255.255.255.192, broadcast <strong>10.0.5.127</strong>, <strong>62</strong> usable hosts from .65 to .126.</li></ul>`, 'example-box'],
      ['Common prefix sizes', `<ul><li>/30: 4 addresses, 2 usable</li><li>/29: 8 addresses, 6 usable</li><li>/28: 16 addresses, 14 usable</li><li>/24: 256 addresses, 254 usable</li><li>/16: 65,536 addresses, 65,534 usable</li></ul><p>Each step down in prefix length doubles the size of the block.</p>`],
      ['Practical notes', `<p>In cloud networks, providers reserve extra addresses in each subnet (AWS reserves 5, for example), so usable counts are lower than this calculator shows. Private ranges for internal networks are 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. IPv6 is not supported.</p>`],
      ['Common mistakes', `<ul><li>Assigning the network or broadcast address to a device.</li><li>Confusing the prefix /26 with a mask of 255.255.255.26.</li><li>Forgetting provider-reserved addresses when planning cloud subnets.</li></ul>`]
    ],
    faqs: [
      ['How many hosts are in a /24?', '254 usable hosts out of 256 addresses.'],
      ['What is CIDR notation?', 'Writing an address with a slash and the number of network bits, such as 192.168.1.0/24.'],
      ['Why are /31 subnets fully usable?', 'RFC 3021 allows both addresses on point-to-point links, since no broadcast address is needed.'],
      ['Does it support IPv6?', 'No, IPv4 only.'],
      ['How do I convert a mask to a prefix?', 'Count the 1 bits. 255.255.255.192 has 26.']
    ],
    related: ['calc-base-converter', 'calc-uuid', 'calc-base64']
  },
  {
    ...util,
    id: 'calc-aspect-ratio',
    slug: 'aspect-ratio-calculator',
    title: 'Aspect Ratio Calculator | Resize Width and Height Proportionally',
    description: 'Find the aspect ratio of an image or video and calculate a new width or height that keeps the same proportions, with common ratios explained.',
    h1: 'Aspect Ratio Calculator',
    lede: 'Resize an image, video or screen layout without stretching it: enter the original size and one new dimension.',
    method: 'new height = new width × original height ÷ original width',
    labels: { 'aspect-width': 'Original width', 'aspect-height': 'Original height', 'aspect-target-width': 'New width', 'aspect-target-height': 'New height' },
    sections: [
      ['What this calculator does', `<p>Enter the original width and height, then either a new width or a new height. The calculator fills in the other dimension so the proportions stay the same, reduces the ratio to its simplest form, and shows the scale as a percentage.</p>`, 'intro-card'],
      ['Formula used', `<p>New height = New width &times; Original height &divide; Original width</p><p>New width = New height &times; Original width &divide; Original height</p><p>The ratio is simplified by dividing both sides by their greatest common divisor.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>1920 &times; 1080 scaled to a width of 1280 gives a height of <strong>720</strong>. The ratio is <strong>16:9</strong> and the scale is 66.67%.</li><li>A 1080 &times; 1350 portrait image is <strong>4:5</strong>, Instagram&rsquo;s tallest feed format.</li></ul>`, 'example-box'],
      ['Common aspect ratios', `<ul><li>16:9 &mdash; HD and 4K video, YouTube, most monitors and TVs</li><li>9:16 &mdash; vertical video: Reels, Shorts, Stories</li><li>4:3 &mdash; older displays, many phone photos</li><li>1:1 &mdash; square social posts</li><li>4:5 &mdash; portrait social posts</li><li>3:2 &mdash; many camera sensors and prints</li></ul>`],
      ['Tips', `<ul><li>Scaling an image up beyond its original pixel size makes it blurry, even with the right ratio.</li><li>To change the ratio itself, such as 16:9 to 1:1, you need to crop or add borders; resizing alone will stretch it.</li><li>For thumbnails, YouTube recommends 1280 &times; 720.</li></ul>`]
    ],
    faqs: [
      ['How do I calculate aspect ratio?', 'Divide width and height by their greatest common divisor. 1920 and 1080 share 120, giving 16:9.'],
      ['What is 1080p in 16:9?', '1920 &times; 1080.'],
      ['What size is a 9:16 video?', 'Commonly 1080 &times; 1920 pixels.'],
      ['Can I enter both new width and height?', 'If you enter a new width, it is used and the height is recalculated.'],
      ['Does it work in centimetres or inches?', 'Yes. Ratios work in any unit, as long as both dimensions use the same one.']
    ],
    related: ['calc-image-converter', 'calc-color', 'calc-unit']
  },
  {
    ...dev,
    id: 'calc-color',
    slug: 'color-converter',
    title: 'Color Converter | HEX to RGB and HSL',
    description: 'Pick a colour or enter a HEX code to get its RGB and HSL values, with an explanation of each colour format and when to use it.',
    h1: 'Color Converter (HEX, RGB, HSL)',
    lede: 'Pick a colour or type a HEX code and get the matching RGB and HSL values for CSS, design tools and brand guides.',
    method: 'standard sRGB HEX, RGB and HSL conversion',
    labels: { 'color-picker': 'Pick a colour', 'color-hex': 'HEX code' },
    sections: [
      ['What this tool does', `<p>Choose a colour with the picker or type a six-digit HEX code. The tool shows the same colour as RGB and HSL values, ready to copy into CSS or a design app.</p>`, 'intro-card'],
      ['The three formats', `<ul><li><strong>HEX</strong> (#3459EC): red, green and blue as two hexadecimal digits each, from 00 to FF.</li><li><strong>RGB</strong> (rgb(52, 89, 236)): the same three channels as decimal numbers from 0 to 255.</li><li><strong>HSL</strong> (hsl(228, 83%, 56%)): hue as an angle on the colour wheel (0&ndash;360&deg;), saturation and lightness as percentages.</li></ul>`, 'formula-box'],
      ['Worked example', `<p>#3459EC, the blue used on this site, converts to <strong>rgb(52, 89, 236)</strong> and <strong>hsl(228, 83%, 56%)</strong>. 34 in hex is 3&times;16 + 4 = 52, which is the red value.</p>`, 'example-box'],
      ['Why HSL is handy', `<p>HSL makes it easy to build variations of a colour. Keep the hue and saturation and change lightness to get a lighter tint for backgrounds or a darker shade for hover states: hsl(228, 83%, 90%) is a pale version of the same blue. In RGB you would have to change all three numbers.</p>`],
      ['Check contrast', `<p>For readable text, the contrast between text and background should be at least 4.5:1 for normal text under WCAG guidelines. Light blues and greys on white often fall short. Use a contrast checker before finalising brand colours for text.</p>`],
      ['Limitations', `<p>Only six-digit HEX codes are read. Three-digit shorthand such as #FFF should be expanded to #FFFFFF, and alpha (transparency) values are not supported.</p>`]
    ],
    faqs: [
      ['How do I convert HEX to RGB?', 'Split the code into three pairs and convert each from hexadecimal to decimal.'],
      ['Can I enter #FFF?', 'Expand it to #FFFFFF first.'],
      ['Does it support transparency?', 'No, only opaque colours.'],
      ['What is the difference between HSL and HSV?', 'Both use hue, but HSL&rsquo;s lightness runs from black through the pure colour to white, while HSV&rsquo;s value runs from black to the pure colour.'],
      ['Which format should I use in CSS?', 'All three work. HSL is easiest for making variations; HEX is the most compact.']
    ],
    related: ['calc-base-converter', 'calc-aspect-ratio', 'calc-image-converter']
  },
  {
    ...util,
    id: 'calc-sw',
    slug: 'online-stopwatch',
    title: 'Online Stopwatch | Start, Pause and Reset in Your Browser',
    description: 'A simple online stopwatch showing hours, minutes, seconds and hundredths, with start, pause and reset, plus notes on accuracy in background tabs.',
    h1: 'Online Stopwatch',
    lede: 'Time a task, a workout set or a presentation with a simple start, pause and reset stopwatch.',
    method: 'browser timer counting hundredths of a second',
    toolHeading: 'Stopwatch',
    sections: [
      ['What this tool does', `<p>Press Start to begin timing, Pause to stop, and Start again to continue from where you left off. Reset sets it back to zero. The display shows hours, minutes, seconds and hundredths of a second.</p>`, 'intro-card'],
      ['Good uses', `<ul><li>Timing study sessions or Pomodoro blocks.</li><li>Rehearsing a talk to fit a time slot.</li><li>Timing exercise intervals or rest periods.</li><li>Measuring how long a routine task really takes before estimating it.</li></ul>`],
      ['Accuracy', `<p>The stopwatch counts in hundredths using the browser&rsquo;s timer. It is fine for everyday timing, but browsers slow down timers in background tabs and on phones when the screen locks, to save battery. If you switch tabs or lock your phone for a long time, the displayed time can fall behind the real time. Keep the tab visible for best results, and do not use it where precise timing matters, such as official sports timing.</p>`],
      ['Limitations', `<p>There is no lap or split button, and the time is not saved if you close or reload the page.</p>`]
    ],
    faqs: [
      ['Does the stopwatch keep running in another tab?', 'It keeps running, but browsers may slow it down in background tabs, so it can fall behind.'],
      ['Does it have laps?', 'No. Pause and note the time for a simple split.'],
      ['Will it reset if I refresh the page?', 'Yes.'],
      ['How precise is it?', 'It displays hundredths of a second; real accuracy depends on the browser keeping the tab active.'],
      ['Can I use it as a countdown timer?', 'No, it counts up only.']
    ],
    related: ['calc-time', 'calc-date-diff', 'calc-timezone']
  },
  {
    ...util,
    id: 'calc-image-converter',
    slug: 'image-format-converter',
    title: 'Image Format Converter | Convert to PNG, JPG or WebP in Your Browser',
    description: 'Convert an image to PNG, JPEG or WebP in your browser without uploading it, with notes on transparency, quality and which format to choose.',
    h1: 'Image Format Converter (PNG, JPG, WebP)',
    lede: 'Convert a photo or graphic to PNG, JPEG or WebP without uploading it anywhere.',
    method: 'browser canvas re-encoding',
    toolHeading: 'Convert an image',
    labels: { 'img-upload': 'Choose an image', 'img-format': 'Convert to' },
    sections: [
      ['What this tool does', `<p>Choose an image from your device and the format you want, then convert. The image is drawn onto a canvas in your browser and saved in the new format, which downloads straight away. The file never leaves your device.</p>`, 'intro-card'],
      ['Which format to choose', `<ul><li><strong>JPEG</strong>: best for photos. Small files, no transparency. Saved at 90% quality here.</li><li><strong>PNG</strong>: best for screenshots, logos and graphics with sharp edges or text. Supports transparency. Larger files for photos.</li><li><strong>WebP</strong>: modern format for the web; usually smaller than JPEG or PNG at similar quality, and supports transparency.</li></ul>`, 'formula-box'],
      ['Things to know', `<ul><li><strong>Transparency</strong>: converting a transparent PNG to JPEG fills transparent areas, usually with black. Use PNG or WebP to keep transparency.</li><li><strong>Quality</strong>: JPEG and WebP are lossy. Converting a JPEG to PNG will not improve its quality; it only makes the file bigger.</li><li><strong>Metadata</strong>: canvas conversion drops EXIF data such as camera details and GPS location, which can be useful for privacy before sharing a photo.</li><li><strong>Size</strong>: the image keeps its pixel dimensions. To resize, use the aspect ratio calculator to work out the size, then an image editor.</li></ul>`],
      ['Common uses', `<ul><li>Converting WebP images saved from websites to JPEG for apps that do not accept WebP.</li><li>Making a smaller JPEG from a large PNG photo for email or forms.</li><li>Converting a screenshot to PNG for a sharp result.</li></ul>`],
      ['Limitations', `<p>HEIC photos from iPhones open only in browsers that support HEIC. Animated GIF or WebP files are converted as a single frame. Very large images may be slow on older phones.</p>`]
    ],
    faqs: [
      ['Is my image uploaded?', 'No. Conversion happens entirely in your browser.'],
      ['Why did my transparent background turn black?', 'JPEG does not support transparency. Choose PNG or WebP instead.'],
      ['Does converting improve quality?', 'No. Conversion cannot restore detail lost in an earlier compression.'],
      ['Can I convert HEIC?', 'Only if your browser can open HEIC images.'],
      ['Does it remove location data?', 'Yes, EXIF metadata including GPS is not carried into the converted file.']
    ],
    related: ['calc-aspect-ratio', ['/images-to-pdf/', 'Images to PDF'], ['/compress-pdf/', 'Compress PDF']]
  },
  {
    ...dev,
    id: 'calc-uuid',
    slug: 'uuid-generator',
    title: 'UUID Generator | Random Version 4 UUIDs in Your Browser',
    description: 'Generate up to 100 random version 4 UUIDs at once using your browser’s secure random number generator, and copy them in one click.',
    h1: 'UUID Generator (v4)',
    lede: 'Generate random version 4 UUIDs for databases, test data and file names, using your browser&rsquo;s cryptographic random number generator.',
    method: 'RFC 4122 / RFC 9562 version 4 with Web Crypto randomness',
    labels: { 'uuid-version': 'UUID version', 'uuid-count': 'How many (1–100)', 'uuid-output': 'Generated UUIDs' },
    sections: [
      ['What this tool does', `<p>Choose how many UUIDs you need, from 1 to 100, and generate. Each appears on its own line, ready to copy. They are created locally using the browser&rsquo;s secure random number generator (Web Crypto).</p>`, 'intro-card'],
      ['What a version 4 UUID is', `<p>A UUID (universally unique identifier) is a 128-bit value written as 32 hexadecimal digits in five groups: 8-4-4-4-12. In version 4, 122 of those bits are random. The 13th digit is always 4 (the version), and the 17th is 8, 9, a or b (the variant).</p><p>Example: <code>6f290498-119c-4eac-9a14-62b3664d8f70</code></p>`, 'formula-box'],
      ['How unique are they?', `<p>With 122 random bits there are about 5.3 &times; 10<sup>36</sup> possible values. You would need to generate around a billion UUIDs every second for about 86 years to reach a 50% chance of a single duplicate. In practice, collisions are not a concern for normal applications, but they are not mathematically impossible, so databases should still enforce uniqueness.</p>`],
      ['When to use something else', `<ul><li>UUIDs are identifiers, not secrets. Do not use one as a password or a long-lived security token.</li><li>Random UUIDs do not sort by creation time, which can slow some database indexes. Version 7 UUIDs, which start with a timestamp, are designed for that case; this tool generates v4 only.</li></ul>`]
    ],
    faqs: [
      ['Are these UUIDs truly random?', 'They use the browser&rsquo;s cryptographically secure random number generator.'],
      ['Can two UUIDs ever be the same?', 'It is astronomically unlikely but not impossible.'],
      ['Are generated UUIDs stored?', 'No. They exist only in your browser tab.'],
      ['What is the difference between UUID and GUID?', 'GUID is Microsoft&rsquo;s name for the same format.'],
      ['Can I generate v1 or v7 UUIDs?', 'Not here; only version 4.']
    ],
    related: ['calc-base64', 'calc-base-converter', ['/password-generator.html', 'Password Generator']]
  },
  {
    ...util,
    id: 'calc-timezone',
    slug: 'time-zone-converter',
    title: 'Time Zone Converter | IST to EST, PST, GMT, CET, AEST and JST',
    description: 'Convert a date and time between India Standard Time and major world time zones, with daylight saving handled automatically.',
    h1: 'Time Zone Converter',
    lede: 'Convert a meeting time between India and other major time zones, with daylight saving changes handled automatically.',
    method: 'IANA time zone database via the browser',
    labels: { 'tz-input-time': 'Date and time', 'tz-from': 'From time zone', 'tz-to': 'To time zone' },
    sections: [
      ['What this tool does', `<p>Choose a date and time, the zone it is in, and the zone you want. The converter shows the matching local date and time, including the day of the week, so you can see when a call falls on a different date.</p>`, 'intro-card'],
      ['Zones available', `<p>UTC, India (IST, UTC+5:30), New York, Los Angeles, London, Paris, Sydney and Tokyo. The converter uses each city&rsquo;s official time zone rules, so daylight saving time is applied on the correct dates rather than using a fixed offset.</p>`, 'formula-box'],
      ['Worked examples', `<ul><li>10:00 AM IST on Monday 16 November 2026 is <strong>11:30 PM on Sunday 15 November</strong> in New York (EST, UTC&minus;5) and 4:30 AM in London (GMT).</li><li>The same 10:00 AM IST on 16 July 2026 is <strong>12:30 AM</strong> in New York and 5:30 AM in London, because both are on summer time (EDT, BST).</li></ul><p>India does not use daylight saving time, so the gap between India and the US or UK changes by an hour twice a year.</p>`, 'example-box'],
      ['Scheduling tips', `<ul><li>Always check the date, not just the time; calls between India and the Americas often cross midnight.</li><li>The US and Europe change clocks on different dates in March and around October&ndash;November, so the gap can be unusual for a week or two.</li><li>Write meeting times with the zone, such as &ldquo;10:00 IST / 23:30 EST&rdquo;.</li></ul>`],
      ['Limitations', `<p>Only the listed zones are available. Results depend on your browser&rsquo;s time zone data, which updates with the browser.</p>`]
    ],
    faqs: [
      ['How many hours ahead is IST of EST?', '10 hours 30 minutes in winter (EST), and 9 hours 30 minutes when New York is on daylight time (EDT).'],
      ['Does India have daylight saving time?', 'No. IST is UTC+5:30 all year.'],
      ['Is GMT the same as UTC?', 'For everyday purposes, yes. London uses GMT in winter and BST (UTC+1) in summer.'],
      ['Does it handle daylight saving?', 'Yes, using the official time zone rules for each city.'],
      ['Can I add other cities?', 'Not currently; choose the zone with the same rules if one matches.']
    ],
    related: ['calc-time', 'calc-date-diff', 'calc-sw']
  },
  {
    ...util,
    id: 'calc-mileage',
    slug: 'fuel-cost-calculator',
    title: 'Fuel Cost and Mileage Calculator | Trip Cost for Petrol, Diesel, CNG and EV',
    description: 'Convert fuel efficiency between km/L, L/100 km and MPG, and estimate the fuel or charging cost of a trip for petrol, diesel, CNG, LPG or EV.',
    h1: 'Fuel Cost and Mileage Calculator',
    lede: 'Convert your vehicle&rsquo;s mileage between km/L, L/100 km and MPG, then estimate the fuel cost of a trip and the cost per kilometre.',
    method: 'distance ÷ efficiency × price',
    labels: { 'mileage-value': 'Mileage', 'mileage-unit': 'Mileage unit', 'mileage-fuel-type': 'Fuel type', 'mileage-distance': 'Trip distance (km)', 'mileage-price': 'Fuel price per unit', 'mileage-battery': 'Battery size (kWh)' },
    sections: [
      ['What this calculator does', `<p>Enter your mileage in any of the supported units. The calculator converts it into km per unit, units per 100 km and, for liquid fuels, US and UK miles per gallon. Add a trip distance and the fuel price to see how much fuel the trip needs, its cost, and the cost per kilometre. For electric vehicles, adding the battery size also estimates full-battery range.</p>`, 'intro-card'],
      ['Formulas used', `<p>L/100 km = 100 &divide; km/L</p><p>US MPG = km/L &times; 2.35215; UK MPG = km/L &times; 2.82481</p><p>Fuel needed = Distance &divide; Efficiency</p><p>Trip cost = Fuel needed &times; Price</p>`, 'formula-box'],
      ['Worked example', `<p>A petrol car that gives 18 km/L, on a 100 km trip with petrol at 104 per litre:</p><ul><li>Fuel needed = 100 &divide; 18 = <strong>5.56 L</strong></li><li>Trip cost = 5.56 &times; 104 = <strong>577.78</strong></li><li>Cost per km = <strong>5.78</strong></li><li>18 km/L is also 5.56 L/100 km, 42.34 US MPG or 50.85 UK MPG.</li></ul>`, 'example-box'],
      ['Real mileage vs claimed mileage', `<p>Manufacturer figures in India are ARAI-certified under test conditions, and real-world mileage is commonly 15&ndash;30% lower, especially in city traffic with AC on. For trip planning, use your own figure: fill the tank, reset the trip meter, drive normally, refill, and divide kilometres by litres added.</p>`],
      ['Comparing fuels', `<p>Use cost per kilometre to compare: a CNG car in km/kg at the CNG price per kg, or an EV in km/kWh at your electricity rate, against petrol or diesel per km. Remember differences in purchase price, maintenance and, for EVs, charging losses.</p>`],
      ['Common mistakes', `<ul><li>Using the brochure mileage for budgeting.</li><li>Mixing US and UK gallons; a UK gallon is about 20% larger.</li><li>Forgetting tolls and parking, which this calculator does not include.</li></ul>`]
    ],
    faqs: [
      ['How do I calculate fuel cost for a trip?', 'Divide distance by mileage to get litres, then multiply by the fuel price.'],
      ['How do I convert km/L to L/100 km?', 'Divide 100 by the km/L figure.'],
      ['Does it work for CNG and EVs?', 'Yes. Choose the fuel type and use km/kg for CNG or LPG, and km/kWh or kWh/100 km for EVs.'],
      ['Why is my real mileage lower than ARAI?', 'Test cycles are gentler than real traffic, AC use and loads.'],
      ['Does it include tolls?', 'No, only fuel or charging cost.']
    ],
    related: ['calc-ev', 'calc-unit', ['/currency-converter.html', 'Currency Converter']]
  }
];
