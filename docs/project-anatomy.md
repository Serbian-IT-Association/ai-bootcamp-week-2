# Mapa projekta

Ova aplikacija čita pripremljene stavke iz Upstash Redis-a, računa napredak na serveru i prikazuje rezultat u browseru. Nema upisa u Redis, autentikacije korisnika ili OpenAI poziva.

## Fajlovi i odgovornosti

| Stavka | Vrsta | Odgovornost |
| --- | --- | --- |
| `README.md` | Dokumentacija | Zadatak, ograničenja, komande i kriterijumi prihvatanja. |
| `client/` | Source za browser | `apiClient.ts` šalje HTTP zahteve; `main.ts` prikazuje podatke, učitavanje i greške. |
| `api/` | Source za server | HTTP ulazne tačke: health, stavke/filter/detail i summary; proveravaju metod i formiraju odgovor. |
| `server/` | Source za server | Konfiguracija, read-only pristup Upstash-u, validacija podataka, filtriranje, obračun i mapiranje grešaka. |
| `public/` | Statički source | HTML, CSS i favicon koji se kopiraju u build. Ne sadrži kompajlirani browser JavaScript. |
| `scripts/` | Razvojni alati | Čišćenje i kontrola build-a, kopiranje statike, lokalni server i smoke/solution provere. |
| `tests/` | Test source | Node testovi ugovora, konfiguracije, podataka, obračuna i HTTP handler-a. |
| `package.json` | Konfiguracija | Komande, Node 24.x i deklarisane razvojne zavisnosti. |
| `package-lock.json` | Konfiguracija | Tačne verzije, izvori i integritet zavisnosti; omogućava ponovljiv `npm ci`. |
| `node_modules/` | Generisani rezultat | Instalirane zavisnosti. Obnavlja se pomoću `npm ci` i ne ide u Git. |
| `tsconfig.json` | Konfiguracija | Stroga provera tipova za client, API, server i testove; `noEmit` sprečava generisanje fajlova. |
| `tsconfig.build.json` | Konfiguracija | Nasleđuje osnovna pravila, uključuje samo `client/`, emituje JS u `dist/assets/` i pretvara relativne `.ts` importe u `.js`. |
| `.gitignore` | Konfiguracija | Isključuje lokalne tajne, zavisnosti, build, Vercel metapodatke i logove iz novih Git unosa. Ne uklanja ranije praćene fajlove. |
| `.env.example` | Javni konfiguracioni šablon | Imena promenljivih i placeholder vrednosti; nije stvarna konfiguracija servisa. |
| `.env` | Lokalna tajna | Stvarne servisne vrednosti. Lokalni `npm start` ih učitava na serveru. |
| `vercel.json` | Deployment konfiguracija | Pokreće `npm run build`, objavljuje `dist/` i uključuje `cleanUrls`. |
| `.vercel/` | Lokalni generisani metapodaci | Vercel CLI povezivanje projekta, kada se CLI koristi; ne ide u Git. |
| `dist/` | Generisani browser output | Samo HTML, CSS, favicon i JS za browser; svaki build ga pravi iznova. |

## Od izvora do javne aplikacije

```text
npm ci → node_modules/
npm test → TypeScript provera + Node testovi
npm run build
  → clean uklanja stari dist/
  → tsc kompajlira client/*.ts u dist/assets/*.js
  → copy-static kopira HTML, CSS i favicon iz public/
  → check-dist proverava inventar i zabranjeni sadržaj
Vercel → dist/ kao statika + api/*.ts kao serverske funkcije
```

`server/` i `api/` ostaju serverski kod: ne ulaze u javni `dist/`. Lokalno `scripts/serve.mjs` služi isti `dist/` i prosleđuje API zahteve istim handler-ima.

## Od browsera do servisa

```text
Osveži podatke
  → client/main.ts
  → client/apiClient.ts: GET /api/preparation-summary
  → api/preparation-summary.ts
  → server/preparationService.ts
  → server/config.ts + server/upstashPreparationRepository.ts
  → Upstash: Redis GET week2:preparation-items
  → validacija podataka → createPreparationSummary(items)
  → HTTP 200 { data: { total, completed, remaining, percentage } }
  → kartica napretka u browseru
```

Transport prema Upstash REST servisu koristi HTTP POST sa telom `['GET', key]`; Redis operacija je čitanje. Token postoji samo u serverskom Authorization zaglavlju. Browser komunicira sa sopstvenim API-jem.

`PREPARATION_DATA_MODE=fallback` bira postojeće lokalne probne podatke. `verify:solution` koristi tu putanju, zato uspešna komanda sama ne dokazuje pristup stvarnom Upstash-u. Za to služi dodatni smoke sa stvarnom konfiguracijom.

## Obračun koji treba objasniti

`total = items.length`; `completed` broji završene stavke; `remaining = total - completed`; `percentage = Math.round(completed / total * 100)`, odnosno `0` za prazan niz.

| Primer | total | completed | remaining | percentage |
| --- | ---: | ---: | ---: | ---: |
| Seed | 8 | 3 | 5 | 38 |
| Prazan niz | 0 | 0 | 0 | 0 |
| Sve završeno | 2 | 2 | 0 | 100 |
| Ništa završeno | 2 | 0 | 2 | 0 |
| Jedna od tri | 3 | 1 | 2 | 33 |
| Dve od tri | 3 | 2 | 1 | 67 |

Za usmeno objašnjenje prođite kroz obe putanje iznad i odgovorite: zašto je `public/` pogrešan deployment output, zašto token ne sme u `client/`, čemu služe obe tsconfig konfiguracije i zašto fallback provera nije dovoljna za servisnu integraciju. Dokument je pomoć za učenje; ne potvrđuje samostalno razumevanje članova para.
