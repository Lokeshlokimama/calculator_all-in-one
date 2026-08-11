const fs = require('fs');
const path = require('path');

const today = '2026-08-12';
const site = 'https://calculatorsallinone.com';

const related = {
  qr: [
    ['/qr-code-generator.html', 'All QR Code Generator'],
    ['/upi-qr-code-generator/', 'UPI QR Generator'],
    ['/wifi-qr-code-generator/', 'Wi-Fi QR Generator'],
    ['/whatsapp-qr-code-generator/', 'WhatsApp QR Generator'],
    ['/vcard-qr-code-generator/', 'vCard QR Generator'],
    ['/bulk-qr-code-generator/', 'Bulk QR Generator']
  ],
  pdf: [
    ['/pdf-converter/', 'PDF Converter'],
    ['/pdf-to-word/', 'PDF to Word'],
    ['/pdf-to-jpg/', 'PDF to JPG'],
    ['/jpg-to-pdf/', 'JPG to PDF'],
    ['/compress-pdf-to-100kb/', 'Compress PDF to 100KB'],
    ['/merge-pdf/', 'Merge PDF'],
    ['/split-pdf/', 'Split PDF'],
    ['/ocr-scanned-pdf/', 'OCR Scanned PDF']
  ],
  finance: [
    ['/finance-calculators.html', 'Finance Calculators'],
    ['/home-loan-emi-calculator-india/', 'Home Loan EMI India'],
    ['/emi-calculator-with-prepayment/', 'EMI Prepayment'],
    ['/sip-step-up-calculator/', 'SIP Step-Up'],
    ['/gst-calculator-india/', 'GST India'],
    ['/emi-calculator.html', 'EMI Calculator'],
    ['/sip-calculator.html', 'SIP Calculator'],
    ['/gst-calculator.html', 'GST Calculator']
  ],
  electricity: [
    ['/electricity-calculators.html', 'Electricity Calculators'],
    ['/electricity-bill-calculator-india/', 'Electricity Bill India'],
    ['/tneb-electricity-bill-calculator/', 'TNEB / Tamil Nadu Bill'],
    ['/bescom-electricity-bill-calculator/', 'BESCOM / Bengaluru Bill'],
    ['/msedcl-electricity-bill-calculator/', 'MSEDCL / Maharashtra Bill'],
    ['/delhi-electricity-bill-calculator/', 'Delhi Electricity Bill'],
    ['/telangana-electricity-bill-calculator/', 'Telangana Electricity Bill'],
    ['/andhra-pradesh-electricity-bill-calculator/', 'Andhra Pradesh Bill'],
    ['/kerala-electricity-bill-calculator/', 'Kerala Electricity Bill'],
    ['/gujarat-electricity-bill-calculator/', 'Gujarat Electricity Bill'],
    ['/uttar-pradesh-electricity-bill-calculator/', 'Uttar Pradesh Bill'],
    ['/rajasthan-electricity-bill-calculator/', 'Rajasthan Electricity Bill'],
    ['/west-bengal-electricity-bill-calculator/', 'West Bengal Bill'],
    ['/punjab-electricity-bill-calculator/', 'Punjab Electricity Bill'],
    ['/#calc-electricity-bill', 'Homepage Electricity Bill'],
    ['/#calc-kwh', 'kWh Calculator'],
    ['/#calc-watt-unit', 'Watt to Unit'],
    ['/#calc-solar', 'Solar Panel Size'],
    ['/#calc-inverter', 'Inverter Backup']
  ]
};

