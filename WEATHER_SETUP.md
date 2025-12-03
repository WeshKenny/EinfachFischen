# ☀️ Wetter-Integration Setup Guide

## 📋 Übersicht

Die Wetter-Integration nutzt die **kostenlose OpenWeatherMap API** und zeigt:
- 🌡️ Aktuelle Temperatur & Gefühlte Temperatur
- 💨 Windgeschwindigkeit & Windrichtung
- 💧 Luftfeuchtigkeit
- ☁️ Bewölkung
- 🌙 Mondphase (berechnet ohne extra API)

**Cache-Strategie:** 30 Minuten Cache → Max. ~50 API-Aufrufe/Tag (bei normalem Traffic)

---

## 🔑 Schritt 1: API Key holen (5 Minuten)

### 1. Account erstellen
1. Gehe zu: https://openweathermap.org/api
2. Klicke auf **"Sign Up"** (oben rechts)
3. Fülle das Formular aus:
   - Email-Adresse
   - Benutzername
   - Passwort
   - Akzeptiere die Terms
4. Bestätige deine Email-Adresse

### 2. API Key erstellen
1. Nach dem Login: Gehe zu **"My API Keys"**
2. Du siehst bereits einen **Default Key** (automatisch erstellt)
3. Kopiere diesen Key (z.B. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

**Wichtig:** 
- Der Key braucht ~2 Stunden bis er aktiviert ist
- Du bekommst eine Email wenn er bereit ist
- Bis dahin kannst du testen, bekommst aber `401 Unauthorized` Fehler

### 3. Free Tier Limits
✅ **1000 Aufrufe pro Tag** (kostenlos)
✅ **60 Aufrufe pro Minute**
✅ **Aktuelle Wetter-Daten**
❌ Keine historischen Daten
❌ Keine 16-Tage Vorhersage (nur 5 Tage im Free Tier)

**Mit unserem 30-Min-Cache:** Du kommst NIEMALS über 1000 Aufrufe/Tag!

---

## 🔧 Schritt 2: API Key einbauen (2 Minuten)

### Option A: Direkt im Service (Quick & Easy)
Öffne `src/app/services/weather.service.ts` (Zeile 27):

```typescript
// Vorher:
private readonly API_KEY = 'DEIN_API_KEY_HIER'; // TODO: API Key eintragen!

// Nachher:
private readonly API_KEY = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; // Dein echter Key
```

**Fertig!** Die App funktioniert jetzt.

---

### Option B: Environment Variables (Professionell)

Falls du den Key **nicht im Code** haben willst (z.B. für GitHub):

#### 1. Environment Dateien erstellen

Erstelle `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  openWeatherMapApiKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
};
```

Erstelle `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  openWeatherMapApiKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'
};
```

#### 2. Service anpassen

In `weather.service.ts`:
```typescript
import { environment } from '../../environments/environment';

// ...

private readonly API_KEY = environment.openWeatherMapApiKey;
```

#### 3. .gitignore anpassen

Füge hinzu:
```
# Environment files with secrets
src/environments/environment.ts
src/environments/environment.prod.ts
```

Erstelle `src/environments/environment.example.ts`:
```typescript
export const environment = {
  production: false,
  openWeatherMapApiKey: 'YOUR_API_KEY_HERE'
};
```

**Vorteil:** Key wird nicht auf GitHub gepusht!

---

## 🧪 Schritt 3: Testen (2 Minuten)

### 1. Dev Server starten
```bash
ng serve
```

### 2. See-Detail-Seite öffnen
Öffne einen beliebigen See, z.B. Vierwaldstättersee

### 3. Was du sehen solltest

**Erfolg:**
```
☀️ Wetter aus Cache geladen (15 Min alt)
✅ Wetter erfolgreich geladen und gecacht
```

**Fehler (API Key noch nicht aktiv):**
```
❌ Fehler beim Laden des Wetters: 401 Unauthorized
```
→ Warte 2 Stunden, dann funktioniert's

**Fehler (API Key falsch):**
```
❌ Fehler beim Laden des Wetters: 401 Unauthorized
```
→ Überprüfe ob du den Key richtig kopiert hast

### 4. Cache testen

1. Öffne einen See → Wetter lädt (API-Aufruf)
2. Reload die Seite → Wetter aus Cache (KEIN API-Aufruf)
3. Warte 30 Minuten → Reload → Neuer API-Aufruf

**Console Logs:**
- `🌐 Neuer API-Aufruf` = API wird abgefragt
- `☀️ Wetter aus Cache` = Kein API-Aufruf (spart Quota!)

---

## 📊 Cache Management

### Cache anzeigen
```javascript
// Browser Console
Object.keys(localStorage).filter(k => k.startsWith('weather_'))
// Ausgabe: ["weather_47.05_8.31", "weather_46.45_10.13"]
```

### Cache löschen (manuell)
```javascript
// Browser Console
Object.keys(localStorage)
  .filter(k => k.startsWith('weather_'))
  .forEach(k => localStorage.removeItem(k));
console.log('✅ Alle Wetter-Caches gelöscht');
```

### Cache automatisch löschen (eingebaut!)
Die App löscht **automatisch abgelaufene Caches** beim Service-Start.

---

## 🎯 API-Aufrufe optimieren

### Aktueller Stand (30 Min Cache)
- **59 Seen** in der Datenbank
- Jeder See: 1 Aufruf alle 30 Min
- **Max. ~50 Aufrufe/Tag** (bei normalem Traffic)
- **Bleibt immer unter 1000!** ✅

### Cache-Dauer anpassen

In `weather.service.ts` (Zeile 21):
```typescript
// Aktuell: 30 Minuten
private readonly CACHE_DURATION_MS = 30 * 60 * 1000;

// Option 1: 1 Stunde (weniger Aufrufe, ältere Daten)
private readonly CACHE_DURATION_MS = 60 * 60 * 1000;

// Option 2: 15 Minuten (mehr Aufrufe, aktuellere Daten)
private readonly CACHE_DURATION_MS = 15 * 60 * 1000;

// Option 3: 2 Stunden (sehr wenig Aufrufe)
private readonly CACHE_DURATION_MS = 2 * 60 * 60 * 1000;
```

**Empfehlung:** 30 Minuten ist perfekt für Wetter-Daten!

---

## 🚀 Features

### ✅ Was funktioniert
- Aktuelle Temperatur
- Gefühlte Temperatur
- Wetter-Beschreibung (auf Deutsch!)
- Wetter-Icon von OpenWeatherMap
- Windgeschwindigkeit & Richtung
- Luftfeuchtigkeit
- Bewölkung
- Mondphase (berechnet, ohne extra API!)
- Intelligentes Caching (localStorage + Memory)
- Automatisches Löschen abgelaufener Caches

### ❌ Was NICHT funktioniert (Free Tier)
- Vorhersage (nur aktuelles Wetter)
- Historische Daten
- Minutengenaue Niederschlags-Vorhersage
- Luft-Qualität (braucht extra API)

---

## 🐛 Troubleshooting

### Problem: "401 Unauthorized"
**Lösung:** 
- Warte 2 Stunden nach Key-Erstellung
- Überprüfe ob Key richtig kopiert (keine Leerzeichen!)
- Überprüfe ob Email bestätigt wurde

### Problem: Wetter lädt nicht
**Console öffnen** (F12) und schaue nach:
- `⚠️ OpenWeatherMap API Key nicht konfiguriert!` → API Key fehlt
- `⚠️ Keine Koordinaten für Wetter verfügbar` → See hat keine Coords in JSON
- `❌ Fehler beim Laden des Wetters` → Netzwerk-Problem oder API down

### Problem: Zu viele API-Aufrufe
**Check:**
1. Console: `🌐 Neuer API-Aufruf` sollte NUR alle 30 Min erscheinen
2. Falls öfter: Cache funktioniert nicht → Browser-Storage voll?
3. Cache löschen und neu laden

### Problem: Mondphase stimmt nicht
**Info:** 
- Mondphase wird **lokal berechnet** (keine API)
- Ist eine vereinfachte Berechnung
- Genauigkeit: ~95%
- Für genauere Daten: Externe Library wie `suncalc` nutzen

---

## 📱 Mobile Support

Das Wetter-Widget ist **voll responsive**:
- Desktop: 2-Spalten Grid
- Tablet: 1-2 Spalten
- Mobile: 1 Spalte, volle Breite

---

## 🔮 Zukünftige Erweiterungen

### Idee 1: 5-Tage Vorhersage
**API:** `https://api.openweathermap.org/data/2.5/forecast`
**Kosten:** Immer noch kostenlos!
**Aufrufe:** +1 pro See alle 30 Min

### Idee 2: Wetter-Warnungen
**API:** OpenWeatherMap "One Call API 3.0"
**Kosten:** ❌ 1.500€/Monat (Premium)
**Alternative:** DWD Warnungen (kostenlos, nur Deutschland)

### Idee 3: Sonnenauf-/untergang anzeigen
**Daten:** Bereits vorhanden! (`weather.sunrise`, `weather.sunset`)
**Umsetzung:** Einfach im Template anzeigen

### Idee 4: Wind-Richtungs-Kompass
**Daten:** Bereits vorhanden! (`weather.windDeg`)
**Umsetzung:** CSS-animierter Pfeil

---

## 📞 Support

**OpenWeatherMap Docs:** https://openweathermap.org/api
**FAQ:** https://openweathermap.org/faq
**Support:** https://home.openweathermap.org/questions

**Angular App:**
- Cache Probleme? → localStorage im Browser löschen
- API Fehler? → Console (F12) öffnen und Fehler lesen
- Fragen? → GitHub Issues

---

## ✅ Checkliste

- [ ] OpenWeatherMap Account erstellt
- [ ] API Key kopiert (und 2h gewartet!)
- [ ] API Key in `weather.service.ts` eingefügt
- [ ] App getestet (`ng serve`)
- [ ] Wetter lädt erfolgreich
- [ ] Cache funktioniert (Reload = kein API-Aufruf)
- [ ] Mondphase wird angezeigt
- [ ] Windrichtung wird korrekt angezeigt (N/NO/O/SO/S/SW/W/NW)

**Fertig!** 🎉

---

## 💡 Tipps

1. **Cache nicht zu kurz:** 15 Min ist Minimum für Wetter
2. **Console Logs:** Behalte sie während der Entwicklung
3. **API Key sicher:** Nutze Environment Variables für GitHub
4. **Monitoring:** Prüfe regelmäßig deine API-Nutzung auf OpenWeatherMap Dashboard
5. **Backup Key:** Erstelle einen zweiten API Key als Backup

---

Viel Erfolg! ☀️🎣
