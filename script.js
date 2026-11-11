/* PinkBulbTCG: menu, blog, tips, beurzen, winkels en Marktplaats-verkoop.
   Alle inhoud komt uit de bestanden in de map data/. */
(function () {
  "use strict";

  /* ---------- Hulpfuncties ---------- */
  const $ = (selector, root) => (root || document).querySelector(selector);
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  async function loadJSON(path) {
    try {
      const response = await fetch(path, { cache: "no-cache" });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  function safeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url : null;
    } catch (e) {
      return null;
    }
  }

  function parseDay(iso) {
    return new Date(String(iso) + "T12:00:00");
  }

  function fmtDate(iso) {
    const d = parseDay(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
  }

  function todayISO() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function fillProvinces(select, items) {
    const set = new Set(items.map((i) => i.province).filter(Boolean));
    Array.from(set).sort((a, b) => a.localeCompare(b, "nl")).forEach((p) => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      select.appendChild(option);
    });
    const wrap = select.closest(".select-wrap");
    if (wrap && !set.size) wrap.hidden = true;
  }

  const emptyBox = (html) => '<p class="sales-empty">' + html + "</p>";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Mobiel menu ---------- */
  const menuToggle = $("#menu-toggle");
  const menu = $("#menu");
  if (menuToggle && menu) {
    const closeMenu = () => {
      menu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Menu openen");
    };
    menuToggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Menu sluiten" : "Menu openen");
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 820) closeMenu(); });
  }

  /* ---------- Actief menu-item tijdens scrollen ---------- */
  const navLinks = Array.from(document.querySelectorAll("#menu a"));
  const navTargets = navLinks.map((a) => {
    const id = a.getAttribute("href").slice(1);
    return { link: a, section: id ? document.getElementById(id) : null };
  });
  let ticking = false;
  function updateNav() {
    ticking = false;
    let current = navTargets[0];
    navTargets.forEach((t) => {
      if (t.section && t.section.getBoundingClientRect().top <= 140) current = t;
    });
    navLinks.forEach((a) => {
      if (a === current.link) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
      a.classList.toggle("on", a === current.link);
    });
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateNav); }
  }, { passive: true });
  updateNav();

  /* ---------- Blog en tips ---------- */
  function setupPosts(posts, section, listId, moreId, firstCount) {
    const list = document.getElementById(listId);
    const items = posts.filter(p => p.section === section && !p.voorbeeld && p.published !== false)
      .sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0, firstCount);
    list.textContent = "";
    if (!items.length) {
      list.innerHTML = emptyBox(section === "blog"
        ? 'Mijn eerste blogberichten verschijnen binnenkort! <a href="blog.html">Neem alvast een kijkje op mijn blog →</a>'
        : 'Nieuwe tips volgen binnenkort! <a href="tips.html">Bekijk alle onderwerpen →</a>');
      return;
    }
    items.forEach(post => {
      const card = document.createElement("article");
      card.className = "card";
      const href = post.section + "/" + encodeURIComponent(post.id) + ".html";
      card.innerHTML = '<div class="thumb" aria-hidden="true">' + esc(post.emoji || "🃏") + '</div>' +
        '<div class="in"><span class="tag">' + esc(post.tag || "Artikel") + '</span>' +
        '<h3><a class="card-link" href="' + href + '">' + esc(post.title) + '</a></h3>' +
        '<p>' + esc(post.excerpt) + '</p><div class="date">' + esc(fmtDate(post.date)) + '</div>' +
        '<a class="post-readmore" href="' + href + '">Lees verder →</a></div>';
      list.appendChild(card);
    });
  }

  /* ---------- Beurzen & events ---------- */
  const EVENT_TYPES = { beurs: "Beurs", ruildag: "Ruildag", prerelease: "Prerelease", toernooi: "Toernooi", overig: "Overig" };

  function setupEvents(all) {
    const list = $("#events-list");
    const upcoming = (Array.isArray(all) ? all : [])
      .filter(e => e && e.title && e.date && (e.endDate || e.date) >= todayISO() && e.date.length === 10)
      .sort((a,b) => a.date.localeCompare(b.date)).slice(0,3);
    if (!upcoming.length) {
      list.innerHTML = emptyBox('Er staan momenteel geen komende evenementen in dit overzicht. <a href="beurzen.html">Bekijk de volledige beursagenda →</a>');
      return;
    }
    list.innerHTML = upcoming.map(e => {
      const d = parseDay(e.date);
      const when = fmtDate(e.date);
      const where = [e.city, e.province].filter(Boolean).join(", ");
      return '<article class="event"><div class="dt"><b>' + esc(d.getDate()) +
        '</b><small>' + esc(d.toLocaleDateString("nl-NL",{month:"short"}).replace(".","")) +
        '</small></div><div class="event-body"><h3>' + esc(e.title) + '</h3><p>' +
        esc(where) + '</p><p class="event-meta">' + esc(when) +
        '</p></div></article>';
    }).join("");
  }

  /* ---------- Winkels ---------- */
  function setupStores(all) {
    const list = $("#stores-list");
    const more = $("#stores-more");
    const search = $("#store-search");
    const provinceSelect = $("#store-province");
    const count = $("#store-count");
    const PAGE = 9;

    const stores = (Array.isArray(all) ? all : [])
      .filter((s) => s && s.name)
      .sort((a, b) => (a.city || "").localeCompare(b.city || "", "nl") || a.name.localeCompare(b.name, "nl"));

    let shown = PAGE;
    fillProvinces(provinceSelect, stores);
    search.addEventListener("input", () => { shown = PAGE; draw(); });
    provinceSelect.addEventListener("change", () => { shown = PAGE; draw(); });
    more.addEventListener("click", () => { shown += PAGE; draw(); });

    if (!stores.length) {
      $(".filters", list.closest("section")).hidden = true;
    }

    function draw() {
      const q = search.value.trim().toLowerCase();
      const province = provinceSelect.value;
      const filtered = stores.filter((s) =>
        (!province || s.province === province) &&
        (!q || [s.name, s.city, s.province].join(" ").toLowerCase().includes(q)));

      count.textContent = stores.length ? filtered.length + (filtered.length === 1 ? " winkel gevonden" : " winkels gevonden") : "";

      if (!filtered.length) {
        list.innerHTML = emptyBox(
          stores.length
            ? "Geen winkels gevonden. Probeer een andere plaats of provincie."
            : 'Mijn winkeloverzicht wordt nog gevuld. Bekijk intussen <a href="https://stockmonster.nl/stores/land/nederland/" target="_blank" rel="noopener">alle winkels bij StockMonster</a>.');
        more.hidden = true;
        return;
      }

      list.innerHTML = filtered.slice(0, shown).map((s) => {
        const url = s.url ? safeUrl(s.url) : null;
        const place = [s.city, s.province].filter(Boolean).join(", ");
        const link = url
          ? '<a class="btn ghost" href="' + esc(url.href) + '" target="_blank" rel="noopener noreferrer">Bekijk winkel →</a>'
          : "";
        return '<article class="card store"><div class="in"><span class="tag">' + esc(place || "Winkel") + "</span><h3>" +
          esc(s.name) + "</h3>" + (s.address ? "<p>" + esc(s.address) + "</p>" : "") +
          (s.note ? "<p>" + esc(s.note) + "</p>" : "") + link + "</div></article>";
      }).join("");
      more.hidden = filtered.length <= shown;
    }
    draw();
  }

  /* ---------- Marktplaats-verkoop ---------- */
  /* data/marktplaats-links.json bepaalt wat er staat en in welke volgorde.
     Een link mag een tekst zijn of een object met url, title, price, image of sold.
     Wat je zelf invult wint van wat het script automatisch ophaalt. */
  async function setupSales() {
    const container = $("#sales-list");
    const [linksRaw, dataRaw] = await Promise.all([
      loadJSON("data/marktplaats-links.json"),
      loadJSON("data/marktplaats-data.json")
    ]);

    const scraped = new Map();
    (Array.isArray(dataRaw) ? dataRaw : []).forEach((i) => { if (i && i.url) scraped.set(i.url, i); });

    const discovered = (Array.isArray(dataRaw) ? dataRaw : []).filter(i => i && i.url && i.status === "active" && /pok[eé]mon|pokemon|tcg|riftbound|booster|elite.trainer|toploader|binder/i.test((i.title || "") + " " + i.url)).map(i => ({url:i.url}));
    const links = [...(Array.isArray(linksRaw) ? linksRaw : []), ...discovered]
      .map((l) => (typeof l === "string" ? { url: l } : l))
      .filter((l, index, arr) => l && typeof l.url === "string" && arr.findIndex(x => (typeof x === "string" ? x : x.url) === l.url) === index);

    if (linksRaw === null) {
      container.innerHTML = emptyBox('De advertenties konden niet worden geladen. Bekijk <a href="https://www.marktplaats.nl/u/amanda/7986935/" target="_blank" rel="noopener">mijn Marktplaats-profiel</a>.');
      return;
    }

    const cards = links.map((link) => {
      const url = safeUrl(link.url);
      if (!url || !/(^|\.)marktplaats\.nl$/.test(url.hostname)) return "";
      const auto = scraped.get(link.url) || {};
      const href = esc(url.href);

      if (link.sold === true || (auto.status === "unavailable" && !link.title)) {
        return '<article class="sales-card unavailable"><div class="sales-no-image" aria-hidden="true">💔</div><div class="sales-card-content"><span class="tag">Niet beschikbaar</span><h3>' +
          esc(link.title || "Advertentie verkocht of verwijderd") + "</h3><p>Deze advertentie is niet meer bereikbaar.</p></div></article>";
      }

      const title = link.title || (auto.status === "active" ? auto.title : "");
      const price = link.price || (auto.status === "active" ? auto.price : "");
      const imageUrl = safeUrl(link.image || (auto.status === "active" ? auto.image : ""));

      if (!title) return "";

      const photo = imageUrl && imageUrl.protocol === "https:"
        ? '<img src="' + esc(imageUrl.href) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
        : '<div class="sales-no-image" aria-hidden="true">🃏</div>';
      return '<article class="sales-card">' + photo + '<div class="sales-card-content"><span class="tag">Pokémon / TCG</span><h3>' +
        esc(title) + "</h3>" + (price ? '<div class="sales-price">' + esc(price) + "</div>" : "") +
        '<a class="btn" href="' + href + '" target="_blank" rel="noopener noreferrer">Bekijk op Marktplaats →</a></div></article>';
    }).filter(Boolean);

    container.innerHTML = cards.length
      ? cards.join("")
      : emptyBox("Er staan op dit moment geen advertenties in het overzicht.");
  }

  /* ---------- Alles starten ---------- */
  loadJSON("data/posts.json").then((posts) => {
    const all = Array.isArray(posts) ? posts : [];
    setupPosts(all, "blog", "blog-list", "blog-more", 3);
    setupPosts(all, "tips", "tips-list", "tips-more", 3);
  });
  loadJSON("data/events.json").then(setupEvents);
  loadJSON("data/stores.json").then(setupStores);
  // De homepage linkt naar de handmatig beheerde verkooppagina; de oude scraper wordt niet meer gestart.
})();
