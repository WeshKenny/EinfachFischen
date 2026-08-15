# 🌤️ Wetter-API

## Was wird benutzt

**[Open-Meteo](https://open-meteo.com/)** (`src/app/services/weather.service.ts`) — komplett kostenlos, unbegrenzte Aufrufe, kein API-Key nötig. Es gibt keine kostenpflichtige Stufe, die man versehentlich erreichen könnte.

> Frühere Version des Projekts nutzte OpenWeatherMap (kostenpflichtig ab 1000 Aufrufen/Tag) — das ist inzwischen komplett durch Open-Meteo ersetzt.

## Caching (trotzdem sinnvoll, auch ohne Kostenrisiko)

- **30-Minuten-Cache** pro See, im `localStorage` (übersteht Reload, geteilt zwischen Tabs) + In-Memory-Cache für die aktuelle Session
- **Koordinaten werden auf 2 Nachkommastellen gerundet** als Cache-Key, damit minimal unterschiedliche Koordinaten denselben Cache-Eintrag nutzen
- `clearExpiredCache()` räumt abgelaufene Einträge automatisch auf

## Wichtig: nur clientseitig

Der Wetter-Abruf läuft bewusst **nur im Browser**, nicht beim Server-Rendering/Prerendering (siehe `isPlatformBrowser`-Check in `lake-detail.ts`). So bleiben die vorgerenderten Seiten unabhängig von Open-Meteo, und jeder Abruf läuft über die IP/den Browser des jeweiligen Besuchers statt zentral über den Server.
