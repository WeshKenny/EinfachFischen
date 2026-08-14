# 🎣 EinfachFischen.ch

**EinfachFischen** ist eine moderne Web-Plattform für Angelfreunde in der Schweiz. Die Anwendung bietet eine interaktive Karte mit detaillierten Informationen zu Schweizer Seen, einschließlich Fischereivorschriften, Fischarten und Saison-Empfehlungen.

![Angular](https://img.shields.io/badge/Angular-21.2-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-green?logo=leaflet)
![Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify)

## 🌟 Projektzweck

Das Hauptziel von **EinfachFischen** ist es, Anglern in der Schweiz einen einfachen und schnellen Zugang zu wichtigen Informationen über Schweizer Seen zu bieten:

- 📍 **Standortinformationen**: Interaktive Karte mit allen wichtigen Seen
- 🐟 **Fischarten-Übersicht**: Welche Fische können in welchem See gefangen werden?
- 📋 **Fischereivorschriften**: Patent-Anforderungen und patentfreie Seen
- 📅 **Beste Angelzeiten**: Saisonale Empfehlungen für optimale Fangergebnisse
- 📊 **See-Details**: Fläche, Tiefe, Höhe über Meer und Kantone

## 🚀 Live-Deployment

Die Anwendung ist live unter **[einfachfischen.ch](https://einfachfischen.ch)** erreichbar.

### Branch-Workflow

Änderungen laufen über drei Stufen, bevor sie live gehen:

```
Feature-Branch  →  dev  →  main  →  Netlify Deploy
```

1. **Feature-Branch**: Neue Änderungen werden auf einem eigenen Branch entwickelt und per Pull Request nach `dev` gemergt.
2. **`dev`**: Integrations-Branch. Hier laufen Änderungen mehrerer Features zusammen und werden getestet, bevor sie produktiv gehen.
3. **`main`**: Nur `dev` darf per Pull Request nach `main` mergen — das wird automatisch erzwungen (siehe unten). Ein Push/Merge auf `main` löst das Live-Deployment aus.

### CI/CD-Pipelines (GitHub Actions)

| Workflow | Läuft bei | Zweck |
|---|---|---|
| `github-pipeline.yml` (**Application Build and Test**) | Pull Request → `dev` oder `main` | Installiert Dependencies, baut das Projekt im Production-Modus, führt die Tests aus (Karma/Jasmine, Headless Chrome) |
| `only-dev.yml` (**Branch Policy Enforcement**) | Pull Request → `main` | Blockiert automatisch jeden Merge nach `main`, dessen Quell-Branch nicht `dev` ist |
| `renovate.yml` | Täglich (2 Uhr UTC) + manuell auslösbar | Renovate Bot prüft auf veraltete Dependencies und öffnet einen gebündelten Pull Request gegen `dev` |

### Automatisches Deployment

Jede Änderung, die auf den `main`-Branch gemergt wird, wird automatisch durch **Netlify** auf die offizielle Website [einfachfischen.ch](https://einfachfischen.ch) ausgerollt:

1. Merge von `dev` nach `main` (nur via PR, Branch Policy erzwingt das)
2. Netlify erkennt die Änderung
3. Build-Prozess startet automatisch
4. Bei erfolgreichem Build wird die neue Version deployed
5. Website ist innerhalb von Minuten live

## 🏗️ Projekt-Architektur

Das Projekt ist als **Angular Standalone Application** mit **Server-Side Rendering (SSR)** aufgebaut.

### Seiten & Routing

| Route | Komponente | Zweck |
|---|---|---|
| `/` | Home (`src/app/home/`) | Landingpage mit Hero-Bereich und eingebetteter Karte (lazy geladen via `@defer`) |
| `/seen` | Lakes (`src/app/lakes/`) | Listenansicht aller Seen |
| `/lake/:id` | LakeDetail (`src/app/lake-detail/`) | Detailseite eines Sees: Wetter, Bewilligungen, Regulierungen, Bildergalerie, Report-Issue-Modal |
| `/about` | About (`src/app/about/`) | Team-Vorstellung |
| `/contact` | Contact (`src/app/contact/`) | Kontaktformular |

Die interaktive Leaflet-Karte (`src/app/map/`) läuft eingebettet auf der Startseite, mit Marker-Clustering, Filtern nach Fischart/Kanton/freiem Fischen und einer Detail-Sidebar. Da Leaflet nicht SSR-kompatibel ist, wird die Karte nur client-seitig gerendert.

> **Hinweis**: `src/app/details/` existiert im Code, ist aber in `app.routes.ts` nicht verlinkt und wird von keiner anderen Komponente importiert — aktuell toter Code.

**Daten-Struktur** (Lake Interface, `src/app/services/lake.service.ts`):
```typescript
interface Lake {
  id?: string;
  name: string;
  coords: [number, number];
  area: string;
  maxDepth: string;
  elevation: string;
  cantons: string;
  fishSpecies: string[];
  freeFishing: boolean;
  bestSeason: string;
  permitRequired: string;
  permitPrices?: { daily?, weekly?, monthly?, annual?, youth?, link? };
  regulations?: { closedSeasons?, minSizes?, bagLimit?, additionalRules? };
}
```

### Services (`src/app/services/`)

| Service | Zweck |
|---|---|
| `LakeService` | Seedaten aus `lakes.json`, Filter- und Suchlogik |
| `UiPreferencesService` | Sprache & Theme (hell/dunkel), persistiert in `localStorage` |
| `WeatherService` | Wetterdaten via Open-Meteo API (kein API-Key, 30-Minuten-Cache) |
| `SeoService` | Meta-Tags & strukturierte Daten pro Seite |

### Mehrsprachigkeit & Theme

Die Seite ist auf **Deutsch, Französisch, Italienisch und Englisch** verfügbar (`src/app/i18n-data.ts`) und unterstützt einen hell/dunkel Theme-Toggle, beides umgesetzt über Signals ohne zusätzliches State-Management (kein NgRx/Redux).

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: Angular 21 (Standalone Components, Signals)
- **Sprache**: TypeScript 5.9, strict mode
- **Karten-Library**: Leaflet 1.9.4 + MarkerCluster
- **Styling**: CSS mit Custom Properties (kein Tailwind/Bootstrap)
- **SSR**: Angular SSR mit Express 5

### Build & Deployment
- **Build-Tool**: Angular CLI (esbuild)
- **Hosting**: Netlify (Auto-Deploy von `main`, siehe [Branch-Workflow](#branch-workflow))
- **CI/CD**: GitHub Actions (Build+Test, Branch Policy Enforcement) + Renovate für Dependency-Updates
- **Dependency-Budget**: 500KB initial, 1MB max (siehe `angular.json`)

### Development Tools
- **Package Manager**: npm
- **Testing**: Jasmine & Karma
- **Linting**: ESLint (implizit durch Angular)

## 📦 Installation & Setup

### Voraussetzungen
- Node.js (v20.19+, v22.12+ oder v24+ — siehe `@angular/cli` Engines-Anforderung)
- npm (v9 oder höher)

### Installation

```bash
# Repository klonen
git clone https://github.com/WeshKenny/EinfachFischen.git
cd EinfachFischen

# Dependencies installieren
npm install

# Development Server starten
npm start
# oder
ng serve
```

Die Anwendung läuft dann auf `http://localhost:4200/`

### Build für Production

```bash
# Production Build erstellen
npm run build

# SSR Server starten (Production)
npm run serve:ssr:my-app
```

## 📁 Projekt-Struktur

```
EinfachFischen/
├── src/
│   ├── app/
│   │   ├── home/               # Landingpage mit eingebetteter Karte
│   │   ├── map/                # Leaflet-Karte mit Sidebar
│   │   ├── lakes/               # Listenansicht aller Seen
│   │   ├── lake-detail/         # Detailseite eines Sees
│   │   ├── about/               # Team-Seite
│   │   ├── contact/             # Kontaktformular
│   │   ├── report-issue/        # Bug-Report-Modal
│   │   ├── services/            # LakeService, WeatherService, UiPreferencesService, SeoService
│   │   ├── app.ts               # Root Component
│   │   ├── app.routes.ts        # Routing-Konfiguration
│   │   └── i18n-data.ts         # Übersetzungen (DE, FR, IT, EN)
│   ├── assets/
│   │   └── data/lakes.json     # Seedatenbank
│   ├── styles.css               # Globale Styles
│   ├── main.ts                  # Client-Entry-Point
│   ├── main.server.ts           # Server-Entry-Point (SSR)
│   └── server.ts                # Express Server (SSR)
├── public/                      # Öffentliche Assets
├── .github/workflows/           # CI/CD-Pipelines
├── angular.json                 # Angular Konfiguration
├── package.json                 # Dependencies
├── renovate.json                # Renovate-Konfiguration
├── tsconfig.json                # TypeScript Konfiguration
└── README.md                    # Projekt-Dokumentation
```

## 🗺️ Verfügbare Seen

Das Projekt enthält eine wachsende Datenbank Schweizer Seen und Gewässer, darunter:

- **Grosse Seen**: Genfersee, Bodensee, Neuenburgersee, Vierwaldstättersee, Zürichsee
- **Patentfreie Seen**: Neuenburgersee, Bielersee, Murtensee
- **Alpine Stauseen & Bergseen**: Lac des Dix, Lac de Mauvoisin, Muttsee, Göscheneralpsee, und viele mehr

Jeder See enthält (soweit verfügbar) detaillierte Informationen zu:
- Geografischen Daten (Koordinaten, Fläche, Tiefe, Höhe)
- Zugehörigen Kantonen
- Fischarten
- Patent-Anforderungen & Preisen
- Besten Angelzeiten & Regulierungen

Alle Daten werden pro See gegen mindestens eine offizielle Quelle (Kantons-Fischereiamt, Wikipedia für Geodaten) geprüft, bevor sie aufgenommen werden — unbestätigte Angaben werden bewusst weggelassen statt geraten.

## 👥 Team

### Entwickler & Konzept

- **Noe Heimgartner** - Lead Developer & Projektleiter
  - Verantwortlich für die technische Umsetzung der Plattform
  - Entwicklung der interaktiven Karte mit Leaflet.js
  - Strukturierung der See-Daten und Datenbankdesign
  - Design und Programmierung der Benutzeroberfläche
  - Einsatz moderner Technologien wie Angular und TypeScript

- **Kadir Dikbas** - Konzept, Dokumentation & Fischereiinformationen
  - Kreative Ideen und Projektkonzeption
  - Bereitstellung von Fachwissen über Schweizer Seen und Fischarten
  - Recherche und Zusammenstellung der Fischereiinformationen
  - Projektdokumentation und Content-Aufbereitung
  - Qualitätssicherung der fachlichen Inhalte

## 📄 Lizenz

Dieses Projekt ist privat und nicht für kommerzielle Zwecke bestimmt.

## 🔗 Links

- **Live-Website**: [einfachfischen.ch](https://einfachfischen.ch)
- **Repository**: [GitHub](https://github.com/WeshKenny/EinfachFischen)
- **Angular Dokumentation**: [angular.dev](https://angular.dev)
- **Leaflet Dokumentation**: [leafletjs.com](https://leafletjs.com)

---

**Entwickelt mit ❤️ für die Schweizer Angel-Community** 🎣🇨🇭
