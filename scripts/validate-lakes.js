#!/usr/bin/env node
// Validates src/assets/data/lakes.json before it can be merged.
// Run locally: npm run validate:lakes

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'src', 'assets', 'data', 'lakes.json');

const REQUIRED_FIELDS = ['id', 'name', 'cantons', 'coords', 'freeFishing', 'permitRequired', 'permitPrices'];
const ID_PATTERN = /^[a-z0-9-]+$/;

// Generous bounding box around Switzerland (incl. border lakes like Lago di Lei, Lago Maggiore)
const CH_BOUNDS = { latMin: 45.6, latMax: 48.0, lngMin: 5.8, lngMax: 10.6 };

function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function main() {
  const errors = [];
  const warnings = [];

  let raw;
  try {
    raw = fs.readFileSync(DATA_PATH, 'utf-8');
  } catch (e) {
    console.error(`lakes.json nicht gefunden unter ${DATA_PATH}`);
    process.exit(1);
  }

  let lakes;
  try {
    lakes = JSON.parse(raw);
  } catch (e) {
    console.error(`lakes.json ist kein gültiges JSON: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(lakes)) {
    console.error('lakes.json muss ein Top-Level-Array sein.');
    process.exit(1);
  }

  const seenIds = new Map();
  const seenNames = new Map();

  lakes.forEach((lake, i) => {
    const where = `Eintrag #${i} (${lake && lake.name ? lake.name : 'kein Name'})`;

    if (!lake || typeof lake !== 'object') {
      errors.push(`${where}: ist kein Objekt`);
      return;
    }

    for (const field of REQUIRED_FIELDS) {
      if (lake[field] === undefined || lake[field] === null || lake[field] === '') {
        errors.push(`${where}: Pflichtfeld "${field}" fehlt`);
      }
    }

    if (typeof lake.id === 'string') {
      if (!ID_PATTERN.test(lake.id)) {
        errors.push(`${where}: id "${lake.id}" enthält ungültige Zeichen (nur a-z, 0-9, -)`);
      }
      const idKey = lake.id;
      if (seenIds.has(idKey)) {
        errors.push(`Doppelte id "${idKey}": ${where} kollidiert mit ${seenIds.get(idKey)}`);
      } else {
        seenIds.set(idKey, where);
      }
    }

    if (typeof lake.name === 'string') {
      const nameKey = normalize(lake.name);
      if (seenNames.has(nameKey)) {
        errors.push(`Doppelter Seename "${lake.name}": ${where} kollidiert mit ${seenNames.get(nameKey)}`);
      } else {
        seenNames.set(nameKey, where);
      }
    }

    if (Array.isArray(lake.coords)) {
      const [lat, lng] = lake.coords;
      if (lake.coords.length !== 2 || typeof lat !== 'number' || typeof lng !== 'number') {
        errors.push(`${where}: coords müssen genau [lat, lng] als Zahlen sein`);
      } else if (
        lat < CH_BOUNDS.latMin || lat > CH_BOUNDS.latMax ||
        lng < CH_BOUNDS.lngMin || lng > CH_BOUNDS.lngMax
      ) {
        warnings.push(`${where}: coords [${lat}, ${lng}] liegen ausserhalb der erwarteten Schweiz-Bounding-Box — bitte prüfen (evtl. lat/lng vertauscht?)`);
      }
    } else if (lake.coords !== undefined) {
      errors.push(`${where}: coords ist kein Array`);
    }

    if (lake.freeFishing !== undefined && typeof lake.freeFishing !== 'boolean') {
      errors.push(`${where}: freeFishing muss ein Boolean sein`);
    }

    if (lake.permitPrices !== undefined && typeof lake.permitPrices !== 'object') {
      errors.push(`${where}: permitPrices muss ein Objekt sein`);
    }
  });

  console.log(`Geprüft: ${lakes.length} Seen aus lakes.json`);

  if (warnings.length) {
    console.log(`\n${warnings.length} Warnung(en):`);
    warnings.forEach(w => console.log('  ⚠ ' + w));
  }

  if (errors.length) {
    console.log(`\n${errors.length} Fehler:`);
    errors.forEach(e => console.log('  ✗ ' + e));
    console.log('\nValidierung fehlgeschlagen.');
    process.exit(1);
  }

  console.log('Validierung erfolgreich — keine Duplikate, alle Pflichtfelder vorhanden.');
}

main();
