# Landing-Page-Generator – Umsetzungsplan

## Ziel
Jeder Tenant (Domain) bekommt eine eigene öffentliche Landing Page. Admin/Teamleiter wählt 1 von 5 Themes und kann Texte (Hero, CTA, Features) anpassen. Themes sind so gebaut, dass sie durch Farben/Fonts/Bilder weiter unkenntlich gemacht werden können.

---

## Phase 1 – Theme-Labor (separates Projekt)

**Du legst ein neues Lovable-Projekt an** namens `landing-themes-lab`. Dort iterieren wir nur am Look – ohne Backend, ohne Auth, ohne Risiko für die Haupt-App.

Was wir dort bauen:
- 5 Routen: `/theme/editorial`, `/theme/brutalist`, `/theme/organic`, `/theme/corporate`, `/theme/dark-tech`
- Jede Route = eine komplette Landing Page mit Dummy-Daten (Hero, 3 Features, Stats, CTA, Footer)
- Alle Themes konsumieren **das gleiche Props-Interface** (`hero_title`, `hero_subtitle`, `cta_label`, `features[]`, `logo_url`, `primary_color`)
- Du sagst pro Theme: passt / Variante X bitte / weg damit

Wenn alle 5 Themes deine Freigabe haben → Phase 2.

## Phase 2 – Übernahme in die Haupt-App

Cross-Project-Copy der finalen Theme-Komponenten aus dem Lab nach:
```
src/components/landing/themes/
  EditorialTheme.tsx
  BrutalistTheme.tsx
  OrganicTheme.tsx
  CorporateTheme.tsx
  DarkTechTheme.tsx
  index.ts        // registry: { editorial: EditorialTheme, ... }
  types.ts        // LandingProps interface
```

## Phase 3 – Datenmodell

Migration: Spalten an `tenants` ergänzen
- `theme_key` text default `'corporate'` (welches Theme)
- `cta_label` text default `'Jetzt bewerben'`
- `features` jsonb default `'[]'` (Array aus `{title, description, icon?}`)
- bestehende Felder (`hero_title`, `hero_subtitle`, `logo_url`, `primary_color`) bleiben

Keine RLS-Änderung nötig – `tenants_public` View liefert das schon.

## Phase 4 – Public Landing Route

Neue Route `src/routes/l.$domain.tsx`:
- Loader lädt Tenant via `get_public_tenant_by_domain(_domain)`
- Wählt Theme-Komponente aus Registry per `theme_key`
- Rendert mit Tenant-Props
- Eigenes `head()` mit Tenant-spezifischem Title/OG

URL-Schema: `/l/<domain>` (z.B. `/l/acme`). Später optional auf Custom-Domain mappen.

## Phase 5 – Admin-Editor

In `admin.tenants.tsx` pro Tenant ergänzen:
- Theme-Picker (5 Karten mit Screenshot-Preview)
- Textfelder: Hero-Titel, Subtitle, CTA-Label
- Feature-Liste (Add/Remove, je 3–6 Einträge)
- Live-Preview-Button öffnet `/l/<domain>` neuen Tab

## Phase 6 (optional, später)
- Farben/Fonts pro Tenant editierbar (CSS-Variablen)
- Hero-Bild Upload (neuer Bucket `tenant-hero-images`)
- Sections an/aus toggeln

---

## Technische Details

**Theme-Props-Interface (fix):**
```ts
type LandingProps = {
  hero_title: string;
  hero_subtitle: string;
  cta_label: string;
  cta_href: string;        // → /register?tenant=<domain>
  logo_url?: string | null;
  primary_color?: string | null;
  features: { title: string; description: string }[];
}
```

**Theme-Registry:**
```ts
export const THEMES = {
  editorial: { component: EditorialTheme, label: 'Editorial', preview: '/themes/editorial.jpg' },
  brutalist: { component: BrutalistTheme, label: 'Brutalist', preview: '/themes/brutalist.jpg' },
  // ...
} as const;
```

**Cross-Project-Copy:** Sobald ein Theme im Lab freigegeben ist, holen wir die Datei mit `cross_project--copy_project_asset` rüber – keine manuelle Copy-Paste-Arbeit für dich.

---

## Nächster konkreter Schritt für dich

1. **Neues Projekt anlegen** mit dem Namen `landing-themes-lab` (im selben Workspace, sonst kann ich nicht drauf zugreifen).
2. **In dem neuen Projekt** schreibst du genau diesen Prompt:

> Baue ein reines Theme-Labor für Landing Pages. Erstelle 5 Routen unter `/theme/<key>` mit den Keys: `editorial`, `brutalist`, `organic`, `corporate`, `dark-tech`. Jede Route ist eine komplette Landing Page (Header mit Logo, Hero mit Titel+Subtitle+CTA-Button, 3 Feature-Cards, Stats-Sektion, Footer) und verwendet diese Dummy-Daten:
> - hero_title: "Werde Teil unseres Teams"
> - hero_subtitle: "Flexible Arbeitszeiten, faire Bezahlung, echtes Team."
> - cta_label: "Jetzt bewerben"
> - features: [{title:"Flexibel", description:"…"}, {title:"Fair", description:"…"}, {title:"Familiär", description:"…"}]
> - logo_url: ein Platzhalter
>
> Stil pro Theme:
> 1. **editorial**: Serif-Display-Font, viel Whitespace, Magazin-Layout, schwarz/weiß + 1 Akzent
> 2. **brutalist**: harte Kanten, Mono-Font, knallige Akzentfarbe, sichtbare Borders
> 3. **organic**: warme Pastelle, runde Shapes, Blob-Animationen, sanfte Schatten
> 4. **corporate**: Navy/Weiß, klare Cards, Stats-Sektion prominent, vertrauenserweckend
> 5. **dark-tech**: dunkler Hintergrund, Gradient-Akzente, Glow-Buttons, futuristisch
>
> Keine Auth, kein Backend, keine Datenbank. Nur Routen + Komponenten.

3. Sobald die 5 Themes stehen, kommst du zurück und sagst mir welche passen. Ich kopiere sie dann hier rein und baue Editor + öffentliche Route.

Sag Bescheid wenn das Lab-Projekt steht – oder ob du am Plan vorher noch was ändern willst (z.B. anderes Theme statt eins der fünf).
