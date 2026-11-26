/**
 * Formulario de contacto: envío sin recargar la página, errores por campo y estado accesible.
 * Sin JavaScript el formulario se envía igualmente al endpoint PHP (mejora progresiva).
 * También preselecciona «Te interesa» desde los enlaces con `data-interest` o `?interes=`.
 */

interface ContactResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form) setupContactForm(form);

function setupContactForm(contactForm: HTMLFormElement): void {
  const status = contactForm.querySelector<HTMLElement>('[data-form-status]');
  const submit = contactForm.querySelector<HTMLButtonElement>('[data-submit]');
  const submitLabel = contactForm.querySelector<HTMLElement>('[data-submit-label]');
  const select = contactForm.querySelector<HTMLSelectElement>('[data-interest-select]');
  // Mensajes del navegador en el idioma de la página (los pone Contact.astro desde i18n/form.ts).
  const networkError = contactForm.dataset.networkError ?? '';
  const unavailableError = contactForm.dataset.unavailableError ?? '';

  // «Te interesa» precargado desde el enlace que trajo al formulario.
  const preset = new URLSearchParams(window.location.search).get('interes');
  if (preset && select) setInterest(select, preset);
  document.querySelectorAll<HTMLAnchorElement>('a[data-interest]').forEach((link) => {
    link.addEventListener('click', () => {
      if (select && link.dataset.interest) setInterest(select, link.dataset.interest);
    });
  });

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(contactForm);
    if (!contactForm.reportValidity()) return;

    const originalLabel = submitLabel?.textContent ?? '';
    setBusy(true);
    try {
      // Turnstile oculto: si se envía muy rápido, se espera a que genere su comprobación.
      await waitForTurnstile(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(contactForm) as unknown as Record<string, string>),
      });
      // Una respuesta que no es JSON (p. ej. sin PHP en desarrollo) se trata como «no disponible».
      const isJson = response.headers.get('Content-Type')?.includes('application/json') ?? false;
      if (!isJson) {
        showStatus(unavailableError, false);
        return;
      }
      const data = (await response.json()) as ContactResponse;
      showStatus(data.message, data.success);
      if (data.success) {
        contactForm.reset();
      } else if (data.errors) {
        showErrors(contactForm, data.errors);
      }
    } catch {
      showStatus(networkError, false);
    } finally {
      window.turnstile?.reset();
      setBusy(false);
      if (submitLabel) submitLabel.textContent = originalLabel;
    }
  });

  function setBusy(isBusy: boolean): void {
    if (!submit) return;
    submit.disabled = isBusy;
    submit.setAttribute('aria-busy', String(isBusy));
    if (isBusy && submitLabel) submitLabel.textContent = submit.dataset.sendingLabel ?? '…';
  }

  function showStatus(message: string, isSuccess: boolean): void {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.classList.remove('hidden');
    status.classList.toggle('border-gold', !isSuccess);
    status.classList.toggle('border-sand', isSuccess);
    status.focus();
  }
}

/** Espera (máx. 5 s) a que Turnstile rellene su campo; el servidor rechaza el envío si sigue vacío. */
async function waitForTurnstile(contactForm: HTMLFormElement): Promise<void> {
  const field = (): HTMLInputElement | null =>
    contactForm.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
  if (!contactForm.querySelector('.cf-turnstile')) return;
  for (let waited = 0; waited < 5000 && !field()?.value; waited += 200) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

function setInterest(select: HTMLSelectElement, value: string): void {
  if ([...select.options].some((option) => option.value === value)) select.value = value;
}

function clearErrors(contactForm: HTMLFormElement): void {
  contactForm.querySelectorAll<HTMLElement>('[data-error-for]').forEach((slot) => {
    slot.textContent = '';
  });
  contactForm.querySelectorAll('[aria-invalid]').forEach((input) => {
    input.removeAttribute('aria-invalid');
  });
}

function showErrors(contactForm: HTMLFormElement, errors: Record<string, string[]>): void {
  let first: HTMLElement | null = null;
  for (const [name, messages] of Object.entries(errors)) {
    const input = contactForm.elements.namedItem(name);
    const slot = contactForm.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (slot) slot.textContent = messages.join(' ');
    if (input instanceof HTMLElement) {
      input.setAttribute('aria-invalid', 'true');
      first ??= input;
    }
  }
  first?.focus();
}

export {};
