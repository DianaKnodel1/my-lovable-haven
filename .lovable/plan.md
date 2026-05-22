
# Landing-Page-Generator im Admin-Portal

## Ziel
Im Admin-Portal eine neue Seite `/admin/landing-generator` bauen, auf der du:
1. Ein Theme aus 6 Vorlagen auswählst
2. Branding-Felder ausfüllst (Firmenname, Logo, Farben, Kontakt, Portal-URL für Bewerbungen …)
3. Eine fertige Landing-Page als **ZIP** herunterlädst
4. Die ZIP per FileZilla auf deinen VPS ziehst und entpackst → live

Keine Datenbank-Speicherung der generierten Seiten, kein Auto-Upload. Reines Build & Download.

---

## Aufbau

### 1. Themes im Portal-Code
Themes werden als statische Templates in `src/landing-themes/` abgelegt:
```text
src/landing-themes/
  theme-01/
    template.html       (Handlebars-Style Placeholder: {{firmenname}}, {{primary_color}}, …)
    style.css
    script.js
    assets/             (Standard-Bilder, Icons, Fonts)
    meta.json           (Name, Preview-Screenshot, welche Felder unterstützt werden)
  theme-02/ …
```
Du schickst mir die 6 Themes (HTML/CSS/JS), ich lege sie dort ab. Updates später per Code-Edit.

### 2. Generator-Seite (`/admin/landing-generator`)
Drei Schritte als Tabs / Wizard:

**Step 1 — Theme wählen:** Grid mit Preview-Screenshots der 6 Themes.

**Step 2 — Branding-Formular** mit folgenden Feldern:
- Firmenname
- Logo (Upload, wird in ZIP eingebettet, NICHT in Cloud gespeichert)
- Primärfarbe / Sekundärfarbe (Color-Picker)
- WhatsApp-Nummer
- Kontakt-E-Mail
- Telefon
- Anschrift (Straße, **PLZ**, Stadt)
- HRB-Nummer
- Geschäftsführer
- Impressum-Text (Textarea)
- **Portal-URL** (z. B. `https://portal.kunde-x.de`) — Landing-Page leitet Bewerbungen hierhin weiter
- **API-Endpoint** (Default: `{Portal-URL}/api/public/applications`)
- Domain der Landing-Page (für Canonical/SEO)

Pro Theme kann `meta.json` festlegen, welche Felder zusätzlich/weniger genutzt werden.

**Step 3 — Build & Download:**
- Klick auf "ZIP generieren" → Server Function (`createServerFn`) nimmt Theme + Daten, ersetzt Placeholder, packt Logo + Assets + finale HTML/CSS/JS in eine ZIP, gibt sie als Download zurück.
- Download-Button: `landing-{firmenname}-{theme}-{datum}.zip`

### 3. Server Function (`src/lib/landing-generator.functions.ts`)
- `generateLanding({ themeId, branding, logoBase64 })`
- Liest Theme-Dateien aus dem Bundle
- Ersetzt `{{placeholders}}` in HTML/CSS
- Erstellt ZIP mit `jszip` (Worker-kompatibel, pure JS)
- Gibt `{ zipBase64, filename }` zurück
- Geschützt mit `requireSupabaseAuth` + Admin-Role-Check

### 4. Bewerbungsformular in den Themes
Jedes Theme enthält ein Formular, das per `fetch POST` an `{{api_endpoint}}` sendet (an deinen Portal-Server). Felder fix: Name, E-Mail, Telefon, PLZ, Stadt, Nachricht (identisch in allen Themes).

Auf Portal-Seite existiert bereits `applications`-Tabelle + öffentliche INSERT-Policy. Wir ergänzen einen `/api/public/applications`-Endpoint mit CORS-Headern (`Access-Control-Allow-Origin: *`), damit Landing-Pages von beliebigen Domains posten können.

---

## Technische Details

- **ZIP-Library:** `jszip` (pure JS, läuft in Cloudflare Workers)
- **Templating:** simples `String.replaceAll('{{key}}', value)` — keine Lib nötig, sicher genug für vertrauenswürdigen Admin-Input
- **Logo-Handling:** Upload via `<input type=file>` → in Browser zu Base64 → an Server Function → in ZIP unter `assets/logo.png`
- **Keine DB-Tabellen** — nichts wird persistiert (du wolltest self-hosting, Portal ist nur Editor)
- **Validierung:** Zod-Schema für alle Branding-Felder (Längen, Hex-Farben, URL-Format)
- **Sidebar:** Neuer Eintrag "Landing Pages" mit Globe/Wand-Icon

---

## Was ich von dir brauche (in dieser Reihenfolge)
1. **Zustimmung zum Plan** → ich baue Schritt 1 (Generator-UI + Server Function + Dummy-Theme-01 als Demo)
2. Danach: **du schickst mir die 6 Themes** (als ZIP oder Dateien) → ich lege sie in `src/landing-themes/` ab
3. **CORS-Endpoint** für Bewerbungen: soll ich den jetzt schon mitbauen oder erst wenn du die Themes lieferst?

---

## ASCII-Flow
```text
Admin-Portal                                VPS (self-hosted)
─────────────                               ─────────────────
[Generator-UI]
   │ wähle Theme + fülle Felder
   ▼
[Server Function]
   │ jszip → branded HTML/CSS/JS/Logo
   ▼
[ZIP-Download] ─── FileZilla ──────────►   [nginx /var/www/kunde-x/]
                                                    │
                                       Bewerbung POST
                                                    ▼
                                           [Portal-API /api/public/applications]
                                                    │
                                                    ▼
                                           [applications Tabelle]
```
