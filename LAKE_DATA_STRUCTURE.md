# 📋 Erweiterte JSON-Struktur für Seen-Daten

## Neue Struktur (lakes.json)

```json
{
  "name": "Vierwaldstättersee",
  "area": "113.72 km²",
  "maxDepth": "214 m",
  "elevation": "434 m",
  "cantons": "Luzern, Uri, Schwyz, Nidwalden, Obwalden",
  "bestSeason": "April - Oktober",
  "coords": [46.9833, 8.4000],
  "id": "vierwaldstaettersee",
  "freeFishing": false,
  
  "fishSpecies": [
    "Forelle", "Hecht", "Zander", "Barsch", "Felchen", "Egli"
  ],
  
  "permits": {
    "required": true,
    "types": [
      {
        "name": "SaNa Basis-Patent",
        "scope": "Schweizweit (Voraussetzung)",
        "price": "CHF 20.00 (einmalig)",
        "link": "https://www.sana.ch/",
        "mandatory": true
      },
      {
        "name": "Kanton Luzern Patent",
        "scope": "Luzerner Gewässer",
        "prices": {
          "daily": "CHF 15.00",
          "weekly": "CHF 40.00",
          "annual": "CHF 150.00",
          "youth": "CHF 50.00"
        },
        "link": "https://www.lawa.lu.ch/themen/fischerei",
        "validIn": ["LU"]
      },
      {
        "name": "Kanton Uri Patent",
        "scope": "Urner Gewässer",
        "prices": {
          "annual": "CHF 180.00"
        },
        "link": "https://www.ur.ch/fischerei",
        "validIn": ["UR"]
      }
    ],
    "notes": [
      "Je nach Angelort benötigen Sie das entsprechende Kantons-Patent",
      "Am besten kaufen Sie das Patent des Kantons, wo Sie am häufigsten fischen"
    ]
  },
  
  "regulations": {
    "closedSeasons": {
      "Forelle": "1. Oktober - 28. Februar",
      "Hecht": "1. Februar - 30. April",
      "Zander": "1. Januar - 30. April"
    },
    "minSizes": {
      "Forelle": "24 cm",
      "Hecht": "50 cm",
      "Zander": "42 cm",
      "Felchen": "28 cm"
    },
    "bagLimit": "Max. 5 Fische pro Tag (nur 1 Hecht)",
    "specialZones": [
      {
        "name": "Schutzzone Ufenau (Zürichsee)",
        "type": "forbidden",
        "description": "Fischen ganzjährig verboten",
        "duration": "Ganzjährig"
      },
      {
        "name": "Laichgebiete Reuss-Mündung",
        "type": "seasonal",
        "description": "Fischen verboten während Laichzeit",
        "duration": "1. März - 30. Mai"
      }
    ],
    "additionalRules": [
      "Nachtangeln nur mit Sonderbewilligung",
      "Schonhaken (Widerhaken) nur für Raubfische erlaubt",
      "Boot-Angeln nur mit Tagesbewilligung"
    ],
    "lastUpdated": "2025-11-20"
  },
  
  "accessibility": {
    "publicAccess": true,
    "parking": "Vorhanden (Parkplätze Luzern, Brunnen, Weggis)",
    "difficulty": "Einfach - Mittel",
    "facilities": ["WC", "Restaurant", "Bootsverleih"]
  },
  
  "images": [
    "https://example.com/vierwaldstaettersee1.jpg",
    "https://example.com/vierwaldstaettersee2.jpg"
  ],
  
  "meta": {
    "verified": true,
    "verifiedDate": "2025-11-20",
    "dataSource": "Offizielle Kantons-Websites",
    "contributors": ["admin"]
  }
}
```

---

## Was ist NEU?

### ✅ **Bessere Patent-Struktur**
```json
"permits": {
  "types": [
    {
      "name": "SaNa Basis-Patent",
      "mandatory": true,
      "price": "CHF 20.00"
    }
  ]
}
```
- Mehrere Patente pro See (z.B. für jeden Kanton)
- `validIn`: Zeigt in welchen Kantonen es gilt
- `notes`: Zusätzliche Infos

### ✅ **Spezielle Zonen**
```json
"specialZones": [
  {
    "name": "Schutzzone Ufenau",
    "type": "forbidden",
    "description": "Fischen verboten"
  }
]
```

### ✅ **Meta-Daten**
```json
"meta": {
  "verified": true,
  "verifiedDate": "2025-11-20",
  "dataSource": "Kantons-Website"
}
```
- Nachvollziehbarkeit
- Qualitätssicherung

---

## Migration (Optional)

Du kannst deine bestehenden Daten **schrittweise** migrieren:

1. **Jetzt:** Behalte die alte Struktur für die meisten Seen
2. **Später:** Erweitere wichtige Seen (Top 10) mit neuer Struktur
3. **TypeScript unterstützt BEIDE** Strukturen gleichzeitig

Beispiel Interface:
```typescript
interface Lake {
  name: string;
  // Alte Struktur (optional)
  permitRequired?: string;
  permitPrices?: {
    daily?: string;
    annual?: string;
  };
  // Neue Struktur (optional)
  permits?: {
    types: PatentType[];
    notes?: string[];
  };
}
```

So funktionieren alte UND neue Seen parallel! 🎉
