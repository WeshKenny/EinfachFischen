#!/usr/bin/env python3
"""
Script zum Hinzufügen von Dummy-Daten (Patent-Preise, Regeln, Bilder) zu allen Seen.
Nach dem Ausführen kannst du die echten Preise und Links manuell anpassen.
"""

import re

# Dummy-Daten Template
DUMMY_DATA = {
    "permitPrices": {
        "daily": "CHF 25.00",
        "weekly": "CHF 55.00",
        "monthly": "CHF 130.00",
        "annual": "CHF 320.00",
        "youth": "CHF 90.00",
        "link": "https://www.sana.ch/"
    },
    "regulations": {
        "closedSeasons": "Bitte Kantonsvorschriften prüfen",
        "minSizes": {
            "Hecht": "50 cm",
            "Zander": "45 cm",
            "Forelle": "24 cm",
            "Barsch": "15 cm"
        },
        "bagLimit": "Bitte Kantonsvorschriften prüfen",
        "additionalRules": [
            "Kantonsvorschriften beachten",
            "Schonzeiten einhalten",
            "Mindestmaße kontrollieren"
        ]
    }
}

def create_id(name):
    """Erstellt URL-freundliche ID aus See-Namen"""
    return (name.lower()
            .replace('ä', 'ae')
            .replace('ö', 'oe')
            .replace('ü', 'ue')
            .replace(' ', '-')
            .replace('é', 'e')
            .replace('è', 'e')
            .replace('à', 'a'))

def add_data_to_lake(lake_text, lake_name):
    """Fügt Dummy-Daten zu einem See hinzu"""
    
    # Prüfe ob bereits Daten vorhanden sind
    if 'permitPrices' in lake_text:
        return lake_text
    
    # Finde den permitRequired Wert
    permit_match = re.search(r'permitRequired:\s*"([^"]+)"', lake_text)
    if not permit_match:
        return lake_text
    
    lake_id = create_id(lake_name)
    
    # Erstelle die neuen Felder
    new_data = f''',
      permitPrices: {{
        daily: "CHF 25.00",
        weekly: "CHF 55.00",
        monthly: "CHF 130.00",
        annual: "CHF 320.00",
        youth: "CHF 90.00",
        link: "https://www.sana.ch/"
      }},
      regulations: {{
        closedSeasons: "Bitte Kantonsvorschriften prüfen",
        minSizes: {{
          "Hecht": "50 cm",
          "Zander": "45 cm",
          "Forelle": "24 cm",
          "Barsch": "15 cm"
        }},
        bagLimit: "Bitte Kantonsvorschriften prüfen",
        additionalRules: [
          "Kantonsvorschriften beachten",
          "Schonzeiten einhalten",
          "Mindestmaße kontrollieren"
        ]
      }},
      images: [
        "/assets/lakes/{lake_id}-1.jpg",
        "/assets/lakes/{lake_id}-2.jpg",
        "/assets/lakes/{lake_id}-3.jpg"
      ],
      id: "{lake_id}"'''
    
    # Füge die Daten vor dem schließenden } ein
    lake_text = re.sub(
        r'(permitRequired:\s*"[^"]+")(\s*\n\s*})',
        r'\1' + new_data + r'\2',
        lake_text
    )
    
    return lake_text

def main():
    file_path = 'src/app/services/lake.service.ts'
    
    # Lese die Datei
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Finde alle Seen
    lake_pattern = r'\{\s*name:\s*"([^"]+)",[^}]+permitRequired:[^}]+\}'
    lakes = re.findall(lake_pattern, content, re.DOTALL)
    
    print(f"Gefundene Seen: {len(lakes)}")
    
    # Verarbeite jeden See
    for lake_name in lakes:
        # Finde den kompletten See-Block
        lake_block_pattern = r'(\{\s*name:\s*"' + re.escape(lake_name) + r'",[^}]+permitRequired:[^}]+\})'
        match = re.search(lake_block_pattern, content, re.DOTALL)
        
        if match:
            old_block = match.group(1)
            new_block = add_data_to_lake(old_block, lake_name)
            
            if old_block != new_block:
                content = content.replace(old_block, new_block, 1)
                print(f"✓ {lake_name} aktualisiert")
            else:
                print(f"○ {lake_name} bereits aktualisiert oder übersprungen")
    
    # Schreibe die Datei zurück
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ Fertig! Alle Seen wurden aktualisiert.")
    print("\n📝 NÄCHSTE SCHRITTE:")
    print("1. Öffne: src/app/services/lake.service.ts")
    print("2. Suche nach 'CHF 25.00' um die Dummy-Preise zu finden")
    print("3. Ersetze die Preise mit echten Werten von:")
    print("   - https://www.sana.ch/")
    print("   - Kantons-Webseiten (z.B. zh.ch, be.ch, etc.)")
    print("4. Aktualisiere die 'link' URLs zu den offiziellen Patent-Seiten")
    print("5. Passe die Schonzeiten und Mindestmaße an")

if __name__ == '__main__':
    main()
