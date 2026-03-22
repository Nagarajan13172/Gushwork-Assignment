// Shared hover zoom helper for carousel images.
(() => {
  const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  window.createCarouselImageZoom = function createCarouselImageZoom(options = {}) {
    const {
      container,
      previewSurface,
      activeClass = "is-zoom-active",
      minFocus = 10,
      maxFocus = 90,
    } = options;

    if (!container || !previewSurface) {
      return {
        isSupported: false,
        showFromImage() {},
        showFromUrl() {},
        previewFromEvent() {},
        move() {},
        hide() {},
        destroy() {},
      };
    }

    function setVisibility(visible) {
      if (!hoverMedia.matches) {
        container.classList.remove(activeClass);
        return;
      }

      container.classList.toggle(activeClass, visible);
    }

    function move(x = 50, y = 50) {
      const clampedX = clamp(x, minFocus, maxFocus);
      const clampedY = clamp(y, minFocus, maxFocus);
      previewSurface.style.backgroundPosition = `${clampedX}% ${clampedY}%`;
    }

    function showFromUrl(url, x = 50, y = 50) {
      if (!url) {
        return;
      }

      previewSurface.style.backgroundImage = `url("${url}")`;
      move(x, y);
      setVisibility(true);
    }

    function showFromImage(image, x = 50, y = 50) {
      if (!image) {
        return;
      }

      const imageSource = image.currentSrc || image.src || image.getAttribute("src");

      if (!imageSource) {
        return;
      }

      showFromUrl(imageSource, x, y);
    }

    function previewFromEvent(event, target, imageForSource = target) {
      if (!event || !target || !imageForSource || !hoverMedia.matches) {
        return;
      }

      const bounds = target.getBoundingClientRect();

      if (!bounds.width || !bounds.height) {
        return;
      }

      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      showFromImage(imageForSource, x, y);
    }

    function hide() {
      setVisibility(false);
    }

    const handleHoverModeChange = (event) => {
      if (!event.matches) {
        hide();
      }
    };

    if ("addEventListener" in hoverMedia) {
      hoverMedia.addEventListener("change", handleHoverModeChange);
    } else if ("addListener" in hoverMedia) {
      hoverMedia.addListener(handleHoverModeChange);
    }

    function destroy() {
      hide();

      if ("removeEventListener" in hoverMedia) {
        hoverMedia.removeEventListener("change", handleHoverModeChange);
      } else if ("removeListener" in hoverMedia) {
        hoverMedia.removeListener(handleHoverModeChange);
      }
    }

    return {
      isSupported: hoverMedia.matches,
      showFromImage,
      showFromUrl,
      previewFromEvent,
      move,
      hide,
      destroy,
    };
  };
})();
