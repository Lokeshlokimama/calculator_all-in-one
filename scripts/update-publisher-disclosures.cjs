// One-time, repeatable editorial migration. No account or consent settings changed.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const filename = path.join(root, 'privacy.html');
let html = fs.readFileSync(filename, 'utf8');
const sections = {
  'Google Analytics': 'As of 5 October 2026, this release does not load Google Analytics. Earlier versions used it to measure visits. Removing the loader stops new collection by this site; it does not delete information previously held by Google. We will update this policy and implement appropriate privacy choices before enabling optional analytics again.',
  'Google AdSense': 'This site is applying for AdSense. Advertising delivery scripts are disabled in this release. The publisher verification meta tag and ads.txt remain; they identify the publisher but do not serve advertisements. Before advertising is enabled, the site must implement applicable consent requirements and review placements so that ads do not overlap tools, navigation or downloads.',
  'Cookies and privacy controls': 'Optional Google analytics and ad delivery are disabled in this release; there is no active consent banner claiming to manage them. Local preferences are described below. Fonts, browser libraries, exchange-rate requests and hosting still involve third parties and may disclose connection data such as IP address. Your browser can clear stored site data. See <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">how Google uses information from partner sites</a> for Google\'s explanation of its services.',
  'External links and retention': 'External sites and service providers have their own retention policies. Hosting may keep access logs, and email providers may retain messages you send. We do not maintain user accounts or a server-side history of ordinary calculator inputs. Disabling an analytics loader does not erase historical data in the analytics account.'
};
for (const [heading, copy] of Object.entries(sections)) {
  const pattern = new RegExp('(<h2>' + heading + '</h2>)<p>[\\s\\S]*?</p>');
  if (!pattern.test(html)) throw new Error('Missing disclosure: ' + heading);
  html = html.replace(pattern, '$1<p>' + copy + '</p>');
}
html = html.replace('Last updated: 8 September 2026', 'Last updated: 5 October 2026')
  .replace('"dateModified": "2026-09-23"', '"dateModified": "2026-10-05"');
fs.writeFileSync(filename, html);
const aboutFile = path.join(root, 'about.html');
const about = fs.readFileSync(aboutFile,'utf8').replace('Optional support and advertising help maintain hosting, domain, testing, and future development costs.', 'Optional support helps with maintenance costs. The site is applying for advertising; advertising delivery is currently disabled.');
fs.writeFileSync(aboutFile, about);
