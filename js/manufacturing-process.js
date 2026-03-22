// Manufacturing process module: tabs swap the stage copy while the side controls cycle supporting photos.
document.addEventListener("DOMContentLoaded", () => {
  const process = document.querySelector("[data-process]");

  if (!process) {
    return;
  }

  const tabs = Array.from(process.querySelectorAll("[data-process-tab]"));
  const stepLabel = process.querySelector("[data-process-step]");
  const title = process.querySelector("[data-process-title]");
  const description = process.querySelector("[data-process-description]");
  const points = process.querySelector("[data-process-points]");
  const media = process.querySelector(".process-media");
  const image = process.querySelector("[data-process-image]");
  const zoomSurface = process.querySelector("[data-process-zoom-surface]");
  const imagePrevButton = process.querySelector("[data-process-prev]");
  const imageNextButton = process.querySelector("[data-process-next]");
  const stagePrevButtons = Array.from(process.querySelectorAll("[data-process-stage-prev]"));
  const stageNextButtons = Array.from(process.querySelectorAll("[data-process-stage-next]"));

  if (!tabs.length || !title || !description || !points || !media || !image || !imagePrevButton || !imageNextButton) {
    return;
  }

  const stages = [
    {
      title: "High-Grade Raw Material Selection",
      description:
        "Vacuum sizing tanks ensure precise outer diameter while internal pressure maintains perfect roundness and wall thickness uniformity.",
      points: ["PE100 grade material", "Optimal molecular weight distribution"],
      imageSrc: "assets/boatimg.jpg",
      imageAlt: "Raw material handling for HDPE pipe manufacturing",
      imagePosition: "center center",
    },
    {
      title: "Precision Extrusion Control",
      description:
        "Advanced extrusion systems maintain stable melt flow, accurate throughput, and consistent pipe geometry throughout continuous production cycles.",
      points: ["Controlled melt pressure", "Uniform material flow"],
      imageSrc: "assets/hero.jpg",
      imageAlt: "Extrusion stage in HDPE pipe manufacturing",
      imagePosition: "center 42%",
    },
    {
      title: "Optimized Cooling & Stabilization",
      description:
        "Calibrated cooling zones preserve structural integrity and reduce internal stress, helping the pipe retain dimensional consistency after forming.",
      points: ["Balanced temperature reduction", "Stress-minimized pipe structure"],
      imageSrc: "assets/boatimg.jpg",
      imageAlt: "Cooling stage in HDPE pipe manufacturing",
      imagePosition: "center 58%",
    },
    {
      title: "Vacuum Sizing Accuracy",
      description:
        "Vacuum sizing tanks and internal support systems help lock in precise diameter, roundness, and wall-thickness uniformity across every batch.",
      points: ["Precise outer diameter", "Consistent circular profile"],
      imageSrc: "assets/hero.jpg",
      imageAlt: "Sizing stage in HDPE pipe manufacturing",
      imagePosition: "center center",
    },
    {
      title: "Reliable Quality Control",
      description:
        "Every production run is validated through dimensional checks, surface inspection, and material-performance testing to ensure compliance.",
      points: ["Dimensional verification", "Performance-grade inspection"],
      imageSrc: "assets/boatimg.jpg",
      imageAlt: "Quality control stage in HDPE pipe manufacturing",
      imagePosition: "center 34%",
    },
    {
      title: "Traceable Product Marking",
      description:
        "Clear, durable marking systems add critical identification data such as size, grade, standards, and batch traceability directly onto the pipe.",
      points: ["Readable line identification", "Batch traceability support"],
      imageSrc: "assets/hero.jpg",
      imageAlt: "Marking stage in HDPE pipe manufacturing",
      imagePosition: "center 48%",
    },
    {
      title: "Accurate Cutting Operations",
      description:
        "Automated cutting systems maintain consistent finished lengths while preserving clean edges and minimizing waste during downstream handling.",
      points: ["Precision cut lengths", "Cleaner production output"],
      imageSrc: "assets/boatimg.jpg",
      imageAlt: "Cutting stage in HDPE pipe manufacturing",
      imagePosition: "center 62%",
    },
    {
      title: "Secure Packaging & Dispatch",
      description:
        "Finished pipes are bundled, protected, and prepared for transport using handling practices that preserve quality from plant to project site.",
      points: ["Safe bundled dispatch", "Damage-resistant handling"],
      imageSrc: "assets/hero.jpg",
      imageAlt: "Packaging stage in HDPE pipe manufacturing",
      imagePosition: "center 54%",
    },
  ];

  const mediaSlides = [
    {
      src: "assets/boatimg.jpg",
      alt: "HDPE pipe manufacturing process handling stage",
      position: "center 54%",
    },
    {
      src: "assets/human2.jpg",
      alt: "HDPE pipe manufacturing quality inspection stage",
      position: "center 38%",
    },
    {
      src: "assets/human1.jpg",
      alt: "HDPE pipe manufacturing operations review stage",
      position: "center 30%",
    },
  ];

  let stageIndex = 0;
  let imageIndex = 0;
  let isAnimating = false;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const imageAnimationClasses = [
    "is-entering-next",
    "is-entering-prev",
    "is-exiting-next",
    "is-exiting-prev",
  ];
  const zoom =
    window.createCarouselImageZoom && zoomSurface
      ? window.createCarouselImageZoom({
          container: media,
          previewSurface: zoomSurface,
        })
      : null;

  // Preload supporting images so next/previous transitions feel immediate.
  mediaSlides.forEach(({ src }) => {
    const preloadImage = new Image();
    preloadImage.src = src;
  });

  function clearImageAnimationState(target) {
    target.classList.remove(...imageAnimationClasses, "process-image-clone");
  }

  function updateImageContent(target, mediaSlide) {
    target.src = mediaSlide.src;
    target.alt = mediaSlide.alt;
    target.style.objectPosition = mediaSlide.position;
  }

  // Render the selected production stage text and keep tab state accessible.
  function renderStage() {
    const stage = stages[stageIndex];

    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === stageIndex;

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    title.textContent = stage.title;
    description.textContent = stage.description;

    if (stepLabel) {
      const totalSteps = stages.length;
      const stepNumber = stageIndex + 1;
      const tabText = tabs[stageIndex]?.textContent?.trim() || "Process";
      stepLabel.textContent = `Step ${stepNumber}/${totalSteps}: ${tabText}`;
    }

    points.innerHTML = "";

    stage.points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      points.appendChild(item);
    });
  }

  // Update the side image and animate directional transitions when motion is allowed.
  function renderImage(direction = 0) {
    const mediaSlide = mediaSlides[imageIndex];

    if (direction === 0 || prefersReducedMotion.matches) {
      clearImageAnimationState(image);
      updateImageContent(image, mediaSlide);
      return;
    }

    isAnimating = true;

    // Clone the current image so we can animate the outgoing and incoming slides separately.
    const outgoingImage = image.cloneNode(true);
    clearImageAnimationState(outgoingImage);
    outgoingImage.setAttribute("aria-hidden", "true");
    outgoingImage.classList.add(
      "process-image-clone",
      direction > 0 ? "is-exiting-next" : "is-exiting-prev"
    );
    media.appendChild(outgoingImage);

    clearImageAnimationState(image);
    updateImageContent(image, mediaSlide);
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

  // Rotate through the image set independently of the selected text tab.
  function stepImage(direction) {
    if (isAnimating) {
      return;
    }

    imageIndex = (imageIndex + direction + mediaSlides.length) % mediaSlides.length;
    renderImage(direction);
  }

  tabs.forEach((tab, tabIndex) => {
    tab.addEventListener("click", () => {
      stageIndex = tabIndex;
      renderStage();
    });
  });

  imagePrevButton.addEventListener("click", () => {
    zoom?.hide();
    stepImage(-1);
  });

  imageNextButton.addEventListener("click", () => {
    zoom?.hide();
    stepImage(1);
  });

  stagePrevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      zoom?.hide();
      stageIndex = (stageIndex - 1 + stages.length) % stages.length;
      imageIndex = stageIndex % mediaSlides.length;
      renderStage();
      renderImage(-1);
    });
  });

  stageNextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      zoom?.hide();
      stageIndex = (stageIndex + 1) % stages.length;
      imageIndex = stageIndex % mediaSlides.length;
      renderStage();
      renderImage(1);
    });
  });

  media.addEventListener("mouseenter", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    zoom?.showFromImage(image);
  });

  media.addEventListener("mousemove", (event) => {
    if (event.target instanceof Element && event.target.closest(".process-image-nav")) {
      return;
    }

    zoom?.previewFromEvent(event, media, image);
  });

  media.addEventListener("mouseleave", () => {
    zoom?.hide();
  });

  renderStage();
  renderImage();
});
