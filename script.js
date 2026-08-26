const toggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    });
  });
}

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

const previewForm = document.querySelector('[data-preview-form]');
if (previewForm) {
  previewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const note = document.querySelector('[data-form-note]');
    if (note) {
      note.textContent = 'Preview only — enquiry delivery is not connected yet.';
    }
  });
}
