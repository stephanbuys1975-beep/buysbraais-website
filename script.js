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
    const eventType = String(formData.get('event_type') || '').trim();
    const eventDate = String(formData.get('event_date') || '').trim();
    const location = String(formData.get('location') || '').trim();
    const guestCount = String(formData.get('guest_count') || '').trim();
    const requirements = String(formData.get('event_requirements') || '').trim();

    const dateForMessage = eventDate
      ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${eventDate}T12:00:00Z`))
      : 'Not confirmed';

    const message = [
      "Hi Oliver, I'd like a Buys Braai's catering quote.",
      '',
      `Name: ${name}`,
      `Telephone: ${telephone}`,
      `Email: ${email}`,
      '',
      `Event type: ${eventType || 'Not specified'}`,
      `Event date: ${dateForMessage}`,
      `Location: ${location}`,
      `Estimated guests: ${guestCount}`,
      '',
      'Food preferences and other details:',
      requirements
    ].join('\n');

    const whatsappUrl = `https://wa.me/447741639494?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  });
}
