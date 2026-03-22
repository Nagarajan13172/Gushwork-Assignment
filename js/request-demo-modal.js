document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("requestDemoOverlay");
  const closeButton = document.getElementById("requestDemoModalClose");
  const form = document.getElementById("requestDemoForm");
  const nameInput = document.getElementById("requestDemoName");
  const triggers = Array.from(document.querySelectorAll("[data-request-demo-trigger]"));

  if (!overlay || !closeButton || !form || !nameInput || triggers.length === 0) {
    return;
  }

  const transitionDuration = 220;
  const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(",");

  let activeTrigger = null;
  let hideTimer = 0;

  function isOpen() {
    return !overlay.hasAttribute("hidden");
  }

  function getFocusableElements() {
    return Array.from(overlay.querySelectorAll(focusableSelector)).filter((element) => {
      return !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true";
    });
  }

  function lockScroll() {
    document.body.style.overflow = "hidden";
  }

  function unlockScroll() {
    document.body.style.overflow = "";
  }

  function openModal(trigger) {
    activeTrigger = trigger || document.activeElement;

    if (hideTimer) {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
    }

    overlay.removeAttribute("hidden");

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        overlay.classList.add("is-visible");
      });
    });

    lockScroll();
    nameInput.focus();
  }

  function closeModal() {
    if (!isOpen()) {
      return;
    }

    overlay.classList.remove("is-visible");

    if (hideTimer) {
      window.clearTimeout(hideTimer);
    }

    hideTimer = window.setTimeout(() => {
      overlay.setAttribute("hidden", "");
      hideTimer = 0;
    }, transitionDuration);

    unlockScroll();

    if (activeTrigger && typeof activeTrigger.focus === "function") {
      window.requestAnimationFrame(() => {
        activeTrigger.focus();
      });
    }
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger);
    });
  });

  closeButton.addEventListener("click", closeModal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!isOpen()) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && (document.activeElement === firstFocusable || !overlay.contains(document.activeElement))) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && (document.activeElement === lastFocusable || !overlay.contains(document.activeElement))) {
      event.preventDefault();
      firstFocusable.focus();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const submission = Object.fromEntries(new FormData(form).entries());
    console.log("Request callback submitted:", submission);
    form.reset();
    closeModal();
  });
});
