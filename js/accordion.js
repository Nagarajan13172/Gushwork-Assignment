document.addEventListener("DOMContentLoaded", () => {
  const accordion = document.querySelector("[data-accordion]");

  if (!accordion) {
    return;
  }

  const items = Array.from(accordion.querySelectorAll(".faq-item"));

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

      items.forEach((entry) => {
        setItemState(entry, false);
      });

      if (!isAlreadyOpen) {
        setItemState(item, true);
      }
    });
  });
});
