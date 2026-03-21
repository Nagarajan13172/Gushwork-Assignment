(function () {
  const trigger = document.getElementById('datasheetBtn');
  const overlay = document.getElementById('catalogueOverlay');
  const closeBtn = document.getElementById('catalogueModalClose');
  const downloadBtn = document.getElementById('catalogueDownloadBtn');
  const emailInput = document.getElementById('catalogueEmail');

  function openModal() {
    overlay.removeAttribute('hidden');
    // Trigger transition on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('is-visible');
      });
    });
    emailInput.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-visible');
    overlay.addEventListener(
      'transitionend',
      function handler() {
        overlay.setAttribute('hidden', '');
        overlay.removeEventListener('transitionend', handler);
      }
    );
    document.body.style.overflow = '';
  }

  trigger.addEventListener('click', function (e) {
    e.preventDefault();
    openModal();
  });

  closeBtn.addEventListener('click', closeModal);

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) {
      closeModal();
    }
  });

  downloadBtn.addEventListener('click', function () {
    var email = emailInput.value.trim();
    if (!email) {
      emailInput.focus();
      emailInput.style.borderColor = '#EF4444';
      emailInput.addEventListener('input', function clear() {
        emailInput.style.borderColor = '';
        emailInput.removeEventListener('input', clear);
      });
      return;
    }
    // Placeholder submission — replace with real API call as needed
    console.log('Catalogue requested for:', email);
    closeModal();
  });
})();
