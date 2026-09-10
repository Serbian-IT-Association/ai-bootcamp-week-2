# Priprema za intervju: Week 2 starter

Ovo je početno stanje za nedeljni zadatak. Upstash/Redis čitanje, server-side konfiguracija, API rute, browser prikaz, test alat, čist `dist/`, lokalni server, smoke provera i Vercel konfiguracija već su pripremljeni.

Starter sadrži tri kontrolisana i ograničena zadatka: jednu browser-to-service grešku, neimplementirani `preparation-summary` i jednu deployment-output grešku. Nema nasumičnih compile ili dependency kvarova. Nije potrebno da praviš Upstash nalog, seješ podatke, menjaš Redis ugovor ili dodaješ novi backend sloj.

Pre izmene pročitaj `docs/project-anatomy.md`. Treba da umeš da razvrstaš glavne stavke kao source, projektnu konfiguraciju, lokalnu tajnu ili generisani rezultat; objasniš odgovornosti `client/`, `api/`, `server/`, `public/`, `scripts/` i `tests/`; i ispratiš source-to-deployment i browser-to-service put. Ne praviš kostur od početka i ne memorišeš svaki helper fajl.

## Početna provera

Koristi Node.js 24.x LTS.

```bash
npm ci
cp .env.example .env
npm run verify:starter
```

U `.env` zameni placeholder-e read-only Upstash vrednostima koje daje tutor. Zatim:

```bash
npm start
```

U drugom terminalu:

```bash
EXPECT_SUMMARY_STATUS=501 BASE_URL=http://127.0.0.1:4173 npm run smoke
```

U početnom stanju očekivano je sledeće:

- health, lista, filteri i detail primeri prolaze;
- aplikacija učitava osam seed stavki;
- direktni `GET /api/preparation-summary` vraća `501 SUMMARY_NOT_IMPLEMENTED`;
- browser summary tok ne prikazuje isti rezultat zbog jedne kontrolisane wiring greške koju treba locirati Network proverom;
- `tests/preparationSummary.test.ts` sadrži jedan `todo` test.

To su namerni početni signali, ne kvar Upstash konfiguracije. `npm run verify:starter` potvrđuje stabilan početni scaffold; ne tvrdi da su kontrolisani zadaci završeni.

## Tvoj zadatak

1. Uporedi direktni summary API odgovor sa browser Network zahtevom, lociraj najmanju browser-to-service grešku i ispravi je bez promene API ugovora.
2. Pročitaj `server/preparationSummary.ts` i `tests/preparationSummary.test.ts`.
3. Pre implementacije napiši kratak plan i očekivane primere.
4. Implementiraj `createPreparationSummary(items)` tako da vrati:
   - `total`: broj svih stavki;
   - `completed`: broj stavki sa `completed: true`;
   - `remaining`: `total - completed`;
   - `percentage`: zaokružen ceo procenat, ili `0` za prazan niz.
5. Zameni `test.todo` stvarnim testovima za seed rezultat `8 / 3 / 5 / 38` i prazan niz.
6. Pokreni `npm test` i `npm run build`.
7. Pokreni aplikaciju sa tutorovom read-only konfiguracijom i ponovi smoke sa:

```bash
EXPECT_SUMMARY_STATUS=200 BASE_URL=http://127.0.0.1:4173 npm run smoke
```

U PowerShell-u:

```powershell
$env:EXPECT_SUMMARY_STATUS="200"
$env:BASE_URL="http://127.0.0.1:4173"
npm run smoke
```

8. Pre deployment-a proveri da li Vercel objavljuje isti verifikovani browser output koji pravi `npm run build`; ispravi jednu kontrolisanu output grešku bez promene providera ili build arhitekture.
9. Pokreni `npm run verify:solution`. Komanda zahteva ispravan summary, stvarne testove, browser rutu, Vercel output, clean build i lokalni `200` smoke.
10. Pregledaj `git diff` i `git status`.
11. Push-uj branch para, objavi na Vercel, pa ponovi smoke sa javnim URL-om.

Očekivani source/config obim su četiri fajla: browser API klijent, summary modul, njegov test i Vercel konfiguracija. Ako menjaš druge fajlove, prvo dokumentuj konkretan dokaz da je to neophodno.

## Kriterijumi prihvatanja

- Menja se mala, objašnjiva TypeScript celina i odgovarajući testovi.
- Za osam seed stavki sa tri završene summary je `total=8`, `completed=3`, `remaining=5`, `percentage=38`.
- Za prazan niz svi brojevi su `0`.
- `npm test` nema `todo` i prolazi.
- Browser summary zahtev koristi postojeći singularni API ugovor i kartica prikazuje `200` rezultat.
- `npm run build` pravi svež `dist/` bez server source-a, `.env`, tokena ili TypeScript fajlova.
- Vercel objavljuje verifikovani `dist/` output, a ne ručno održavani source folder.
- Lokalni i javni smoke prolaze sa očekivanim summary statusom `200`.
- `npm run verify:solution` prolazi.
- `.env`, `dist/`, `node_modules/` i `.vercel/` nisu commit-ovani.
- Oba člana para umeju da objasne `README.md`, package/lockfile/`node_modules/`, obe TypeScript konfiguracije, `.gitignore`, `.env.example`/lokalni `.env`, `vercel.json` i `dist/`; odgovornosti glavnih foldera; i dve ključne putanje.

## Granica rada

Ne menjaj seed podatke, Upstash repository, API route ugovor, Vercel provider, autentikaciju ili UI dizajn osim ako dokazani kvar blokira minimum. Ispravka browser poziva mora da koristi postojeći API ugovor, a deployment ispravka postojeći `dist/`. Ne dodaj Redis write, novi framework, CRUD, OpenAI API ili ručno izmenjen `dist/`.

Ako isti problem traje oko 20 minuta, vrati se na poslednje zeleno stanje, sačuvaj komandu i prvu konkretnu grešku, napiši precizan bloker i koristi odobreni AI asistent ili Discord. Tutor nije aktivni support kanal između sesija.

## Dokazi za predaju

- link ka branch-u, commit-u ili PR-u;
- javni Vercel URL;
- rezultati `npm test`, `npm run build`, lokalnog i remote smoke-a;
- kratak inventar `dist/`;
- potvrda da tajne nisu u Git-u ili browser bundle-u;
- jedan debugging primer ili dokumentovan bloker;
- pre/posle signal za obe kontrolisane greške;
- doprinos oba člana para;
- beleška o korišćenju AI-ja.

Detaljna mapa projekta nalazi se u `docs/project-anatomy.md`; Vercel tok u `docs/deployment-guide.md`; dokaz u `docs/evidence-checklist.md`; tipični problemi u `docs/troubleshooting.md`.
