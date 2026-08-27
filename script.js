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

const enquiryForm = document.querySelector('[data-enquiry-form]');
if (enquiryForm) {
  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(enquiryForm);
    const website = String(formData.get('website') || '').trim();
    if (website) return;

    const name = String(formData.get('full_name') || '').trim();
    const telephone = String(formData.get('telephone') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const requirements = String(formData.get('event_requirements') || '').trim();

    const message = [
      "Hi Oliver, I'd like a Buys Braai's catering quote.",
      '',
      `Name: ${name}`,
      `Telephone: ${telephone}`,
      `Email: ${email}`,
      '',
      'Event details:',
      requirements
    ].join('\n');

    const whatsappUrl = `https://wa.me/447741639494?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  });
}
