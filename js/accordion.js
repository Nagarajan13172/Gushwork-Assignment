// FAQ accordion: keep one answer open at a time and sync the ARIA state for each panel.
document.addEventListener("DOMContentLoaded", () => {
  const accordion = document.querySelector("[data-accordion]");

  if (!accordion) {
    return;
  }

  const items = Array.from(accordion.querySelectorAll(".faq-item"));

  // Apply the visual open state and the accessibility state for a single FAQ item.
  function setItemState(item, isOpen) {
    const trigger = item.querySelector(".faq-trigger");
    const panel = item.querySelector(".faq-panel");

    item.classList.toggle("is-open", isOpen);
    trigger.setAttribute("aria-expanded", String(isOpen));
    panel.hidden = !isOpen;
  }

  items.forEach((item) => {
    const trigger = item.querySelector(".faq-trigger");

    trigger.addEventListener("click", () => {
      const isAlreadyOpen = item.classList.contains("is-open");

      // Close every item first so the clicked entry becomes the only expanded panel.
      items.forEach((entry) => {
        setItemState(entry, false);
      });

      if (!isAlreadyOpen) {
        setItemState(item, true);
      }
    });
  });
});
