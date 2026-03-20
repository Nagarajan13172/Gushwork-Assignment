// Hero carousel: manage the main image, thumbnail navigation, and desktop hover zoom preview.
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  const mediaCard = carousel.querySelector(".hero-media-card");
  const image = carousel.querySelector("[data-hero-image]");
  const prevButton = carousel.querySelector("[data-hero-prev]");
  const nextButton = carousel.querySelector("[data-hero-next]");
  const thumbnails = carousel.querySelector("[data-hero-thumbnails]");
  const zoomSurface = carousel.querySelector("[data-hero-zoom-surface]");

  if (!mediaCard || !image || !prevButton || !nextButton || !thumbnails || !zoomSurface) {
    return;
  }

  const slides = [
    {
      src: "assets/hero.jpg",
      alt: "Mangalam HDPE pipe installation in progress",
      imagePosition: "center 48%",
      thumbnailPosition: "center 48%",
      label: "Installation overview",
    },
    {
      src: "assets/human1.jpg",
      alt: "Engineer reviewing HDPE piping operations",
      imagePosition: "center 34%",
      thumbnailPosition: "center 34%",
      label: "Operations review",
    },
    {
      src: "assets/human2.jpg",
      alt: "Quality team inspecting production output",
      imagePosition: "center 36%",
      thumbnailPosition: "center 36%",
      label: "Quality inspection",
    },
    {
      src: "assets/hero.jpg",
      alt: "Detailed HDPE pipe installation crop",
      imagePosition: "center 70%",
      thumbnailPosition: "center 70%",
      label: "Installation detail",
    },
    {
      src: "assets/human1.jpg",
      alt: "Engineer documenting pipeline specifications",
      imagePosition: "center 60%",
      thumbnailPosition: "center 60%",
      label: "Specification review",
    },
    {
      src: "assets/human2.jpg",
      alt: "Production floor monitoring and compliance checks",
      imagePosition: "center 58%",
      thumbnailPosition: "center 58%",
      label: "Production monitoring",
    },
  ];

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHoverZoom = window.matchMedia("(hover: hover) and (pointer: fine)");
  const imageAnimationClasses = [
    "is-entering-next",
    "is-entering-prev",
    "is-exiting-next",
    "is-exiting-prev",
    "hero-image-clone",
  ];

  let activeIndex = 0;
  let isAnimating = false;
  let thumbnailButtons = [];

  // Preload slide assets so the first interaction does not wait on image fetches.
  slides.forEach(({ src }) => {
    const preloadImage = new Image();
    preloadImage.src = src;
  });

  // Keep zoom focus away from the extreme edges where the preview becomes awkward.
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clearImageAnimationState(target) {
    target.classList.remove(...imageAnimationClasses);
  }

  // Update the shared hero image element with the active slide content.
  function updateImage(target, slide) {
    target.src = slide.src;
    target.alt = slide.alt;
    target.style.objectPosition = slide.imagePosition;
  }

  // Mirror the active slide into the detached zoom surface and move its focal point.
  function updateZoomSurface(slide, x = 50, y = 50) {
    zoomSurface.style.backgroundImage = `url("${slide.src}")`;
    zoomSurface.style.backgroundPosition = `${x}% ${y}%`;
  }

  // Only expose the zoom UI on devices that actually support hover interactions.
  function setZoomVisibility(visible) {
    if (!canHoverZoom.matches) {
      carousel.classList.remove("is-zoom-active");
      return;
    }

    carousel.classList.toggle("is-zoom-active", visible);
  }

  function syncThumbnails() {
    thumbnailButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  // Swap the main image and optionally animate directional changes between slides.
  function renderSlide(direction = 0) {
    const slide = slides[activeIndex];
    syncThumbnails();
    updateZoomSurface(slide);

    if (direction === 0 || prefersReducedMotion.matches) {
      clearImageAnimationState(image);
      updateImage(image, slide);
      return;
    }

    isAnimating = true;

    // Clone the outgoing image so the next slide can animate in without popping.
    const outgoingImage = image.cloneNode(true);
    clearImageAnimationState(outgoingImage);
    outgoingImage.classList.add(
      "hero-image-clone",
      direction > 0 ? "is-exiting-next" : "is-exiting-prev"
    );
    outgoingImage.setAttribute("aria-hidden", "true");
    mediaCard.appendChild(outgoingImage);

    clearImageAnimationState(image);
    updateImage(image, slide);
    image.classList.add(direction > 0 ? "is-entering-next" : "is-entering-prev");

    image.addEventListener(
      "animationend",
      () => {
        clearImageAnimationState(image);
        isAnimating = false;
      },
      { once: true }
    );

    outgoingImage.addEventListener(
      "animationend",
      () => {
        outgoingImage.remove();
      },
      { once: true }
    );
  }

  // Advance through the slide list in either direction while preventing double clicks mid-animation.
  function stepSlide(direction) {
    if (isAnimating) {
      return;
    }

    activeIndex = (activeIndex + direction + slides.length) % slides.length;
    renderSlide(direction);
  }

  // Reuse the zoom surface for both the active image and hovered thumbnails.
  function previewSlide(slideIndex, x = 50, y = 50) {
    updateZoomSurface(slides[slideIndex], clamp(x, 10, 90), clamp(y, 10, 90));
    setZoomVisibility(true);
  }

  // Build thumbnail controls from the slide data so labels, images, and state stay in sync.
  function buildThumbnails() {
    const fragment = document.createDocumentFragment();

    slides.forEach((slide, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");

      button.type = "button";
      button.className = "hero-thumbnail";
      button.setAttribute("aria-label", `Show image ${index + 1}: ${slide.label}`);
      button.setAttribute("aria-pressed", "false");
      button.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)), url("${slide.src}")`;
      button.style.backgroundPosition = slide.thumbnailPosition;

      button.addEventListener("click", () => {
        if (index === activeIndex || isAnimating) {
          return;
        }

        const direction = index > activeIndex ? 1 : -1;
        activeIndex = index;
        renderSlide(direction);
      });

      button.addEventListener("mouseenter", () => {
        previewSlide(index);
      });

      button.addEventListener("mouseleave", () => {
        setZoomVisibility(false);
      });

      button.addEventListener("focus", () => {
        previewSlide(index);
      });

      button.addEventListener("blur", () => {
        setZoomVisibility(false);
      });

      item.appendChild(button);
      fragment.appendChild(item);
      thumbnailButtons.push(button);
    });

    thumbnails.innerHTML = "";
    thumbnails.appendChild(fragment);
  }

  mediaCard.addEventListener("mouseenter", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    previewSlide(activeIndex);
  });

  mediaCard.addEventListener("mousemove", (event) => {
    if (!canHoverZoom.matches) {
      return;
    }

    const bounds = mediaCard.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    previewSlide(activeIndex, x, y);
  });

  mediaCard.addEventListener("mouseleave", () => {
    setZoomVisibility(false);
  });

  prevButton.addEventListener("click", () => {
    stepSlide(-1);
  });

  nextButton.addEventListener("click", () => {
    stepSlide(1);
  });

  // Hide the zoom panel immediately if the device switches out of hover-capable mode.
  const handleHoverModeChange = (event) => {
    if (!event.matches) {
      setZoomVisibility(false);
    }
  };

  if ("addEventListener" in canHoverZoom) {
    canHoverZoom.addEventListener("change", handleHoverModeChange);
  } else if ("addListener" in canHoverZoom) {
    canHoverZoom.addListener(handleHoverModeChange);
  }

  buildThumbnails();
  renderSlide();
});
