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
  let cropOffset = 0;

  function removeClones() {
    track.querySelectorAll("[data-results-clone]").forEach((node) => {
      node.remove();
    });
  }

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

  function getInitialOffset() {
    return loopWidth + cropOffset;
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
    cropOffset = step * 0.5;
    offset = getInitialOffset();
    applyPosition(false);
  }

  function enable() {
    isEnabled = true;
    configureLoop();
    startAutoSlide();
  }

  function disable() {
    stopAutoSlide();
    isEnabled = false;
    removeClones();
    offset = 0;
    step = 0;
    loopWidth = 0;
    cropOffset = 0;
    track.style.left = "";
    track.style.transform = "";
    track.style.transition = "";
  }

  track.addEventListener("transitionend", () => {
    if (!isEnabled) {
      return;
    }

    const upperBound = loopWidth * 2 + cropOffset;
    const lowerBound = cropOffset;

    if (offset >= upperBound - 1) {
      offset -= loopWidth;
      applyPosition(false);
    } else if (offset <= lowerBound - 1) {
      offset += loopWidth;
      applyPosition(false);
    }
  });

  carousel.addEventListener("mouseenter", stopAutoSlide);
  carousel.addEventListener("mouseleave", () => {
    if (isEnabled) {
      startAutoSlide();
    }
  });

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
