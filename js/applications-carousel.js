// Applications carousel: move the track one card at a time and clamp it within the visible viewport.
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".applications-section");

  if (!section) {
    return;
  }

  const carousel = section.querySelector("[data-applications-carousel]");
  const prevButton = section.querySelector("[data-carousel-prev]");
  const nextButton = section.querySelector("[data-carousel-next]");

  if (!carousel || !prevButton || !nextButton) {
    return;
  }

  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(track.children);
  const zoomSurface = carousel.querySelector("[data-carousel-zoom-surface]");

  if (!viewport || !track || slides.length === 0) {
    return;
  }

  const zoom =
    window.createCarouselImageZoom && zoomSurface
      ? window.createCarouselImageZoom({
          container: carousel,
          previewSurface: zoomSurface,
        })
      : null;

  const slideCards = slides
    .map((slide) => ({
      card: slide,
      image: slide.querySelector(".application-card-image"),
    }))
    .filter(({ image }) => Boolean(image));

  slideCards.forEach(({ card, image }) => {
    card.addEventListener("mouseenter", (event) => {
      if (event.pointerType && event.pointerType !== "mouse") {
        return;
      }

      zoom?.showFromImage(image);
    });

    card.addEventListener("mousemove", (event) => {
      zoom?.previewFromEvent(event, card, image);
    });

    card.addEventListener("mouseleave", () => {
      zoom?.hide();
    });
  });

  let index = 0;

  // Measure one slide movement using the first card width plus the grid gap.
  function getStep() {
    const firstSlide = slides[0];
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");

    return slideWidth + gap;
  }

  function getMaxTranslate() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

  // Keep a small desktop lead-in so the first card aligns with the design framing.
  function getBaseOffset() {
    if (window.innerWidth <= 900) {
      return 0;
    }

    return Math.min(getStep() * 0.35, getMaxTranslate() / 2);
  }

  function getMaxIndex() {
    const step = getStep();
    const available = Math.max(0, getMaxTranslate() - getBaseOffset());

    if (step === 0 || available === 0) {
      return 0;
    }

    return Math.ceil(available / step);
  }

  // Disable navigation at the ends so the track never overshoots.
  function syncButtons(translateX, baseOffset) {
    prevButton.disabled = translateX <= baseOffset + 1;
    nextButton.disabled = translateX >= getMaxTranslate() - 1;
  }

  // Recompute the translate value from the current index whenever the layout changes.
  function render() {
    const step = getStep();
    const maxIndex = getMaxIndex();
    const baseOffset = getBaseOffset();
    index = Math.max(0, Math.min(index, maxIndex));
    const translateX = Math.min(baseOffset + index * step, getMaxTranslate());

    track.style.transform = `translateX(-${translateX}px)`;
    syncButtons(translateX, baseOffset);
  }

  prevButton.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    zoom?.hide();
    render();
  });

  nextButton.addEventListener("click", () => {
    index = Math.min(getMaxIndex(), index + 1);
    zoom?.hide();
    render();
  });

  window.addEventListener("resize", () => {
    zoom?.hide();
    index = Math.min(index, getMaxIndex());
    render();
  });

  render();
});
