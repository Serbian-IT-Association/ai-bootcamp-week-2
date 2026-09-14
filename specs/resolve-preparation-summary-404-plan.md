# Plan: otklanjanje 404 greške i prikaz server-side pregleda

## Status i pravilo rada

- Status: samo plan; implementacija nije započeta.
- Ovaj dokument je jedina promena napravljena tokom analize.
- Izvorni kod, testovi, konfiguracija, generisani `dist/` i lokalni `.env` nisu menjani.
- Pre svake buduće promene biće traženo posebno odobrenje korisnika. Jedno odobrenje važi samo za jasno imenovan fajl i opisanu promenu.

## Cilj

Omogućiti da kartica **Server-side računanje / Pregled pripreme**:

1. poziva postojeću API rutu bez 404 greške;
2. učita iste stavke koje server čita iz podešenog read-only Upstash izvora;
3. na serveru izračuna i vrati `total`, `completed`, `remaining` i `percentage`;
4. prikaže očekivani rezultat za seed podatke: `8 / 3 / 5 / 38%`;
5. radi lokalno i na Vercel deployment-u bez izlaganja tajni browseru.

## Pregledana dokumentacija i ograničenja

Pregledani su svi dokumenti koji stvarno postoje u trenutnom Git stablu:

- `README.md`;
- `.env.example` kao dokumentovani primer konfiguracije;
- `package.json`, obe TypeScript konfiguracije, `.gitignore` i `vercel.json` kao projektna konfiguracija;
- kompletan tok kroz `client/`, `api/`, `server/`, `scripts/`, `tests/` i statički `public/` sadržaj.

README navodi sledeće dokumente, ali oni ne postoje ni u radnom stablu ni u trenutnom `HEAD` commit-u:

- `docs/project-anatomy.md`;
- `docs/deployment-guide.md`;
- `docs/evidence-checklist.md`;
- `docs/troubleshooting.md`.

Njihov sadržaj zato nije mogao biti pregledan. Plan se oslanja na postojeći README, kod, testove i verifikacione skripte. Ne planira se izmišljanje ili rekonstrukcija nestalih dokumenata bez posebnog zahteva.

README definiše tri namerna starter problema i očekivani osnovni obim od četiri fajla:

1. pogrešno povezana browser ruta;
2. neimplementiran summary;
3. pogrešan Vercel output direktorijum.

Granica rada ostaje ista: bez izmene seed podataka, Upstash repository-ja, API ugovora, autentikacije, UI dizajna, Vercel providera ili build arhitekture.

## Utvrđeno trenutno stanje

### 1. Neposredan uzrok vidljivog 404 odgovora

`client/apiClient.ts` za summary šalje zahtev na:

```text
/api/preparation-summaries
```

Međutim, postojeća serverless funkcija je `api/preparation-summary.ts`, a lokalni server i smoke provera registruju:

```text
/api/preparation-summary
```

Zbog razlike množina/jednina browser završava na nepostojećoj ruti. Lokalni server zato ispravno vraća `404 NOT_FOUND` sa porukom „API ruta ne postoji.” Zahtev u toj tački uopšte ne stiže do summary handlera niti do baze.

### 2. Sledeći očekivani problem posle ispravke rute

Ispravka URL-a sama po sebi neće dati rezultate. Singularna ruta trenutno:

1. poziva `loadPreparationItems()`;
2. čita podatke iz Upstash-a, osim kada je eksplicitno uključen testni `fallback` režim;
3. poziva `createPreparationSummary(items)`;
4. dobija `SummaryNotImplementedError`, jer je funkcija namerno nedovršena;
5. mapira grešku u `501 SUMMARY_NOT_IMPLEMENTED`.

Zato su potrebne i ispravka browser rute i implementacija računanja. To su dva odvojena signala i treba ih proveravati tim redom: `404 -> 501 -> 200`.

### 3. Tok podataka iz baze

Planirani tok ostaje postojeći:

