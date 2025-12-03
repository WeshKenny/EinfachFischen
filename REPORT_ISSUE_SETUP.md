# 🚨 Fehler melden System - Setup Anleitung

## ✅ Was wurde implementiert?

1. **Report-Issue Komponente** (`src/app/report-issue/`)
2. **"Fehler melden" Button** auf jeder See-Detail Seite
3. **Spam-Schutz** (5 Minuten Cooldown zwischen Meldungen)
4. **Google Forms Integration** (empfohlen und kostenlos!)

---

## 📋 Google Forms Setup (5 Minuten)

### Schritt 1: Google Form erstellen

1. Gehe zu https://forms.google.com
2. Klicke auf **"+ Blank"** (Neues Formular)
3. Titel: **"EinfachFischen - Fehler melden"**

### Schritt 2: Felder hinzufügen

Erstelle diese 4 Felder (in dieser Reihenfolge):

| Feld | Typ | Pflichtfeld? |
|------|-----|--------------|
| **See-Name** | Kurzantwort | ✅ Ja |
| **Kategorie** | Multiple Choice | ✅ Ja |
| **Beschreibung** | Absatz | ✅ Ja |
| **E-Mail** | Kurzantwort | ❌ Nein |

**Kategorie-Optionen:**
- Patent-Informationen veraltet
- Regeländerung
- Falsche Daten
- Sonstiges

### Schritt 3: Entry IDs herausfinden

1. Klicke auf **"Senden"** Button (oben rechts)
2. Wähle **"Link"** Tab
3. Klicke auf **"Vorausgefüllten Link erstellen"**
4. Fülle ALLE Felder mit Dummy-Daten aus (z.B. "test")
5. Klicke **"Link abrufen"**
6. Kopiere den Link - er sieht so aus:

```
https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?
entry.123456=test&
entry.789012=test&
entry.345678=test&
entry.901234=test
```

Die Zahlen nach `entry.` sind deine **Entry IDs**!

### Schritt 4: Code aktualisieren

Öffne `src/app/report-issue/report-issue.component.ts` und ersetze:

```typescript
// VORHER (Zeile 84-93):
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/DEINE_FORM_ID/formResponse';

const formData = new URLSearchParams({
  'entry.12345': report.lakeName,           // ❌ Dummy
  'entry.67890': report.category,           // ❌ Dummy
  'entry.11111': report.description,        // ❌ Dummy
  'entry.22222': report.email || 'Anonym'   // ❌ Dummy
});

// NACHHER (mit deinen echten Werten):
const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse';

const formData = new URLSearchParams({
  'entry.123456': report.lakeName,          // ✅ Deine Entry ID für "See-Name"
  'entry.789012': report.category,          // ✅ Deine Entry ID für "Kategorie"
  'entry.345678': report.description,       // ✅ Deine Entry ID für "Beschreibung"
  'entry.901234': report.email || 'Anonym'  // ✅ Deine Entry ID für "E-Mail"
});
```

### Schritt 5: Testen!

1. Öffne deine App
2. Klicke auf einen See
3. Klicke **"🚨 Fehler melden"**
4. Fülle das Formular aus
5. Überprüfe Google Forms → **"Antworten"** Tab

✅ Du solltest die Meldung sehen!

---

## 🛡️ Spam-Schutz Features

### ✅ Implementiert:

1. **Rate Limiting (Client-Side)**
   - 5 Minuten Cooldown zwischen Meldungen
   - Gespeichert in `localStorage`

2. **Validation**
   - Beschreibung muss ausgefüllt sein
   - Max. 500 Zeichen
   - E-Mail optional

3. **User Agent Tracking**
   - Wird mitgesendet für Spam-Analyse

### 🔒 Zusätzliche Optionen (optional):

**In Google Forms:**
1. **"E-Mail-Adresse erfassen"** aktivieren
2. **"Nur 1 Antwort"** (erfordert Google Login) → Sehr effektiv!

**reCAPTCHA (Overkill für kleine Apps):**
- Google reCAPTCHA v3 hinzufügen
- Nur bei >1000 Nutzern/Tag nötig

---

## 📊 Meldungen verwalten

### Google Sheets Integration

1. In Google Forms → **"Antworten"** Tab
2. Klicke auf **Google Sheets Icon** (grünes Symbol)
3. Erstelle neue Tabelle
4. Alle Meldungen landen jetzt in Google Sheets!

