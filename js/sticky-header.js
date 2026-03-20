// Sticky header: clone the main header and reveal it after the first fold scrolls out of view.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");

  if (!header) {
    return;
  }

  // Reuse the existing header markup so the sticky version stays visually identical.
  const stickyHeader = header.cloneNode(true);
  stickyHeader.classList.add("site-header-sticky");
  stickyHeader.setAttribute("aria-hidden", "true");

  const interactiveElements = Array.from(stickyHeader.querySelectorAll("a, button"));
  let isVisible = false;
  let revealThreshold = 0;
  let isTicking = false;

  // Keep hidden sticky links out of the tab order until the bar is visible.
  function setInteractiveState(visible) {
    if ("inert" in stickyHeader) {
      stickyHeader.inert = !visible;
    }

    interactiveElements.forEach((element) => {
      if (visible) {
        element.removeAttribute("tabindex");
      } else {
        element.setAttribute("tabindex", "-1");
      }
    });
  }

  // Reveal the sticky bar once the initial viewport content has mostly scrolled away.
  function computeRevealThreshold() {
    revealThreshold = Math.max(window.innerHeight - header.offsetHeight, header.offsetHeight * 2);
  }

  // Sync the cloned header visibility with the current scroll position.
  function syncStickyHeader() {
    const shouldShow = window.scrollY > revealThreshold;

    if (shouldShow === isVisible) {
      return;
    }

    isVisible = shouldShow;
    stickyHeader.classList.toggle("is-visible", shouldShow);
    stickyHeader.setAttribute("aria-hidden", String(!shouldShow));
    setInteractiveState(shouldShow);
  }

  // Batch scroll updates into the next animation frame for smoother scrolling performance.
  function requestSync() {
    if (isTicking) {
      return;
    }

    isTicking = true;
    window.requestAnimationFrame(() => {
      syncStickyHeader();
      isTicking = false;
    });
  }

  setInteractiveState(false);
  document.body.appendChild(stickyHeader);
  computeRevealThreshold();
  syncStickyHeader();

  window.addEventListener("scroll", requestSync, { passive: true });
  window.addEventListener("resize", () => {
    computeRevealThreshold();
    syncStickyHeader();
  });
});
