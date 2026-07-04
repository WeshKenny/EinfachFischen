# Workflow: Adding new lakes to `src/assets/data/lakes.json`

Read this file before adding new lake entries. It describes the process that worked well, including the mistake to avoid (researching legality one lake at a time instead of pulling a canton's official roster first).

## 0. Ground rules

- **Never invent numbers or facts.** Every field must trace to an actually-fetched source page.
- **Never assume fishing is legal just because a lake is pretty/well-known/in a canton that has other lakes in the dataset.** Being a scenic or touristy lake is not evidence of legal fishing — several strong-looking candidates turned out to be private-lease waters, banned zones, or simply absent from every official list.
- If no solid confirmation of legality can be found, drop the candidate. Don't fill in `permitRequired` with a guess.

## 1. Dedupe check (cheap, do first)

Don't read the whole file. Extract just the existing ids/names:

```bash
node -e "const d=require('./src/assets/data/lakes.json'); console.log(d.map(x=>x.id).join('\n'))"
```

Compare candidate slugs against this list before doing any research on them.

## 2. Pick candidates — canton-roster-first (the efficient way)

**Don't** pick a plausible-sounding lake name and then test its legality one at a time — roughly a third to a half of "sounds legit" candidates turn out to have no confirmable legal fishing access, and you only find out after spending a full research pass on them.

**Do** fetch the canton's *official roster of patent/lease waters* first, then only pick candidates already confirmed on that roster. This turns a ~60% hit rate into ~100% and avoids reject-and-replace cycles. Known official rosters/offices, reusable across runs:

| Canton | Roster / office source |
|---|---|
| Bern | https://www.bkfv-fcbp.ch/fischen-im-kanton-bern/patentgewaesser/ (explicit list: 3 Seen, 6 Bergseen, 5 Stauseen — some Bergseen/Stauseen have their own dedicated subpages with species detail) |
| Ticino | https://www4.ti.ch/dt/da/ucp/temi/pesca/ (general cantonal licence D1/T1 covers most TI waters; check FAQ for exclusion zones) |
| Graubünden | https://www.gr.ch/DE/institutionen/verwaltung/diem/ajf/fischerei/Fischen-in-Graubuenden/Seiten/Fischereipatente.aspx (cantonal patent covers most GR lakes — but verify each one; some popular/touristy lakes, e.g. Heidsee Lenzerheide, explicitly exclude the cantonal patent and require a separate local permit) |
| Wallis | https://www.vs.ch/de/web/scpf/permis-de-peche-epeche- (cantonal patent, category "Bergseen und Teiche" for alpine lakes/reservoirs; some lakes instead have a local société de pêche, e.g. Lac de Champex) |
| St. Gallen | https://www.sg.ch/umwelt-natur/jagd-fischerei/fischerei/fischereipatente/patentgewaesser-kanton-st-gallen.html — cantonal patent covers only Bodensee/Walensee/Zürichsee-Obersee/Alpenrhein. Everything else is a **Pachtgewässer** leased to a local club; check the relevant regional fishing club site (e.g. fv-sarganserland.ch) instead of assuming absence = illegal |
| Uri | https://fischereipatente.ur.ch/en/ (cantonal patent; special 1-Tagespatent explicitly names the waters it covers) |
| Obwalden | https://www.ow.ch/dienstleistungen/2051 |
| Nidwalden | Cantonal patent covers **only Vierwaldstättersee**; all other waters (Bergseen, Stauseen, Bäche) are privately leased out — do not assume a Nidwalden alpine lake is publicly fishable without finding the specific lease-holder |
| Freiburg | https://www.fr.ch/de/energie-landwirtschaft-und-umwelt/fauna-und-biodiversitaet/sektion-fauna-jagd-und-fischerei/fischerei, or regional tourism sites (e.g. fribourg.ch) for specific lakes |

If a canton isn't on this table yet, the first research pass should find and record its roster/office URL here for next time.

## 3. Research each candidate in parallel (one subagent per lake)

Launch one `general-purpose` subagent per candidate, all in a single message (parallel). Each prompt should include:

1. The exact schema (field names/types — pull a live example from `lakes.json` since the schema has evolved; don't trust this doc for field shape, only for process).
2. **Geodata source**: German Wikipedia for area/maxDepth/elevation/coords.
3. **Legality + species + pricing source**: the canton's official roster/office (table above), or a regional fishing club/tourism site as fallback.
4. An explicit critical-verification instruction: confirm from an official/reliable source that fishing is *legally permitted at this specific lake* (not just "somewhere in this canton") — and to report `"NO CONFIRMATION FOUND"` with an explanation instead of fabricating a `permitRequired` value.
5. Instruction to use WebSearch/WebFetch for real fetches, not training-data recall, and to list the source URLs used per fact category.

If a canton's roster mentions a specific known-good alternative near a rejected candidate (this happens — e.g. rejecting Grimselsee surfaced Räterichsbodensee as confirmed on the same roster), reuse that lead immediately for a replacement agent instead of picking a fresh unverified name.

## 4. Handle rejections

When an agent reports "NO CONFIRMATION FOUND":
- Read its reasoning — it usually names a nearby/similar water that *is* confirmed (same reservoir system, same club, same canton roster).
- Launch one replacement agent for that lead, same prompt structure as step 3.

## 5. Insert and validate

- Add each confirmed object via `Edit`, following the exact field order used by neighboring entries.
- Validate JSON + duplicate ids:

```bash
node -e "const d=require('./src/assets/data/lakes.json'); console.log('entries:', d.length); const ids=d.map(x=>x.id); console.log('duplicates:', ids.filter((v,i)=>ids.indexOf(v)!==i));"
```

- Run the type check:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

## Track record (for reference)

Confirmed and added: Seelisbergersee (UR), Schwarzsee (FR), Mapraggsee (SG), Räterichsbodensee (BE), Lac de Champex (VS), Gelmersee (BE), Mattenalpsee (BE), Lago di Vogorno (TI), Lac de Tseuzier (VS), Heidsee (GR).

Rejected — no confirmation of legal fishing found: Grimselsee (BE, absent from Bernese patent roster), Gigerwaldsee (SG, absent from every cantonal/club list), Trübsee (assumed Obwalden, actually Nidwalden — leased privately, no public access confirmed).
