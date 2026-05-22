# Plan

## 1. Standard-Aufträge als geordnete Liste

**Datenbank (Migration):**
- Neue Tabelle `tenant_default_tasks (id, tenant_id, task_template_id, sort_order)` mit Unique (tenant_id, sort_order).
- RLS: Admins manage, Authenticated read.
- Alte Spalte `tenants.default_task_template_id` bleibt vorerst stehen (Migration-Sicherheit), wird aber nicht mehr genutzt — Default beim Anlegen automatisch in neue Tabelle migriert.

**Logik:**
- Beim Buchen wird gezählt, wie viele bestätigte Buchungen der Mitarbeiter bereits hat (n). Wenn `n < default_count`, wird automatisch der `n+1`-te Standard-Auftrag zugewiesen. Ab der `(n+1)`-ten Buchung läuft individuelle Zuweisung (admin).
- Update der bestehenden Booking-Logik (Auto-Assignment-Trigger oder Server-Fn — Stelle finde ich in `src/lib/` / Booking-Handler).

**UI:**
- Domain-Dialog: Block „Standard-Auftrag nach Aktivierung" **entfernen**.
- Neuer Tab/Karte in Admin-Einstellungen: Auflistung pro Domain, Drag-and-Drop-Reihenfolge, „Auftrag hinzufügen"-Selector. Klare Anzeige „Buchung #1 → Auftrag X, Buchung #2 → Auftrag Y, …".

## 2. Admin-Einstellungen als zentrale Hub-Seite

Neue Struktur `/admin/settings` mit Tabs (oder Karten-Grid → Detail-Seiten):

| Tab | Inhalt | Quelle |
|---|---|---|
| Allgemein | Passwort, Erscheinungsbild | bestehend |
| Domains | Tenant-Verwaltung | aus `/admin/tenants` |
| Standard-Aufträge | Neue UI (siehe oben) | neu |
| Teamleiter | Profil, Avatar, Online-Status | aus `/admin/team-leader-settings` |
| KI-Assistent | An/Aus, System-Prompt, FAQ, Modell | aus `/admin/ai-settings` |
| E-Mail-Vorlagen | Welcome / Reset / Signatur | aus `/admin/email-templates` |
| Buchungslimits | min Pause, Tageslimit | bestehend BookingLimitsCard |

Sidebar-Einträge `Domains`, `Teamleiter`, `KI-Einstellungen`, `E-Mail-Vorlagen` werden **aus der Sidebar entfernt** (Routes bleiben für Direkt-Links bestehen, leiten aber auf `/admin/settings?tab=…` weiter).

**Admin-Sidebar danach (operativ):** Übersicht, Bewerbungen, Mitarbeiter, Aufträge, Termine, Verträge, Chat, SMS, E-Mail-Logs, Aktivität, Post-Ident, KYC, Reviews, Revisionen, Transaktionen, **Einstellungen** (unten).

## 3. Sidebar-Redesign (Admin + Mitarbeiter)

Style angelehnt an Screenshot 3, aber **theme-abhängig**:
- Light Mode: weißer Hintergrund, dezente Borders.
- Dark Mode: dunkler Hintergrund (`bg-slate-900`/`#0f172a`).
- Logo/Branding-Avatar oben links mit Firmenname.
- Aktive Route: **blauer Active-State** (`bg-blue-600` Hintergrund, weißer Text, `rounded-lg`, leichter Glow). Hover: subtiler `bg-muted/50`.
- Konsistente Icons (Lucide), gleicher Abstand, klare Trennung Gruppen.
- Collapse-Button unten („Einklappen").
- Mitarbeiter-Sidebar: identisches System, gleiche Tokens.

## 4. Mitarbeiter-Dashboard

- Chat-Block (Teamleiter-Nachrichten + Eingabefeld) komplett aus `/dashboard` entfernen. Chat ist über `Mitteilungen` und Floating-Chat-Button weiterhin erreichbar.

## 5. Aufräumen

- Aus `admin.settings.tsx` die jetzt redundanten „Shortcut-Karten" (Standard-Auftrag → Domains, KI → AI-Settings) entfernen, da nun integriert.
- Doppelte Funktionen vermeiden: Domain-Dialog enthält keinen Standard-Auftrag mehr.

## Technische Details

- Migration: `tenant_default_tasks` + RLS + Backfill aus `tenants.default_task_template_id`.
- Booking-Auto-Assign: bestehende Stelle suchen (`task_assignments` Insert nach Booking) und auf neue Tabelle umstellen — Index `n = count(task_assignments where user_id=…)`.
- Sidebar-Komponenten: `AdminLayout.tsx` + `EmployeeLayout.tsx` refactor; Tokens in `src/styles.css` ergänzen (`--sidebar-active`, `--sidebar-active-foreground`).
- Drag-and-Drop: `@dnd-kit/sortable` (bereits installiert? sonst hinzufügen).
- Tabs: bestehende shadcn `Tabs`-Komponente.

## Reihenfolge der Umsetzung

1. Migration `tenant_default_tasks` (eigene Anfrage zur Bestätigung).
2. Backend-Logik (Auto-Assign) aktualisieren.
3. Admin-Einstellungen-Hub mit Tabs bauen, alte Routen umleiten.
4. Standard-Aufträge UI im Tab.
5. Domain-Dialog säubern.
6. Sidebar Admin + Mitarbeiter neu stylen.
7. Chat-Block aus Mitarbeiter-Dashboard entfernen.