const pages = [
  {
    slug: 'upi-qr-code-generator',
    group: 'qr',
    kind: 'qr',
    qrKind: 'upi',
    title: 'UPI QR Code Generator for India | Free Payment QR',
    description: 'Create a static UPI QR code for Indian payment links with UPI ID, payee name, amount, and note. Runs locally in your browser.',
    kicker: 'UPI QR tool',
    h1: 'UPI QR code generator',
    lede: 'Create a payment QR code for an Indian UPI ID. Add a payee name, optional amount, and payment note, then scan-test before printing.',
    proof: ['Static UPI link', 'No account required', 'Local QR rendering'],
    form: `
      <form class="traffic-form" data-traffic-qr="upi">
        <label>UPI ID<input name="pa" required placeholder="name@upi"></label>
        <label>Payee name<input name="pn" placeholder="Business or person name"></label>
        <label>Amount, optional<input name="am" type="number" min="0" step="0.01" placeholder="500"></label>
        <label>Payment note<input name="tn" placeholder="Invoice 1024"></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Generate UPI QR</button>
      </form>`,
    sections: [
      ['What this UPI QR generator does', 'This page builds a standard UPI payment URI and turns it into a scannable static QR code. It is useful for shop counters, invoices, event stalls, tuition collections, donations, and simple personal payment requests.'],
      ['Important UPI checks', 'Always scan the QR code with a real phone before printing or sharing it. Confirm the payee name shown by the UPI app, verify the UPI ID spelling, and avoid using the same printed QR if the bank account or UPI handle changes.'],
      ['Static vs dynamic payment QR', 'This tool creates a static QR code. It does not track scans, create payment links on a server, or verify whether a payment was received. Your UPI app and bank remain the source of truth for payment status.'],
      ['Privacy and safety', 'The QR image is rendered in the browser. Do not encode private account passwords, OTPs, PINs, or recovery codes. A UPI QR should contain payment routing details only.']
    ],
    faqs: [
      ['Can I create a UPI QR without an amount?', 'Yes. Leave amount blank when you want the payer to enter the amount in their UPI app.'],
      ['Does this verify my UPI ID?', 'No. It formats the QR code; your UPI app or bank verifies the payment destination when scanned.'],
      ['Can I print the generated QR?', 'Yes, but scan-test a printed sample at final size before bulk printing.'],
      ['Can I use it for business?', 'Yes, if your UPI handle and invoicing process are correct for your business.'],
      ['Is the QR dynamic?', 'No. It is static. If details change, generate a new QR.'],
      ['Does it upload the payment details?', 'No QR image provider receives the payload from this page.']
    ]
  },
  {
    slug: 'wifi-qr-code-generator',
    group: 'qr',
    kind: 'qr',
    qrKind: 'wifi',
    title: 'Wi-Fi QR Code Generator | Share Network Password Fast',
    description: 'Create a Wi-Fi QR code for guests by entering network name, password, security type, and hidden network setting. Local browser QR rendering.',
    kicker: 'Wi-Fi QR tool',
    h1: 'Wi-Fi QR code generator',
    lede: 'Make a scannable Wi-Fi login QR for guests, cafes, classrooms, offices, or home visitors without asking people to type a long password.',
    proof: ['WPA/WEP/no password', 'Guest network friendly', 'Local QR rendering'],
    form: `
      <form class="traffic-form" data-traffic-qr="wifi">
        <label>Network name / SSID<input name="ssid" required placeholder="Cafe Guest WiFi"></label>
        <label>Password<input name="password" placeholder="Wi-Fi password"></label>
        <label>Security type<select name="encryption"><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No password</option></select></label>
        <label><span><input name="hidden" type="checkbox"> Hidden network</span></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Generate Wi-Fi QR</button>
      </form>`,
    sections: [
      ['What this Wi-Fi QR generator does', 'The tool creates a Wi-Fi QR payload that supported phone cameras can read. When scanned, the phone can offer to join the network without manual typing.'],
      ['Best use cases', 'Use it for a guest network in a shop, clinic, tuition center, Airbnb, event desk, office meeting room, or home. It is better to share a guest network than a private router administrator password.'],
      ['Security checklist', 'Create a separate guest SSID where possible, rotate shared passwords periodically, and remove printed QR signs when the password changes. Never encode router admin credentials.'],
      ['Printing tips', 'Use dark QR modules on a light background, keep clear space around the code, and test with both Android and iPhone cameras before displaying it publicly.']
    ],
    faqs: [
      ['Will every phone join automatically?', 'Most modern phones can read Wi-Fi QR codes, but behavior depends on the camera app and operating system.'],
      ['Can I use it for hidden networks?', 'Yes. Check the hidden network option before generating the QR.'],
      ['Should I use it for my main Wi-Fi?', 'A guest network is safer for public or semi-public sharing.'],
      ['Does the password leave my browser?', 'The QR is rendered locally by the browser on this site.'],
      ['Can I print it for a cafe?', 'Yes. Print one sample first and scan-test it at final size.'],
      ['What happens when the password changes?', 'Generate and print a new QR code.']
    ]
  },
  {
    slug: 'whatsapp-qr-code-generator',
    group: 'qr',
    kind: 'qr',
    qrKind: 'whatsapp',
    title: 'WhatsApp QR Code Generator | Direct Chat QR Link',
    description: 'Generate a WhatsApp QR code for a direct chat link with country code and optional prefilled message. Useful for shops, posters, and support.',
    kicker: 'WhatsApp QR tool',
    h1: 'WhatsApp QR generator',
    lede: 'Create a QR code that opens a WhatsApp chat with your number and optional message. Useful for support desks, small businesses, posters, and events.',
    proof: ['Direct chat link', 'Optional message', 'Poster ready'],
    form: `
      <form class="traffic-form" data-traffic-qr="whatsapp">
        <label>Phone with country code<input name="phone" required placeholder="919876543210"></label>
        <label>Prefilled message<textarea name="message" placeholder="Hello, I want to know more."></textarea></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Generate WhatsApp QR</button>
      </form>`,
    sections: [
      ['What this WhatsApp QR generator does', 'The tool formats a wa.me direct chat link and renders it as a QR code. A scanner can open WhatsApp with the phone number and message you prepared.'],
      ['Where it works well', 'Use the QR on product packaging, business cards, restaurant tables, event stalls, real estate flyers, and support posters where typing a number would be slow.'],
      ['Phone number formatting', 'Use the country code without plus signs or spaces for the most reliable result. For India, a number usually begins with 91 followed by the 10-digit mobile number.'],
      ['Safety checks', 'Scan-test the QR before printing. Confirm it opens the right chat and message. Replace the QR if the phone number changes or if the campaign message is outdated.']
    ],
    faqs: [
      ['Does the QR send a message automatically?', 'No. It opens WhatsApp with a prepared message. The user still chooses whether to send it.'],
      ['Should I include the plus sign?', 'For wa.me links, use country code and number without the plus sign.'],
      ['Can I use it on a shop poster?', 'Yes. Test the final poster at the actual print size.'],
      ['Does it work without WhatsApp installed?', 'The link may open a browser prompt, but the best experience requires WhatsApp.'],
      ['Can I change the message later?', 'Static QR codes cannot change. Generate a new QR if the message changes.'],
      ['Is the QR generated locally?', 'Yes, the QR image is rendered in the browser.']
    ]
  },
  {
    slug: 'vcard-qr-code-generator',
    group: 'qr',
    kind: 'qr',
    qrKind: 'vcard',
    title: 'vCard QR Code Generator | Contact Card QR Online',
    description: 'Create a vCard contact QR code with name, phone, email, organization, and website. Useful for business cards and networking.',
    kicker: 'Contact QR tool',
    h1: 'vCard QR generator',
    lede: 'Turn contact details into a scannable vCard QR code for business cards, desk signs, event badges, and networking materials.',
    proof: ['Contact card format', 'Business-card friendly', 'Local QR rendering'],
    form: `
      <form class="traffic-form" data-traffic-qr="vcard">
        <label>Full name<input name="name" required placeholder="Asha Kumar"></label>
        <label>Phone<input name="phone" placeholder="+919876543210"></label>
        <label>Email<input name="email" type="email" placeholder="asha@example.com"></label>
        <label>Organization<input name="organization" placeholder="Asha Studio"></label>
        <label>Website<input name="url" placeholder="https://example.com"></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Generate vCard QR</button>
      </form>`,
    sections: [
      ['What this vCard QR generator does', 'The page builds a vCard 3.0 record and encodes it as a QR code. Supported contact apps can offer to save the name, phone number, email, company, and website.'],
      ['Best use cases', 'vCard QR codes are useful on business cards, conference badges, office door signs, resumes, portfolio pages, flyers, and sales counters where people may want to save details quickly.'],
      ['Keep the code readable', 'A contact card contains more data than a short URL, so it creates a denser QR. Print it larger, preserve quiet space, and avoid placing logos over the code.'],
      ['Data hygiene', 'Only include public contact information. If your number, company, or website changes, the old static QR cannot update itself. Create a fresh code and replace printed material.']
    ],
    faqs: [
      ['Can phones save the contact automatically?', 'Many phones offer to save the contact after scanning, but exact behavior depends on the scanner app.'],
      ['Can I add a logo?', 'You can add a logo in a design tool, but test carefully because overlays can damage scan reliability.'],
      ['Why is the QR dense?', 'Contact cards store multiple fields, so they require more QR modules than a simple URL.'],
      ['Can I use this for a resume?', 'Yes, if the contact details are safe to share publicly.'],
      ['Does this track scans?', 'No. It creates a static contact QR only.'],
      ['Is my contact uploaded?', 'The QR rendering happens locally in the browser.']
    ]
  },
  {
    slug: 'bulk-qr-code-generator',
    group: 'qr',
    kind: 'bulk-qr',
    title: 'Bulk QR Code Generator | Create Multiple QR Codes',
    description: 'Create multiple static QR codes from a list of URLs or text lines. Generate up to 12 previews at once in your browser.',
    kicker: 'Bulk QR tool',
    h1: 'Bulk QR generator',
    lede: 'Paste one URL or text item per line and create multiple static QR previews for labels, classrooms, inventory notes, or small batches.',
    proof: ['Up to 12 previews', 'One item per line', 'Local QR rendering'],
    sections: [
      ['What this bulk QR generator does', 'Bulk QR generation is useful when you need several labels or short links at once. Paste one item per line and the page creates individual QR previews in the browser.'],
      ['Good batch use cases', 'Use it for classroom stations, product samples, event table cards, internal shelf labels, small inventory notes, or quick testing of several landing-page URLs.'],
      ['Limits to know', 'This is a lightweight browser batch tool, not a database-backed QR management system. It does not create scan analytics, serial numbers, CSV exports, or editable redirects.'],
      ['Print safety', 'Inspect every generated label before printing. Long items create dense QR codes, so keep URLs short and use larger print sizes for batches that contain long text.']
    ],
    faqs: [
      ['How many QR codes can I make at once?', 'This page previews up to 12 at a time to keep browser performance comfortable.'],
      ['Can I paste URLs and text together?', 'Yes. Each line is encoded as its own static QR payload.'],
      ['Does this make dynamic QR codes?', 'No. These are static QR codes.'],
      ['Can I download all at once?', 'This first version previews the batch; use the full QR generator for downloadable single codes.'],
      ['Should I use short URLs?', 'Yes. Shorter payloads produce cleaner QR patterns.'],
      ['Is the list uploaded?', 'No QR image provider receives your list from this page.']
    ]
  },
  {
    slug: 'pdf-to-word',
    group: 'pdf',
    kind: 'pdf',
    title: 'PDF to Word Converter Online | Editable Text Export',
    description: 'Convert selectable PDF text into a Word-compatible document using the browser PDF converter. Learn limits for scanned PDFs and layouts.',
    kicker: 'PDF to Word',
    h1: 'PDF to Word converter',
    lede: 'Use the PDF converter to extract selectable text from a PDF into a Word-compatible document, then check formatting before sharing.',
    proof: ['Browser-based workflow', 'Editable text export', 'Layout check required'],
    ctaHref: '/pdf-converter/#pdf-converter',
    ctaText: 'Open PDF to Word tool',
    sections: [
      ['What PDF to Word means here', 'This workflow extracts readable selectable text from a PDF and creates a Word-compatible document. It is useful for notes, drafts, simple reports, receipts, and documents where the text layer already exists.'],
      ['When it will not be perfect', 'Complex tables, multi-column layouts, forms, scanned pages, handwritten notes, and decorative PDFs may need manual cleanup. A browser converter can help you recover text, but it is not a guaranteed layout clone.'],
      ['Privacy and file handling', 'The linked PDF converter runs in the browser for ordinary files. Avoid sensitive contracts, medical records, identity documents, or password-protected files in any general online utility.'],
      ['After-conversion checklist', 'Open the output, verify page order, check headings, review tables, confirm special symbols, and compare the result against the original before sending it to anyone.']
    ],
    faqs: [
      ['Can scanned PDFs become Word files?', 'Image-only scanned pages need OCR. Use the OCR scanned PDF page first if the text is not selectable.'],
      ['Will the layout match exactly?', 'No. Treat the result as editable text that may need cleanup.'],
      ['Does it work on mobile?', 'Small files may work, but larger PDFs are easier on a laptop or desktop browser.'],
      ['What should I check after export?', 'Check text order, tables, spacing, symbols, and missing content.'],
      ['Is a server upload required?', 'The linked converter is designed for browser processing of ordinary files.'],
      ['Which tool should I use for page images?', 'Use PDF to JPG or the PDF converter image export mode.']
    ]
  },
  {
    slug: 'pdf-to-jpg',
    group: 'pdf',
    kind: 'pdf',
    title: 'PDF to JPG Converter | Turn PDF Pages into Images',
    description: 'Render PDF pages as JPG images for sharing, previews, uploads, and thumbnails. Understand quality, file-size, and privacy limits.',
    kicker: 'PDF to JPG',
    h1: 'PDF to JPG converter',
    lede: 'Render PDF pages as image files when you need previews, thumbnails, upload-friendly pages, or visual sharing instead of editable text.',
    proof: ['Page image export', 'Good for previews', 'Quality tradeoffs'],
    ctaHref: '/pdf-converter/#pdf-converter',
    ctaText: 'Open PDF image converter',
    sections: [
      ['What PDF to JPG is useful for', 'JPG export is helpful when a form, design, receipt, slide, or certificate must be shared as an image. It preserves the visual page more reliably than a text extraction workflow.'],
      ['JPG versus PNG', 'JPG usually creates smaller files for photo-heavy pages. PNG is better for crisp text, screenshots, charts, and documents with sharp lines. Choose the format based on the page content.'],
      ['Quality checks', 'Zoom into the exported image before submitting it anywhere. Check that text remains readable, stamps or signatures are visible, and important edges were not cropped.'],
      ['Privacy note', 'Use browser-based conversion for ordinary files only. Avoid confidential IDs, private contracts, bank statements, medical records, or files you do not have permission to process.']
    ],
    faqs: [
      ['Can every PDF page become a JPG?', 'Most pages can be rendered visually, but very large or protected PDFs may fail in the browser.'],
      ['Is JPG best for text?', 'PNG is often better for sharp text. JPG is better for photos and smaller file size.'],
      ['Can I convert only selected pages?', 'Use split PDF first if you only need a page range.'],
      ['Will links stay clickable?', 'No. Image export flattens the page visually.'],
      ['Can I upload the result to forms?', 'Usually, if the form accepts JPG and the file size is within its limit.'],
      ['Does it edit the original PDF?', 'No. It creates image output from the pages.']
    ]
  },
  {
    slug: 'jpg-to-pdf',
    group: 'pdf',
    kind: 'pdf',
    title: 'JPG to PDF Converter | Combine Photos into PDF',
    description: 'Turn JPG, JPEG, PNG, or WebP images into one PDF for forms, assignments, receipts, and document sharing.',
    kicker: 'JPG to PDF',
    h1: 'JPG to PDF converter',
    lede: 'Combine photos or scanned images into one PDF file for uploads, assignments, receipts, and simple document bundles.',
    proof: ['Image sequence to PDF', 'Works with common images', 'Check page order'],
    ctaHref: '/images-to-pdf/#images-to-pdf',
    ctaText: 'Open Images to PDF tool',
    sections: [
      ['What JPG to PDF does', 'The workflow places one or more images into a PDF. It is useful when a website or office asks for one PDF instead of several separate photo uploads.'],
      ['Before you convert', 'Rename or arrange images in the order you want. Crop unnecessary background, keep pages upright, and make sure text is readable before creating the final PDF.'],
      ['Common use cases', 'Students can combine assignment photos, customers can package receipts, and small offices can combine photographed forms or document pages into a single upload.'],
      ['Quality and privacy', 'Photo quality controls the final PDF readability. Use sufficient lighting, avoid shadows, and do not process sensitive identity or bank documents in a general online tool unless you accept the risk.']
    ],
    faqs: [
      ['Can I use PNG or WebP too?', 'Yes. The images-to-PDF tool supports common browser image formats.'],
      ['Can I reorder images?', 'Arrange the files before conversion or use the tool page options if available.'],
      ['Will the PDF be searchable?', 'No. Image PDFs are visual unless OCR is applied.'],
      ['Why is my PDF large?', 'High-resolution photos create large PDFs. Compress or resize images if needed.'],
      ['Can I use it for forms?', 'Yes, if the receiving site accepts a PDF made from photos.'],
      ['What should I check?', 'Open the downloaded PDF and confirm page order, orientation, and readability.']
    ]
  },
  {
    slug: 'compress-pdf-to-100kb',
    group: 'pdf',
    kind: 'pdf',
    title: 'Compress PDF to 100KB | Reduce PDF Size Carefully',
    description: 'Learn how to reduce PDF size toward 100KB with browser compression, image quality tradeoffs, and safer document checks.',
    kicker: 'PDF compression',
    h1: 'Compress PDF to 100KB',
    lede: 'Try to reduce PDF size for upload limits while understanding that exact 100KB output depends on images, pages, fonts, and document complexity.',
    proof: ['Upload-size help', 'Quality tradeoffs', 'Check readability'],
    ctaHref: '/compress-pdf/#compress-pdf',
    ctaText: 'Open PDF compressor',
    sections: [
      ['Why exact 100KB is hard', 'PDF size depends on page count, embedded images, fonts, scans, and compression history. A one-page text PDF can be tiny; a scanned document may not reach 100KB without becoming unreadable.'],
      ['Best compression strategy', 'Remove unnecessary pages, compress images, avoid screenshots when text PDF is possible, and test a lower quality setting only after saving a backup of the original.'],
      ['When not to over-compress', 'Do not sacrifice readability for a file-size target. If an upload portal requires clear names, marks, barcodes, or signatures, the document must remain legible after compression.'],
      ['Privacy and safety', 'Use PDF compression only for files you are allowed to process. Avoid identity documents, medical files, contracts, or confidential records in a general online utility.']
    ],
    faqs: [
      ['Can every PDF become 100KB?', 'No. Some files cannot reach 100KB without unacceptable quality loss.'],
      ['What reduces PDF size most?', 'Large images and scanned pages usually contribute most to file size.'],
      ['Should I keep the original?', 'Yes. Always keep the original file before compression.'],
      ['Can I compress for exam or job portals?', 'Yes, but confirm readability and file-size rules after export.'],
      ['Does compression remove security?', 'Use dedicated password workflows for protected files; compression is not a security tool.'],
      ['What if the output is blurry?', 'Use a higher quality setting or reduce page count instead.']
    ]
  },
  {
    slug: 'home-loan-emi-calculator-india',
    group: 'finance',
    kind: 'finance',
    calc: 'home-emi',
    title: 'Home Loan EMI Calculator India | Monthly EMI Estimate',
    description: 'Calculate home loan EMI in India with principal, annual interest rate, and tenure. See monthly EMI, total interest, and total payment.',
    kicker: 'Loan calculator',
    h1: 'Home loan EMI India',
    lede: 'Estimate monthly home loan EMI, total interest, and total repayment before comparing bank offers or changing tenure assumptions.',
    proof: ['Monthly EMI', 'Total interest', 'Tenure planning'],
    form: `
      <form class="traffic-form" data-traffic-calc="home-emi">
        <label>Loan amount<input name="principal" type="number" min="1" value="5000000" required></label>
        <label>Annual interest rate (%)<input name="rate" type="number" min="0" step="0.01" value="8.5" required></label>
        <label>Tenure in years<input name="years" type="number" min="1" step="1" value="20" required></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Calculate EMI</button>
      </form>`,
    sections: [
      ['How the EMI is calculated', 'The calculator uses the standard reducing-balance EMI formula. It assumes a fixed annual interest rate, fixed tenure, and equal monthly payments. Actual bank offers may include fees, insurance, reset dates, and rounding.'],
      ['How to use the result', 'Compare the EMI against monthly income, rent, other debts, emergency savings, and maintenance costs. A lower EMI from a longer tenure can create much higher total interest.'],
      ['India-specific checks', 'When comparing home loans in India, also check processing fees, legal charges, valuation fees, insurance bundling, prepayment rules, floating-rate reset terms, and tax treatment from current official guidance.'],
      ['Responsible planning', 'Treat the output as a planning estimate, not a loan approval or bank quote. Final EMI depends on the lender, date of disbursal, exact interest type, and repayment schedule.']
    ],
    faqs: [
      ['What is EMI?', 'EMI is the equal monthly installment paid toward a loan.'],
      ['Does this include processing fees?', 'No. Add lender fees separately when comparing offers.'],
      ['Can floating rates change EMI?', 'Yes. A floating rate can change EMI or tenure after rate resets.'],
      ['What tenure should I choose?', 'Choose a tenure that balances monthly comfort with total interest cost.'],
      ['Is this tax advice?', 'No. Verify tax benefits with current official rules or a professional.'],
      ['Can I use it for car loans?', 'The EMI formula works, but car loans may have different fees and terms.']
    ]
  },
  {
    slug: 'emi-calculator-with-prepayment',
    group: 'finance',
    kind: 'finance',
    calc: 'emi-prepayment',
    title: 'EMI Calculator with Prepayment | Interest Saved Estimate',
    description: 'Estimate how a loan prepayment can reduce outstanding balance, remaining months, and future interest burden for a fixed EMI loan.',
    kicker: 'Prepayment calculator',
    h1: 'EMI prepayment calculator',
    lede: 'Estimate how a lump-sum prepayment changes the remaining balance and closure time when the EMI stays the same.',
    proof: ['Balance after prepay', 'Months saved', 'Interest comparison'],
    form: `
      <form class="traffic-form" data-traffic-calc="emi-prepayment">
        <label>Original loan amount<input name="principal" type="number" min="1" value="2500000" required></label>
        <label>Annual interest rate (%)<input name="rate" type="number" min="0" step="0.01" value="9" required></label>
        <label>Original tenure in years<input name="years" type="number" min="1" step="1" value="15" required></label>
        <label>EMIs already paid<input name="paidMonths" type="number" min="0" step="1" value="24" required></label>
        <label>Prepayment amount<input name="prepay" type="number" min="0" value="200000" required></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Estimate prepayment effect</button>
      </form>`,
    sections: [
      ['What this prepayment calculator estimates', 'The calculator estimates outstanding balance after a number of EMIs, subtracts the lump-sum prepayment, and estimates how many months remain if the EMI continues unchanged.'],
      ['Why prepayment can help', 'In reducing-balance loans, interest is charged on outstanding principal. Paying principal early can reduce future interest, especially in the early years of a long loan.'],
      ['Check lender rules', 'Some lenders have lock-in periods, part-payment minimums, foreclosure fees, or different rules for fixed and floating rates. Confirm the policy before making a large payment.'],
      ['Limitations', 'This is an estimate. It assumes the rate and EMI remain constant and does not model exact payment dates, reset dates, penalties, tax effects, or fees.']
    ],
    faqs: [
      ['Is prepayment always best?', 'Not always. Compare interest saved with liquidity needs, emergency funds, investment alternatives, and lender charges.'],
      ['Does this reduce EMI or tenure?', 'This page estimates tenure reduction when EMI stays the same.'],
      ['Can I use it for home loans?', 'Yes, as a planning estimate if the loan uses reducing-balance EMI.'],
      ['Does it include prepayment penalties?', 'No. Add lender charges separately.'],
      ['Why are early prepayments powerful?', 'More outstanding principal remains early in the loan, so principal reduction can affect more future interest.'],
      ['Is the future payment saved exact?', 'No. It is a simplified estimate based on fixed-rate math.']
    ]
  },
  {
    slug: 'sip-step-up-calculator',
    group: 'finance',
    kind: 'finance',
    calc: 'sip-step-up',
    title: 'SIP Step-Up Calculator | Increase SIP Every Year',
    description: 'Calculate a yearly step-up SIP projection with monthly investment, expected annual return, annual increase, and investment period.',
    kicker: 'SIP calculator',
    h1: 'SIP step-up calculator',
    lede: 'Project how increasing your monthly SIP every year can change total investment, estimated future value, and long-term compounding.',
    proof: ['Annual SIP increase', 'Future value estimate', 'Total invested'],
    form: `
      <form class="traffic-form" data-traffic-calc="sip-step-up">
        <label>Starting monthly SIP<input name="monthly" type="number" min="1" value="10000" required></label>
        <label>Expected annual return (%)<input name="rate" type="number" min="0" step="0.01" value="12" required></label>
        <label>Annual step-up (%)<input name="step" type="number" min="0" step="0.1" value="10" required></label>
        <label>Investment period in years<input name="years" type="number" min="1" step="1" value="15" required></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Calculate step-up SIP</button>
      </form>`,
    sections: [
      ['What a step-up SIP is', 'A step-up SIP increases the monthly investment amount at a fixed interval, commonly once per year. It can align investing with rising income while keeping a disciplined contribution habit.'],
      ['How this estimate works', 'The calculator increases the monthly contribution at the start of each investment year and compounds each monthly contribution using the expected annual return converted to a monthly rate.'],
      ['Use conservative scenarios', 'Market returns are not guaranteed. Test lower return assumptions, inflation, expenses, and goal timing before treating a projection as achievable.'],
      ['Planning note', 'A higher step-up rate creates a much larger final monthly commitment. Make sure the future SIP remains realistic for income, expenses, and emergency savings.']
    ],
    faqs: [
      ['Is SIP return guaranteed?', 'No. Mutual fund and market-linked returns can vary.'],
      ['What does step-up percentage mean?', 'It is the annual increase applied to your monthly SIP amount.'],
      ['When should I step up SIP?', 'Many people step up when income increases, but affordability matters.'],
      ['Does this include tax?', 'No. Tax and fund costs are not included.'],
      ['Can I use this for goals?', 'Yes, as a rough planning projection.'],
      ['Why is final SIP shown?', 'It helps you see whether the future monthly contribution is realistic.']
    ]
  },
  {
    slug: 'gst-calculator-india',
    group: 'finance',
    kind: 'finance',
    calc: 'gst-india',
    title: 'GST Calculator India | Add or Remove GST Online',
    description: 'Calculate GST in India by adding or removing GST from an amount. See base amount, GST amount, inclusive total, and CGST/SGST split.',
    kicker: 'GST calculator',
    h1: 'GST calculator India',
    lede: 'Add GST to a base price or remove GST from an inclusive price for common Indian GST rates.',
    proof: ['Add or remove GST', 'CGST + SGST split', 'Invoice checks'],
    form: `
      <form class="traffic-form" data-traffic-calc="gst-india">
        <label>Amount<input name="amount" type="number" min="0" step="0.01" value="1000" required></label>
        <label>GST rate<select name="gstRate"><option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18" selected>18%</option><option value="28">28%</option></select></label>
        <label>Mode<select name="mode"><option value="add">Add GST</option><option value="remove">Remove GST from total</option></select></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Calculate GST</button>
      </form>`,
    sections: [
      ['What this GST calculator does', 'The calculator adds GST to a base amount or removes GST from a tax-inclusive total. It also shows the basic equal CGST and SGST split for intra-state examples.'],
      ['Add GST versus remove GST', 'Use add GST when you know the base price before tax. Use remove GST when a price already includes GST and you need to estimate the taxable value and tax amount.'],
      ['Rate selection warning', 'This page does not decide the legal GST rate for a product or service. Classification can change and should be checked using current official guidance or a tax professional.'],
      ['Invoice use', 'For invoices, verify GSTIN, place of supply, tax type, rate, rounding, HSN/SAC, and current compliance requirements. The calculator only performs arithmetic.']
    ],
    faqs: [
      ['Which GST rates are included?', 'The form includes common 0%, 5%, 12%, 18%, and 28% rates.'],
      ['Can this decide my GST rate?', 'No. It calculates arithmetic after you choose the rate.'],
      ['What is remove GST?', 'It extracts the base value and tax amount from a GST-inclusive total.'],
      ['Is CGST and SGST always equal?', 'For many intra-state examples, GST is split equally, but actual tax type depends on transaction context.'],
      ['Does this file GST returns?', 'No. It is only a calculator.'],
      ['Should I verify official rules?', 'Yes, especially for tax filing and business invoices.']
    ]
  },
  {
    slug: 'electricity-bill-calculator-india',
    group: 'electricity',
    kind: 'finance',
    calc: 'electricity-bill',
    title: 'Electricity Bill Calculator India | Units to Cost Estimate',
    description: 'Estimate electricity bill cost in India from monthly units, unit rate, fixed charge, and tax or duty percentage. Use your latest tariff.',
    kicker: 'Electricity calculator',
    h1: 'Electricity bill India',
    lede: 'Estimate monthly electricity cost from units consumed, tariff per unit, fixed charges, and taxes using values from your latest bill or state tariff notice.',
    proof: ['Units to cost', 'User-entered tariff', 'No outdated slab claims'],
    form: `
      <form class="traffic-form" data-traffic-calc="electricity-bill">
        <label>Monthly units / kWh<input name="units" type="number" min="0" step="0.01" value="250" required></label>
        <label>Rate per unit<input name="unitRate" type="number" min="0" step="0.01" value="7.5" required></label>
        <label>Fixed charge<input name="fixed" type="number" min="0" step="0.01" value="100"></label>
        <label>Tax / duty (%)<input name="tax" type="number" min="0" step="0.01" value="0"></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Estimate bill</button>
      </form>`,
    sections: [
      ['Why this calculator asks for your tariff', 'Electricity rates in India vary by state, board, consumer category, slab, connected load, subsidy, fixed charge, and billing period. Hardcoding a rate can become wrong quickly, so this page lets you enter the rate from your latest bill or official tariff notice.'],
      ['How the estimate works', 'The calculator multiplies consumed units by the unit rate, adds fixed charges, and optionally applies a tax or duty percentage. This gives a quick planning estimate, not an official bill calculation.'],
      ['Where to find inputs', 'Use the units or kWh shown on your electricity bill. For unit rate, check the tariff line, average energy charge, or official tariff sheet. Add fixed charges and taxes separately if your bill shows them.'],
      ['State-board caution', 'TNEB, BESCOM, MSEDCL, Telangana, Andhra Pradesh, and other boards can use different slabs and rules. For payment disputes or exact billing, use the official board bill, tariff order, or customer portal.']
    ],
    faqs: [
      ['Can this calculate exact state electricity slabs?', 'No. It avoids hardcoded state slabs because tariffs change and vary by category. Enter your current rate manually.'],
      ['What is one unit of electricity?', 'One unit is usually one kilowatt-hour, or 1 kWh.'],
      ['Where do I find units consumed?', 'Check the consumption or units line on your electricity bill.'],
      ['Why add fixed charge separately?', 'Many bills include fixed or demand charges in addition to per-unit energy charges.'],
      ['Can I use it for AC cost?', 'Yes. First estimate AC kWh usage, then enter those units and your tariff rate.'],
      ['Is this an official bill?', 'No. It is a planning estimate for comparison and budgeting.']
    ]
  }
];

