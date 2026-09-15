# Pokretanje i deployment

## Lokalno pokretanje

Koristi Node.js 24.x, pa u korenu projekta pokreni:

```bash
npm ci
npm run verify:solution
```

Na prvom pokretanju napravi `.env` iz `.env.example` samo ako `.env` ne postoji. Sačuvaj postojeću konfiguraciju. Upiši tutorove read-only Upstash vrednosti lokalno, zatim:

```bash
npm start
```

U drugom terminalu:

```bash
EXPECT_SUMMARY_STATUS=200 BASE_URL=http://127.0.0.1:4173 npm run smoke
```

Za stvarnu servisnu proveru `PREPARATION_DATA_MODE` ne sme biti `fallback`. Ako je podrazumevani port zauzet, koristi npr. `PORT=4183 npm start` i isti port u `BASE_URL`.

## Postojeći Vercel projekat

Rešenje je već objavljeno na [javnoj aplikaciji](https://ai-bootcamp-week-2-wheat.vercel.app). Kod za predaju je na grani [`uros/week2-preparation-summary`](https://github.com/umilutinovic25-hash/ai-bootcamp-week-2/tree/uros/week2-preparation-summary), a [PR #1](https://github.com/Serbian-IT-Association/ai-bootcamp-week-2/pull/1) vodi ka izvornom repozitorijumu.

Koristi postojeće povezivanje sa Vercel-om i proveri da deployment odgovara željenom commit-u. Podešavanja u ovom projektu su:

| Podešavanje | Vrednost |
| --- | --- |
| Root directory | Koren repozitorijuma |
| Node | 24.x |
| Build command | `npm run build` |
| Output directory | `dist` |
| Servisna konfiguracija | Serverske environment variables iz `.env.example` |

Stvarne Upstash vrednosti moraju biti podešene za okruženje deployment-a. Lokalni `.env` se ne šalje u Git. Koristi tutorov read-only token i postojeći ključ; ne pravi novi Redis i ne menjaj seed. `APP_ENV` je prikazna oznaka: tekst `local` na javnom sajtu sam po sebi ne znači da sajt radi lokalno.

Pre slanja izmena:

```bash
npm run verify:solution
git diff --check
git diff
git status --short
```

Push na povezanu granu može pokrenuti novi deployment. U Vercel projektu proveri status, commit i da li je željeni rezultat Preview ili Production. Ne kopiraj ručno fajlove u `dist/` i ne prebacuj output na `public/`.

## Provera javnog rezultata

```bash
EXPECT_SUMMARY_STATUS=200 BASE_URL=https://ai-bootcamp-week-2-wheat.vercel.app npm run smoke
```

Očekivanje je 11/11 PASS i summary `8 / 3 / 5 / 38`. Otvori sajt, sačekaj listu i summary, pa pritisni „Osveži podatke“. Kartica treba da prikaže iste vrednosti, a browser da koristi `/api/preparation-summary`.

Javni browser fajlovi su `index.html`, `styles.css`, `sita-favicon.webp`, `assets/main.js` i `assets/apiClient.js`. Njihov sadržaj može da se uporedi sa svežim lokalnim build-om. To dokazuje jednakost browser output-a; serverski kod se proverava API i smoke zahtevima.
