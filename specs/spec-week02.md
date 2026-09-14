# Week 02 — specifikacija i status

## Plan i očekivano ponašanje

1. Uporediti browser zahtev za summary sa postojećim API endpointom i promeniti samo pogrešnu putanju klijenta.
2. Iz liste stavki izračunati ukupan broj, završene, preostale i zaokruženi procenat; za praznu listu vratiti nule.
3. Zameniti `test.todo` konkretnim testovima, zatim proveriti tipove, testove, build i dist izlaz.

Očekivani primeri:

- Osam stavki, od kojih su tri `completed: true`: `total: 8`, `completed: 3`, `remaining: 5`, `percentage: 38`.
- Prazan niz: `total: 0`, `completed: 0`, `remaining: 0`, `percentage: 0`.

## Izvedene izmene

- [x] Browser summary zahtev u `client/apiClient.ts` koristi postojeći singularni endpoint `/api/preparation-summary`.
- [x] `server/preparationSummary.ts` implementira `createPreparationSummary(items)` bez izmene API ugovora.
- [x] `tests/preparationSummary.test.ts` sadrži stvarne testove za seed rezultat `8 / 3 / 5 / 38` i prazan niz.
- [x] `vercel.json` je izmenjen da objavljuje verifikovani `dist/` izlaz.

## Lokalne provere

- [x] `npm test` — prolazi (typecheck i 11 testova; nema `todo` testa).
- [x] `npm ci` — prolazi i nije uneo dodatne izmene u radno stablo.
- [x] `npm run build` — prolazi; svež `dist/` sadrži samo `index.html`, `styles.css`, favicon i kompajlirane `assets/*.js` fajlove.
- [x] `npm run verify:solution` — prolazi, uključujući proveru summary ugovora, browser rute i Vercel output-a.
- [x] Lokalni smoke sa read-only konfiguracijom i očekivanim summary statusom `200` — prolazi svih 11 provera.

## Van moje odgovornosti u ovom handoff-u

- [ ] Vercel deployment, podešavanje remote environment varijabli, redeploy i remote smoke radi koleginica iz tima.
- [ ] Branch/commit/push i finalna podela doprinosa ostaju da se dogovore u paru; commit treba da obuhvati samo namerne izmene.

## Bezbednost i obim

- [x] API handler i njegov ugovor nisu menjani.
- [x] Nisu dodavani Redis write, novi endpoint, autentikacija niti UI redizajn.
- [x] `.gitignore` isključuje `.env`, `dist/`, `node_modules/` i `.vercel/`; pre commita proveriti staging oblast, ne samo radno stablo.