const regionalElectricityPages = [
  ['tneb-electricity-bill-calculator', 'TNEB Electricity Bill Calculator | Tamil Nadu Units Cost', 'Estimate a Tamil Nadu or TNEB-style electricity bill from units, latest unit rate, fixed charge, and duty. No hardcoded slab rates.', 'Tamil Nadu electricity', 'TNEB bill calculator', 'Estimate a Tamil Nadu electricity bill using the units on your bill and the latest tariff rate you enter yourself.', 'Tamil Nadu / TNEB searches'],
  ['bescom-electricity-bill-calculator', 'BESCOM Electricity Bill Calculator | Bengaluru Units Cost', 'Estimate a Bengaluru BESCOM electricity bill from monthly units, current rate per unit, fixed charge, and tax or duty.', 'Bengaluru electricity', 'BESCOM bill calculator', 'Estimate a BESCOM-style electricity bill for Bengaluru by entering your current units, unit rate, fixed charge, and duty.', 'BESCOM / Bengaluru searches'],
  ['msedcl-electricity-bill-calculator', 'MSEDCL Electricity Bill Calculator | Maharashtra Units Cost', 'Estimate a Maharashtra MSEDCL electricity bill using units, latest rate per unit, fixed charges, and tax or duty percentage.', 'Maharashtra electricity', 'MSEDCL bill calculator', 'Estimate a Maharashtra electricity bill with your latest MSEDCL-style tariff inputs instead of outdated fixed slab assumptions.', 'MSEDCL / Maharashtra searches'],
  ['delhi-electricity-bill-calculator', 'Delhi Electricity Bill Calculator | Units to Bill Estimate', 'Estimate a Delhi electricity bill from monthly units, current unit rate, fixed charge, and duty or tax percentage.', 'Delhi electricity', 'Delhi electricity bill calculator', 'Estimate a Delhi electricity bill using the units and tariff values from your latest bill or provider notice.', 'Delhi electricity searches'],
  ['telangana-electricity-bill-calculator', 'Telangana Electricity Bill Calculator | Units Cost Estimate', 'Estimate a Telangana electricity bill from units consumed, current tariff per unit, fixed charge, and duty or tax.', 'Telangana electricity', 'Telangana electricity bill calculator', 'Estimate a Telangana electricity bill with user-entered tariff values, fixed charges, and tax or duty percentage.', 'Telangana electricity searches'],
  ['andhra-pradesh-electricity-bill-calculator', 'Andhra Pradesh Electricity Bill Calculator | Units Cost', 'Estimate an Andhra Pradesh electricity bill using monthly units, latest rate per unit, fixed charge, and duty or tax.', 'Andhra Pradesh electricity', 'Andhra Pradesh electricity bill calculator', 'Estimate an Andhra Pradesh electricity bill from your current unit consumption and tariff values.', 'Andhra Pradesh searches'],
  ['kerala-electricity-bill-calculator', 'Kerala Electricity Bill Calculator | KSEB Units Cost Estimate', 'Estimate a Kerala or KSEB-style electricity bill from units, latest unit rate, fixed charge, and duty or tax percentage.', 'Kerala electricity', 'Kerala electricity bill calculator', 'Estimate a Kerala electricity bill using your latest KSEB-style tariff inputs and monthly unit consumption.', 'Kerala / KSEB searches'],
  ['gujarat-electricity-bill-calculator', 'Gujarat Electricity Bill Calculator | Units Cost Estimate', 'Estimate a Gujarat electricity bill from monthly units, current per-unit tariff, fixed charge, and tax or duty percentage.', 'Gujarat electricity', 'Gujarat electricity bill calculator', 'Estimate a Gujarat electricity bill by entering the latest unit rate and fixed charges shown on your bill.', 'Gujarat electricity searches'],
  ['uttar-pradesh-electricity-bill-calculator', 'Uttar Pradesh Electricity Bill Calculator | Units Cost', 'Estimate an Uttar Pradesh electricity bill using units consumed, current unit rate, fixed charge, and duty or tax.', 'Uttar Pradesh electricity', 'Uttar Pradesh electricity bill calculator', 'Estimate an Uttar Pradesh electricity bill with your own latest tariff rate, fixed charge, and duty inputs.', 'Uttar Pradesh searches'],
  ['rajasthan-electricity-bill-calculator', 'Rajasthan Electricity Bill Calculator | Units Cost Estimate', 'Estimate a Rajasthan electricity bill from monthly units, current tariff rate, fixed charge, and tax or duty percentage.', 'Rajasthan electricity', 'Rajasthan electricity bill calculator', 'Estimate a Rajasthan electricity bill using current bill values instead of hardcoded tariff tables.', 'Rajasthan electricity searches'],
  ['west-bengal-electricity-bill-calculator', 'West Bengal Electricity Bill Calculator | Units Cost', 'Estimate a West Bengal electricity bill from consumed units, current rate per unit, fixed charge, and duty or tax.', 'West Bengal electricity', 'West Bengal electricity bill calculator', 'Estimate a West Bengal electricity bill by entering units, unit rate, fixed charges, and taxes from your latest bill.', 'West Bengal searches'],
  ['punjab-electricity-bill-calculator', 'Punjab Electricity Bill Calculator | Units Cost Estimate', 'Estimate a Punjab electricity bill using monthly units, current rate per unit, fixed charge, and duty or tax percentage.', 'Punjab electricity', 'Punjab electricity bill calculator', 'Estimate a Punjab electricity bill using the tariff values from your latest bill or official provider notice.', 'Punjab electricity searches']
].map(([slug, title, description, kicker, h1, lede, proof]) => ({
  slug,
  group: 'electricity',
  kind: 'finance',
  calc: 'electricity-bill',
  title,
  description,
  kicker,
  h1,
  lede,
  proof: [proof, 'User-entered tariff', 'No hardcoded slabs'],
  form: `
      <form class="traffic-form" data-traffic-calc="electricity-bill">
        <label>Monthly units / kWh<input name="units" type="number" min="0" step="0.01" value="250" required></label>
        <label>Latest rate per unit<input name="unitRate" type="number" min="0" step="0.01" value="7.5" required></label>
        <label>Fixed / demand charge<input name="fixed" type="number" min="0" step="0.01" value="100"></label>
        <label>Tax / duty (%)<input name="tax" type="number" min="0" step="0.01" value="0"></label>
        <button class="glowing-btn demo-btn ripple-btn" type="submit">Estimate bill</button>
      </form>`,
  sections: [
    ['Why this regional page does not hardcode rates', 'Electricity tariffs can change by state, distribution company, consumer category, slab, subsidy, billing cycle, and connected load. This calculator avoids stale tariff tables and asks you to enter the latest rate from your own bill or official tariff notice.'],
    ['How to use this estimate', 'Enter the units or kWh consumed, the current unit rate, any fixed or demand charge, and an optional duty or tax percentage. The result is a planning estimate that helps you compare usage scenarios before checking the official bill.'],
    ['Where to find the inputs', 'Look for units consumed, energy charge, fixed charge, duty, tax, subsidy, and average unit rate on your latest electricity bill. If your bill uses slabs, you can enter an average rate for a quick estimate or calculate each slab separately.'],
    ['Official bill caution', 'For bill payment, complaints, subsidy eligibility, arrears, meter issues, category changes, or slab disputes, use the official distribution-company bill, customer portal, tariff order, or support channel. This page performs arithmetic only.']
  ],
  faqs: [
    ['Does this use official current tariff slabs?', 'No. It avoids hardcoded rates because tariffs and eligibility rules can change. Enter the latest rate from your bill or official tariff notice.'],
    ['What is one electricity unit?', 'One unit is usually one kilowatt-hour, or 1 kWh.'],
    ['Can I use this for a slab-based bill?', 'Yes for a rough estimate. Use an average per-unit rate, or calculate separate slab portions manually.'],
    ['Why is fixed charge separate?', 'Many electricity bills include fixed, demand, meter, or customer charges in addition to per-unit energy charges.'],
    ['Can this replace my official bill?', 'No. It is only a planning estimate and not a payment demand or official statement.'],
    ['Can I estimate AC or appliance cost?', 'Yes. Estimate the appliance kWh first, then enter those units with your current tariff rate.']
  ]
}));