```text
Browser
  -> GET /api/preparation-summary
  -> api/preparation-summary.ts
  -> loadPreparationItems()
  -> readRedisRuntimeConfig()
  -> readPreparationItemsFromUpstash()
  -> read-only Redis GET za UPSTASH_PREPARATION_KEY
  -> parsePreparationItems()
  -> createPreparationSummary()
  -> { data: { total, completed, remaining, percentage } }
  -> prikaz u browseru
```

Upstash token ostaje isključivo na serveru. Browser dobija samo javni JSON rezultat.

### 4. Deployment problem koji bi sakrio ispravku

`npm run build` pravi provereni browser output u `dist/`, ali `vercel.json` trenutno postavlja `outputDirectory` na `public`. Zbog toga Vercel nije usmeren na isti output koji lokalni build i `check-dist` proveravaju. Čak i ispravan TypeScript source može ostati neobjavljen ili objavljen bez očekivanih kompajliranih asseta.

### 5. Testovi i početni dokaz

Trenutni rezultat `npm.cmd test`:

- 9 testova prolazi;
- 0 testova pada;
- 1 test je `todo`: summary test.

`node scripts/check-starter.mjs` potvrđuje sva tri namerna starter stanja: pluralnu browser putanju, summary `todo`/izuzetak i Vercel `public` output.

Read-only pokušaj učitavanja Upstash podataka iz trenutnog izvršnog okruženja završio se sa `ExternalServiceError: Upstash servis nije dostupan.` Pošto repository namerno skriva niži mrežni uzrok, ovim nije utvrđeno da li je problem DNS/mrežno ograničenje okruženja, dostupnost instance ili konfiguracija. Ovu proveru treba ponoviti posle rotacije tokena i tokom lokalnog smoke testa. Ona nije uzrok trenutno viđenog summary 404 odgovora.

### 6. Bezbednosni nalaz van očekivana četiri fajla

Lokalni `.env` postoji i nije praćen Git-om, ali trenutni `.gitignore` ne sadrži pravila za `.env`, `dist/` i `node_modules/`. Sva tri se zato vide kao untracked, suprotno README kriterijumu da ne budu commit-ovani.

Tokom dijagnostike read-only Upstash token je prikazan u izlazu lokalne pretrage. Vrednost se ne ponavlja u ovom dokumentu. Token treba smatrati kompromitovanim i rotirati ga pre daljeg rada ili deployment-a. Rotacija je spoljašnja bezbednosna radnja koju korisnik obavlja u Upstash-u; nije izmena koda.

## Plan implementacije sa zasebnim odobrenjima

### Faza 0 — bezbednosni preduslov

#### Promena 0A: rotacija read-only Upstash tokena

- Korisnik opoziva postojeći read-only token i generiše novi sa najmanjim potrebnim ovlašćenjima.
- Korisnik ažurira samo lokalni `.env` i kasnije Vercel environment variable.
- Novi token se ne šalje u razgovor, ne ispisuje u terminal i ne stavlja u browser kod.
- Prelazni kriterijum: stari token više nije važeći, a novi postoji samo u tajnim konfiguracijama.

Odobrenje/akcija: zahteva eksplicitnu potvrdu korisnika; agent neće menjati `.env` niti Upstash nalog.

#### Promena 0B: zaštita lokalnih i generisanih fajlova

Predloženi fajl: `.gitignore`.

- Dodati `.env`, `dist/` i `node_modules/`.
- Zadržati postojeća pravila.
- Proveriti da `git status --short` više ne nudi ove lokalne/generisane fajlove za commit.

Obrazloženje dodatnog, petog fajla: promena nije deo tri starter zadatka, ali je konkretno potrebna da bi se ispunio README bezbednosni kriterijum i sprečio slučajan commit tajne. Biće traženo zasebno odobrenje; može biti odložena, ali deployment/commit ne treba raditi pre nje.

### Faza 1 — ispravka browser-to-service povezivanja

Predloženi fajl: `client/apiClient.ts`.

