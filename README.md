# PinkBulbTCG

Persoonlijke Pokémon TCG-hobbysite voor GitHub Pages (pinkbulbtcg.nl).

## Website onderhouden (november 2026)

**Menu en Instagram:** pas alleen `nav-menu.js` aan. De HTML-pagina's hebben een lege `<ul id="menu"></ul>` die automatisch wordt gevuld. Verander de menuknoppen niet in losse artikelen.

**Nieuws:** voeg een item toe aan `data/news.json`. De pagina `nieuws.html` gebruikt `news-feed.js` om de kaarten automatisch te tonen, op datum gesorteerd. Maak daarnaast de bijbehorende artikelpagina in `nieuws/`. Plaats afbeeldingen bij voorkeur in `nieuws/` of `assets/articles/` en verwijs er met het juiste pad naar. Verander niet handmatig de nieuwskaarten in `nieuws.html`.

**Releasekalender:** beheer items in `data/releases.json`; de pagina `releases.html` toont deze automatisch.

**Blogs en tips:** de overzichten gebruiken `data/posts.json`. Een los artikel heeft daarnaast een eigen HTML-bestand in `blog/` of `tips/`.

**Vormgeving:** `style.css` bevat de basis; `extra.css` aanvullende stijlen. Voeg een algemene aanpassing liever op één centrale plek toe dan in elke pagina afzonderlijk.

**Publiceren:** GitHub Pages publiceert na wijzigingen op `main`. De sitemap wordt automatisch bijgewerkt via `.github/workflows/update-sitemap.yml`. Bij een fout: kijk eerst naar de juiste workflow onder GitHub Actions.

**Let op:** de site is een statische website. Een nieuw artikel heeft nog steeds een eigen HTML-pagina nodig. Het menu, de nieuwskaarten en de releasekalender zijn wel centraal geregeld.

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

Veel overzichten pas je aan via de bestanden in `data/`. Voor losse artikelpagina's en het centrale menu gelden de instructies hierboven. Let op de komma's tussen items en dubbele aanhalingstekens rond tekst.

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

## Afbeeldingen bij blogs en nieuws

De foto's van artikelen staan in `assets/articles/`. Bestandsnamen bevatten kleine letters en streepjes, zonder spaties.

- **Blogoverzicht en homepage:** voeg in `data/posts.json` bij een bericht `"image": "assets/articles/naam-van-foto.jpg"` toe. Zonder foto verschijnt het bestaande pictogram.
- **Blogartikel:** gebruik in `blog/naam.html` een pad dat begint met `../assets/articles/`.
- **Nieuws:** de nieuwskaart staat voorlopig rechtstreeks in `nieuws.html`; de foto verwijst naar `assets/articles/`.
- **Nieuwe afbeeldingen:** upload ze naar `assets/articles/` en pas de verwijzing aan. Verwijder nooit een afbeelding zolang een pagina die nog gebruikt.

### Veilig publiceren

1. Maak in GitHub eerst een back-up via **Code → Download ZIP**.
2. Upload **niet de ZIP als één bestand**: pak hem uit en upload de inhoud van `pinkbulbtcg-main/` met behoud van de mappenstructuur.
3. Verwijder niet vooraf alle bestaande bestanden. Voor verplaatste foto's kun je de oude bestanden pas verwijderen nadat de nieuwe website goed werkt.
4. Controleer na de GitHub Pages-deploy homepage, blog, nieuws en enkele artikelpagina's.

Let op: bestaande inhoud en koppelingen zijn behouden. Dit is een gerichte opschoning van artikelafbeeldingen, geen volledige herbouw van de site.
