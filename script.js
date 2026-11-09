// Mobiel navigatiemenu voor PinkBulbTCG
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");
if (menuToggle && menu) {
  const closeMenu = () => { menu.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.setAttribute("aria-label", "Menu openen"); };
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
  });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 820) closeMenu(); });
}


// Marktplaats-links worden periodiek verwerkt door GitHub Actions.
(async function loadSalesListings() {
  const container = document.getElementById("sales-list");
  if (!container) return;
  const esc = (v) => String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  try {
    const response = await fetch("data/marktplaats-data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Listingbestand niet gevonden");
    const listings = await response.json();
    if (!Array.isArray(listings) || !listings.length) {
      container.innerHTML = '<p class="sales-empty">Er staan op dit moment geen advertenties in het overzicht.</p>';
      return;
    }
    container.innerHTML = listings.map(item => {
      let safeUrl;
      try { safeUrl = new URL(item.url); } catch { return ""; }
      if (!/(^|\.)marktplaats\.nl$/.test(safeUrl.hostname)) return "";
      if (item.status === "unavailable") {
        return `<article class="sales-card unavailable"><div class="sales-no-image">💔</div><div class="sales-card-content"><span class="tag">Niet beschikbaar</span><h3>Advertentie verkocht of verwijderd</h3><p>Deze advertentie is niet meer bereikbaar.</p><a class="btn ghost" href="${esc(safeUrl.href)}" target="_blank" rel="noopener noreferrer">Link controleren →</a></div></article>`;
      }
      if (item.status !== "active" || !item.title) {
        return `<article class="sales-card"><div class="sales-no-image">🃏</div><div class="sales-card-content"><span class="tag">Marktplaats</span><h3>Advertentie bekijken</h3><p>De advertentiegegevens konden momenteel niet worden opgehaald.</p><a class="btn" href="${esc(safeUrl.href)}" target="_blank" rel="noopener noreferrer">Bekijk op Marktplaats →</a></div></article>`;
      }
      const photo = item.image ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" referrerpolicy="no-referrer">` : '<div class="sales-no-image">🃏</div>';
      const price = item.price ? `<div class="sales-price">${esc(item.price)}</div>` : '';
      return `<article class="sales-card">${photo}<div class="sales-card-content"><span class="tag">Pokémon / TCG</span><h3>${esc(item.title)}</h3>${price}<a class="btn" href="${esc(safeUrl.href)}" target="_blank" rel="noopener noreferrer">Bekijk op Marktplaats →</a></div></article>`;
    }).filter(Boolean).join("");
    if (!container.innerHTML.trim()) container.innerHTML = '<p class="sales-empty">Geen geldige Marktplaats-links gevonden.</p>';
  } catch (error) {
    container.innerHTML = '<p class="sales-empty">De advertenties konden niet worden geladen. Bekijk <a href="https://www.marktplaats.nl/u/amanda/7986935/" target="_blank" rel="noopener">mijn Marktplaats-profiel</a>.</p>';
  }
})();
