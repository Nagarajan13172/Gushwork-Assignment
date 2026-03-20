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

  if (!viewport || !track || slides.length === 0) {
    return;
  }

  let index = 0;

  function getStep() {
    const firstSlide = slides[0];
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "0");

    return slideWidth + gap;
  }

  function getMaxTranslate() {
    return Math.max(0, track.scrollWidth - viewport.clientWidth);
  }

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

  function syncButtons(translateX, baseOffset) {
    prevButton.disabled = translateX <= baseOffset + 1;
    nextButton.disabled = translateX >= getMaxTranslate() - 1;
  }

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
    render();
  });

  nextButton.addEventListener("click", () => {
    index = Math.min(getMaxIndex(), index + 1);
    render();
  });

  window.addEventListener("resize", () => {
    index = Math.min(index, getMaxIndex());
    render();
  });

  render();
});
