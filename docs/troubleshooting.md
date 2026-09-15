# Tipični problemi

| Signal | Provera i najmanja ispravka |
| --- | --- |
| `npm ci` odbija instalaciju | Koristi Node 24.x i granu sa commit-ovanim `package-lock.json`. Originalni starter ga nema; grana rešenja ga sadrži. |
| `verify:starter` pada posle implementacije | Ta komanda očekuje namerni 501 i starter stanje. Za završeno rešenje koristi `npm run verify:solution`. Isto važi za `verify:local`, koji je alias za starter. |
| Health radi, a podaci ne rade | Health proverava prisustvo/format konfiguracije, ne uspeh čitanja Redis-a. Proveri konkretan odgovor `/api/preparation-items`. |
| Poruka o nedostajućoj konfiguraciji ili placeholder-u | Proveri lokalni `.env` ili serverske promenljive odgovarajućeg Vercel okruženja. Pokreni ponovo lokalni server nakon izmene. |
| Upstash HTTP greška | Proveri read-only URL/token, dostupnost servisa i postojeći ključ. Ne objavljuj token u logu, commitu ili browser kodu. |
| Seed ključ ne postoji ili nije validan JSON | Proveri `UPSTASH_PREPARATION_KEY` i ugovor sa tutorovim pripremljenim izvorom; ne menjaj seed da bi test prošao. |
| Browser summary ne radi, direktni API radi | Proveri da client koristi `/api/preparation-summary`, u jednini. |
| Summary vraća 501 | Pokrenuta je starter verzija. Proveri aktivnu granu/commit i restartuj server posle implementacije. |
| HTML se učita, ali JS vraća 404 | Proveri `/assets/main.js`, uspeh build-a i Vercel `outputDirectory: dist`. |
| `EADDRINUSE` | Izaberi slobodan port za ručni server i isti port u `BASE_URL`. `verify:solution` koristi fiksni 4174; ne zaustavljaj tuđe procese naslepo. |
| `verify:solution` prolazi, pravi servis ne radi | Solution komanda koristi fallback. Pokreni zaseban smoke sa stvarnim Upstash-om. |
| Javna aplikacija pokazuje `local` | To je `APP_ENV` prikazna vrednost iz serverske konfiguracije, nije dokaz lokacije izvršavanja. |
| Lokalni i javni sajt se razlikuju | Uporedi commit deployment-a i svih pet fajlova iz `dist/`; proveri da li gledaš pravi Preview/Production URL. |

Za prijavu problema sačuvaj komandu, verziju Node-a, aktivnu granu/commit, prvi konkretan HTTP status ili grešku i očekivani rezultat. Izostavi tajne. Ako isti problem traje oko 20 minuta, prati ograničenje iz README-a: sačuvaj dokaz i vrati se na poznato zeleno stanje bez brisanja tuđih ili necommit-ovanih izmena.
