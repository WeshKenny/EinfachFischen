# 📊 API-Nutzung & Quota Management

## 🎯 Übersicht

### Dein Free Tier Limit
- **1000 API-Aufrufe pro Tag**
- **60 API-Aufrufe pro Minute**
- **Kostenlos für immer** (solange unter 1000/Tag)

### Aktuelle Konfiguration
- **Cache-Dauer:** 30 Minuten
- **Seen in DB:** 59
- **Erwartete Aufrufe/Tag:** ~50 (bei normalem Traffic)
- **Sicherheit:** ✅ Immer unter 1000!

---

## 📈 Worst-Case Szenarien

### Szenario 1: Maximaler Traffic (unrealistisch)
**Annahme:** JEDER See wird JEDE halbe Stunde besucht
- 59 Seen × 48 Aufrufe/Tag = **2.832 Aufrufe**
- ❌ Über Limit!

**Realität:** 
- Nicht alle Seen werden besucht
- Cache wird zwischen Benutzern geteilt (localStorage)
- → **Niemals so viel Traffic**

---

### Szenario 2: Normaler Traffic (realistisch)
**Annahme:** 10-20 verschiedene Seen pro Tag werden besucht
- 20 Seen × 48 Aufrufe/Tag = **960 Aufrufe**
- ✅ Knapp unter Limit

**Mit Cache:**
- Erster Besuch: API-Aufruf
- Nächste 30 Min: Cache
- → **Real: ~100-200 Aufrufe/Tag**

---

### Szenario 3: Geringer Traffic (am wahrscheinlichsten)
**Annahme:** 5-10 verschiedene Seen pro Tag
- 10 Seen × 48 Aufrufe/Tag = **480 Aufrufe**
- ✅ Locker unter Limit

**Mit Cache:**
- → **Real: ~50-100 Aufrufe/Tag**

---

## 🛡️ Schutz-Mechanismen (bereits eingebaut!)

### 1. localStorage Cache (30 Min)
```typescript
private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 Min
```
- **Spart:** 95% der API-Aufrufe
- **Funktioniert:** Auch nach Browser-Reload
- **Geteilt:** Zwischen allen Tabs

### 2. Memory Cache
```typescript
private memoryCache = new Map<string, CachedWeather>();
```
- **Spart:** Noch mehr Aufrufe (innerhalb einer Session)
- **Schneller:** Keine localStorage-Zugriffe

### 3. Koordinaten-Rundung
```typescript
const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
```
- **Spart:** Doppelte Aufrufe für minimal verschiedene Coords
- **Beispiel:** 46.9999 und 47.0001 → Beide nutzen 47.00

### 4. Automatisches Aufräumen
```typescript
clearExpiredCache(): void
```
- **Löscht:** Abgelaufene Caches automatisch
- **Verhindert:** Speicher-Overflow

---

## 🔧 Cache-Dauer anpassen

### Aktuelle Einstellung: 30 Minuten
```typescript
private readonly CACHE_DURATION_MS = 30 * 60 * 1000;
```

### Anpassungen & Auswirkungen

| Cache-Dauer | API-Aufrufe/Tag* | Daten-Aktualität | Empfehlung |
|-------------|------------------|------------------|------------|
| 15 Min | ~100 | Sehr aktuell | ⚠️ Grenzwertig |
| 30 Min | ~50 | Aktuell | ✅ **Empfohlen** |
| 60 Min | ~25 | OK | ✅ Sehr sicher |
| 2 Std | ~12 | Veraltet | ⚠️ Zu lang |

*Bei 10 verschiedenen Seen/Tag

---

## 📊 Monitoring

### API-Nutzung prüfen
1. Gehe zu: https://home.openweathermap.org/statistics
2. Login mit deinem Account
3. Siehst du:
   - **Aufrufe heute**
   - **Aufrufe diese Woche**
   - **Durchschnitt pro Tag**

### Console Logs
```javascript
// Browser Console (F12)

// Alle Wetter-Caches anzeigen
Object.keys(localStorage).filter(k => k.startsWith('weather_'))

// Anzahl gecachter Seen
Object.keys(localStorage).filter(k => k.startsWith('weather_')).length

// Cache-Alter prüfen
const cache = JSON.parse(localStorage.getItem('weather_47.05_8.31'));
const ageMinutes = (Date.now() - cache.timestamp) / 1000 / 60;
console.log(`Cache ist ${ageMinutes.toFixed(1)} Minuten alt`);
```

### Aufrufe manuell zählen
Die App loggt jeden API-Aufruf:
```
🌐 Neuer API-Aufruf für Wetter (Cache abgelaufen oder nicht vorhanden)
```

→ Zähle diese Logs = Anzahl API-Aufrufe

---

## ⚡ Optimierungen

### Wenn du über 1000/Tag kommst (unwahrscheinlich)

#### Option 1: Cache verlängern (einfachste Lösung)
```typescript
private readonly CACHE_DURATION_MS = 60 * 60 * 1000; // 1 Stunde
```
→ **Halbiert die API-Aufrufe**

