# 🎣 EinfachFischen.ch

**EinfachFischen** ist eine moderne Web-Plattform für Angelfreunde in der Schweiz. Die Anwendung bietet eine interaktive Karte mit detaillierten Informationen zu über 44 Schweizer Seen, einschließlich Fischereivorschriften, Fischarten und Saison-Empfehlungen.

![Angular](https://img.shields.io/badge/Angular-20.3.5-red?logo=angular)
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

### Automatisches Deployment

Jede Änderung, die auf den `main`-Branch gepusht wird, wird automatisch durch **Netlify** auf die offizielle Website [einfachfischen.ch](https://einfachfischen.ch) ausgerollt. 

Der Deployment-Prozess läuft vollautomatisch:
1. Push auf `main` Branch
2. Netlify erkennt die Änderung
3. Build-Prozess startet automatisch
4. Bei erfolgreichem Build wird die neue Version deployed
5. Website ist innerhalb von Minuten live

## 🏗️ Projekt-Architektur

Das Projekt ist als **Angular Standalone Application** mit **Server-Side Rendering (SSR)** aufgebaut.

### Hauptkomponenten

#### 1. **Home Component** (`src/app/home/`)
- **Zweck**: Landing Page mit Hero-Section und Karten-Integration
- **Features**:
  - Animierter Hero-Bereich mit "Zur Karte"-Button
  - Smooth-Scroll zur Karte
  - Responsive Design für alle Bildschirmgrößen

#### 2. **Map Component** (`src/app/map/`)
- **Zweck**: Interaktive Leaflet-Karte mit 44 Schweizer Seen
- **Features**:
  - Dynamische Marker für jeden See
  - Click-Handling für See-Auswahl
  - Integration mit der Sidebar
  - Responsive Kartengröße (98% Breite, max. 2000px)
  - Custom Marker-Styling mit Hover-Effekten
  - SSR-kompatible Implementierung (Client-only Rendering für Leaflet)

**Daten-Struktur** (Lake Interface):
```typescript
interface Lake {
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
}
```

#### 3. **Sidebar Component** (Teil von Map)
- **Zweck**: Detailansicht für ausgewählten See
- **Features**:
  - Slide-in Animation von rechts
  - Drei Informations-Sektionen:
    - 📊 Allgemeine Informationen (Fläche, Tiefe, Höhe, Kantone)
    - 🎣 Fischereiinformationen (Saison, Patent-Status, Bewilligung)
    - 🐟 Fischarten (als Tags dargestellt)
  - Fixed Position über der Karte
  - Close-Button für bessere UX

#### 4. **About Component** (`src/app/about/`)
- **Zweck**: Team-Vorstellung und Projekt-Informationen
- **Features**:
  - Profil-Karten für Entwickler
  - Responsive Grid-Layout
  - Hover-Effekte und Glassmorphism-Design

#### 5. **Details Component** (`src/app/details/`)
- **Zweck**: Zusätzliche Informationen und Details zum Projekt
- **Features**: TBD (To Be Determined)

### Navigation & Layout

#### Top Navigation Bar (`src/app/app.html`)
- Fixed Header mit Auto-Hide beim Scrollen
- Routen: Home (`/`), Details (`/details`), Über uns (`/about`)
- Gradient-Styling mit Backdrop-Blur-Effekt
- Responsive für Mobile & Desktop

## 🛠️ Technologie-Stack

### Frontend
- **Framework**: Angular 20.3.5 (Standalone Components)
- **Sprache**: TypeScript 5.9
- **Karten-Library**: Leaflet 1.9.4
- **Styling**: CSS3 mit Custom Animations
- **SSR**: Angular Universal (@angular/ssr)

### Build & Deployment
- **Build-Tool**: Angular CLI (esbuild)
- **Hosting**: Netlify
- **CI/CD**: Automatisches Deployment via Netlify (main branch)

### Development Tools
- **Package Manager**: npm
- **Testing**: Jasmine & Karma
- **Linting**: ESLint (implizit durch Angular)

## 📦 Installation & Setup

### Voraussetzungen
- Node.js (v18 oder höher)
- npm (v9 oder höher)

### Installation

```bash
# Repository klonen
git clone https://github.com/WeshKenny/Html_ToDoListe.git
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
│   │   ├── home/              # Landing Page Component
│   │   ├── map/               # Karten-Component mit Sidebar
│   │   ├── about/             # Team-Seite
│   │   ├── details/           # Details-Seite
│   │   ├── app.ts             # Root Component
│   │   ├── app.routes.ts      # Routing-Konfiguration
│   │   └── app.css            # Globale Styles
│   ├── assets/                # Statische Assets (Bilder, Icons)
│   ├── styles.css             # Globale Styles
│   ├── main.ts                # Client-Entry-Point
│   ├── main.server.ts         # Server-Entry-Point (SSR)
│   └── server.ts              # Express Server (SSR)
├── public/                    # Öffentliche Assets
├── angular.json               # Angular Konfiguration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript Konfiguration
└── README.md                  # Projekt-Dokumentation
```

## 🗺️ Verfügbare Seen (Auswahl)

Das Projekt enthält Informationen zu 44 Schweizer Seen, darunter:

- **Große Seen**: Genfersee, Bodensee, Neuenburgersee, Vierwaldstättersee, Zürichsee
- **Patentfreie Seen**: Neuenburgersee, Bielersee, Murtensee
- **Weitere Seen**: Thunersee, Brienzersee, Zugersee, Sempachersee, Hallwilersee, und viele mehr

Jeder See enthält detaillierte Informationen zu:
- Geografischen Daten (Koordinaten, Fläche, Tiefe, Höhe)
- Zugehörigen Kantonen
- Fischarten (z.B. Hecht, Zander, Barsch, Forelle)
- Patent-Anforderungen
- Besten Angelzeiten

## 👥 Team

- **Noe Heimgartner** - Developer / Projektleiter
- **Kadir** - Unterstützung & Testing

## 📄 Lizenz

Dieses Projekt ist privat und nicht für kommerzielle Zwecke bestimmt.

## 🔗 Links

- **Live-Website**: [einfachfischen.ch](https://einfachfischen.ch)
- **Repository**: [GitHub](https://github.com/WeshKenny/Html_ToDoListe)
- **Angular Dokumentation**: [angular.dev](https://angular.dev)
- **Leaflet Dokumentation**: [leafletjs.com](https://leafletjs.com)

---

**Entwickelt mit ❤️ für die Schweizer Angel-Community** 🎣🇨🇭