**Vorteile:**
- ✅ Automatische Sortierung/Filterung
- ✅ Export als CSV/Excel möglich
- ✅ Benachrichtigungen einrichten

### E-Mail Benachrichtigungen

1. Google Sheets öffnen
2. **Erweiterungen** → **Apps Script**
3. Füge diesen Code ein:

```javascript
function sendEmailOnFormSubmit(e) {
  var seeName = e.values[1];      // Spalte B (See-Name)
  var category = e.values[2];     // Spalte C (Kategorie)
  var description = e.values[3];  // Spalte D (Beschreibung)
  var email = e.values[4];        // Spalte E (E-Mail)
  
  var subject = "🚨 Neue Meldung: " + seeName;
  var body = "See: " + seeName + "\n" +
             "Kategorie: " + category + "\n" +
             "Beschreibung: " + description + "\n" +
             "Kontakt: " + (email || "Anonym");
  
  MailApp.sendEmail("deine@email.ch", subject, body);
}
```

4. **Trigger** → **+Trigger hinzufügen**
5. Wähle: `sendEmailOnFormSubmit`, `From spreadsheet`, `On form submit`
6. Speichern!

---

## 🎯 Alternativen zu Google Forms

### Option 1: Formspree (Einfacher, kostenpflichtig)

**Kostenlos:** 50 Submissions/Monat  
**Pro:** $10/Monat (unbegrenzt)

Setup:
1. Registriere auf https://formspree.io
2. Erstelle neues Formular
3. Kopiere Form-ID
4. In `report-issue.component.ts` (Zeile 110):

```typescript
private async submitToFormspree(report: ReportIssue): Promise<void> {
  const FORMSPREE_URL = 'https://formspree.io/f/YOUR_FORM_ID'; // ✅ Deine ID
  // ... rest bleibt gleich
}
```

5. In `submitReport()` (Zeile 71):
```typescript
// await this.submitToGoogleForms(report); // ❌ Auskommentieren
await this.submitToFormspree(report);      // ✅ Aktivieren
```

### Option 2: Eigenes Backend (Overkill)

Nur wenn du:
- Mehr als 10.000 Meldungen/Monat erwartest
- Volle Kontrolle brauchst
- Bereits ein Backend hast

---

## 🧪 Testing

```bash
# Starte Dev Server
ng serve

# Öffne Browser
http://localhost:4200

# Test-Schritte:
1. Klicke auf einen See
2. Klicke "🚨 Fehler melden"
3. Fülle Formular aus
4. Klicke "Melden"
5. Überprüfe Google Forms Antworten
```

---

## 🎨 Anpassungen

### Button-Position ändern

In `lake-detail.html`:
```html
<!-- Aktuell: Rechts oben -->
<button class="report-issue-btn" (click)="reportIssue.open()">
  🚨 Fehler melden
</button>

<!-- Alternative: Unten als Fußnote -->
<div class="report-issue-footer">
  <button (click)="reportIssue.open()">
    Fehler melden oder Daten korrigieren
  </button>
</div>
```

### Cooldown-Zeit ändern

In `report-issue.component.ts` (Zeile 23):
```typescript
private readonly COOLDOWN_MINUTES = 5; // ✅ Ändere zu 10, 15, etc.
```

---

## ❓ FAQ

**Q: Wie viele Meldungen kann Google Forms verarbeiten?**  
A: Unbegrenzt! Aber ab 100k Einträgen wird Google Sheets langsam.

**Q: Können Nutzer Spam-Meldungen senden?**  
A: Ja, aber durch 5-Min-Cooldown ist es sehr mühsam. Du kannst in Google Forms "Nur 1 Antwort" aktivieren (erfordert Google Login).

**Q: Was ist mit DSGVO?**  
A: ✅ E-Mail ist optional, du speicherst nur was Nutzer freiwillig angeben. Füge einen Datenschutz-Hinweis hinzu (bereits im Modal vorhanden).

**Q: Kann ich sehen WER die Meldung gesendet hat?**  
A: Nur wenn sie E-Mail angeben oder du Google Forms auf "E-Mail erfassen" stellst.

---

## 🚀 Nächste Schritte

1. ✅ Google Form erstellen (5 Min)
2. ✅ Entry IDs in Code eintragen (2 Min)
3. ✅ Testen (1 Min)
4. ✅ Google Sheets Integration (optional)
5. ✅ E-Mail Benachrichtigungen (optional)

**Du bist bereit! 🎉**
