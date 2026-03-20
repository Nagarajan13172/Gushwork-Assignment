document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("[data-results-carousel]");
  const track = carousel?.querySelector("[data-results-track]");

  if (!carousel || !track) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileBreakpoint = window.matchMedia("(max-width: 640px)");
  const originalCards = Array.from(track.children);

  if (!originalCards.length) {
    return;
  }

  let intervalId = null;
  let isEnabled = false;
  let isResetting = false;
  let offset = 0;

  function removeClones() {
    track.querySelectorAll("[data-results-clone]").forEach((node) => {
      node.remove();
    });
  }

  function appendClones() {
    removeClones();

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("data-results-clone", "true");
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
  }

  function getStep() {
    const firstCard = originalCards[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");

    return cardWidth + gap;
  }

  function getInitialOffset() {
    return getStep() * 0.5;
  }

  function getLoopWidth() {
    return getStep() * originalCards.length;
  }

  function applyPosition(useTransition = true) {
    track.style.left = "0";
    track.style.transform = `translateX(-${offset}px)`;
    track.style.transition = useTransition
      ? "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)"
      : "none";
  }

  function stopAutoSlide() {
    if (intervalId) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startAutoSlide() {
    stopAutoSlide();

    intervalId = window.setInterval(() => {
      if (!isEnabled || isResetting) {
        return;
      }

      offset += getStep();
      applyPosition(true);
    }, 2800);
  }

  function enable() {
    if (isEnabled) {
      return;
    }

    appendClones();
    offset = getInitialOffset();
    isEnabled = true;
    applyPosition(false);
    startAutoSlide();
  }

  function disable() {
    stopAutoSlide();
    isEnabled = false;
    isResetting = false;
    removeClones();
    offset = 0;
    track.style.left = "";
    track.style.transform = "";
    track.style.transition = "";
  }

  function syncMode() {
    if (reducedMotion.matches || mobileBreakpoint.matches) {
      disable();
      return;
    }

    if (!isEnabled) {
      enable();
      return;
    }

    offset = getInitialOffset();
    applyPosition(false);
  }

  track.addEventListener("transitionend", () => {
    if (!isEnabled) {
      return;
    }

    const resetPoint = getInitialOffset() + getLoopWidth();

    if (offset < resetPoint) {
      return;
    }

    isResetting = true;
    offset = getInitialOffset();
    applyPosition(false);

    window.requestAnimationFrame(() => {
      isResetting = false;
      track.style.transition = "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)";
    });
  });

  carousel.addEventListener("mouseenter", stopAutoSlide);
  carousel.addEventListener("mouseleave", () => {
    if (isEnabled) {
      startAutoSlide();
    }
  });

  window.addEventListener("resize", syncMode);
  reducedMotion.addEventListener("change", syncMode);
  mobileBreakpoint.addEventListener("change", syncMode);

  syncMode();
});
