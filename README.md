# PinkBulbTCG

Persoonlijke Pokémon TCG-hobbysite voor GitHub Pages (pinkbulbtcg.nl).

## Mapindeling

Zet de mappen precies zo in de hoofdmap van de repository. Als de mappen plat worden geüpload, werken de Marktplaats-koppeling en de dagelijkse update niet.

```
index.html, style.css, script.js, CNAME, README.md
data/        alle inhoud van de site (zie hieronder)
scripts/     update_marktplaats.py
.github/workflows/update-marktplaats.yml
```

Upload mappen door ze in één keer naar GitHub te slepen (niet als zipbestand), of gebruik GitHub Desktop.

## Inhoud aanpassen

Je past de site aan door alleen de bestanden in `data/` te bewerken. Let op de komma's tussen items en dubbele aanhalingstekens rond tekst.

### Beurzen en events: `data/events.json`

```json
{
  "title": "Pokémon ruildag Utrecht",
  "date": "2026-12-06",
  "endDate": "2026-12-07",
  "type": "ruildag",
  "city": "Utrecht",
  "province": "Utrecht",
  "venue": "Café De Hoek",
  "time": "11:00 – 16:00",
  "price": "Gratis",
  "url": "https://..."
}
```

Verplicht zijn `title` en `date` (jaar-maand-dag). `endDate` is voor meerdaagse evenementen. `type` is `beurs`, `ruildag`, `prerelease`, `toernooi` of `overig`. De rest is optioneel. Evenementen waarvan de datum voorbij is, verdwijnen vanzelf uit de lijst.

### Winkels: `data/stores.json`

```json
{
  "name": "Kaartenhoek",
  "city": "Utrecht",
  "province": "Utrecht",
  "address": "Voorbeeldstraat 1",
  "note": "Speeltafels aanwezig",
  "url": "https://..."
}
```

Verplicht is alleen `name`. Gebruik voor `province` overal dezelfde schrijfwijze, dan werkt het provinciefilter goed.

### Blogs en tips: `data/posts.json`

Elk item heeft `section` (`blog` of `tips`), `tag`, `emoji`, `title`, `excerpt`, `date` en `body` (een lijstje alinea's). De drie blogposts met `"voorbeeld": true` zijn voorbeelden: vervang ze door je eigen verhalen en haal die regel weg. De nieuwste staat bovenaan.

### Marktplaats-advertenties: `data/marktplaats-links.json`

De lijst bepaalt welke advertenties er staan en in welke volgorde. Het kan op twee manieren:

```json
[
  "https://link.marktplaats.nl/m1234567",
  {
    "url": "https://link.marktplaats.nl/m7654321",
    "title": "Binder met 200 kaarten",
    "price": "€ 25,00",
    "image": "https://..."
  },
  { "url": "https://link.marktplaats.nl/m1111111", "sold": true }
]
```

- Een kale link werkt zolang het script titel, prijs en foto kan ophalen.
- Vul je zelf `title`, `price` of `image` in, dan gaat dat altijd voor op wat het script ophaalt. Zo staat een advertentie er ook als Marktplaats het ophalen blokkeert.
- `"sold": true` toont de advertentie als niet meer beschikbaar.

`data/marktplaats-data.json` wordt door het script ingevuld. Die hoef je niet zelf aan te passen.

## Marktplaats-update (GitHub Actions)

`.github/workflows/update-marktplaats.yml` draait elke dag en kan ook handmatig via GitHub → Actions → Update Marktplaats listings → Run workflow. Zet bij Settings → Actions → General → Workflow permissions aan: Read and write permissions.

Het script gebruikt geen officiële API. Marktplaats kan het ophalen blokkeren, vooral vanaf de servers van GitHub. Eerder opgehaalde gegevens blijven dan staan en een advertentie wordt nooit ten onrechte als verkocht getoond. Wil je zekerheid, vul dan zelf titel, prijs en foto in.

## Bronnen

De beurzenagenda en het winkeloverzicht verwijzen naar PokéRadar en StockMonster. Neem gegevens van andere websites alleen over met hun toestemming of vul je eigen verzameling in, en laat de bronvermelding staan.

## Lokaal bekijken

De site laadt zijn gegevens met `fetch`, dus een dubbelklik op `index.html` werkt niet. Start in de map een eenvoudige server met `python3 -m http.server` en open http://localhost:8000.
