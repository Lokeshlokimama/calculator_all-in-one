wifi-qr-code-generator/index.html

## Prepare a guest-network sign that works in practice

### Use the network name exactly as configured

The SSID field contains the Wi-Fi network name, not the router model, the venue name, or a label invented for the sign. If the network is named “Studio Guest 2”, preserve its spaces, capitalisation, and final digit. A code containing “StudioGuest” asks the phone to find a different network. The generator cannot discover which networks are nearby or correct a name by comparing it with your router.

Copy the Wi-Fi password from the network configuration and distinguish it from the router administration password. The latter controls router settings and should not be placed on a guest sign. Choose the security option that matches the guest network. The WPA/WPA2 option in this form produces a WPA-labelled payload; WEP and no-password modes produce different payload settings. Choosing a mode does not change the router's actual security configuration.

The hidden-network checkbox describes a network that does not broadcast its name. It does not hide the password inside the QR code or prevent people from reading the encoded settings. If you are unsure whether the network is hidden, check its configuration instead of selecting the checkbox because it sounds more private. The payload's hidden flag and the visibility of the printed sign are unrelated.

### Understand escaping without editing the payload manually

Wi-Fi QR text uses delimiters between fields. Characters such as semicolons, colons, quotes, and backslashes can also occur in an SSID or password. This tool escapes those characters while assembling the payload so they are not mistaken for field boundaries. Enter the original value in the form rather than inserting your own escape characters first. Double-escaping changes the information the scanner receives.

For a synthetic test, imagine an SSID containing a semicolon, such as “Lab;Guest”. Its encoded representation includes an escape before the semicolon. A scanner should recover the original network name, not ask you to rename the network. Check the decoded field on a compatible device if special punctuation is involved. The shortened payload text shown beneath a long preview is a display convenience, not evidence that the QR contains only that abbreviated text.

### Test joining as well as scanning

Generating a square image confirms that the browser assembled and rendered a payload. It does not confirm that the router is reachable, that the password is correct, or that the network allows internet access. First scan the code on a phone that does not already have the network saved. Then confirm the proposed network name and complete the device's connection prompt. Finally, test the actual access the guest is supposed to receive.

A saved network can conceal a mistake by reconnecting through previously stored credentials. Use an appropriate test device or carefully forget only the test network before checking again. If a phone decodes the settings but cannot join, review the SSID, password, security mode, signal, and router policy. Reprinting a sharper image will not correct a wrong password or a network that is temporarily unavailable.

### Treat a code as readable access information

Anyone who obtains the printed code can potentially decode the network credentials. The QR is an encoding, not encryption or a password vault. Share only credentials you are authorised to distribute. A guest network is a better fit for a public sign than a private network used for sensitive work. Whether guests are isolated from other devices depends on the router configuration, which this page does not inspect or enforce.

Do not add an administration password, recovery code, or personal account detail to a network name or note merely because it is convenient to print everything together. The sign should provide the minimum information for its intended audience. Keep a separate, secure record of the router settings needed for maintenance.

### Plan replacement before changing credentials

Changing the guest password makes the old static code incorrect. Regenerate the image and replace every distributed copy, including signs in secondary rooms and artwork stored for later printing. Mark the sign's version or preparation date somewhere outside the code so staff can distinguish old and new copies. The generator does not remotely update posters or notify devices that credentials have changed.

Before distributing the final artwork, test it at its printed size with the clear border intact. Keep the code square and away from folds, glare, and decorative overlays. Include a readable guest-network name nearby so a visitor can see what they are joining. Provide another authorised connection method for devices whose camera application does not recognise Wi-Fi QR payloads.
