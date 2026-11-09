// Mobiel navigatiemenu voor PinkBulbTCG
const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

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

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMenu();
  });
}