- U `getPreparationSummary()` promeniti samo putanju sa pluralne na postojeću singularnu rutu `/api/preparation-summary`.
- Ne menjati HTTP metod, envelope tipove, prikaz greške ili API ugovor.
- Ne praviti novu API rutu i ne preimenovati postojeću serverless funkciju.

Očekivani međurezultat:

- browser više ne dobija `404 API ruta ne postoji`;
- dok summary još nije implementiran, dobija očekivani `501 SUMMARY_NOT_IMPLEMENTED`;
- Network kartica potvrđuje singularni request URL.

Odobrenje: tražiti pre izmene samo ovog fajla.

### Faza 2 — server-side računanje

Predloženi fajl: `server/preparationSummary.ts`.

Implementirati čistu funkciju nad prosleđenim nizom:

- `total = items.length`;
- `completed = broj stavki za koje je completed === true`;
- `remaining = total - completed`;
- `percentage = 0` kada je `total === 0`;
- u ostalim slučajevima `percentage` je najbliži ceo broj za `completed / total * 100`.

Funkcija ne sme da:

- menja ulazni niz ili njegove stavke;
- čita environment variables;
- poziva bazu ili mrežu;
- menja postojeći `PreparationSummary` ugovor;
- vraća decimalni procenat ili deli nulom.

Očekivani primeri:

| Ulaz | total | completed | remaining | percentage |
|---|---:|---:|---:|---:|
| 8 stavki, 3 završene | 8 | 3 | 5 | 38 |
| prazan niz | 0 | 0 | 0 | 0 |

Pošto API handler već prvo učitava stavke preko `loadPreparationItems()`, nije potrebna promena handlera, service sloja ili repository-ja.

Odobrenje: tražiti pre izmene samo ovog fajla.

### Faza 3 — zamena `todo` testa stvarnim testovima

Predloženi fajl: `tests/preparationSummary.test.ts`.

- Ukloniti `test.todo`.
- Dodati test za seed oblik sa osam stavki i tri završene; očekivati tačno `{ total: 8, completed: 3, remaining: 5, percentage: 38 }`.
- Dodati test za prazan niz; očekivati četiri nule.
- Koristiti postojeći Node test/assert stil bez nove biblioteke.
- Testirati javno ponašanje funkcije, ne detalje implementacije.

Odobrenje: tražiti pre izmene samo ovog fajla.

### Faza 4 — usklađivanje Vercel output-a

Predloženi fajl: `vercel.json`.

- Zadržati postojeći `buildCommand`.
- Promeniti samo `outputDirectory` sa `public` na `dist`.
- Ne menjati provider, serverless `api/` raspored ili build arhitekturu.

Očekivani rezultat: Vercel objavljuje isti kompajlirani browser output koji su prethodno proverili `npm run build` i `scripts/check-dist.mjs`.

Odobrenje: tražiti pre izmene samo ovog fajla.

## Redosled verifikacije

Svaka provera se pokreće tek nakon odobrene promene kojoj pripada. Provere ne smeju menjati source fajlove.

1. Posle promene rute:
   - pretražiti source i potvrditi da browser koristi samo singularnu summary putanju;
   - izgraditi svež `dist/`, jer browser ne izvršava direktno `client/*.ts`;
   - u Network tabu ili lokalnim zahtevom potvrditi da je signal prešao sa `404` na `501` dok faza 2 još nije završena.
2. Posle računanja i testova:
   - pokrenuti ciljani summary test;
   - pokrenuti `npm.cmd test` i zahtevati 0 fail / 0 todo;
   - pokrenuti TypeScript proveru bez emitovanja.
3. Posle Vercel izmene:
   - pokrenuti `npm.cmd run build`;
   - potvrditi `dist/` inventar: statički fajlovi i `assets/*.js`, bez `.env`, tokena, TypeScript source-a, mapa, server koda ili testova;
   - pokrenuti `npm.cmd run verify:solution`.
