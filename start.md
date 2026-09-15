# Priprema za intervju — trenutno stanje

Projekat je mala web aplikacija za prikaz stavki za pripremu intervjua. Koristi TypeScript, običan HTML/CSS i Node.js, bez frontend frameworka. Podaci se samo čitaju: korisnik ne može da dodaje, menja ili označava stavke kao završene.

## Šta je implementirano

- Stranica sa listom stavki, oznakama završenosti, informacijama o okruženju i dugmetom „Osveži podatke“. Postoje poruke za učitavanje i greške, kao i pripremljena kartica za pregled napretka.
- `GET /api/health` vraća javne informacije o okruženju i proverava prisustvo/ispravnost konfiguracije, ali ne proverava vezu sa Redisom.
- `GET /api/preparation-items` vraća listu. Parametri `?completed=true` i `?completed=false` filtriraju stavke, a `?id=1` vraća pojedinačnu stavku. Ove mogućnosti postoje u API-ju; interfejs trenutno prikazuje celu listu.
- Serversko čitanje iz Upstash Redis-a, validacija podataka (`id`, `title`, `completed`) i obrada grešaka. Postoji i eksplicitni režim `PREPARATION_DATA_MODE=fallback` sa osam lokalnih stavki, od kojih su tri završene; nije automatska zamena pri grešci servisa.
- Lokalni HTTP server, build skripte, testovi i smoke provere, kao i početna Vercel konfiguracija.

## Kako program funkcioniše

Pri otvaranju stranice ili kliku na osvežavanje, `client/main.ts` paralelno pokreće zahteve za stanje servisa, listu i pregled napretka preko `client/apiClient.ts`. Rezultati se prikazuju nezavisno, pa greška pregleda ne sprečava prikaz liste.

Tok podataka je: **browser → API ruta u `api/` → servis u `server/` → Upstash Redis → JSON odgovor → prikaz na stranici**. Server čita JSON niz sa ključa `week2:preparation-items` (podrazumevana vrednost), proverava njegov sadržaj i vraća podatke. Redis poziv koristi HTTP POST koji prenosi Redis komandu `GET`; nema upisa. Pristupni token ostaje na serveru.

`npm run build` čisti `dist/`, prevodi browser TypeScript u `dist/assets/` i kopira statičke fajlove iz `public/`. Lokalni server služi taj izlaz i obrađuje API zahteve; serverski kod se ne kopira u browser paket.

## Šta još nije završeno

1. `server/preparationSummary.ts` još baca grešku: nakon uspešnog učitavanja podataka, `/api/preparation-summary` vraća `501 SUMMARY_NOT_IMPLEMENTED`. Računanje ukupnog, završenog, preostalog i procenta nije implementirano; pripadajući test je `todo`.
2. Browser poziva pogrešnu rutu `/api/preparation-summaries` umesto `/api/preparation-summary`, pa lokalno dobija `404`.
3. `vercel.json` navodi `public` kao izlazni folder, iako build pravi kompletan browser sadržaj u `dist/`.

## Lokalno pokretanje

Uz Node.js 24.x, iz foldera projekta:

```powershell
npm ci
npm start
```

`npm start` pravi build, učitava postojeći `.env` i pokreće aplikaciju na `http://127.0.0.1:4173`. Za proveru tipova i testove služi `npm test`, a za proveru build-a `npm run build`.

Ovaj pregled je zasnovan na čitanju koda; testovi i veza sa Upstash servisom nisu pokretani tokom njegovog pisanja.