const regionalGuidance = {
  'tneb-electricity-bill-calculator': ['Tamil Nadu / TNEB review checks', 'Tamil Nadu domestic bills may be affected by billing cycle length, consumer category, subsidy treatment, fixed charges, and the distribution company named on the bill. Use this page to compare usage scenarios, then confirm the exact payable amount in the official bill or customer portal before payment.'],
  'bescom-electricity-bill-calculator': ['Bengaluru / BESCOM review checks', 'For a Bengaluru-style estimate, check whether the bill separates energy charges, fixed or demand charges, fuel adjustment, arrears, taxes, and any credits. Enter the rate you want to test instead of assuming one permanent city-wide slab.'],
  'msedcl-electricity-bill-calculator': ['Maharashtra / MSEDCL review checks', 'Maharashtra bills can vary by connection type, sanctioned load, category, arrears, subsidy, duty, and other line items. Use the latest bill line items as inputs and keep official payment or dispute questions with the distribution company.'],
  'delhi-electricity-bill-calculator': ['Delhi electricity review checks', 'Delhi estimates should account for the provider shown on the bill, consumer category, unit slab, fixed charge, subsidy or rebate eligibility, arrears, and taxes. A quick average-rate estimate is useful for budgeting but does not decide subsidy eligibility.'],
  'telangana-electricity-bill-calculator': ['Telangana electricity review checks', 'For Telangana bills, verify the distribution company, consumer category, billing period, connected load, fixed charges, arrears, and any state-specific duties on the latest bill. Use official tariff notices for exact slab disputes.'],
  'andhra-pradesh-electricity-bill-calculator': ['Andhra Pradesh electricity review checks', 'Andhra Pradesh estimates should be checked against the DISCOM named on the bill, consumer category, connected load, subsidy line, duty, and fixed charges. Enter an average unit rate only for quick planning.'],
  'kerala-electricity-bill-calculator': ['Kerala / KSEB review checks', 'For Kerala or KSEB-style planning, check the bill for energy charge, fixed charge, duty, surcharge, billing period, consumer category, and any subsidy or arrear line. Keep the official bill as the payable record.'],
  'gujarat-electricity-bill-calculator': ['Gujarat electricity review checks', 'Gujarat users should verify the distribution company named on the bill, tariff category, fuel adjustment or other surcharge lines, fixed charges, duty, and subsidy or credit entries before comparing the estimate.'],
  'uttar-pradesh-electricity-bill-calculator': ['Uttar Pradesh electricity review checks', 'For Uttar Pradesh estimates, check the connection category, rural or urban tariff context, sanctioned load, fixed charge, duty, arrears, and the distribution company listed on the bill. Use this page for scenario planning, not official billing.'],
  'rajasthan-electricity-bill-calculator': ['Rajasthan electricity review checks', 'Rajasthan bills can include distribution-circle context, subsidy or rebate treatment, fuel surcharge, fixed charges, taxes, arrears, and category-specific rates. Enter the latest bill values to avoid stale tariff assumptions.'],
  'west-bengal-electricity-bill-calculator': ['West Bengal electricity review checks', 'For West Bengal estimates, confirm whether your bill is from the state distribution company or a city supplier, then check category, billing period, fixed or meter charges, duty, arrears, and any rebate line.'],
  'punjab-electricity-bill-calculator': ['Punjab electricity review checks', 'Punjab estimates should be checked against the latest bill for category, connected load, subsidy treatment, duty, fixed charges, arrears, and the official payable amount. This tool is for budgeting and usage comparison.']
};

