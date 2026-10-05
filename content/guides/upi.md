upi-qr-code-generator/index.html

## Prepare a payment request people can verify

### Distinguish an encoded request from a verified account

The required UPI ID is the payment address placed in the payload. The optional payee name is a label you supply. Entering a name does not verify that the name and account belong together. The generator does not connect to a bank, validate ownership of the address, or register a merchant. The receiving payment application and the account holder's records are needed to verify the actual destination.

Before printing, confirm the payment address through the account owner's authorised channel. Copy it carefully and review the characters around the at sign. A typing mistake can make the address invalid or identify a different destination. Do not regard a successfully rendered preview as an account-verification result. The preview proves only that the page could encode the entered text.

### Choose an amount only when the request needs one

Leaving the optional amount blank creates a request without a specified amount in this page's payload. That can suit a general payment sign where a customer supplies the amount in their app. Entering an amount creates a more specific request. For a synthetic arithmetic example, an entered amount of 250 means a requested amount of INR 250, not 250 in whichever display currency is selected elsewhere on this site.

This generator explicitly places INR in its UPI payload. The homepage's currency preference does not convert the request into euros or another currency. Treat the amount field as an INR payment request and confirm the amount shown by the receiving application. This distinction is especially important if you have recently used the site's general currency converter and expect the display preference to carry over.

An optional amount is not proof that a payment for that amount took place. Some app flows may let the payer review or alter fields before confirmation. The payer should inspect the receiving app's actual transaction screen. The generator does not enforce checkout totals, reserve an invoice balance, or determine whether an entered value matches a merchant's pricing.

### Use the note for identification, not secrets

A short note can describe a purpose or reference, such as “Invoice ABC” in a test scenario. The note becomes part of the readable payload. Avoid entering a PIN, password, full financial record, or a customer's sensitive information. Printing a QR publicly distributes its encoded fields, even if those fields are not visually readable without a scanner.

The page uses URL encoding for the name and note. Spaces and punctuation may look different in the displayed encoded text while the payment app shows their readable forms. Do not edit those encoded sequences manually to make the preview more attractive. The form is the place to change the original text; the generator handles the structural representation.

### Test the app journey without making an unintended payment

Scan the generated code with an appropriate UPI application and inspect the payee information, payment address, currency, amount, and note that the app presents. Stop before transaction authorisation when performing a configuration test. A successful scan and a correct request screen are useful checks without sending money. Obtain the account owner's approval through your normal process before any real test transaction.

If the app reports an invalid address or cannot handle the request, review the address and device support. A payment-app error is not automatically an image-quality error. Conversely, if the camera cannot decode the square at all, improve the physical size, contrast, or border before changing account details. Diagnose which stage failed: scanning, parsing, account lookup, or transaction authorisation.

### Confirm payment through the proper record

This website does not receive a payment callback or access an account balance. It cannot mark an invoice paid, confirm settlement, or certify a screenshot sent by a customer. Use the account holder's own trusted transaction record for confirmation. A QR image and its encoded amount are a request, while a completed payment is a separate event.

For business use, follow the requirements of the bank or payment provider supporting that business. This free browser generator does not replace merchant onboarding, account controls, or any provider-specific payment acceptance arrangement. Keep claims on the printed sign limited to what the sign actually offers.

### Maintain the physical sign

Place readable recipient information beside the QR so the customer can compare it with the app. Keep the code square, preserve its clear border, and test a sample at its final size. Check installed signs periodically for damage or unauthorised replacement. A correct file stored on your computer does not guarantee that the public sign still shows that file.

When the payment address changes, regenerate the artwork and replace old copies. The previous static code continues to contain the old address. Keep a preparation record with the confirmed address, intended amount behaviour, and sign location so the next update can be checked systematically.

Source: https://www.npci.org.in/what-we-do/upi/faqs NPCI overview of UPI QR payments
