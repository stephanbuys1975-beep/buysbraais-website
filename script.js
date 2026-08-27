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

const smokeLayer = document.querySelector('.hero-smoke');
if (smokeLayer) {
  const wisps = [...smokeLayer.querySelectorAll('.hero-smoke-wisp')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timings = [
    { duration: 8200, phase: 0, drift: 5, peak: .72 },
    { duration: 9800, phase: .36, drift: -4, peak: .62 },
    { duration: 11600, phase: .68, drift: 7, peak: .58 }
  ];
  let smokeFrame = 0;

  const renderSmoke = (time) => {
    wisps.forEach((wisp, index) => {
      const timing = timings[index];
      const progress = ((time / timing.duration) + timing.phase) % 1;
      const fade = Math.pow(Math.sin(Math.PI * progress), 1.35);
      const horizontal = -7 + (18 * progress) + (Math.sin(progress * Math.PI * 2) * timing.drift);
      const vertical = 18 - (58 * progress);
      const scale = .72 + (.52 * progress);
      const rotation = -8 + (16 * progress);

      wisp.style.opacity = String(fade * timing.peak);
      wisp.style.transform = `translate3d(${horizontal}%, ${vertical}%, 0) scale(${scale}) rotate(${rotation}deg)`;
    });

    smokeFrame = window.requestAnimationFrame(renderSmoke);
  };

  const updateSmokeMotion = () => {
    window.cancelAnimationFrame(smokeFrame);
    smokeFrame = 0;

    if (reducedMotion.matches) {
      smokeLayer.classList.remove('is-scripted');
      wisps.forEach((wisp) => wisp.removeAttribute('style'));
      return;
    }

    smokeLayer.classList.add('is-scripted');
    smokeFrame = window.requestAnimationFrame(renderSmoke);
  };

  updateSmokeMotion();
  reducedMotion.addEventListener('change', updateSmokeMotion);
}

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