4. Lokalna integracija sa fallback podacima:
   - očekivati da sve smoke provere prođu sa summary statusom `200` i rezultatom `8 / 3 / 5 / 38`.
5. Lokalna integracija sa pravim Upstash podešavanjem:
   - potvrditi da health prijavljuje pronađenu servisnu konfiguraciju;
   - potvrditi `200` i osam stavki sa `/api/preparation-items`;
   - potvrditi `200` i očekivani summary sa `/api/preparation-summary`;
   - ako Upstash i dalje nije dostupan, sačuvati status/bezbednu grešku bez tokena i odvojeno dijagnostikovati mrežu, URL, token i ključ. Ne uvoditi fallback kao prikriveno produkciono rešenje.
6. Pre commita:
   - pregledati `git diff` i `git status`;
   - očekivani osnovni diff ograničiti na četiri starter fajla, uz zasebno odobreni `.gitignore` i ovaj planski dokument;
   - potvrditi da `.env`, `dist/`, `node_modules/` i `.vercel/` nisu praćeni.
7. Posle korisnikovog zasebnog odobrenja za deployment:
   - postaviti rotirane environment variables u Vercel-u;
   - objaviti branch;
   - pokrenuti remote smoke prema javnom URL-u sa očekivanim summary statusom `200`.

## Kriterijumi prihvatanja

- Browser šalje `GET /api/preparation-summary`, bez pluralne varijante.
- Summary API vraća `200` i postojeći `{ data: PreparationSummary }` ugovor.
- Seed rezultat je tačno `total=8`, `completed=3`, `remaining=5`, `percentage=38`.
- Prazan niz vraća četiri nule.
- Podaci se učitavaju kroz postojeći `loadPreparationItems()` i read-only Upstash `GET` tok; nema Redis write operacija.
- `npm test` prolazi bez `todo` testova.
- `npm run build` pravi čist `dist/`.
- `npm run verify:solution` prolazi.
- Lokalni fallback smoke i lokalni pravi Upstash smoke prolaze sa statusom `200`.
- Vercel koristi `dist` i remote smoke prolazi sa statusom `200`.
- Nijedna tajna nije u Git-u, `dist/` sadržaju, browser bundle-u, logu ili odgovoru API-ja.
- Stari, izloženi read-only token je opozvan pre commita/deployment-a.

## Rizici i način kontrole

| Rizik | Kontrola |
|---|---|
| Ispravi se samo 404, pa korisnik dobije 501 | Implementirati i testirati summary kao zasebnu fazu. |
| Source je ispravljen, ali browser i dalje koristi stari bundle | Posle client izmene obavezno napraviti svež `dist/`; ne uređivati `dist/` ručno. |
| Lokalni fallback prikrije kvar Upstash-a | Pokrenuti odvojene fallback i real-configuration smoke provere. |
| Vercel objavi `public/` umesto kompajliranog output-a | Uskladiti `outputDirectory` sa `dist/` i proveriti javni URL. |
| Token dospe u Git ili log | Rotirati token, dopuniti `.gitignore`, ne ispisivati vrednosti i pregledati diff/status. |
| Obim se proširi na nepotrebne slojeve | Ne menjati API handler, repository, seed, UI ili ugovor bez novog konkretnog dokaza i odobrenja. |

## Predloženi approval gate-ovi

Implementacija ne počinje automatski. Nakon što korisnik pročita plan, sledeće odluke se traže pojedinačno i navedenim redom:

1. potvrda da je stari Upstash token rotiran;
2. odobrenje za `.gitignore`;
3. odobrenje za `client/apiClient.ts`;
4. odobrenje za `server/preparationSummary.ts`;
5. odobrenje za `tests/preparationSummary.test.ts`;
6. odobrenje za `vercel.json`;
7. zasebno odobrenje za commit/push/deployment, samo ako ih korisnik želi.

Ako bilo koja provera otkrije potrebu za drugim fajlom, rad se zaustavlja, iznosi se konkretan dokaz i traži novo odobrenje pre te dodatne promene.
