#!/usr/bin/env python3
"""
Fügt allen Seen in lakes.json ein 'id' Feld hinzu
"""

import json
import re

def create_id(name):
    """Erstellt URL-freundliche ID aus See-Namen"""
    id_str = name.lower()
    id_str = id_str.replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue')
    id_str = re.sub(r'[^a-z0-9]+', '-', id_str)
    id_str = id_str.strip('-')
    return id_str

def main():
    print("🔄 Füge IDs zu allen Seen hinzu...")
    
    # Lade JSON
    with open('src/assets/data/lakes.json', 'r', encoding='utf-8') as f:
        lakes = json.load(f)
    
    print(f"📊 {len(lakes)} Seen gefunden")
    
    # Füge IDs hinzu
    updated = 0
    for lake in lakes:
        if 'id' not in lake or not lake['id']:
            lake['id'] = create_id(lake['name'])
            updated += 1
            print(f"  ✓ {lake['name']} → {lake['id']}")
    
    # Schreibe zurück
    with open('src/assets/data/lakes.json', 'w', encoding='utf-8') as f:
        json.dump(lakes, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ {updated} Seen mit IDs aktualisiert")
    print(f"📁 Gespeichert: src/assets/data/lakes.json")

if __name__ == '__main__':
    main()
