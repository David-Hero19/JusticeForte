document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Contact form
const form = document.getElementById('contact-form');
const statusEl = form.querySelector('.form-status');
const submitBtn = form.querySelector('button[type="submit"]');
const submitLabel = submitBtn.querySelector('.btn-label');

function clearErrors() {
  form.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  statusEl.textContent = '';
  statusEl.className = 'form-status';

  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    matter: form.matter.value,
    message: form.message.value.trim(),
  };

  submitBtn.disabled = true;
  submitLabel.textContent = 'Submitting…';

  try {
    const res = await fetch('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      if (data.errors) {
        Object.entries(data.errors).forEach(([field, msg]) => {
          const el = form.querySelector(`.field-error[data-for="${field}"]`);
          if (el) el.textContent = msg;
        });
      }
      statusEl.textContent = 'Please correct the fields above.';
      statusEl.classList.add('error');
      return;
    }

    statusEl.textContent = data.message || 'Received. We will be in touch shortly.';
    statusEl.classList.add('success');
    form.reset();
  } catch (err) {
    statusEl.textContent = 'Something went wrong. Please try again or call the office directly.';
    statusEl.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitLabel.textContent = 'Submit request';
  }
});
