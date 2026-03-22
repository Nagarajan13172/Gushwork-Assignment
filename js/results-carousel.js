// Results carousel: clone the cards on both sides so the desktop auto-scroll can loop seamlessly.
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
  let offset = 0;
  let step = 0;
  let loopWidth = 0;

  // Remove generated duplicates before rebuilding the loop on resize or mode changes.
  function removeClones() {
    track.querySelectorAll("[data-results-clone]").forEach((node) => {
      node.remove();
    });
  }

  // Mark clones so assistive tech ignores them and cleanup stays simple.
  function createClone(card) {
    const clone = card.cloneNode(true);
    clone.setAttribute("data-results-clone", "true");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  }

  function buildLoopTrack() {
    removeClones();

    const prependFragment = document.createDocumentFragment();
    const appendFragment = document.createDocumentFragment();

    // Place a copy of the full set before and after the originals to hide loop resets.
    originalCards.forEach((card) => {
      prependFragment.appendChild(createClone(card));
      appendFragment.appendChild(createClone(card));
    });

    track.prepend(prependFragment);
    track.append(appendFragment);
  }

  function getStep() {
    const firstCard = originalCards[0];
    const cardWidth = firstCard.getBoundingClientRect().width;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");

    return cardWidth + gap;
  }

  function normalizeOffset() {
    if (!loopWidth) {
      return;
    }

    const upperBound = loopWidth * 2;
    const lowerBound = loopWidth;

    while (offset >= upperBound) {
      offset -= loopWidth;
    }

    while (offset < lowerBound) {
      offset += loopWidth;
    }
  }

  // Move the track with or without animation depending on whether we are sliding or snapping.
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

    // Advance by one card at a steady interval while the desktop loop is enabled.
    intervalId = window.setInterval(() => {
      if (!isEnabled) {
        return;
      }

      offset += step;
      applyPosition(true);
    }, 2800);
  }

  function configureLoop() {
    buildLoopTrack();
    step = getStep();
    loopWidth = step * originalCards.length;

    if (step <= 0 || loopWidth <= 0) {
      return false;
    }

    offset = loopWidth;
    applyPosition(false);

    return true;
  }

  function enable() {
    isEnabled = configureLoop();

    if (!isEnabled) {
      return;
    }

    startAutoSlide();
  }

  function disable() {
    stopAutoSlide();
    isEnabled = false;
    removeClones();
    offset = 0;
    step = 0;
    loopWidth = 0;
    track.style.left = "";
    track.style.transform = "";
    track.style.transition = "";
  }

  track.addEventListener("transitionend", () => {
    if (!isEnabled) {
      return;
    }

    // Snap back into the middle copy once we cross an edge so the loop looks continuous.
    const upperBound = loopWidth * 2;
    const lowerBound = loopWidth;

    if (offset >= upperBound) {
      offset -= loopWidth;
      applyPosition(false);
    } else if (offset < lowerBound) {
      offset += loopWidth;
      applyPosition(false);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (!isEnabled) {
      return;
    }

    if (document.hidden) {
      stopAutoSlide();
      return;
    }

    if (loopWidth <= 0) {
      return;
    }

    offset = Math.max(loopWidth, Math.min(offset, loopWidth * 2));
    normalizeOffset();
    applyPosition(false);
    startAutoSlide();
  });

  carousel.addEventListener("mouseenter", stopAutoSlide);
  carousel.addEventListener("mouseleave", () => {
    if (isEnabled) {
      startAutoSlide();
    }
  });

  // Disable the effect on mobile and reduced-motion setups, otherwise keep the loop running.
  function syncMode() {
    if (reducedMotion.matches || mobileBreakpoint.matches) {
      disable();
      return;
    }

    enable();
  }

  window.addEventListener("resize", syncMode);
  reducedMotion.addEventListener("change", syncMode);
  mobileBreakpoint.addEventListener("change", syncMode);

  syncMode();
});