regionalElectricityPages.forEach((page) => {
  const extra = regionalGuidance[page.slug];
  if (extra) page.sections.splice(1, 0, extra);
});

pages.push(...regionalElectricityPages);

function json(value) {
  return JSON.stringify(value, null, 2).replace(/</g, '\\u003c');
}

function reviewStrip(page) {
  const method = page.group === 'electricity'
    ? 'Tariff method checked: user-entered current bill values'
    : page.group === 'finance'
      ? 'Formula method checked: standard planning arithmetic'
      : page.group === 'pdf'
        ? 'Workflow checked: browser-only file handling'
        : 'QR payload checked: local browser rendering';
  return `<div class="review-strip"><strong>Published by Calculator All-in-One</strong><span>Last reviewed: 12 August 2026</span><span>${method}</span><a href="/editorial-standards.html">Testing and editorial standards</a></div>`;
}

function evidenceArticle(page) {
  const text = page.group === 'electricity'
    ? 'This page deliberately avoids fixed tariff tables because electricity rates, slabs, subsidies, taxes, and distribution-company rules change. The source of truth is the latest bill, official tariff order, or customer portal; the calculator performs only the arithmetic on the values you enter.'
    : page.group === 'finance'
      ? 'The calculation uses transparent arithmetic from the inputs shown on the page. It does not include lender-specific fees, tax classification, market volatility, eligibility rules, or provider quotations unless you enter those values yourself.'
      : page.group === 'pdf'
        ? 'The PDF workflow is described as a browser utility, not a server conversion service. Selected files are processed locally where the tool supports it, and users should open the downloaded output to confirm page order, text, image quality, and missing advanced features.'
        : 'The QR payload is assembled from the fields shown on the page and rendered locally in the browser. Static QR codes do not provide scan analytics, editable redirects, payment confirmation, or account-based history.';
  return `<article class="content-evidence source-note"><h2>Review method and source trail</h2><p>${text} See the <a href="/editorial-standards.html">editorial standards</a> and <a href="/disclaimer.html">site disclaimer</a> for how estimates, file tools, and safety notes are reviewed.</p></article>`;
}

