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
  const reader = $("#reader");

  function openPost(post) {
    $("#reader-tag").textContent = post.voorbeeld ? "Voorbeeldpost" : (post.tag || "");
    $("#reader-title").textContent = post.title;
    $("#reader-date").textContent = fmtDate(post.date);
    const text = $("#reader-text");
    text.textContent = "";
    (post.body || []).forEach((para) => {
      const p = document.createElement("p");
      p.textContent = para;
      text.appendChild(p);
    });
    reader.showModal();
  }
  $("#reader-close").addEventListener("click", () => reader.close());
  reader.addEventListener("click", (e) => { if (e.target === reader) reader.close(); });

  function setupPosts(posts, section, listId, moreId, firstCount) {
    const list = document.getElementById(listId);
    const more = document.getElementById(moreId);
    const items = posts
      .filter((p) => p.section === section)
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    let expanded = false;

    function draw() {
      list.textContent = "";
      if (!items.length) {
        list.innerHTML = emptyBox("Hier komt binnenkort iets te lezen.");
        more.hidden = true;
        return;
      }
      items.slice(0, expanded ? items.length : firstCount).forEach((post) => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML =
          '<div class="thumb" aria-hidden="true">' + esc(post.emoji || "🃏") + "</div>" +
          '<div class="in"><span class="tag">' + esc(post.voorbeeld ? "Voorbeeldpost" : post.tag) + "</span>" +
          '<h3><button type="button" class="card-link">' + esc(post.title) + "</button></h3>" +
          "<p>" + esc(post.excerpt) + '</p><div class="date">' + esc(fmtDate(post.date)) + "</div></div>";
        $(".card-link", card).addEventListener("click", () => openPost(post));
        list.appendChild(card);
      });
      more.hidden = items.length <= firstCount;
      more.textContent = expanded ? "Minder tonen" : more.dataset.label;
    }

    more.dataset.label = more.textContent;
    more.addEventListener("click", () => { expanded = !expanded; draw(); });
    draw();
  }

  /* ---------- Beurzen & events ---------- */
  const EVENT_TYPES = { beurs: "Beurs", ruildag: "Ruildag", prerelease: "Prerelease", toernooi: "Toernooi", overig: "Overig" };

  function setupEvents(all) {
    const list = $("#events-list");
    const more = $("#events-more");
    const typeBox = $("#event-types");
    const provinceSelect = $("#event-province");
    const PAGE = 6;
    const today = todayISO();

    const upcoming = (Array.isArray(all) ? all : [])
      .filter((e) => e && e.title && e.date && (e.endDate || e.date) >= today)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    let type = "alles";
    let province = "";
    let shown = PAGE;

    const presentTypes = Array.from(new Set(upcoming.map((e) => e.type || "overig")));
    if (presentTypes.length > 1) {
      ["alles"].concat(presentTypes).forEach((t) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip";
        b.dataset.type = t;
        b.setAttribute("aria-pressed", t === "alles" ? "true" : "false");
        b.textContent = t === "alles" ? "Alles" : (EVENT_TYPES[t] || t);
        b.addEventListener("click", () => {
          type = t; shown = PAGE;
          typeBox.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c === b ? "true" : "false"));
          draw();
        });
        typeBox.appendChild(b);
      });
    } else {
      typeBox.hidden = true;
    }
    fillProvinces(provinceSelect, upcoming);
    if (!upcoming.length) $(".filters", list.closest("section")).hidden = true;
    provinceSelect.addEventListener("change", () => { province = provinceSelect.value; shown = PAGE; draw(); });
    more.addEventListener("click", () => { shown += PAGE; draw(); });

    function dateBox(e) {
      const d = parseDay(e.date);
      return '<div class="dt"><b>' + esc(d.getDate()) + "</b><small>" +
        esc(d.toLocaleDateString("nl-NL", { month: "short" }).replace(".", "")) + "</small></div>";
    }

    function draw() {
      const filtered = upcoming.filter((e) =>
        (type === "alles" || (e.type || "overig") === type) && (!province || e.province === province));

      if (!filtered.length) {
        list.innerHTML = emptyBox(
          upcoming.length
            ? "Geen evenementen gevonden met deze filters."
            : 'Er staan nog geen komende evenementen in mijn agenda. Bekijk de <a href="https://www.pokeradar.nl/evenement/" target="_blank" rel="noopener">volledige agenda bij PokéRadar</a>.');
        more.hidden = true;
        return;
      }

      list.innerHTML = filtered.slice(0, shown).map((e) => {
        const url = e.url ? safeUrl(e.url) : null;
        const when = e.endDate && e.endDate !== e.date
          ? fmtDate(e.date) + " t/m " + fmtDate(e.endDate)
          : fmtDate(e.date);
        const where = [e.venue, e.city, e.province].filter(Boolean).join(", ");
        const meta = [EVENT_TYPES[e.type] || EVENT_TYPES.overig, when, e.time, e.price].filter(Boolean).join(" · ");
        const link = url
          ? '<a class="event-link" href="' + esc(url.href) + '" target="_blank" rel="noopener noreferrer">Meer info →</a>'
          : "";
        return '<article class="event">' + dateBox(e) + '<div class="event-body"><h3>' + esc(e.title) + "</h3><p>" +
          esc(where) + "</p><p class=\"event-meta\">" + esc(meta) + "</p>" + link + "</div></article>";
      }).join("");
      more.hidden = filtered.length <= shown;
    }
    draw();
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

    const links = (Array.isArray(linksRaw) ? linksRaw : [])
      .map((l) => (typeof l === "string" ? { url: l } : l))
      .filter((l) => l && typeof l.url === "string");

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

      if (!title) {
        return '<article class="sales-card"><div class="sales-no-image" aria-hidden="true">🃏</div><div class="sales-card-content"><span class="tag">Marktplaats</span><h3>Advertentie bekijken</h3><p>De gegevens van deze advertentie zijn nu niet beschikbaar. Bekijk hem direct op Marktplaats.</p><a class="btn" href="' +
          href + '" target="_blank" rel="noopener noreferrer">Bekijk op Marktplaats →</a></div></article>';
      }

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
  setupSales();
})();
