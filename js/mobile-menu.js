document.addEventListener("DOMContentLoaded", () => {
  const headers = Array.from(document.querySelectorAll(".site-header"));

  if (!headers.length) {
    return;
  }

  headers.forEach((header) => {
    const toggle = header.querySelector(".menu-toggle");
    const nav = header.querySelector(".site-nav");

    if (!toggle || !nav) {
      return;
    }

    const menuLinks = Array.from(nav.querySelectorAll("a"));

    function closeMenu() {
      header.classList.remove("is-menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
      header.classList.add("is-menu-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
    }

    function isMobileView() {
      return window.matchMedia("(max-width: 767px)").matches;
    }

    toggle.addEventListener("click", () => {
      if (!isMobileView()) {
        return;
      }

      if (header.classList.contains("is-menu-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (isMobileView()) {
          closeMenu();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!isMobileView() || !header.classList.contains("is-menu-open")) {
        return;
      }

      if (header.contains(event.target)) {
        return;
      }

      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (!isMobileView()) {
        closeMenu();
      }
    });

    closeMenu();
  });
});