function nav(current) {
  const links = [
    ['/', 'Home'],
    ['/qr-code-generator.html', 'QR Tools'],
    ['/pdf-converter/', 'PDF Tools'],
    ['/finance-calculators.html', 'Finance'],
    ['/utility-tools.html', 'Utility'],
    ['/contact.html', 'Contact']
  ];
  const htmlLinks = links.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<header class="navbar"><a href="/" class="logo">Calculator All-in-One</a><nav>${htmlLinks}</nav><details class="mobile-menu"><summary>Menu</summary><div class="mobile-menu-panel">${htmlLinks}<a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms</a></div></details></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-links"><a href="/">Home</a><a href="/qr-code-generator.html">QR Code Generator</a><a href="/pdf-converter/">PDF Converter</a><a href="/finance-calculators.html">Finance Calculators</a><a href="/utility-tools.html">Utility Tools</a><a href="/privacy.html">Privacy Policy</a><a href="/contact.html">Contact Us</a></div><p class="maintainer-credit">Developed and maintained by <a href="mailto:support.aiagents@gmail.com">support.aiagents@gmail.com</a>.</p><p class="copyright">&copy; 2026 Calculator All-in-One.</p></footer>`;
}

function tool(page) {
  if (page.kind === 'qr') {
    return `<aside class="traffic-tool-card" aria-label="${page.h1} tool"><h2>Create it now</h2>${page.form}<div class="traffic-qr-preview"><img data-traffic-qr-image alt="Generated ${page.h1}" hidden><span>QR preview</span></div><p class="traffic-encoded" data-traffic-qr-output></p><div class="traffic-result-grid" data-traffic-result hidden></div></aside>`;
  }
  if (page.kind === 'bulk-qr') {
    return `<aside class="traffic-tool-card" aria-label="${page.h1} tool"><h2>Create a small batch</h2><form class="traffic-form" data-traffic-bulk-qr><label>One URL or text item per line<textarea name="items" required placeholder="https://example.com/menu&#10;https://example.com/contact&#10;Table 7 feedback form"></textarea></label><button class="glowing-btn demo-btn ripple-btn" type="submit">Generate batch</button></form><div class="bulk-qr-grid" data-bulk-qr-grid></div></aside>`;
  }
  if (page.kind === 'finance') {
    return `<aside class="traffic-tool-card" aria-label="${page.h1} calculator"><h2>Calculate now</h2>${page.form}<div class="traffic-result-grid" data-traffic-result hidden></div><p class="traffic-encoded">Planning estimate only. Verify final loan, tax, or investment decisions with current official or provider information.</p></aside>`;
  }
  return `<aside class="traffic-tool-card" aria-label="${page.h1} action"><h2>Use the working tool</h2><p class="traffic-encoded">This long-tail guide explains the workflow and points you to the active browser tool that completes the task.</p><div class="page-actions"><a class="glowing-btn" href="${page.ctaHref}">${page.ctaText}</a><a class="secondary-btn" href="/pdf-converter/">See all PDF tools</a></div><div class="traffic-result-grid"><div><span>Best for</span><strong>${page.proof[0]}</strong></div><div><span>Watch for</span><strong>${page.proof[2]}</strong></div></div></aside>`;
}