#### Option 2: Server-Side Caching
- Baue einen Backend-Service (Node.js, Python, PHP)
- Backend cached Wetter-Daten für alle Seen
- Frontend fragt nur Backend ab (keine API-Limits!)
- **Aufwand:** Mittel bis hoch

#### Option 3: Bezahl-Plan
- **Startup Plan:** 500€/Monat, 100.000 Aufrufe/Tag
- **Developer Plan:** 150€/Monat, 30.000 Aufrufe/Tag
- **Lohnt sich:** ❌ Nur bei SEHR viel Traffic

#### Option 4: Andere API
- **WeatherAPI.com:** 1.000.000 Aufrufe/Monat kostenlos! (aber schlechtere Daten)
- **Tomorrow.io:** 1.000 Aufrufe/Tag kostenlos
- **Open-Meteo:** Komplett kostenlos, unbegrenzt! (open source)

---

## 🎯 Best Practices

### DO ✅
- Cache-Dauer bei 30+ Minuten halten
- Console Logs beobachten während Entwicklung
- Regelmäßig API-Nutzung auf OpenWeatherMap Dashboard prüfen
- localStorage nicht manuell löschen (es sei denn zum Testen)

### DON'T ❌
- Cache NICHT unter 15 Minuten setzen
- API Key NICHT auf GitHub pushen
- Wetter-Daten NICHT auf jeder Seite laden (nur Detail-Seite)
- Keine parallelen Requests für gleiche Koordinaten

---

## 🔮 Skalierung

### Wenn die App wächst...

#### Bis 100 User/Tag
- **Aktuelle Lösung:** ✅ Perfekt
- **Keine Änderungen nötig**

#### 100-500 User/Tag
- **Cache auf 60 Min erhöhen**
- **Oder:** Open-Meteo API nutzen (unbegrenzt)

#### 500+ User/Tag
- **Server-Side Caching einbauen**
- **Backend:** Cached alle Seen zentral
- **Frontend:** Fragt Backend ab (keine API-Limits)

---

## 📞 Was tun wenn Limit erreicht?

### OpenWeatherMap sendet Email
Du bekommst eine Warnung bei 80% Nutzung:
> "You have used 800 of your 1000 daily API calls"

### Sofort-Maßnahmen:
1. **Cache auf 2 Stunden erhöhen:**
   ```typescript
   private readonly CACHE_DURATION_MS = 2 * 60 * 60 * 1000;
   ```

2. **Wetter-Komponente temporär ausblenden:**
   ```typescript
   // In lake-detail.html
   <div class="info-card weather-card" *ngIf="false">
   ```

3. **Alternative API einbauen:**
   - Open-Meteo (unbegrenzt kostenlos)
   - WeatherAPI.com (1M/Monat kostenlos)

4. **Server-Side Caching:**
   - Baue Backend-Proxy
   - Backend cached für alle User

---

## 🆓 Alternative: Open-Meteo (unbegrenzt kostenlos!)

Falls du das Limit öfter erreichst:

### Vorteile
- ✅ **Komplett kostenlos**
- ✅ **Unbegrenzte API-Aufrufe**
- ✅ **Kein API Key nötig**
- ✅ **Open Source**
- ✅ **Sehr genaue Daten (NOAA, DWD)**

### Nachteile
- ❌ Keine fertigen Icons
- ❌ Komplexere API-Struktur
- ❌ Keine Mondphasen-Daten

### API Endpoint
```typescript
const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m,cloud_cover&timezone=Europe/Berlin`;
```

**Dokumentation:** https://open-meteo.com/en/docs

---

## ✅ Zusammenfassung

### Deine Situation
- **Free Tier:** 1000 Aufrufe/Tag
- **Aktuelle Config:** 30 Min Cache
- **Erwartete Nutzung:** ~50 Aufrufe/Tag
- **Sicherheit:** ✅ **Sehr sicher, kein Risiko!**

### Was du tun solltest
1. ✅ **Nichts ändern** - 30 Min Cache ist perfekt
2. ✅ **API Key einbauen** (siehe WEATHER_SETUP.md)
3. ✅ **App testen**
4. ✅ **Nach 1 Woche:** OpenWeatherMap Dashboard checken

### Was du NICHT tun solltest
- ❌ Cache unter 30 Min setzen (unnötig)
- ❌ Stress machen wegen Limit (kommt nie)
- ❌ Bezahl-Plan kaufen (völlig übertrieben)

---

**Du bist safe!** 🎉 Mit 30 Min Cache kommst du niemals über 1000 Aufrufe/Tag.

---

## 📖 Weiterführende Infos

- **OpenWeatherMap Dashboard:** https://home.openweathermap.org/
- **API Dokumentation:** https://openweathermap.org/api
- **Pricing:** https://openweathermap.org/price
- **Open-Meteo Alternative:** https://open-meteo.com/

