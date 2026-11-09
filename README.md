# PinkBulbTCG

Persoonlijke Pokémon TCG-hobbysite voor GitHub Pages.

## Marktplaats-aanbod beheren

Je hoeft alleen de links te beheren in `data/marktplaats-links.json`. Zet elke Marktplaats-advertentielink tussen dubbele aanhalingstekens, met komma's ertussen. Je hoeft titel, prijs of foto niet zelf over te typen.

GitHub Actions voert dagelijks `scripts/update_marktplaats.py` uit. Het script probeert de titel, prijs en eerste afbeelding uit de openbare advertentiepagina te halen en schrijft de resultaten naar `data/marktplaats-data.json`. Je kunt het ook handmatig starten via GitHub → Actions → Update Marktplaats listings → Run workflow.

### Belangrijke beperkingen

- Marktplaats kan automatische verzoeken blokkeren of de pagina-opmaak wijzigen. Dan kan een advertentie als 'gegevens niet opgehaald' verschijnen; dat betekent niet automatisch dat hij verkocht is.
- Alleen een duidelijke 404/410 of herkenbare verwijdermelding wordt als 'verkocht of verwijderd' weergegeven. Een netwerkfout of blokkade wordt niet onterecht als verkocht bestempeld.
- De prijs en afbeelding worden alleen getoond als Marktplaats ze publiek beschikbaar maakt in de pagina-metadata.
- Het script gebruikt geen officiële API en biedt daarom geen gegarandeerde uptime of volledigheid. Voor een stabiele officiële koppeling is API-toegang van Marktplaats nodig.

## Website publiceren

Upload alle bestanden en mappen naar de hoofdmap van `rasblackfire/pinkbulbtcg` en commit de wijzigingen. GitHub Pages publiceert de website. Zorg dat GitHub Actions aan staat en dat de repository Actions schrijfrechten heeft (workflow permissions: Read and write permissions).

## Overige onderdelen

- Testfase-melding
- Instagram-post en profiel
- VaultX-affiliatelink met 10% korting
- PokéRadar-evenementenagenda
- StockMonster-winkeldirectory