function pageHtml(page) {
  const url = `${site}/${page.slug}/`;
  const groupMeta = {
    finance: ['Finance Calculators', `${site}/finance-calculators.html`],
    pdf: ['PDF Tools', `${site}/pdf-converter/`],
    electricity: ['Electricity Calculators', `${site}/electricity-calculators.html`],
    qr: ['QR Tools', `${site}/qr-code-generator.html`]
  };
  const [groupName, groupUrl] = groupMeta[page.group] || groupMeta.qr;
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': page.kind === 'pdf' ? 'Article' : 'WebApplication',
    name: page.h1,
    url,
    description: page.description,
    isPartOf: { '@type': 'WebSite', name: 'Calculator All-in-One', url: site },
    publisher: { '@type': 'Organization', name: 'Calculator All-in-One', email: 'support.aiagents@gmail.com', url: site },
    dateModified: today,
    isAccessibleForFree: true,
    ...(page.kind !== 'pdf' ? { applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } } : {})
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
      { '@type': 'ListItem', position: 2, name: groupName, item: groupUrl },
      { '@type': 'ListItem', position: 3, name: page.h1, item: url }
    ]
  };
  const scripts = page.group === 'qr'
    ? `<script src="/qr-code-engine.js?v=20260812qr" defer></script><script src="/traffic-calculators.js?v=20260812seo" defer></script>`
    : page.kind === 'finance'
      ? `<script src="/traffic-calculators.js?v=20260812seo" defer></script>`
      : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <meta name="description" content="${page.description}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Calculator All-in-One">
    <meta name="theme-color" content="#0f172a">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="website"><meta property="og:site_name" content="Calculator All-in-One"><meta property="og:title" content="${page.title}"><meta property="og:description" content="${page.description}"><meta property="og:url" content="${url}">
    <meta name="twitter:card" content="summary"><meta name="twitter:title" content="${page.title}"><meta name="twitter:description" content="${page.description}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="stylesheet" href="/style.css?v=20260812seo">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-MRCMVF9545"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-MRCMVF9545');</script>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9409281508068005" crossorigin="anonymous"></script>
    <script type="application/ld+json">${json(appSchema)}</script>
    <script type="application/ld+json">${json(faqSchema)}</script>
    <script type="application/ld+json">${json(breadcrumb)}</script>
