(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

  const form = document.getElementById('lead-form');
  const card = form.closest('.form-card');
  const errorEl = form.querySelector('.form-error');

  const showStep = (step) => {
    form.querySelectorAll('[data-step]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.step === String(step));
    });
    card.dataset.current = step;
  };

  const validate = (fieldset) => {
    let ok = true;
    fieldset.querySelectorAll('[required]').forEach((input) => {
      if (input.type === 'radio') {
        const group = fieldset.querySelectorAll(`[name="${input.name}"]`);
        const checked = [...group].some((r) => r.checked);
        input.closest('.choices').classList.toggle('is-invalid', !checked);
        if (!checked) ok = false;
        return;
      }
      const valid = input.checkValidity() && input.value.trim() !== '';
      input.classList.toggle('is-invalid', !valid);
      if (!valid) ok = false;
    });
    return ok;
  };

  const setError = (msg) => {
    errorEl.textContent = msg || '';
    errorEl.hidden = !msg;
  };

  form.querySelector('[data-next]').addEventListener('click', () => {
    if (!validate(form.querySelector('[data-step="1"]'))) {
      setError('Please complete the highlighted fields.');
      return;
    }
    setError('');
    showStep(2);
    form.querySelector('[name="name"]').focus();
  });

  form.querySelector('[data-back]').addEventListener('click', () => {
    setError('');
    showStep(1);
  });

  form.addEventListener('input', (e) => {
    e.target.classList.remove('is-invalid');
    e.target.closest('.choices')?.classList.remove('is-invalid');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form.querySelector('[data-step="2"]'))) {
      setError('Please complete the highlighted fields.');
      return;
    }
    setError('');
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), page: location.href }),
      });
      if (!res.ok) throw new Error();
      showStep('done');
      form.querySelector('[data-step="done"]').focus();
    } catch {
      setError('Something went wrong sending your request. Please call us at 1.800.333.8006.');
      btn.disabled = false;
      btn.textContent = 'Get My Free Estimate';
    }
  });
})();
