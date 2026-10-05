# Calculator input testing — 6 October 2026

Tested the local built site at http://127.0.0.1:4173 using the in-app browser. Build, static checks and all 71 automated tests passed.

## Coverage

- All 62 embedded calculator/utility cards exercised with representative inputs: 42 calculation samples plus arithmetic, scientific, nutrition, text, generators, currency, graph, image and invoice utilities. Seven PDF navigation cards are excluded from this count.
- 42 missing-input cases and 99 zero/negative/non-finite primary-input cases across 33 numeric tools.
- 15 standalone calculator/generator pages: valid sample for each; missing-input checks on 13 numeric/date calculators.
- Mobile input/result checks for EMI, loan and BMI at 390 × 844, with no horizontal overflow. Broader layout coverage is in UI-UX-TEST-2026-10-06.md.

## Bugs corrected

- Electricity bill and EV charging multiplication overflow previously displayed zero monetary results; now rejected with a field error.
- Unit conversion rounding could overflow on large finite results; safe rounding and finite-result validation added.
- Generator safety margin and EV charging percentage no longer silently substitute defaults for missing or non-finite values.
- Equation plotting rejects missing and overflowing coefficients.
- Nutrition rejects non-finite weight, overflowing macros and accumulated totals.
- Five regression tests cover these cases; complete suite passes 71/71.

## Numeric samples

| Tool | Expected display | Actual | Result |
|---|---|---|---|
| bmi | 22.9 | BMI 22.9 | Pass |
| emi | 10,624 | ₹10,624 | Pass |
| roi | 20 | ROI: 20.00% | Pass |
| tip | 57.50 | Per person: ₹57.50 | Pass |
| bmr | 1649 | 1649 kcal/day | Pass |
| water | 2.5 | 2.5 Liters | Pass |
| ideal-weight | 70.5 | 70.5 kg | Pass |
| protein | 56 | 56.0 g/day | Pass |
| body-fat | 19.2 | 19.2 % | Pass |
| due-date | 2026 | Due date: Oct 8, 2026 | Pass |
| sip | 12,000 | Maturity: ₹12,000 | Pass |
| fd | 10,000 | Maturity: ₹10,000 | Pass |
| rd | 12,000 | Maturity: ₹12,000 | Pass |
| gst | 1,180 | ₹1,180.00 | Pass |
| salary | 9,520 | In-hand: ₹9,520 / month | Pass |
| leave | 10,000 | Payable: ₹10,000 | Pass |
| date-diff | 10 | 10 Days | Pass |
| time | 2 | 2h 15m | Pass |
| pct | 30 | 30.00 | Pass |
| fraction | 3/4 | Result: 3/4 | Pass |
| quadratic | 3 | Roots: 3 and 2 | Pass |
| att | 80 | Current: 80.0%  You can bunk 6 more classes. | Pass |
| base-converter | 1010 | Result: 1010 (Binary) | Pass |
| subnet | 192.168.1.0 | Network 192.168.1.0 Mask 255.255.255.0 Broadcast 192.168.1.255 Usable hosts 254 Usable range 192.168.1.1 - 192.168.1.254 | Pass |
| aspect-ratio | 720 | Scaled size: 1280 x 720 | Pass |
| discount-tax | 1,062 | ₹1,062.00 | Pass |
| power | 460 | 460 W | Pass |
| electricity-bill | 500 | ₹500.00 | Pass |
| kwh | 2 | 2 kWh | Pass |
| watt-unit | 30 | 30 units | Pass |
| solar | 2.5 | 2.5 kW (2,500 W) | Pass |
| inverter | 10.2 | 10.2 hours (612 min) | Pass |
| ups | 9.6 | 576 minutes (9.6 hr) | Pass |
| ohm | 6 | V: 12 V I: 2 A R: 6 Ohm P: 24 W | Pass |
| generator | 1.56 | 1.56 kVA | Pass |
| ev | 250 | ₹250.00 | Pass |
| circle | 3.14 | Area: 3.14 | Pass |
| triangle | 25 | Area: 25 | Pass |
| pythagorean | 5 | Hypotenuse: 5 | Pass |
| volume | 27 | Volume: 27 | Pass |
| timezone | 2026 | Thu, Jan 1, 2026, 01:30 AM EST From Thu, Jan 1, 2026, 12:00 PM GMT+5:30 | Pass |
| mileage | 500 | 100.0 km uses 5.00 L Trip cost 500.00 Cost per km 5.00 | Pass |

## Standalone samples

- /emi-calculator.html: Pass; expected 10,623.52.
- /loan-calculator.html: Pass; expected 10,000.
- /bmi-calculator.html: Pass; expected 22.9.
- /percentage-calculator.html: Pass; expected 30.
- /gst-calculator.html: Pass; expected 1,180.
- /sip-calculator.html: Pass; expected 12,000.
- /age-calculator.html: Pass; expected 26 years.
- /epf-calculator.html: Pass; expected 12,000.
- /eps-pension-calculator.html: Pass; expected 2,142.
- /nps-calculator.html: Pass; expected 12,000.
- /electricity-bill-calculator-india/: Pass; expected 100.
- /emi-calculator-with-prepayment/: Pass; expected 0.
- /sip-step-up-calculator/: Pass; expected 12,000.
- /currency-converter.html: Pass; expected $100.00.
- /password-generator.html: Pass; expected 16 characters.

## Practical limits

These are representative and boundary checks, not every possible input combination. The automated suite includes larger arithmetic matrices and currency failure cases. Currency browser results used cached reference rates with the update timestamp displayed. Graph canvas rendering was verified, but individual plotted pixels were not numerically inspected. Image conversion decoded a 1 × 1 PNG and reported WebP conversion success; saving the download was not verified. Exports, QR scanning, specialized standalone QR forms and PDF workflows are outside this calculator pass. Some toolbox errors retain the previous output while showing an error; users should read the validation message before reusing results.

Detailed inputs, outputs and validation evidence: CALCULATOR-TEST-2026-10-06.json.