${scripts}
</head>
<body>
    <a class="skip-link" href="#tool">Skip to tool</a>
    <div class="bg-grid"></div><div class="particles"></div><div class="gradient-blob blob-1"></div><div class="gradient-blob blob-2"></div>
    ${nav(`/${page.slug}/`)}
    <main class="traffic-main">
        <section class="traffic-hero">
            <div><p class="page-kicker">${page.kicker}</p><h1>${page.h1}</h1><p>${page.lede}</p><div class="page-actions"><a class="glowing-btn" href="#tool">${page.kind === 'pdf' ? 'Open workflow' : 'Use the tool'}</a><a class="secondary-btn" href="#faq">Read FAQs</a></div></div>
            <aside class="traffic-hero-card"><span>Search intent</span><strong>${page.proof[0]}</strong><p>${page.proof.join(' &middot; ')}</p></aside>
        </section>
        ${reviewStrip(page)}
        <section class="traffic-shell" id="tool">
            ${tool(page)}
            <div class="traffic-panel">
                ${page.sections.map(([heading, body]) => `<article><h2>${heading}</h2><p>${body}</p></article>`).join('')}
                ${evidenceArticle(page)}
                <article><h2>Related tools</h2><div class="traffic-related">${related[page.group].map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}</div></article>
                <article id="faq"><h2>FAQs</h2><div class="faq-list">${page.faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></article>
            </div>
        </section>
    </main>
    ${footer()}
</body>
</html>
`;
}

for (const page of pages) {
  const dir = path.join(process.cwd(), page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(page), 'utf8');
}

const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
for (const page of pages) {
  const loc = `${site}/${page.slug}/`;
  if (!sitemap.includes(`<loc>${loc}</loc>`)) {
    sitemap = sitemap.replace('</urlset>', `    <url>\n        <loc>${loc}</loc>\n        <lastmod>${today}</lastmod>\n        <changefreq>monthly</changefreq>\n        <priority>${page.group === 'pdf' ? '0.82' : '0.84'}</priority>\n    </url>\n</urlset>`);
  }
}
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log(`Generated ${pages.length} traffic pages and updated sitemap.xml`);
