# Dokazi za predaju — Week 2

Provera: 12. septembar 2026, Europe/Belgrade. Zatečena implementacija: commit `8d72c72f465eb093c47b1425571837ba5ce09dcb`; tri zadate ispravke potiču iz `5b199f1`. Naknadna dopuna dokumentacije ne menja izvršni kod.

- [Grana rešenja](https://github.com/umilutinovic25-hash/ai-bootcamp-week-2/tree/uros/week2-preparation-summary)
- [PR #1](https://github.com/Serbian-IT-Association/ai-bootcamp-week-2/pull/1)
- [Javna aplikacija](https://ai-bootcamp-week-2-wheat.vercel.app)

## Šta je zatečeno i šta je dopunjeno

Na početku ove provere implementacija, testovi, push, PR i deployment već su postojali. Ova sesija ih je ponovo proverila i dopunila nedostajuću dokumentaciju. Nije ponovo implementirala već rešene zadatke.

Dokaz za dokumentaciju van četiri zadate source/config izmene: README zahteva čitanje `docs/project-anatomy.md` i upućuje na još tri dokumenta, ali `git ls-tree -r --name-only origin/main docs` nije vratio nijedan fajl. Dodata su upravo ta četiri dokumenta.

Ranije dodatni `package-lock.json` opravdan je komandom `npm ci` iz README-a: originalni commit `7ee58a4` nema lockfile. Ranija dopuna `.gitignore` odgovara kriterijumu da `.env`, `dist/` i `node_modules/` ne budu commit-ovani. Postojeći commit `8d72c72` dodaje vreme osvežavanja u tri UI fajla; to je dodatak van minimalnog zadatka i zadržan je kao postojeći rad, bez tvrdnje da je neophodan.

## Plan i očekivanja

Originalni plan napisan pre ranije implementacije nije dostupan u ovoj proveri; ovaj dokument nije retroaktivni dokaz da je taj korak tada obavljen. Plan ove sesije bio je: proveriti postojeći diff, pokrenuti solution proveru, zasebno proveriti pravi Upstash i javni sajt, uporediti build i dopuniti dokaze.

Očekivanja: seed daje `{ total: 8, completed: 3, remaining: 5, percentage: 38 }`; prazan niz daje sve nule. Postojeći testovi dodatno pokrivaju 0%, 100%, 33% i 67%.

## Rezultati ponovljenih provera

| Provera | Rezultat |
| --- | --- |
| `node --version` | `v24.20.0` |
| `npm ci` | Uspešno; 0 prijavljenih ranjivosti u tom izvršavanju |
| `npm test` kroz `verify:solution` | 15/15 PASS, 0 fail, 0 skipped, 0 todo; typecheck prolazi |
| `npm run build` kroz `verify:solution` | PASS; svež `dist/` i kontrola inventara |
| `npm run verify:solution` | PASS; obračun, testovi, singularna ruta, Vercel output i lokalni fallback smoke |
| Lokalni fallback smoke na portu 4174 | 11/11 PASS, summary HTTP 200 |
| Lokalni pravi Upstash na portu 4183 | 11/11 PASS, summary HTTP 200 |
| Javni smoke | 11/11 PASS, summary HTTP 200 |
| Browser na javnom sajtu | Učitano osam stavki; kartica pokazuje 8 / 3 / 5 / 38% |
| Poređenje javnog i lokalnog browser output-a | Svih pet fajlova identično bajt po bajt |
| `git diff --check` | PASS |

Stvarni Upstash je proveren zasebnim serverom:

```bash
HOST=127.0.0.1 PORT=4183 PREPARATION_DATA_MODE=upstash node --env-file=.env scripts/serve.mjs
EXPECT_SUMMARY_STATUS=200 BASE_URL=http://127.0.0.1:4183 npm run smoke
EXPECT_SUMMARY_STATUS=200 BASE_URL=https://ai-bootcamp-week-2-wheat.vercel.app npm run smoke
```

`verify:solution` sam koristi fallback i ne potvrđuje stvarne kredencijale. GitHub deployment zapis `6403037471` potvrdio je uspešan Production deployment commit-a `8d72c72`. PR je u trenutku provere OPEN i MERGEABLE; merge nije uslov iz README-a i nije izvršen ovom proverom.

## Pre/posle i debugging primer

„Pre“ je utvrđeno iz originalnog source-a `7ee58a4`; originalna verzija nije ponovo objavljivana niti je njen browser Network snimak napravljen u ovoj sesiji.

| Problem | Pre, originalni source | Posle, provereno rešenje |
| --- | --- | --- |
| Browser ruta | Klijent poziva `/api/preparation-summaries`, a handler postoji samo za jedninu; lokalni server za nepoznati API vraća 404. | Klijent poziva `/api/preparation-summary`; HTTP 200 i kartica 8 / 3 / 5 / 38%. |
| Summary | Funkcija baca `SummaryNotImplementedError`, koji API mapira u 501. | Izračunat odgovor HTTP 200; seed i prazan niz pokriveni testovima. |
| Deployment output | `outputDirectory: public`; kompajlirani JS nastaje u `dist/assets`, pa nije deo tog output-a. | `outputDirectory: dist`; oba JS fajla dostupna i svih pet javnih fajlova jednako lokalnom buildu. |

Za dijagnostiku razdvoji direktni API i browser: ako `/api/preparation-summary` radi, a browser prijavljuje grešku, pogledaj URL zahteva u Network panelu i uporedi sa imenom handler-a. Ako HTML radi, ali se UI ne popunjava, proveri odgovor za `/assets/main.js`, zatim `outputDirectory`. Ne menjaj Redis da bi popravio pogrešnu browser rutu.

## Inventar i tajne

```text
dist/
  assets/apiClient.js
  assets/main.js
  index.html
  sita-favicon.webp
  styles.css
```

Kontrola build-a nije našla server/API source, `.ts`, source map, `.env` ili serverske konfiguracione markere u `dist/`. Dodatno je lokalna stvarna vrednost Upstash tokena upoređena u memoriji sa sadržajem praćenih fajlova i build-a: nije pronađena, a vrednost nije ispisana. `.env`, `dist/`, `node_modules/` i `.vercel/` nisu praćeni u trenutnom Git stablu. Ovo je provera trenutnog stabla, ne tvrdnja o svim istorijskim Git objektima ili svim mogućim tajnama.

## Doprinos para i AI

Ova sesija koristi Codex za analizu postojećeg rešenja, izvršavanje provera, pregled javnog browser prikaza i pisanje dokumentacije. Ranija implementacija je zatečena; autorstvo i pojedinačni doprinosi članova para ne mogu se zaključiti samo iz Git commit-a.

Pre lične predaje svaki član para treba da potvrdi svoj konkretan doprinos i samostalno prođe [mapu projekta](project-anatomy.md). Te izjave i lično razumevanje nisu automatski verifikovani. Postojeći privatni nacrti izveštaja nisu uključeni u ovu javnu dokumentaciju. Tehnički deo i dokazi su provereni; potvrda doprinosa i razumevanja ostaje lični korak.
